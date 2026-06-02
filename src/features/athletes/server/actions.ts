"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/features/auth/server/session";
import { mk } from "@/shared/i18n/mk";
import { ATHLETE_STATUSES, GUARDIAN_RELATIONSHIPS, type AthleteStatus, type GuardianRelationship } from "../domain/athlete";
import {
  createPersistedAthlete,
  createPersistedGuardian,
  linkPersistedGuardianToAthlete,
  removePersistedGuardianLink,
  updatePersistedAthlete,
  type AthleteMutationInput
} from "./athlete-persistence";
import { getTrainingGroupsView } from "./athlete-read-models";

export type AthleteFormState = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

type ParsedAthleteForm = {
  input: AthleteMutationInput;
  guardian?: {
    fullName: string;
    phone: string;
    email: string | null;
  };
};

export async function createAthleteAction(_previousState: AthleteFormState, formData: FormData): Promise<AthleteFormState> {
  const access = await assertManagementAccess();

  if (!access.ok) {
    return { message: access.message };
  }

  const parsed = await parseAthleteForm(formData, access.clubId, { requireGuardian: true });

  if (!parsed.ok) {
    return { message: parsed.message, fieldErrors: parsed.fieldErrors };
  }

  let athleteId: string;

  try {
    athleteId = await createPersistedAthlete(parsed.value.input);

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

async function assertManagementAccess(): Promise<{ ok: true; clubId: string } | { ok: false; message: string }> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { ok: false, message: mk.auth.loginRequired };
  }

  if (sessionContext.role !== "management") {
    return { ok: false, message: mk.athletes.managementOnly };
  }

  return { ok: true, clubId: sessionContext.clubId };
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
  const status = String(formData.get("status") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const currentBelt = String(formData.get("currentBelt") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const guardianFullName = String(formData.get("guardianFullName") ?? "").trim();
  const guardianPhone = String(formData.get("guardianPhone") ?? "").trim();
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim();
  const fieldErrors: Record<string, string> = {};

  if (!firstName) {
    fieldErrors.firstName = mk.athletes.formRequired;
  }

  if (!lastName) {
    fieldErrors.lastName = mk.athletes.formRequired;
  }

  if (!isValidDate(birthDate)) {
    fieldErrors.birthDate = mk.athletes.invalidBirthDate;
  }

  if (!isAthleteStatus(status)) {
    fieldErrors.status = mk.athletes.formRequired;
  }

  if (options.requireGuardian && !guardianFullName) {
    fieldErrors.guardianFullName = mk.athletes.formRequired;
  }

  if (options.requireGuardian && !guardianPhone) {
    fieldErrors.guardianPhone = mk.athletes.formRequired;
  }

  if (guardianEmail && !isValidEmail(guardianEmail)) {
    fieldErrors.guardianEmail = "Внесете валидна email адреса.";
  }

  const groups = await getTrainingGroupsView({
    userId: null,
    userProfileId: null,
    role: "management",
    clubId,
    parentGuardianIds: [],
    displayName: "Validation",
    isAuthenticated: true
  });
  const currentGroupId = groupId && groups.some((group) => group.id === groupId) ? groupId : null;

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Проверете ги внесените податоци.", fieldErrors };
  }

  const athleteStatus = isAthleteStatus(status) ? status : "active";
  const value: ParsedAthleteForm = {
    input: {
      clubId,
      fullName: `${firstName} ${lastName}`.trim(),
      birthDate,
      status: athleteStatus,
      currentGroupId,
      currentBeltText: currentBelt || "Бел",
      profileSummary: notes
    }
  };

  if (options.requireGuardian) {
    value.guardian = {
      fullName: guardianFullName,
      phone: guardianPhone,
      email: guardianEmail || null
    };
  }

  return { ok: true, value };
}

function isAthleteStatus(value: string): value is AthleteStatus {
  return ATHLETE_STATUSES.includes(value as AthleteStatus);
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
