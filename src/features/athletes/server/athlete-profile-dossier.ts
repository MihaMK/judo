import type { SessionContext } from "@/features/auth/domain/roles";
import type { MembershipSummary } from "@/features/payments/domain/payment";
import { getAthleteMembershipSummary } from "@/features/payments/server/payment-read-models";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import type { AthleteProfileView } from "../domain/athlete";
import { calculateAthleteCategory } from "./category-logic";

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

export type AthleteWeightMeasurement = {
  id: string;
  measuredAt: string;
  weight: number;
  note: string;
};

export type AthleteProfileDossier = {
  ageGroupName: string;
  weightCategoryName: string;
  attendance: AthleteAttendanceSummary;
  membership: MembershipSummary;
  weightHistory: {
    available: boolean;
    recent: AthleteWeightMeasurement[];
  };
};

type AttendanceEntryRow = {
  status: "present" | "absent";
  attendance_session_id: string;
};

type AttendanceSessionRow = {
  id: string;
  session_date: string;
};

type WeightMeasurementRow = {
  id: string;
  measured_at: string;
  weight: number | string;
  note: string | null;
};

export async function getAthleteProfileDossier(
  athlete: AthleteProfileView,
  sessionContext: SessionContext
): Promise<AthleteProfileDossier> {
  const [category, attendance, membership, weightHistory] = await Promise.all([
    loadCategorySummary(athlete),
    loadAttendanceSummary(athlete.id, sessionContext.clubId),
    getAthleteMembershipSummary({
      clubId: sessionContext.clubId,
      athleteId: athlete.id
    }),
    loadWeightHistory(athlete.id, sessionContext.clubId)
  ]);

  return {
    ageGroupName: category.ageGroupName,
    weightCategoryName: category.weightCategoryName,
    attendance,
    membership,
    weightHistory
  };
}

async function loadWeightHistory(athleteId: string, clubId: string | null): Promise<AthleteProfileDossier["weightHistory"]> {
  if (!clubId || !isSupabaseConfigured()) {
    return { available: false, recent: [] };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("athlete_weight_measurements")
      .select("id, measured_at, weight, note")
      .eq("club_id", clubId)
      .eq("athlete_id", athleteId)
      .is("deleted_at", null)
      .order("measured_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      if (isMissingWeightHistoryError(error)) {
        return { available: false, recent: [] };
      }

      throw new Error(`Unable to load athlete weight history: ${error.message}`);
    }

    return {
      available: true,
      recent: (data as WeightMeasurementRow[]).map((measurement) => ({
        id: measurement.id,
        measuredAt: measurement.measured_at,
        weight: Number(measurement.weight),
        note: measurement.note ?? ""
      }))
    };
  } catch (error) {
    if (isMissingWeightHistoryError(error)) {
      return { available: false, recent: [] };
    }

    throw error;
  }
}

async function loadCategorySummary(athlete: AthleteProfileView) {
  try {
    const category = await calculateAthleteCategory({
      birthDate: athlete.birthDate,
      gender: athlete.gender ?? "M",
      weight: athlete.weight ?? null
    });

    return {
      ageGroupName: category.ageGroupName || "Нема дефинирана категорија",
      weightCategoryName: athlete.gender
        ? category.weightCategoryName || "Нема дефинирана тежинска категорија"
        : "Нема внесен пол"
    };
  } catch (error) {
    if (isSchemaCacheError(error, "age_groups") || isSchemaCacheError(error, "weight_categories")) {
      return {
        ageGroupName: "Категориите не се достапни",
        weightCategoryName: "Категориите не се достапни"
      };
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

function getIsoDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function isMissingAttendanceError(error: unknown) {
  return isSchemaCacheError(error, "attendance_sessions") || isSchemaCacheError(error, "attendance_entries");
}

function isMissingWeightHistoryError(error: unknown) {
  return isSchemaCacheError(error, "athlete_weight_measurements");
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
