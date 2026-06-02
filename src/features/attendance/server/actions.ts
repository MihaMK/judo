"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/features/auth/server/session";
import { mk } from "@/shared/i18n/mk";
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "../domain/attendance";
import { isAttendanceSchemaMissingError, saveAttendanceEntry, saveAttendanceSession } from "./attendance-persistence";

export type AttendanceSaveState = {
  message?: string;
  ok?: boolean;
};

export type AttendanceEntrySaveInput = {
  groupId: string;
  sessionDate: string;
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

  if (!input.groupId || !input.athleteId || !isValidDate(input.sessionDate)) {
    return { message: "Недостасуваат податоци за присуство.", ok: false };
  }

  if (input.status !== "present" && input.status !== "absent") {
    return { message: "Невалиден статус за присуство.", ok: false };
  }

  try {
    await saveAttendanceEntry({
      clubId: sessionContext.clubId,
      groupId: input.groupId,
      sessionDate: input.sessionDate,
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
  return { ok: true, message: "Зачувано" };
}

export async function saveAttendanceAction(_previousState: AttendanceSaveState, formData: FormData): Promise<AttendanceSaveState> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { message: mk.auth.loginRequired };
  }

  if (sessionContext.role !== "management" && sessionContext.role !== "trainer") {
    return { message: mk.pages.attendance.accessDenied };
  }

  const groupId = String(formData.get("groupId") ?? "").trim();
  const sessionDate = String(formData.get("sessionDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!groupId) {
    return { message: mk.pages.attendance.validationMissingGroup };
  }

  if (!isValidDate(sessionDate)) {
    return { message: mk.pages.attendance.validationMissingDate };
  }

  const athleteIds = formData.getAll("athleteId").map((value) => String(value).trim()).filter(Boolean);
  const entries = athleteIds.map((athleteId) => {
    const rawStatus = String(formData.get(`status:${athleteId}`) ?? "present");
    const status: AttendanceStatus = isAttendanceStatus(rawStatus) ? rawStatus : "present";
    const note = String(formData.get(`note:${athleteId}`) ?? "").trim();

    return { athleteId, status, note };
  });

  try {
    await saveAttendanceSession({
      clubId: sessionContext.clubId,
      groupId,
      sessionDate,
      userProfileId: sessionContext.userProfileId,
      notes,
      entries
    });
  } catch (error) {
    return { message: getAttendanceActionErrorMessage(error, "Неуспешно зачувување присуство.") };
  }

  revalidatePath("/attendance");
  return { ok: true, message: mk.pages.attendance.saved };
}

function getAttendanceActionErrorMessage(error: unknown, fallback: string) {
  if (isAttendanceSchemaMissingError(error)) {
    return "Присуството не е подготвено. Применете ја attendance миграцијата и освежете ја страницата.";
  }

  return error instanceof Error ? error.message : fallback;
}

function isAttendanceStatus(value: string): value is AttendanceStatus {
  return ATTENDANCE_STATUSES.includes(value as AttendanceStatus);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
