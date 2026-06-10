import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import type { AttendanceSessionView, AttendanceStatus, AttendanceTrainingOption } from "../domain/attendance";

type AthleteRow = {
  id: string;
  full_name: string;
  birth_date: string | null;
  current_belt_text: string | null;
};

type TrainingGroupRow = {
  id: string;
  name: string;
};

type ScheduledSessionRow = {
  id: string;
  training_group_id: string;
  scheduled_date: string;
  scheduled_time: string;
  session_type: "regular" | "extra";
  status: "scheduled" | "completed" | "rescheduled" | "cancelled";
  notes: string | null;
};

type EntryRow = {
  athlete_id: string;
  status: AttendanceStatus;
  note: string | null;
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
  sessionId: string;
  userProfileId: string;
  athleteId: string;
  status: Extract<AttendanceStatus, "present" | "absent">;
};

export async function loadAttendanceTrainingOptions(input: {
  clubId: string;
  sessionDate: string;
}): Promise<AttendanceTrainingOption[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const sessions = await loadScheduledSessions(input.clubId, input.sessionDate);

  if (sessions.length === 0) {
    return [];
  }

  const groups = await loadTrainingGroupsByIds(
    input.clubId,
    Array.from(new Set(sessions.map((session) => session.training_group_id)))
  );

  return Promise.all(
    sessions.map(async (session) => {
      const groupName = groups.get(session.training_group_id)?.name ?? "Непозната група";
      const view = await buildAttendanceSessionView({
        clubId: input.clubId,
        session,
        groupName
      });

      return {
        sessionId: session.id,
        groupId: session.training_group_id,
        groupName,
        trainingTime: formatSessionTime(session.scheduled_time),
        sessionType: session.session_type,
        status: normalizeSessionStatus(session.status),
        expectedAthletes: view.athletes.length,
        session: view
      };
    })
  );
}

export async function saveAttendanceSession(input: SaveAttendanceInput): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data: existingSession, error: existingSessionError } = await admin
    .from("attendance_sessions")
    .select("id")
    .eq("club_id", input.clubId)
    .eq("training_group_id", input.groupId)
    .eq("scheduled_date", input.sessionDate)
    .eq("scheduled_time", "00:00")
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
          scheduled_date: input.sessionDate,
          scheduled_time: "00:00",
          session_type: "regular",
          status: "scheduled",
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

  await saveAttendanceEntries({
    clubId: input.clubId,
    sessionId: session.id,
    entries: input.entries
  });

  return session.id;
}

export async function saveAttendanceEntry(input: SaveAttendanceEntryInput): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data: session, error: sessionError } = await admin
    .from("attendance_sessions")
    .select("id, training_group_id, status")
    .eq("id", input.sessionId)
    .eq("club_id", input.clubId)
    .is("deleted_at", null)
    .single();

  if (sessionError) {
    throwAttendanceSchemaMissingError(sessionError);
    throw new Error(`Unable to inspect attendance session: ${sessionError.message}`);
  }

  if (!session || session.status === "cancelled") {
    throw new Error("Овој тренинг е откажан и не може да се евидентира присуство.");
  }

  const { data: athlete, error: athleteError } = await admin
    .from("athletes")
    .select("id")
    .eq("id", input.athleteId)
    .eq("club_id", input.clubId)
    .eq("current_group_id", session.training_group_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (athleteError) {
    throw new Error(`Unable to validate attendance athlete: ${athleteError.message}`);
  }

  if (!athlete) {
    throw new Error("Спортистот не припаѓа на избраниот тренинг.");
  }

  const { data: existingEntry, error: existingEntryError } = await admin
    .from("attendance_entries")
    .select("id")
    .eq("club_id", input.clubId)
    .eq("attendance_session_id", input.sessionId)
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
        attendance_session_id: input.sessionId,
        athlete_id: input.athleteId,
        status: input.status,
        note: ""
      });

  if (entryError) {
    throwAttendanceSchemaMissingError(entryError);
    throw new Error(`Unable to save attendance entry: ${entryError.message}`);
  }

  return input.sessionId;
}

async function buildAttendanceSessionView(input: {
  clubId: string;
  session: ScheduledSessionRow;
  groupName: string;
}): Promise<AttendanceSessionView> {
  const athletes = await loadGroupAthletes(input.clubId, input.session.training_group_id);
  const entries = await loadExistingEntries(input.clubId, input.session.id);

  return {
    sessionId: input.session.id,
    groupId: input.session.training_group_id,
    groupName: input.groupName,
    sessionDate: input.session.scheduled_date,
    trainingTime: formatSessionTime(input.session.scheduled_time),
    sessionType: input.session.session_type,
    status: normalizeSessionStatus(input.session.status),
    notes: input.session.notes ?? "",
    athletes: athletes.map((athlete) => {
      const existingEntry = entries.get(athlete.id);

      return {
        id: athlete.id,
        fullName: athlete.full_name,
        birthYear: athlete.birth_date ? new Date(`${athlete.birth_date}T00:00:00Z`).getUTCFullYear() : 0,
        currentBelt: athlete.current_belt_text ?? "",
        existingStatus: existingEntry?.status ?? "present",
        existingNote: existingEntry?.note ?? ""
      };
    })
  };
}

async function loadScheduledSessions(clubId: string, sessionDate: string): Promise<ScheduledSessionRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id, training_group_id, scheduled_date, scheduled_time, session_type, status, notes")
    .eq("club_id", clubId)
    .eq("scheduled_date", sessionDate)
    .neq("status", "cancelled")
    .is("deleted_at", null)
    .order("scheduled_time", { ascending: true });

  if (error) {
    throwAttendanceSchemaMissingError(error);
    throw new Error(`Unable to load attendance sessions: ${error.message}`);
  }

  return (data ?? []) as ScheduledSessionRow[];
}

async function loadTrainingGroupsByIds(clubId: string, groupIds: string[]): Promise<Map<string, TrainingGroupRow>> {
  if (groupIds.length === 0) {
    return new Map();
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_groups")
    .select("id, name")
    .eq("club_id", clubId)
    .in("id", groupIds)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to load attendance training groups: ${error.message}`);
  }

  return new Map(((data ?? []) as TrainingGroupRow[]).map((group) => [group.id, group]));
}

async function saveAttendanceEntries(input: {
  clubId: string;
  sessionId: string;
  entries: Array<{
    athleteId: string;
    status: AttendanceStatus;
    note: string;
  }>;
}) {
  if (input.entries.length === 0) {
    return;
  }

  const admin = createAdminSupabaseClient();
  const { data: existingEntries, error: existingEntriesError } = await admin
    .from("attendance_entries")
    .select("id, athlete_id")
    .eq("club_id", input.clubId)
    .eq("attendance_session_id", input.sessionId)
    .is("deleted_at", null);

  if (existingEntriesError) {
    throwAttendanceSchemaMissingError(existingEntriesError);
    throw new Error(`Unable to inspect attendance entries: ${existingEntriesError.message}`);
  }

  const existingByAthlete = new Map(
    (existingEntries as Array<{ id: string; athlete_id: string }>).map((entry) => [entry.athlete_id, entry.id])
  );
  const now = new Date().toISOString();
  const inserts = input.entries
    .filter((entry) => !existingByAthlete.has(entry.athleteId))
    .map((entry) => ({
      club_id: input.clubId,
      attendance_session_id: input.sessionId,
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
}

async function loadGroupAthletes(clubId: string, groupId: string): Promise<AthleteRow[]> {
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
    (error.code === "PGRST205" || error.code === "PGRST204" || error.code === "42703" || error.code === "42P01") &&
    typeof error.message === "string" &&
    (error.message.includes("attendance_sessions") ||
      error.message.includes("attendance_entries") ||
      error.message.includes("scheduled_date") ||
      error.message.includes("scheduled_time"))
  );
}

function normalizeSessionStatus(status: ScheduledSessionRow["status"]) {
  return status === "cancelled" ? "scheduled" : status;
}

function formatSessionTime(value: string) {
  return value.slice(0, 5);
}
