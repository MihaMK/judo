"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/features/auth/server/session";
import { type AttendanceStatus } from "../domain/attendance";
import { isAttendanceSchemaMissingError, saveAttendanceEntry } from "./attendance-persistence";

export type AttendanceSaveState = {
  message?: string;
  ok?: boolean;
};

export type AttendanceEntrySaveInput = {
  sessionId: string;
  athleteId: string;
  status: Extract<AttendanceStatus, "present" | "absent">;
};

export async function markAttendanceEntryAction(input: AttendanceEntrySaveInput): Promise<AttendanceSaveState> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { message: "Потребна е најава.", ok: false };
  }

  if (sessionContext.role !== "management" && sessionContext.role !== "trainer") {
    return { message: "Само управа и тренери можат да уредуваат присуство.", ok: false };
  }

  if (!input.sessionId || !input.athleteId) {
    return { message: "Недостасуваат податоци за присуство.", ok: false };
  }

  if (input.status !== "present" && input.status !== "absent") {
    return { message: "Невалиден статус за присуство.", ok: false };
  }

  try {
    await saveAttendanceEntry({
      clubId: sessionContext.clubId,
      sessionId: input.sessionId,
      userProfileId: sessionContext.userProfileId,
      athleteId: input.athleteId,
      status: input.status
    });
  } catch (error) {
    return {
      message: getAttendanceActionErrorMessage(error, "Присуството не е зачувано."),
      ok: false
    };
  }

  revalidatePath("/attendance");
  revalidatePath("/today");
  return { ok: true, message: "Зачувано" };
}

export async function saveAttendanceAction(): Promise<AttendanceSaveState> {
  return {
    ok: false,
    message: "Овој начин на зачувување е заменет со автоматско зачувување по конкретен тренинг."
  };
}

function getAttendanceActionErrorMessage(error: unknown, fallback: string) {
  if (isAttendanceSchemaMissingError(error)) {
    return "Присуството не е подготвено. Применете ја attendance/scheduler миграцијата и освежете ја страницата.";
  }

  return error instanceof Error ? error.message : fallback;
}
