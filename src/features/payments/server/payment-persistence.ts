import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import {
  calculateMonthsCovered,
  DEFAULT_MONTHLY_MEMBERSHIP_FEE,
  type MembershipPaymentRecord,
  type PaymentMethod
} from "../domain/payment";

type PaymentRow = {
  id: string;
  athlete_id: string;
  amount: number | string;
  payment_method: PaymentMethod;
  payment_date: string | null;
  created_at: string;
};

export type CreatePaymentInput = {
  clubId: string;
  athleteId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  createdBy: string;
};

export async function loadPaymentsByAthleteId(clubId: string, athleteIds: string[]) {
  const paymentsByAthleteId = new Map<string, MembershipPaymentRecord[]>();

  if (athleteIds.length === 0) {
    return paymentsByAthleteId;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, athlete_id, amount, payment_method, payment_date, created_at")
    .eq("club_id", clubId)
    .in("athlete_id", athleteIds)
    .order("payment_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isPaymentsSchemaMissingError(error)) {
      return paymentsByAthleteId;
    }

    throw new Error(`Unable to load payments: ${error.message}`);
  }

  for (const payment of data as PaymentRow[]) {
    const existing = paymentsByAthleteId.get(payment.athlete_id) ?? [];
    const amount = Number(payment.amount);
    existing.push({
      id: payment.id,
      athleteId: payment.athlete_id,
      amount,
      paymentMethod: payment.payment_method,
      paymentDate: payment.payment_date ?? payment.created_at.slice(0, 10),
      monthsCovered: calculateMonthsCovered(amount, DEFAULT_MONTHLY_MEMBERSHIP_FEE),
      createdAt: payment.created_at
    });
    paymentsByAthleteId.set(payment.athlete_id, existing);
  }

  return paymentsByAthleteId;
}

export async function createPaymentRecord(input: CreatePaymentInput) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("payments").insert({
    club_id: input.clubId,
    athlete_id: input.athleteId,
    amount: input.amount,
    payment_method: input.paymentMethod,
    payment_date: input.paymentDate,
    created_by: input.createdBy
  });

  if (error) {
    throw error;
  }
}

export function isPaymentsSchemaMissingError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as { code?: string; message?: string };
  return (
    possibleError.code === "PGRST205" &&
    typeof possibleError.message === "string" &&
    possibleError.message.includes("payments")
  );
}
