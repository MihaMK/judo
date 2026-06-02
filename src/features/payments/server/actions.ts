"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { getSessionContext } from "@/features/auth/server/session";
import { calculateMonthsCovered, PAYMENT_METHODS, type PaymentMethod } from "../domain/payment";
import { getAthleteMembershipSummary, isMembershipSchemaMissingError } from "./payment-read-models";

export type MembershipPaymentActionState = {
  ok?: boolean;
  message?: string;
};

export async function createMembershipPaymentAction(
  _previousState: MembershipPaymentActionState,
  formData: FormData
): Promise<MembershipPaymentActionState> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
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
    const admin = createAdminSupabaseClient();
    const { error } = await admin.from("membership_payments").insert({
      club_id: sessionContext.clubId,
      athlete_id: athleteId,
      amount,
      payment_method: paymentMethod,
      payment_date: paymentDate,
      created_by_user_profile_id: sessionContext.userProfileId
    });

    if (error) {
      if (isMembershipSchemaMissingError(error)) {
        return { message: "Membership schema не е подготвена. Применете ја миграцијата за членарини.", ok: false };
      }

      return { message: `Уплатата не е зачувана: ${error.message}`, ok: false };
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Уплатата не е зачувана.",
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
