import type { SessionContext } from "@/features/auth/domain/roles";
import { getMembershipDashboardSummary } from "@/features/payments/server/payment-read-models";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";

type ActiveAthleteRow = {
  id: string;
  birth_date: string | null;
  gender: string | null;
  current_group_id: string | null;
  belt_rank_id: string | null;
  current_belt_text: string | null;
  weight: number | string | null;
  federation_license_number: string | null;
  photo_path: string | null;
};

type AttendanceEntryRow = {
  athlete_id: string;
  status: "present" | "absent";
  attendance_session_id: string;
};

type AttendanceSessionRow = {
  id: string;
  session_date: string;
};

export type TodayCommandCenterView = {
  activeAthletes: number;
  activeGroupsWithAthletes: number;
  unpaidMemberships: number;
  paidMemberships: number;
  absentOver30Days: number;
  athletesWithoutPhoto: number;
  incompleteAthleteProfiles: number;
};

export async function getTodayCommandCenterView(sessionContext: SessionContext): Promise<TodayCommandCenterView> {
  if (!sessionContext.clubId || !isSupabaseConfigured()) {
    return emptyTodayCommandCenterView();
  }

  const [athleteStats, membershipStats] = await Promise.all([
    loadActiveAthleteStats(sessionContext.clubId),
    getMembershipDashboardSummary(sessionContext)
  ]);

  const absentOver30Days = await loadAbsentOver30DaysCount({
    clubId: sessionContext.clubId,
    activeAthleteIds: athleteStats.activeAthleteIds
  });

  return {
    activeAthletes: athleteStats.activeAthletes,
    activeGroupsWithAthletes: athleteStats.activeGroupsWithAthletes,
    unpaidMemberships: membershipStats.unpaidAthletes,
    paidMemberships: membershipStats.paidAthletes,
    absentOver30Days,
    athletesWithoutPhoto: athleteStats.athletesWithoutPhoto,
    incompleteAthleteProfiles: athleteStats.incompleteAthleteProfiles
  };
}

async function loadActiveAthleteStats(clubId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("id, birth_date, gender, current_group_id, belt_rank_id, current_belt_text, weight, federation_license_number, photo_path")
    .eq("club_id", clubId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to load Today athlete stats: ${error.message}`);
  }

  const athletes = data as ActiveAthleteRow[];
  const activeGroups = new Set(athletes.map((athlete) => athlete.current_group_id).filter(Boolean));

  return {
    activeAthletes: athletes.length,
    activeAthleteIds: athletes.map((athlete) => athlete.id),
    activeGroupsWithAthletes: activeGroups.size,
    athletesWithoutPhoto: athletes.filter((athlete) => !athlete.photo_path).length,
    incompleteAthleteProfiles: athletes.filter(hasIncompleteOperationalProfile).length
  };
}

async function loadAbsentOver30DaysCount(input: { clubId: string; activeAthleteIds: string[] }) {
  if (input.activeAthleteIds.length === 0) {
    return 0;
  }

  const supabase = await createServerSupabaseClient();
  const { data: entries, error: entriesError } = await supabase
    .from("attendance_entries")
    .select("athlete_id, status, attendance_session_id")
    .eq("club_id", input.clubId)
    .in("athlete_id", input.activeAthleteIds)
    .is("deleted_at", null);

  if (entriesError) {
    if (isMissingAttendanceTableError(entriesError)) {
      return 0;
    }

    throw new Error(`Unable to load Today attendance entries: ${entriesError.message}`);
  }

  const attendanceEntries = entries as AttendanceEntryRow[];
  const sessionIds = [...new Set(attendanceEntries.map((entry) => entry.attendance_session_id))];

  if (sessionIds.length === 0) {
    return 0;
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("attendance_sessions")
    .select("id, session_date")
    .eq("club_id", input.clubId)
    .in("id", sessionIds)
    .is("deleted_at", null);

  if (sessionsError) {
    if (isMissingAttendanceTableError(sessionsError)) {
      return 0;
    }

    throw new Error(`Unable to load Today attendance sessions: ${sessionsError.message}`);
  }

  const sessionDateById = new Map((sessions as AttendanceSessionRow[]).map((session) => [session.id, session.session_date]));
  const cutoff = toIsoDate(addDays(new Date(), -30));
  const athletesWithAnyAttendance = new Set<string>();
  const athletesPresentInLast30Days = new Set<string>();

  for (const entry of attendanceEntries) {
    const sessionDate = sessionDateById.get(entry.attendance_session_id);

    if (!sessionDate) {
      continue;
    }

    athletesWithAnyAttendance.add(entry.athlete_id);

    if (entry.status === "present" && sessionDate >= cutoff) {
      athletesPresentInLast30Days.add(entry.athlete_id);
    }
  }

  return [...athletesWithAnyAttendance].filter((athleteId) => !athletesPresentInLast30Days.has(athleteId)).length;
}

function hasIncompleteOperationalProfile(athlete: ActiveAthleteRow) {
  const hasBelt = Boolean(athlete.belt_rank_id || athlete.current_belt_text?.trim());

  return (
    !athlete.birth_date ||
    !athlete.gender ||
    !athlete.current_group_id ||
    !hasBelt ||
    athlete.weight === null ||
    athlete.weight === "" ||
    !athlete.federation_license_number
  );
}

function emptyTodayCommandCenterView(): TodayCommandCenterView {
  return {
    activeAthletes: 0,
    activeGroupsWithAthletes: 0,
    unpaidMemberships: 0,
    paidMemberships: 0,
    absentOver30Days: 0,
    athletesWithoutPhoto: 0,
    incompleteAthleteProfiles: 0
  };
}

function isMissingAttendanceTableError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as { code?: string; message?: string };
  return (
    possibleError.code === "PGRST205" &&
    typeof possibleError.message === "string" &&
    (possibleError.message.includes("attendance_entries") || possibleError.message.includes("attendance_sessions"))
  );
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
