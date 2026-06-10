"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/features/auth/server/session";
import {
  cancelTrainingSession,
  createExtraTrainingSession,
  createScheduleTemplate,
  deactivateScheduleTemplate,
  generateMonthlySessions,
  rescheduleTrainingSession
} from "./scheduler-persistence";

export type SchedulerActionState = {
  ok: boolean;
  message: string;
};

export async function createScheduleTemplateAction(input: {
  groupId: string;
  dayOfWeek: number;
  startTime: string;
}): Promise<SchedulerActionState> {
  const sessionContext = await requireManagement();

  if (!sessionContext.ok) {
    return sessionContext;
  }

  if (!input.groupId || !isValidDayOfWeek(input.dayOfWeek) || !isValidTime(input.startTime)) {
    return { ok: false, message: "Недостасуваат валидни податоци за неделен термин." };
  }

  try {
    await createScheduleTemplate({
      clubId: sessionContext.clubId,
      groupId: input.groupId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Терминот не е зачуван." };
  }

  revalidateSchedulePaths();
  return { ok: true, message: "Неделниот термин е зачуван." };
}

export async function deactivateScheduleTemplateAction(input: {
  scheduleId: string;
}): Promise<SchedulerActionState> {
  const sessionContext = await requireManagement();

  if (!sessionContext.ok) {
    return sessionContext;
  }

  if (!input.scheduleId) {
    return { ok: false, message: "Недостасува термин за деактивација." };
  }

  try {
    await deactivateScheduleTemplate({
      clubId: sessionContext.clubId,
      scheduleId: input.scheduleId
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Терминот не е деактивиран." };
  }

  revalidateSchedulePaths();
  return { ok: true, message: "Неделниот термин е деактивиран." };
}

export async function generateMonthlySessionsAction(input: {
  year: number;
  month: number;
}): Promise<SchedulerActionState> {
  const sessionContext = await requireManagement();

  if (!sessionContext.ok) {
    return sessionContext;
  }

  if (!isValidYearMonth(input.year, input.month)) {
    return { ok: false, message: "Изберете валиден месец." };
  }

  try {
    const created = await generateMonthlySessions({
      clubId: sessionContext.clubId,
      userProfileId: sessionContext.userProfileId,
      year: input.year,
      month: input.month
    });

    revalidateSchedulePaths();
    return { ok: true, message: `Генерирани се ${created} тренинзи.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Месечниот распоред не е генериран." };
  }
}

export async function cancelTrainingSessionAction(input: {
  sessionId: string;
  reason: string;
}): Promise<SchedulerActionState> {
  const sessionContext = await requireTrainerOrManagement();

  if (!sessionContext.ok) {
    return sessionContext;
  }

  if (!input.sessionId) {
    return { ok: false, message: "Недостасува тренинг за откажување." };
  }

  try {
    await cancelTrainingSession({
      clubId: sessionContext.clubId,
      sessionId: input.sessionId,
      reason: input.reason.trim()
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Тренингот не е откажан." };
  }

  revalidateSchedulePaths();
  return { ok: true, message: "Тренингот е откажан." };
}

export async function rescheduleTrainingSessionAction(input: {
  sessionId: string;
  date: string;
  time: string;
}): Promise<SchedulerActionState> {
  const sessionContext = await requireTrainerOrManagement();

  if (!sessionContext.ok) {
    return sessionContext;
  }

  if (!input.sessionId || !isValidDate(input.date) || !isValidTime(input.time)) {
    return { ok: false, message: "Изберете валиден датум и час за презакажување." };
  }

  try {
    await rescheduleTrainingSession({
      clubId: sessionContext.clubId,
      sessionId: input.sessionId,
      date: input.date,
      time: input.time
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Тренингот не е презакажан." };
  }

  revalidateSchedulePaths();
  return { ok: true, message: "Тренингот е презакажан." };
}

export async function createExtraTrainingSessionAction(input: {
  groupId: string;
  date: string;
  time: string;
  notes: string;
}): Promise<SchedulerActionState> {
  const sessionContext = await requireTrainerOrManagement();

  if (!sessionContext.ok) {
    return sessionContext;
  }

  if (!input.groupId || !isValidDate(input.date) || !isValidTime(input.time)) {
    return { ok: false, message: "Изберете група, датум и час за дополнителниот тренинг." };
  }

  try {
    await createExtraTrainingSession({
      clubId: sessionContext.clubId,
      userProfileId: sessionContext.userProfileId,
      groupId: input.groupId,
      date: input.date,
      time: input.time,
      notes: input.notes.trim()
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Дополнителниот тренинг не е зачуван." };
  }

  revalidateSchedulePaths();
  return { ok: true, message: "Дополнителниот тренинг е зачуван." };
}

async function requireManagement(): Promise<
  | { ok: true; clubId: string; userProfileId: string }
  | { ok: false; message: string }
> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.clubId || !sessionContext.userProfileId) {
    return { ok: false, message: "Потребна е најава." };
  }

  if (sessionContext.role !== "management") {
    return { ok: false, message: "Само управа може да го уредува неделниот распоред." };
  }

  return { ok: true, clubId: sessionContext.clubId, userProfileId: sessionContext.userProfileId };
}

async function requireTrainerOrManagement(): Promise<
  | { ok: true; clubId: string; userProfileId: string }
  | { ok: false; message: string }
> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.clubId || !sessionContext.userProfileId) {
    return { ok: false, message: "Потребна е најава." };
  }

  if (sessionContext.role !== "management" && sessionContext.role !== "trainer") {
    return { ok: false, message: "Само управа и тренери можат да уредуваат тренинзи." };
  }

  return { ok: true, clubId: sessionContext.clubId, userProfileId: sessionContext.userProfileId };
}

function revalidateSchedulePaths() {
  revalidatePath("/management/schedule");
  revalidatePath("/attendance");
  revalidatePath("/today");
}

function isValidYearMonth(year: number, month: number) {
  return Number.isInteger(year) && Number.isInteger(month) && year >= 2025 && year <= 2100 && month >= 1 && month <= 12;
}

function isValidDayOfWeek(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
