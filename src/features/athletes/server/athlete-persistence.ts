import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import type {
  AthleteProfile,
  AthleteGender,
  AthleteStatus,
  GuardianOption,
  GuardianRelationship,
  GuardianSummary,
  TrainingGroup
} from "../domain/athlete";

type AthleteRow = {
  id: string;
  full_name: string;
  birth_date: string;
  gender: AthleteGender | null;
  status: AthleteStatus;
  current_group_id: string | null;
  belt_rank_id: string | null;
  current_belt_text: string;
  weight: number | string | null;
  photo_path: string | null;
  joined_at: string;
  profile_summary: string;
};

type BeltRankRow = {
  id: string;
  name: string;
};

type TrainingGroupRow = {
  id: string;
  name: string;
  description: string;
  training_days: string;
};

type GuardianRelationRow = {
  athlete_id: string;
  relationship: GuardianRelationship;
  is_primary_contact: boolean;
  guardians: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
  } | null;
};

type GuardianOptionRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
};

export type AthleteMutationInput = {
  clubId: string;
  fullName: string;
  birthDate: string;
  gender: AthleteGender | null;
  status: AthleteStatus;
  currentGroupId: string | null;
  beltRankId: string | null;
  currentBeltText: string;
  weight: number | null;
  profileSummary: string;
};

export async function loadPersistedTrainingGroups(clubId: string): Promise<TrainingGroup[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_groups")
    .select("id, name, description, training_days")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load training groups: ${error.message}`);
  }

  return (data as TrainingGroupRow[]).map((group) => ({
    id: group.id,
    name: localizeKnownGroupText(group.name),
    description: localizeKnownGroupText(group.description),
    trainingDays: localizeKnownGroupText(group.training_days)
  }));
}

export async function loadPersistedAthletes(
  clubId: string,
  parentGuardianIds: string[],
  restrictToParentGuardians: boolean
): Promise<AthleteProfile[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const visibleAthleteIds = restrictToParentGuardians
    ? await loadParentVisibleAthleteIds(clubId, parentGuardianIds)
    : [];

  let athleteQuery = supabase
    .from("athletes")
    .select("id, full_name, birth_date, gender, status, current_group_id, belt_rank_id, current_belt_text, weight, photo_path, joined_at, profile_summary")
    .eq("club_id", clubId)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (restrictToParentGuardians) {
    if (visibleAthleteIds.length === 0) {
      return [];
    }

    athleteQuery = athleteQuery.in("id", visibleAthleteIds);
  }

  const { data: athletes, error: athletesError } = await athleteQuery;

  if (athletesError) {
    throw new Error(`Unable to load athletes: ${athletesError.message}`);
  }

  const athleteRows = athletes as unknown as AthleteRow[];
  const athleteIds = athleteRows.map((athlete) => athlete.id);
  const beltRankMap = await loadBeltRankMap(supabase);
  const guardianMap = await loadGuardianMap(clubId, athleteIds, restrictToParentGuardians ? parentGuardianIds : []);
  const photoUrlMap = await loadAthletePhotoUrlMap(athleteRows.map((athlete) => athlete.photo_path).filter(isPresent));

  return athleteRows.map((athlete) => {
    const fallbackGroupId = athlete.current_group_id ?? "unassigned";

    return {
      id: athlete.id,
      fullName: athlete.full_name,
      birthDate: athlete.birth_date,
      birthYear: new Date(`${athlete.birth_date}T00:00:00`).getUTCFullYear(),
      gender: isAthleteGender(athlete.gender) ? athlete.gender : null,
      status: athlete.status,
      groupId: fallbackGroupId,
      beltRankId: athlete.belt_rank_id,
      currentBelt: (athlete.belt_rank_id ? beltRankMap.get(athlete.belt_rank_id) : null) ?? localizeKnownAthleteText(athlete.current_belt_text),
      weight: athlete.weight === null ? null : Number(athlete.weight),
      photoUrl: athlete.photo_path ? photoUrlMap.get(athlete.photo_path) ?? null : null,
      joinedAt: athlete.joined_at,
      profileSummary: localizeKnownAthleteText(athlete.profile_summary),
      guardians: guardianMap.get(athlete.id) ?? []
    };
  });
}

async function loadBeltRankMap(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data, error } = await supabase
    .from("belt_ranks")
    .select("id, name")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("rank_order", { ascending: true });

  if (error) {
    return new Map<string, string>();
  }

  return new Map((data as BeltRankRow[]).map((rank) => [rank.id, rank.name]));
}

async function loadAthletePhotoUrlMap(photoPaths: string[]) {
  const uniquePaths = [...new Set(photoPaths)];

  if (uniquePaths.length === 0) {
    return new Map<string, string>();
  }

  try {
    const admin = createAdminSupabaseClient();
    const entries = await Promise.all(
      uniquePaths.map(async (path) => {
        const { data, error } = await admin.storage.from("athlete-photos").createSignedUrl(path, 60 * 60);
        return error || !data?.signedUrl ? null : ([path, data.signedUrl] as const);
      })
    );

    return new Map(entries.filter(isPresent));
  } catch {
    return new Map<string, string>();
  }
}

export async function loadGuardianOptions(clubId: string): Promise<GuardianOption[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("guardians")
    .select("id, full_name, phone, email")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load guardians: ${error.message}`);
  }

  return (data as GuardianOptionRow[]).map((guardian) => ({
    id: guardian.id,
    fullName: guardian.full_name,
    phone: guardian.phone,
    email: guardian.email ?? undefined
  }));
}

export async function createPersistedAthlete(input: AthleteMutationInput): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("athletes")
    .insert({
      club_id: input.clubId,
      full_name: input.fullName,
      birth_date: input.birthDate,
      gender: input.gender,
      status: input.status,
      current_group_id: input.currentGroupId,
      belt_rank_id: input.beltRankId,
      current_belt_text: input.currentBeltText,
      weight: input.weight,
      profile_summary: input.profileSummary
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create athlete: ${error.message}`);
  }

  return data.id;
}

export async function createPersistedGuardian(input: {
  clubId: string;
  fullName: string;
  phone: string;
  email: string | null;
}): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("guardians")
    .insert({
      club_id: input.clubId,
      full_name: input.fullName,
      phone: input.phone,
      email: input.email
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create guardian: ${error.message}`);
  }

  return data.id;
}

export async function updatePersistedGuardian(input: {
  clubId: string;
  guardianId: string;
  fullName: string;
  phone: string;
  email: string | null;
}): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("guardians")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      email: input.email,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.guardianId)
    .eq("club_id", input.clubId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to update guardian: ${error.message}`);
  }
}

export async function updatePersistedAthlete(athleteId: string, input: AthleteMutationInput): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("athletes")
    .update({
      full_name: input.fullName,
      birth_date: input.birthDate,
      gender: input.gender,
      status: input.status,
      current_group_id: input.currentGroupId,
      belt_rank_id: input.beltRankId,
      current_belt_text: input.currentBeltText,
      weight: input.weight,
      profile_summary: input.profileSummary,
      updated_at: new Date().toISOString()
    })
    .eq("id", athleteId)
    .eq("club_id", input.clubId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to update athlete: ${error.message}`);
  }
}

export async function updatePersistedAthletePhoto(input: {
  clubId: string;
  athleteId: string;
  photoPath: string;
}): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("athletes")
    .update({
      photo_path: input.photoPath,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.athleteId)
    .eq("club_id", input.clubId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to update athlete photo: ${error.message}`);
  }
}

export async function createPersistedWeightMeasurement(input: {
  clubId: string;
  athleteId: string;
  measuredAt: string;
  weight: number;
  note: string;
  createdByUserProfileId: string;
}): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error: insertError } = await admin.from("athlete_weight_measurements").insert({
    club_id: input.clubId,
    athlete_id: input.athleteId,
    measured_at: input.measuredAt,
    weight: input.weight,
    note: input.note,
    created_by_user_profile_id: input.createdByUserProfileId
  });

  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await admin
    .from("athletes")
    .update({
      weight: input.weight,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.athleteId)
    .eq("club_id", input.clubId)
    .is("deleted_at", null);

  if (updateError) {
    throw updateError;
  }
}

function isAthleteGender(value: string | null): value is AthleteGender {
  return value === "M" || value === "Ж";
}

export async function linkPersistedGuardianToAthlete(input: {
  clubId: string;
  athleteId: string;
  guardianId: string;
  relationship: GuardianRelationship;
  isPrimaryContact?: boolean;
}): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("athlete_guardians").insert({
    club_id: input.clubId,
    athlete_id: input.athleteId,
    guardian_id: input.guardianId,
    relationship: input.relationship,
    is_primary_contact: input.isPrimaryContact ?? false,
    receives_notifications: true,
    is_active: true
  });

  if (error) {
    throw new Error(`Unable to link guardian: ${error.message}`);
  }
}

export async function removePersistedGuardianLink(input: {
  clubId: string;
  athleteId: string;
  guardianId: string;
}): Promise<void> {
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await admin
    .from("athlete_guardians")
    .update({
      is_active: false,
      deleted_at: now,
      updated_at: now
    })
    .eq("club_id", input.clubId)
    .eq("athlete_id", input.athleteId)
    .eq("guardian_id", input.guardianId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to remove guardian link: ${error.message}`);
  }
}

async function loadParentVisibleAthleteIds(clubId: string, parentGuardianIds: string[]) {
  if (parentGuardianIds.length === 0) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("athlete_guardians")
    .select("athlete_id")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .in("guardian_id", parentGuardianIds);

  if (error) {
    throw new Error(`Unable to load parent athlete scope: ${error.message}`);
  }

  return [...new Set(data.map((row) => row.athlete_id))];
}

async function loadGuardianMap(clubId: string, athleteIds: string[], parentGuardianIds: string[]) {
  const guardiansByAthlete = new Map<string, GuardianSummary[]>();

  if (athleteIds.length === 0) {
    return guardiansByAthlete;
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("athlete_guardians")
    .select("athlete_id, relationship, is_primary_contact, guardians!athlete_guardians_guardian_id_fkey(id, full_name, phone, email)")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .in("athlete_id", athleteIds);

  if (parentGuardianIds.length > 0) {
    query = query.in("guardian_id", parentGuardianIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load athlete guardians: ${error.message}`);
  }

  for (const relation of data as unknown as GuardianRelationRow[]) {
    if (!relation.guardians) {
      continue;
    }

    const existing = guardiansByAthlete.get(relation.athlete_id) ?? [];
    existing.push({
      id: relation.guardians.id,
      fullName: relation.guardians.full_name,
      relationship: relation.relationship,
      phone: relation.guardians.phone,
      email: relation.guardians.email ?? undefined,
      isPrimaryContact: relation.is_primary_contact
    });
    guardiansByAthlete.set(relation.athlete_id, existing);
  }

  return guardiansByAthlete;
}

function localizeKnownGroupText(value: string) {
  const translations: Record<string, string> = {
    "Junior Group": "Помлада група",
    "Younger athletes and early competition preparation.": "Помлади спортисти и основна натпреварувачка подготовка.",
    "Monday, Wednesday, Friday": "Понеделник, среда, петок",
    "Advanced Group": "Напредна група",
    "Experienced competitors and higher-intensity training.": "Искусни натпреварувачи и тренинг со поголем интензитет.",
    "Tuesday, Thursday, Saturday": "Вторник, четврток, сабота"
  };

  return translations[value] ?? value;
}

function localizeKnownAthleteText(value: string) {
  const translations: Record<string, string> = {
    "White belt": "Бел појас",
    "Yellow belt": "Жолт појас",
    "Orange belt": "Портокалов појас",
    "Consistent junior athlete. Needs parent confirmation workflows in the competition phase.":
      "Редовна спортистка од помладата група. Подготвена за идните процеси за присуство и натпревари.",
    "Advanced group athlete. Profile is ready for future attendance and competition history.":
      "Спортист од напредната група. Профилот е подготвен за идно присуство и натпреварувачка историја.",
    "Temporarily paused. Operational visibility remains, but no attendance workflow exists yet.":
      "Привремено паузиран. Оперативната видливост останува, без процес за присуство во оваа фаза."
  };

  return translations[value] ?? value;
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
