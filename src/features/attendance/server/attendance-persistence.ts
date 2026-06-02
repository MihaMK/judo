import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import type { AttendanceSessionView, AttendanceStatus, AttendanceTrainingOption } from "../domain/attendance";

type AthleteRow = {
  id: string;
  full_name: string;
  birth_date: string;
  current_belt_text: string;
};

type TrainingGroupRow = {
  id: string;
  name: string;
};

type SessionRow = {
  id: string;
  notes: string;
};

type EntryRow = {
  athlete_id: string;
  status: AttendanceStatus;
  note: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

export class AttendanceSchemaMissingError extends Error {
  constructor(message = "Attendance tables are not available in Supabase.") {
    super(message);
    this.name = "AttendanceSchemaMissingError";
  }
}

export type SaveAttendanceInput = {
  clubId: string;
  groupId: string;
  sessionDate: string;
  userProfileId: string;
  notes: string;
  entries: Array<{
    athleteId: string;
    status: AttendanceStatus;
    note: string;
  }>;
};

export type SaveAttendanceEntryInput = {
  clubId: string;
  groupId: string;
  sessionDate: string;
  userProfileId: string;
  athleteId: string;
  status: Extract<AttendanceStatus, "present" | "absent">;
};

// TODO: Replace these UI-only times when a real training schedule model exists.
const TRAINING_TIME_PRESETS = ["18:00", "19:00", "20:00"];

export async function loadAttendanceTrainingOptions(input: {
  clubId: string;
  sessionDate: string;
}): Promise<AttendanceTrainingOption[]> {
  const groups = await loadTrainingGroups(input.clubId);

  return Promise.all(
    groups.map(async (group, index) => {
      const trainingTime = TRAINING_TIME_PRESETS[index] ?? `${18 + index}:00`;
      const session = await loadAttendanceSessionView({
        clubId: input.clubId,
        groupId: group.id,
        groupName: group.name,
        sessionDate: input.sessionDate,
        trainingTime
      });

      return {
        groupId: group.id,
        groupName: group.name,
        trainingTime,
        expectedAthletes: session.athletes.length,
        session
      };
    })
  );
}

export async function loadAttendanceSessionView(input: {
  clubId: string;
  groupId: string;
  groupName: string;
  sessionDate: string;
  trainingTime?: string;
}): Promise<AttendanceSessionView> {
  const athletes = await loadGroupAthletes(input.clubId, input.groupId);
  const session = await loadExistingSession(input.clubId, input.groupId, input.sessionDate);
  const entries = session ? await loadExistingEntries(input.clubId, session.id) : new Map<string, EntryRow>();

  return {
    sessionId: session?.id ?? null,
    groupId: input.groupId,
    groupName: input.groupName,
    sessionDate: input.sessionDate,
    trainingTime: input.trainingTime,
    notes: session?.notes ?? "",
    athletes: athletes.map((athlete) => {
      const existingEntry = entries.get(athlete.id);

      return {
        id: athlete.id,
        fullName: athlete.full_name,
        birthYear: new Date(`${athlete.birth_date}T00:00:00Z`).getUTCFullYear(),
        currentBelt: athlete.current_belt_text,
        existingStatus: existingEntry?.status ?? "present",
        existingNote: existingEntry?.note ?? ""
      };
    })
  };
}

async function loadTrainingGroups(clubId: string): Promise<TrainingGroupRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_groups")
    .select("id, name")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load attendance training groups: ${error.message}`);
  }

  return data as TrainingGroupRow[];
}

export async function saveAttendanceSession(input: SaveAttendanceInput): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data: existingSession, error: existingSessionError } = await admin
    .from("attendance_sessions")
    .select("id")
    .eq("club_id", input.clubId)
    .eq("training_group_id", input.groupId)
    .eq("session_date", input.sessionDate)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingSessionError) {
    throwAttendanceSchemaMissingError(existingSessionError);
    throw new Error(`Unable to inspect attendance session: ${existingSessionError.message}`);
  }

  const { data: session, error: sessionError } = existingSession
    ? await admin
        .from("attendance_sessions")
        .update({
          trainer_user_profile_id: input.userProfileId,
          notes: input.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSession.id)
        .eq("club_id", input.clubId)
        .select("id")
        .single()
    : await admin
        .from("attendance_sessions")
        .insert({
          club_id: input.clubId,
          training_group_id: input.groupId,
          session_date: input.sessionDate,
          trainer_user_profile_id: input.userProfileId,
          created_by_user_profile_id: input.userProfileId,
          notes: input.notes
        })
        .select("id")
        .single();

  if (sessionError) {
    throwAttendanceSchemaMissingError(sessionError);
    throw new Error(`Unable to save attendance session: ${sessionError.message}`);
  }

  const sessionId = session.id;

  if (input.entries.length === 0) {
    return sessionId;
  }

  const { data: existingEntries, error: existingEntriesError } = await admin
    .from("attendance_entries")
    .select("id, athlete_id")
    .eq("club_id", input.clubId)
    .eq("attendance_session_id", sessionId)
    .is("deleted_at", null);

  if (existingEntriesError) {
    throwAttendanceSchemaMissingError(existingEntriesError);
    throw new Error(`Unable to inspect attendance entries: ${existingEntriesError.message}`);
  }

  const existingByAthlete = new Map((existingEntries as Array<{ id: string; athlete_id: string }>).map((entry) => [entry.athlete_id, entry.id]));
  const now = new Date().toISOString();
  const inserts = input.entries
    .filter((entry) => !existingByAthlete.has(entry.athleteId))
    .map((entry) => ({
      club_id: input.clubId,
      attendance_session_id: sessionId,
      athlete_id: entry.athleteId,
      status: entry.status,
      note: entry.note
    }));
  const updates = input.entries.filter((entry) => existingByAthlete.has(entry.athleteId));

  if (inserts.length > 0) {
    const { error } = await admin.from("attendance_entries").insert(inserts);

    if (error) {
      throwAttendanceSchemaMissingError(error);
      throw new Error(`Unable to create attendance entries: ${error.message}`);
    }
  }

  for (const entry of updates) {
    const { error } = await admin
      .from("attendance_entries")
      .update({
        status: entry.status,
        note: entry.note,
        updated_at: now
      })
      .eq("id", existingByAthlete.get(entry.athleteId))
      .eq("club_id", input.clubId);

    if (error) {
      throwAttendanceSchemaMissingError(error);
      throw new Error(`Unable to update attendance entry: ${error.message}`);
    }
  }

  return sessionId;
}

export async function saveAttendanceEntry(input: SaveAttendanceEntryInput): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data: existingSession, error: existingSessionError } = await admin
    .from("attendance_sessions")
    .select("id")
    .eq("club_id", input.clubId)
    .eq("training_group_id", input.groupId)
    .eq("session_date", input.sessionDate)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingSessionError) {
    throwAttendanceSchemaMissingError(existingSessionError);
    throw new Error(`Unable to inspect attendance session: ${existingSessionError.message}`);
  }

  const { data: session, error: sessionError } = existingSession
    ? await admin
        .from("attendance_sessions")
        .update({
          trainer_user_profile_id: input.userProfileId,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSession.id)
        .eq("club_id", input.clubId)
        .select("id")
        .single()
    : await admin
        .from("attendance_sessions")
        .insert({
          club_id: input.clubId,
          training_group_id: input.groupId,
          session_date: input.sessionDate,
          trainer_user_profile_id: input.userProfileId,
          created_by_user_profile_id: input.userProfileId
        })
        .select("id")
        .single();

  if (sessionError) {
    throwAttendanceSchemaMissingError(sessionError);
    throw new Error(`Unable to save attendance session: ${sessionError.message}`);
  }

  const sessionId = session.id;
  const { data: existingEntry, error: existingEntryError } = await admin
    .from("attendance_entries")
    .select("id")
    .eq("club_id", input.clubId)
    .eq("attendance_session_id", sessionId)
    .eq("athlete_id", input.athleteId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingEntryError) {
    throwAttendanceSchemaMissingError(existingEntryError);
    throw new Error(`Unable to inspect attendance entry: ${existingEntryError.message}`);
  }

  const { error: entryError } = existingEntry
    ? await admin
        .from("attendance_entries")
        .update({
          status: input.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingEntry.id)
        .eq("club_id", input.clubId)
    : await admin.from("attendance_entries").insert({
        club_id: input.clubId,
        attendance_session_id: sessionId,
        athlete_id: input.athleteId,
        status: input.status,
        note: ""
      });

  if (entryError) {
    throwAttendanceSchemaMissingError(entryError);
    throw new Error(`Unable to save attendance entry: ${entryError.message}`);
  }

  return sessionId;
}

async function loadGroupAthletes(clubId: string, groupId: string): Promise<AthleteRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("id, full_name, birth_date, current_belt_text")
    .eq("club_id", clubId)
    .eq("current_group_id", groupId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load attendance athletes: ${error.message}`);
  }

  return data as AthleteRow[];
}

async function loadExistingSession(clubId: string, groupId: string, sessionDate: string): Promise<SessionRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id, notes")
    .eq("club_id", clubId)
    .eq("training_group_id", groupId)
    .eq("session_date", sessionDate)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throwAttendanceSchemaMissingError(error);
    throw new Error(`Unable to load attendance session: ${error.message}`);
  }

  return data as SessionRow | null;
}

async function loadExistingEntries(clubId: string, sessionId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_entries")
    .select("athlete_id, status, note")
    .eq("club_id", clubId)
    .eq("attendance_session_id", sessionId)
    .is("deleted_at", null);

  if (error) {
    throwAttendanceSchemaMissingError(error);
    throw new Error(`Unable to load attendance entries: ${error.message}`);
  }

  return new Map((data as EntryRow[]).map((entry) => [entry.athlete_id, entry]));
}

export function isAttendanceSchemaMissingError(error: unknown): error is AttendanceSchemaMissingError {
  return error instanceof AttendanceSchemaMissingError;
}

function throwAttendanceSchemaMissingError(error: SupabaseErrorLike) {
  if (isMissingAttendanceTableError(error)) {
    throw new AttendanceSchemaMissingError();
  }
}

function isMissingAttendanceTableError(error: SupabaseErrorLike) {
  return (
    error.code === "PGRST205" &&
    typeof error.message === "string" &&
    (error.message.includes("attendance_sessions") || error.message.includes("attendance_entries"))
  );
}
