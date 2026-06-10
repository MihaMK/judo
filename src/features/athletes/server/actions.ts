"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/features/auth/server/session";
import { createAthleteMembership } from "@/features/payments/server/payment-persistence";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { mk } from "@/shared/i18n/mk";
import { ATHLETE_STATUSES, GUARDIAN_RELATIONSHIPS, type AthleteStatus, type GuardianRelationship } from "../domain/athlete";
import {
  createPersistedAthlete,
  createPersistedGuardian,
  createPersistedWeightMeasurement,
  linkPersistedGuardianToAthlete,
  removePersistedGuardianLink,
  updatePersistedAthlete,
  updatePersistedAthletePhoto,
  updatePersistedGuardian,
  type AthleteMutationInput
} from "./athlete-persistence";
import { getTrainingGroupsView } from "./athlete-read-models";

const ATHLETE_PHOTO_BUCKET = "athlete-photos";
const MAX_ATHLETE_PHOTO_SIZE = 3 * 1024 * 1024;
const ALLOWED_ATHLETE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type AthleteFormState = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

export type WeightMeasurementFormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export type GuardianFormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

type ParsedAthleteForm = {
  input: AthleteMutationInput;
  photoFile?: File;
  guardian?: {
    fullName: string;
    phone: string;
    email: string | null;
  };
  membershipStartMonth: string;
};

export async function createAthleteAction(_previousState: AthleteFormState, formData: FormData): Promise<AthleteFormState> {
  const access = await assertManagementAccess();

  if (!access.ok) {
    return { message: access.message };
  }

  const parsed = await parseAthleteForm(formData, access.clubId, { requireGuardian: false });

  if (!parsed.ok) {
    return { message: parsed.message, fieldErrors: parsed.fieldErrors };
  }

  let athleteId: string;

  try {
    athleteId = await createPersistedAthlete(parsed.value.input);

    await createAthleteMembership({
      clubId: access.clubId,
      athleteId,
      startMonth: parsed.value.membershipStartMonth,
      createdByUserProfileId: access.userProfileId
    });

    if (parsed.value.guardian) {
      const guardianId = await createPersistedGuardian({
        clubId: access.clubId,
        fullName: parsed.value.guardian.fullName,
        phone: parsed.value.guardian.phone,
        email: parsed.value.guardian.email
      });

      await linkPersistedGuardianToAthlete({
        clubId: access.clubId,
        athleteId,
        guardianId,
        relationship: "guardian",
        isPrimaryContact: true
      });
    }

    if (parsed.value.photoFile) {
      await uploadAthletePhoto({
        clubId: access.clubId,
        athleteId,
        file: parsed.value.photoFile
      });
    }
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Неуспешно креирање спортист." };
  }

  revalidatePath("/athletes");
  redirect(`/athletes/${athleteId}`);
}

export async function updateAthleteAction(
  athleteId: string,
  _previousState: AthleteFormState,
  formData: FormData
): Promise<AthleteFormState> {
  const access = await assertManagementAccess();

  if (!access.ok) {
    return { message: access.message };
  }

  const parsed = await parseAthleteForm(formData, access.clubId, { requireGuardian: false });

  if (!parsed.ok) {
    return { message: parsed.message, fieldErrors: parsed.fieldErrors };
  }

  try {
    await updatePersistedAthlete(athleteId, parsed.value.input);

    if (parsed.value.photoFile) {
      await uploadAthletePhoto({
        clubId: access.clubId,
        athleteId,
        file: parsed.value.photoFile
      });
    }
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Неуспешно ажурирање спортист." };
  }

  revalidatePath("/athletes");
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}`);
}

export async function linkGuardianAction(athleteId: string, formData: FormData) {
  const access = await assertManagementAccess();

  if (!access.ok) {
    redirect(`/athletes/${athleteId}`);
  }

  const guardianId = String(formData.get("guardianId") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "").trim();

  if (!guardianId || !isGuardianRelationship(relationship)) {
    redirect(`/athletes/${athleteId}`);
  }

  await linkPersistedGuardianToAthlete({
    clubId: access.clubId,
    athleteId,
    guardianId,
    relationship
  });

  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}`);
}

export async function removeGuardianLinkAction(athleteId: string, guardianId: string) {
  const access = await assertManagementAccess();

  if (!access.ok) {
    redirect(`/athletes/${athleteId}`);
  }

  await removePersistedGuardianLink({
    clubId: access.clubId,
    athleteId,
    guardianId
  });

  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}`);
}

export async function updateGuardianAction(
  athleteId: string,
  guardianId: string,
  _previousState: GuardianFormState,
  formData: FormData
): Promise<GuardianFormState> {
  const access = await assertManagementAccess();

  if (!access.ok) {
    return { ok: false, message: access.message };
  }

  const fullName = String(formData.get("guardianFullName") ?? "").trim();
  const phone = String(formData.get("guardianPhone") ?? "").trim();
  const email = String(formData.get("guardianEmail") ?? "").trim();
  const fieldErrors: Record<string, string> = {};

  if (!fullName) {
    fieldErrors.guardianFullName = mk.athletes.formRequired;
  }

  if (!phone) {
    fieldErrors.guardianPhone = mk.athletes.formRequired;
  }

  if (email && !isValidEmail(email)) {
    fieldErrors.guardianEmail = "Внесете валидна email адреса.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Проверете ги податоците за родителот/старателот.",
      fieldErrors
    };
  }

  try {
    await updatePersistedGuardian({
      clubId: access.clubId,
      guardianId,
      fullName,
      phone,
      email: email || null
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Податоците за родителот не се зачувани."
    };
  }

  revalidatePath(`/athletes/${athleteId}`);

  return {
    ok: true,
    message: "Податоците за родителот се зачувани."
  };
}

export async function addWeightMeasurementAction(
  athleteId: string,
  _previousState: WeightMeasurementFormState,
  formData: FormData
): Promise<WeightMeasurementFormState> {
  const access = await assertOperationalAccess();

  if (!access.ok) {
    return { ok: false, message: access.message };
  }

  const weight = numberOrNull(formData, "weight");
  const measuredAt = String(formData.get("measuredAt") ?? getTodayDate()).trim();
  const note = String(formData.get("note") ?? "").trim();
  const fieldErrors: Record<string, string> = {};

  if (weight === null || weight <= 0) {
    fieldErrors.weight = "Внесете валидна тежина.";
  }

  if (!isValidDate(measuredAt)) {
    fieldErrors.measuredAt = "Внесете валиден датум.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Проверете ги внесените податоци.",
      fieldErrors
    };
  }

  try {
    await createPersistedWeightMeasurement({
      clubId: access.clubId,
      athleteId,
      measuredAt,
      weight: weight ?? 0,
      note,
      createdByUserProfileId: access.userProfileId
    });
  } catch (error) {
    if (isSchemaCacheError(error, "athlete_weight_measurements")) {
      return {
        ok: false,
        message: "Табелата за историја на тежини не е достапна. Применете ја миграцијата за мерења."
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? `Мерењето не е зачувано: ${error.message}` : "Мерењето не е зачувано."
    };
  }

  revalidatePath("/athletes");
  revalidatePath(`/athletes/${athleteId}`);

  return {
    ok: true,
    message: "Мерењето е успешно зачувано."
  };
}

async function assertManagementAccess(): Promise<{ ok: true; clubId: string; userProfileId: string } | { ok: false; message: string }> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { ok: false, message: mk.auth.loginRequired };
  }

  if (sessionContext.role !== "management") {
    return { ok: false, message: mk.athletes.managementOnly };
  }

  return { ok: true, clubId: sessionContext.clubId, userProfileId: sessionContext.userProfileId };
}

async function assertOperationalAccess(): Promise<
  { ok: true; clubId: string; userProfileId: string } | { ok: false; message: string }
> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { ok: false, message: mk.auth.loginRequired };
  }

  if (sessionContext.role !== "management" && sessionContext.role !== "trainer") {
    return { ok: false, message: "Само управата и тренерите можат да внесуваат мерења." };
  }

  return { ok: true, clubId: sessionContext.clubId, userProfileId: sessionContext.userProfileId };
}

async function parseAthleteForm(
  formData: FormData,
  clubId: string,
  options: { requireGuardian: boolean }
): Promise<
  | { ok: true; value: ParsedAthleteForm }
  | { ok: false; message: string; fieldErrors: Record<string, string> }
> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const currentBelt = String(formData.get("currentBelt") ?? "").trim();
  const beltRankId = String(formData.get("beltRankId") ?? "").trim();
  const weight = numberOrNull(formData, "weight");
  const federationLicenseNumber = String(formData.get("federationLicenseNumber") ?? "").trim();
  const athletePhone = String(formData.get("athletePhone") ?? "").trim();
  const athleteEmail = String(formData.get("athleteEmail") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const membershipStartMonth = parseMembershipStartMonth(String(formData.get("membershipStartMonth") ?? "").trim());
  const guardianFullName = String(formData.get("guardianFullName") ?? "").trim();
  const guardianPhone = String(formData.get("guardianPhone") ?? "").trim();
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim();
  const photoFile = getPhotoFile(formData);
  const fieldErrors: Record<string, string> = {};
  const hasGuardianInput = Boolean(guardianFullName || guardianPhone || guardianEmail);

  if (!firstName) {
    fieldErrors.firstName = mk.athletes.formRequired;
  }

  if (!lastName) {
    fieldErrors.lastName = mk.athletes.formRequired;
  }

  if (!isValidDate(birthDate)) {
    fieldErrors.birthDate = mk.athletes.invalidBirthDate;
  }

  if (gender && !isAthleteGender(gender)) {
    fieldErrors.gender = mk.athletes.formRequired;
  }

  if (federationLicenseNumber && !/^\d+$/.test(federationLicenseNumber)) {
    fieldErrors.federationLicenseNumber = "Бројот на легитимација мора да содржи само цифри.";
  }

  if (athleteEmail && !isValidEmail(athleteEmail)) {
    fieldErrors.athleteEmail = "Внесете валидна email адреса.";
  }

  if (!isAthleteStatus(status)) {
    fieldErrors.status = mk.athletes.formRequired;
  }

  if ((options.requireGuardian || hasGuardianInput) && !guardianFullName) {
    fieldErrors.guardianFullName = mk.athletes.formRequired;
  }

  if ((options.requireGuardian || hasGuardianInput) && !guardianPhone) {
    fieldErrors.guardianPhone = mk.athletes.formRequired;
  }

  if (guardianEmail && !isValidEmail(guardianEmail)) {
    fieldErrors.guardianEmail = "Внесете валидна email адреса.";
  }

  if (photoFile && !ALLOWED_ATHLETE_PHOTO_TYPES.has(photoFile.type)) {
    fieldErrors.photo = "Дозволени се JPEG, PNG или WEBP фотографии.";
  }

  if (photoFile && photoFile.size > MAX_ATHLETE_PHOTO_SIZE) {
    fieldErrors.photo = "Фотографијата мора да биде најмногу 3MB.";
  }

  const groups = await getTrainingGroupsView({
    userId: null,
    userProfileId: null,
    role: "management",
    clubId,
    clubName: null,
    clubLogoUrl: null,
    parentGuardianIds: [],
    displayName: "Validation",
    isAuthenticated: true
  });
  const currentGroupId = groupId && groups.some((group) => group.id === groupId) ? groupId : null;

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Проверете ги внесените податоци.", fieldErrors };
  }

  const athleteStatus = isAthleteStatus(status) ? status : "active";
  const resolvedBeltName = beltRankId ? await resolveBeltRankName(beltRankId) : null;
  const value: ParsedAthleteForm = {
    input: {
      clubId,
      fullName: `${firstName} ${lastName}`.trim(),
      birthDate,
      gender: isAthleteGender(gender) ? gender : null,
      status: athleteStatus,
      currentGroupId,
      beltRankId: beltRankId || null,
      currentBeltText: (resolvedBeltName ?? currentBelt) || "Бел",
      weight,
      federationLicenseNumber: federationLicenseNumber || null,
      phone: athletePhone || null,
      email: athleteEmail || null,
      profileSummary: notes
    },
    membershipStartMonth
  };

  if (photoFile) {
    value.photoFile = photoFile;
  }

  if (options.requireGuardian || hasGuardianInput) {
    value.guardian = {
      fullName: guardianFullName,
      phone: guardianPhone,
      email: guardianEmail || null
    };
  }

  return { ok: true, value };
}

async function uploadAthletePhoto(input: { clubId: string; athleteId: string; file: File }) {
  const admin = createAdminSupabaseClient();
  const photoPath = `clubs/${input.clubId}/athletes/${input.athleteId}/profile`;
  const { error } = await admin.storage.from(ATHLETE_PHOTO_BUCKET).upload(photoPath, input.file, {
    cacheControl: "3600",
    contentType: input.file.type,
    upsert: true
  });

  if (error) {
    throw new Error(`Неуспешно зачувување на фотографијата: ${error.message}`);
  }

  await updatePersistedAthletePhoto({
    clubId: input.clubId,
    athleteId: input.athleteId,
    photoPath
  });
}

function parseMembershipStartMonth(value: string) {
  const normalized = value && /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : "";
  if (normalized && isValidDate(normalized)) {
    return normalized;
  }

  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function getPhotoFile(formData: FormData) {
  const value = formData.get("photo");

  if (typeof File === "undefined" || !(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function isAthleteStatus(value: string): value is AthleteStatus {
  return ATHLETE_STATUSES.includes(value as AthleteStatus);
}

function isAthleteGender(value: string): value is "M" | "Ж" {
  return value === "M" || value === "Ж";
}

function isGuardianRelationship(value: string): value is GuardianRelationship {
  return GUARDIAN_RELATIONSHIPS.includes(value as GuardianRelationship);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSchemaCacheError(error: unknown, tableName: string) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as { code?: string; message?: string };
  return (
    possibleError.code === "PGRST205" ||
    (typeof possibleError.message === "string" &&
      possibleError.message.includes(tableName) &&
      possibleError.message.includes("schema cache"))
  );
}

function numberOrNull(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function resolveBeltRankName(beltRankId: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("belt_ranks")
    .select("name")
    .eq("id", beltRankId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return typeof data?.name === "string" ? data.name : null;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}


