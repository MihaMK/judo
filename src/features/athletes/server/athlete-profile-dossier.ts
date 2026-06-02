import type { SessionContext } from "@/features/auth/domain/roles";
import type { MembershipSummary } from "@/features/payments/domain/payment";
import { getAthleteMembershipSummary } from "@/features/payments/server/payment-read-models";
import { getCategoryManagementView } from "@/features/categories/server/category-read-models";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import type { AthleteProfileView } from "../domain/athlete";

export type AthleteAttendanceRecord = {
  date: string;
  status: "present" | "absent";
};

export type AthleteAttendanceSummary = {
  available: boolean;
  present30Days: number;
  absent30Days: number;
  recent: AthleteAttendanceRecord[];
};

export type AthleteProfileDossier = {
  ageGroupName: string;
  attendance: AthleteAttendanceSummary;
  membership: MembershipSummary;
};

type AttendanceEntryRow = {
  status: "present" | "absent";
  attendance_session_id: string;
};

type AttendanceSessionRow = {
  id: string;
  session_date: string;
};

export async function getAthleteProfileDossier(
  athlete: AthleteProfileView,
  sessionContext: SessionContext
): Promise<AthleteProfileDossier> {
  const [ageGroupName, attendance, membership] = await Promise.all([
    loadAgeGroupName(athlete, sessionContext.clubId),
    loadAttendanceSummary(athlete.id, sessionContext.clubId),
    getAthleteMembershipSummary({
      clubId: sessionContext.clubId,
      athleteId: athlete.id
    })
  ]);

  return {
    ageGroupName,
    attendance,
    membership
  };
}

async function loadAgeGroupName(athlete: AthleteProfileView, clubId: string | null) {
  try {
    const groups = await getCategoryManagementView(clubId);

    if (groups.length === 0) {
      return "Ќе се пресмета кога категориите се достапни";
    }

    const age = calculateAge(athlete.birthDate);
    const group = groups.find((item) => {
      if (!item.isActive) {
        return false;
      }

      const matchesMin = item.minAge === null || age >= item.minAge;
      const matchesMax = item.maxAge === null || age <= item.maxAge;
      return matchesMin && matchesMax;
    });

    return group?.name ?? "Нема дефинирана категорија";
  } catch (error) {
    if (isSchemaCacheError(error, "competition_age_groups")) {
      return "Ќе се пресмета кога категориите се достапни";
    }

    throw error;
  }
}

async function loadAttendanceSummary(athleteId: string, clubId: string | null): Promise<AthleteAttendanceSummary> {
  if (!clubId || !isSupabaseConfigured()) {
    return emptyAttendanceSummary(false);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: entries, error: entriesError } = await supabase
      .from("attendance_entries")
      .select("status, attendance_session_id")
      .eq("club_id", clubId)
      .eq("athlete_id", athleteId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(60);

    if (entriesError) {
      if (isMissingAttendanceError(entriesError)) {
        return emptyAttendanceSummary(false);
      }

      throw new Error(`Unable to load athlete attendance entries: ${entriesError.message}`);
    }

    const entryRows = entries as AttendanceEntryRow[];
    const sessionIds = [...new Set(entryRows.map((entry) => entry.attendance_session_id))];

    if (sessionIds.length === 0) {
      return emptyAttendanceSummary(true);
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from("attendance_sessions")
      .select("id, session_date")
      .eq("club_id", clubId)
      .in("id", sessionIds)
      .is("deleted_at", null);

    if (sessionsError) {
      if (isMissingAttendanceError(sessionsError)) {
        return emptyAttendanceSummary(false);
      }

      throw new Error(`Unable to load athlete attendance sessions: ${sessionsError.message}`);
    }

    const sessionsById = new Map((sessions as AttendanceSessionRow[]).map((session) => [session.id, session.session_date]));
    const records = entryRows
      .map((entry) => ({
        date: sessionsById.get(entry.attendance_session_id),
        status: entry.status
      }))
      .filter((record): record is AthleteAttendanceRecord => Boolean(record.date))
      .sort((first, second) => second.date.localeCompare(first.date));
    const since = getIsoDateDaysAgo(30);
    const recent30 = records.filter((record) => record.date >= since);

    return {
      available: true,
      present30Days: recent30.filter((record) => record.status === "present").length,
      absent30Days: recent30.filter((record) => record.status === "absent").length,
      recent: records.slice(0, 5)
    };
  } catch (error) {
    if (isMissingAttendanceError(error)) {
      return emptyAttendanceSummary(false);
    }

    throw error;
  }
}

function emptyAttendanceSummary(available: boolean): AthleteAttendanceSummary {
  return {
    available,
    present30Days: 0,
    absent30Days: 0,
    recent: []
  };
}

function calculateAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = today.getUTCDate() - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function getIsoDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function isMissingAttendanceError(error: unknown) {
  return isSchemaCacheError(error, "attendance_sessions") || isSchemaCacheError(error, "attendance_entries");
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
