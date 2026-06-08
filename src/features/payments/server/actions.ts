"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/features/auth/server/session";
import { calculateMonthsCovered, PAYMENT_METHODS, type PaymentMethod } from "../domain/payment";
import { getAthleteMembershipSummary, isMembershipSchemaMissingError } from "./payment-read-models";
import { createPaymentRecord } from "./payment-persistence";

export type PaymentActionState = {
  ok?: boolean;
  message?: string;
};

export async function createPayment(
  _previousState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userId || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { message: "Потребна е најава.", ok: false };
  }

  if (sessionContext.role !== "management" && sessionContext.role !== "trainer") {
    return { message: "Само управа и тренери можат да внесуваат уплати.", ok: false };
  }

  const athleteId = String(formData.get("athleteId") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").trim());
  const paymentMethod = String(formData.get("paymentMethod") ?? "cash").trim();
  const paymentDate = String(formData.get("paymentDate") ?? getTodayDate()).trim();

  if (!athleteId) {
    return { message: "Недостасува спортист.", ok: false };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { message: "Внесете валиден износ.", ok: false };
  }

  if (!isPaymentMethod(paymentMethod)) {
    return { message: "Изберете валиден начин на плаќање.", ok: false };
  }

  if (!isValidDate(paymentDate)) {
    return { message: "Изберете валиден датум на уплата.", ok: false };
  }

  const membership = await getAthleteMembershipSummary({
    clubId: sessionContext.clubId,
    athleteId
  });
  const monthsCovered = calculateMonthsCovered(amount, membership.monthlyFee);

  if (monthsCovered <= 0) {
    return { message: "Износот мора да покрие најмалку еден цел месец.", ok: false };
  }

  try {
    await createPaymentRecord({
      clubId: sessionContext.clubId,
      athleteId,
      amount,
      paymentMethod,
      paymentDate,
      createdBy: sessionContext.userId
    });
  } catch (error) {
    if (isMembershipSchemaMissingError(error)) {
      return { message: "Табелата за уплати не е достапна. Проверете ја Supabase конфигурацијата.", ok: false };
    }

    return {
      message: `Уплатата не е зачувана: ${formatUnknownError(error)}`,
      ok: false
    };
  }

  revalidatePath("/payments");
  revalidatePath("/today");
  revalidatePath(`/athletes/${athleteId}`);
  return { ok: true, message: "Уплатата е зачувана." };
}

function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatUnknownError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const possibleError = error as { message?: unknown; details?: unknown; code?: unknown };
    const parts = [possibleError.message, possibleError.details, possibleError.code]
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  return "Проверете ја Supabase payments конфигурацијата.";
}
