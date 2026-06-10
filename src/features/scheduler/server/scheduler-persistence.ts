import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import type {
  SchedulerManagementView,
  TrainingGroupOption,
  TrainingSessionSummary
} from "../domain/scheduler";

type ScheduleRow = {
  id: string;
  training_group_id: string;
  day_of_week: number;
  start_time: string;
  is_active: boolean;
};

type SessionRow = {
  id: string;
  training_group_id: string;
  scheduled_date: string;
  scheduled_time: string;
  session_type: "regular" | "extra";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string | null;
  cancellation_reason: string | null;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

export class SchedulerSchemaMissingError extends Error {
  constructor(message = "Training scheduler tables are not available in Supabase.") {
    super(message);
    this.name = "SchedulerSchemaMissingError";
  }
}

export async function loadSchedulerManagementView(input: {
  clubId: string;
  year: number;
  month: number;
}): Promise<SchedulerManagementView> {
  if (!isSupabaseConfigured()) {
    return {
      year: input.year,
      month: input.month,
      groups: [],
      schedules: [],
      sessions: []
    };
  }

  const groups = await loadTrainingGroups(input.clubId);
  const groupMap = new Map(groups.map((group) => [group.id, group.name]));
  const [schedules, sessions, athleteCounts] = await Promise.all([
    loadSchedules(input.clubId),
    loadSessionsForMonth(input.clubId, input.year, input.month),
    loadActiveAthleteCounts(input.clubId)
  ]);

  return {
    year: input.year,
    month: input.month,
    groups,
    schedules: schedules.map((schedule) => ({
      id: schedule.id,
      groupId: schedule.training_group_id,
      groupName: groupMap.get(schedule.training_group_id) ?? "Непозната група",
      dayOfWeek: schedule.day_of_week,
      startTime: formatTime(schedule.start_time),
      isActive: schedule.is_active
    })),
    sessions: sessions.map((session) => ({
      id: session.id,
      groupId: session.training_group_id,
      groupName: groupMap.get(session.training_group_id) ?? "Непозната група",
      date: session.scheduled_date,
      time: formatTime(session.scheduled_time),
      type: session.session_type,
      status: session.status,
      athleteCount: athleteCounts.get(session.training_group_id) ?? 0,
      notes: session.notes ?? "",
      cancellationReason: session.cancellation_reason ?? ""
    }))
  };
}

export async function loadTodayTrainingSessions(input: {
  clubId: string;
  date: string;
}): Promise<TrainingSessionSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const groups = await loadTrainingGroups(input.clubId);
  const groupMap = new Map(groups.map((group) => [group.id, group.name]));
  const [sessions, athleteCounts] = await Promise.all([
    loadSessionsForDate(input.clubId, input.date),
    loadActiveAthleteCounts(input.clubId)
  ]);

  return sessions.map((session) => ({
    id: session.id,
    groupId: session.training_group_id,
    groupName: groupMap.get(session.training_group_id) ?? "Непозната група",
    date: session.scheduled_date,
    time: formatTime(session.scheduled_time),
    type: session.session_type,
    status: session.status,
    athleteCount: athleteCounts.get(session.training_group_id) ?? 0,
    notes: session.notes ?? "",
    cancellationReason: session.cancellation_reason ?? ""
  }));
}

export async function createScheduleTemplate(input: {
  clubId: string;
  groupId: string;
  dayOfWeek: number;
  startTime: string;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("training_schedules").insert({
    club_id: input.clubId,
    training_group_id: input.groupId,
    day_of_week: input.dayOfWeek,
    start_time: input.startTime
  });

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to create training schedule: ${error.message}`);
  }
}

export async function deactivateScheduleTemplate(input: {
  clubId: string;
  scheduleId: string;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("training_schedules")
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", input.scheduleId)
    .eq("club_id", input.clubId);

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to deactivate training schedule: ${error.message}`);
  }
}

export async function generateMonthlySessions(input: {
  clubId: string;
  userProfileId: string;
  year: number;
  month: number;
}) {
  const schedules = (await loadSchedules(input.clubId)).filter((schedule) => schedule.is_active);
  const admin = createAdminSupabaseClient();
  let created = 0;

  for (const date of getDatesInMonth(input.year, input.month)) {
    const dayOfWeek = getIsoDayOfWeek(date);
    const dateText = toDateInputValue(date);
    const matchingSchedules = schedules.filter((schedule) => schedule.day_of_week === dayOfWeek);

    for (const schedule of matchingSchedules) {
      const time = formatTime(schedule.start_time);
      const { data: existing, error: existingError } = await admin
        .from("attendance_sessions")
        .select("id")
        .eq("club_id", input.clubId)
        .eq("training_group_id", schedule.training_group_id)
        .eq("scheduled_date", dateText)
        .eq("scheduled_time", time)
        .is("deleted_at", null)
        .maybeSingle();

      if (existingError) {
        throwSchedulerSchemaMissingError(existingError);
        throw new Error(`Unable to inspect generated training session: ${existingError.message}`);
      }

      if (existing) {
        continue;
      }

      const { error } = await admin.from("attendance_sessions").insert({
        club_id: input.clubId,
        training_group_id: schedule.training_group_id,
        session_date: dateText,
        scheduled_date: dateText,
        scheduled_time: time,
        schedule_id: schedule.id,
        session_type: "regular",
        status: "scheduled",
        created_by_user_profile_id: input.userProfileId
      });

      if (error) {
        throwSchedulerSchemaMissingError(error);
        throw new Error(`Unable to generate training session: ${error.message}`);
      }

      created += 1;
    }
  }

  return created;
}

export async function cancelTrainingSession(input: {
  clubId: string;
  sessionId: string;
  reason: string;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("attendance_sessions")
    .update({
      status: "cancelled",
      cancellation_reason: input.reason,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.sessionId)
    .eq("club_id", input.clubId);

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to cancel training session: ${error.message}`);
  }
}

export async function rescheduleTrainingSession(input: {
  clubId: string;
  sessionId: string;
  date: string;
  time: string;
}) {
  const admin = createAdminSupabaseClient();
  const { data: session, error: sessionError } = await admin
    .from("attendance_sessions")
    .select("scheduled_date, scheduled_time, original_date, original_time")
    .eq("id", input.sessionId)
    .eq("club_id", input.clubId)
    .single();

  if (sessionError) {
    throwSchedulerSchemaMissingError(sessionError);
    throw new Error(`Unable to inspect training session: ${sessionError.message}`);
  }

  const { error } = await admin
    .from("attendance_sessions")
    .update({
      session_date: input.date,
      scheduled_date: input.date,
      scheduled_time: input.time,
      original_date: session.original_date ?? session.scheduled_date,
      original_time: session.original_time ?? session.scheduled_time,
      status: "rescheduled",
      updated_at: new Date().toISOString()
    })
    .eq("id", input.sessionId)
    .eq("club_id", input.clubId);

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to reschedule training session: ${error.message}`);
  }
}

export async function createExtraTrainingSession(input: {
  clubId: string;
  userProfileId: string;
  groupId: string;
  date: string;
  time: string;
  notes: string;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("attendance_sessions").insert({
    club_id: input.clubId,
    training_group_id: input.groupId,
    session_date: input.date,
    scheduled_date: input.date,
    scheduled_time: input.time,
    session_type: "extra",
    status: "scheduled",
    created_by_user_profile_id: input.userProfileId,
    notes: input.notes
  });

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to create extra training session: ${error.message}`);
  }
}

async function loadTrainingGroups(clubId: string): Promise<TrainingGroupOption[]> {
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
    throw new Error(`Unable to load training groups: ${error.message}`);
  }

  return (data ?? []) as TrainingGroupOption[];
}

async function loadSchedules(clubId: string): Promise<ScheduleRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_schedules")
    .select("id, training_group_id, day_of_week, start_time, is_active")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to load training schedules: ${error.message}`);
  }

  return (data ?? []) as ScheduleRow[];
}

async function loadSessionsForMonth(clubId: string, year: number, month: number): Promise<SessionRow[]> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = toDateInputValue(new Date(Date.UTC(year, month, 0)));

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id, training_group_id, scheduled_date, scheduled_time, session_type, status, notes, cancellation_reason")
    .eq("club_id", clubId)
    .gte("scheduled_date", from)
    .lte("scheduled_date", to)
    .is("deleted_at", null)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to load training sessions: ${error.message}`);
  }

  return (data ?? []) as SessionRow[];
}

async function loadSessionsForDate(clubId: string, date: string): Promise<SessionRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id, training_group_id, scheduled_date, scheduled_time, session_type, status, notes, cancellation_reason")
    .eq("club_id", clubId)
    .eq("scheduled_date", date)
    .neq("status", "cancelled")
    .is("deleted_at", null)
    .order("scheduled_time", { ascending: true });

  if (error) {
    throwSchedulerSchemaMissingError(error);
    throw new Error(`Unable to load today's training sessions: ${error.message}`);
  }

  return (data ?? []) as SessionRow[];
}

async function loadActiveAthleteCounts(clubId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("current_group_id")
    .eq("club_id", clubId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to load training athlete counts: ${error.message}`);
  }

  const counts = new Map<string, number>();

  for (const row of (data ?? []) as Array<{ current_group_id: string | null }>) {
    if (!row.current_group_id) {
      continue;
    }

    counts.set(row.current_group_id, (counts.get(row.current_group_id) ?? 0) + 1);
  }

  return counts;
}

function getDatesInMonth(year: number, month: number) {
  const dates: Date[] = [];
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();

  for (let day = 1; day <= days; day += 1) {
    dates.push(new Date(Date.UTC(year, month - 1, day)));
  }

  return dates;
}

function getIsoDayOfWeek(date: Date) {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function isSchedulerSchemaMissingError(error: unknown): error is SchedulerSchemaMissingError {
  return error instanceof SchedulerSchemaMissingError;
}

function throwSchedulerSchemaMissingError(error: SupabaseErrorLike) {
  if (isMissingSchedulerSchemaError(error)) {
    throw new SchedulerSchemaMissingError();
  }
}

function isMissingSchedulerSchemaError(error: SupabaseErrorLike) {
  if (!error.message) {
    return false;
  }

  return (
    ["PGRST205", "PGRST204", "42703", "42P01"].includes(error.code ?? "") &&
    (error.message.includes("training_schedules") ||
      error.message.includes("attendance_sessions") ||
      error.message.includes("scheduled_date") ||
      error.message.includes("scheduled_time") ||
      error.message.includes("session_type") ||
      error.message.includes("cancellation_reason"))
  );
}
