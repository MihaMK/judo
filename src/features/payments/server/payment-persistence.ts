import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import {
  calculateMonthsCovered,
  DEFAULT_MONTHLY_MEMBERSHIP_FEE,
  type AthleteMembershipRecord,
  type MembershipAllocationRecord,
  type MembershipExemptionRecord,
  type MembershipPaymentRecord,
  type PaymentMethod
} from "../domain/payment";

type PaymentRow = {
  id: string;
  athlete_id: string;
  amount: number | string;
  payment_method: string;
  payment_date: string | null;
  created_at: string;
};

type AthleteMembershipRow = {
  id: string;
  athlete_id: string;
  start_month: string;
  monthly_fee: number | string;
  status: "active" | "paused" | "inactive";
};

type AllocationRow = {
  id: string;
  athlete_id: string;
  payment_id: string;
  membership_month: string;
  amount_allocated: number | string;
  created_at: string;
};

type ExemptionRow = {
  id: string;
  athlete_id: string;
  membership_month: string;
  reason: string;
  note: string;
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

export type CreateAthleteMembershipInput = {
  clubId: string;
  athleteId: string;
  startMonth: string;
  monthlyFee?: number;
  createdByUserProfileId: string;
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
      paymentMethod: mapPaymentMethodFromDatabase(payment.payment_method),
      paymentDate: payment.payment_date ?? payment.created_at.slice(0, 10),
      monthsCovered: calculateMonthsCovered(amount, DEFAULT_MONTHLY_MEMBERSHIP_FEE),
      createdAt: payment.created_at
    });
    paymentsByAthleteId.set(payment.athlete_id, existing);
  }

  return paymentsByAthleteId;
}

export async function loadMembershipsByAthleteId(clubId: string, athleteIds: string[]) {
  const membershipsByAthleteId = new Map<string, AthleteMembershipRecord>();

  if (athleteIds.length === 0) {
    return membershipsByAthleteId;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("athlete_memberships")
    .select("id, athlete_id, start_month, monthly_fee, status")
    .eq("club_id", clubId)
    .is("deleted_at", null)
    .in("athlete_id", athleteIds);

  if (error) {
    if (isMembershipFoundationMissingError(error)) {
      return membershipsByAthleteId;
    }

    throw new Error(`Unable to load athlete memberships: ${error.message}`);
  }

  for (const membership of data as AthleteMembershipRow[]) {
    membershipsByAthleteId.set(membership.athlete_id, {
      id: membership.id,
      athleteId: membership.athlete_id,
      startMonth: membership.start_month,
      monthlyFee: Number(membership.monthly_fee),
      status: membership.status
    });
  }

  return membershipsByAthleteId;
}

export async function loadMembershipAllocationsByAthleteId(clubId: string, athleteIds: string[]) {
  const allocationsByAthleteId = new Map<string, MembershipAllocationRecord[]>();

  if (athleteIds.length === 0) {
    return allocationsByAthleteId;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("membership_payment_allocations")
    .select("id, athlete_id, payment_id, membership_month, amount_allocated, created_at")
    .eq("club_id", clubId)
    .is("deleted_at", null)
    .in("athlete_id", athleteIds)
    .order("membership_month", { ascending: true });

  if (error) {
    if (isMembershipFoundationMissingError(error)) {
      return allocationsByAthleteId;
    }

    throw new Error(`Unable to load membership allocations: ${error.message}`);
  }

  for (const allocation of data as AllocationRow[]) {
    const existing = allocationsByAthleteId.get(allocation.athlete_id) ?? [];
    existing.push({
      id: allocation.id,
      athleteId: allocation.athlete_id,
      paymentId: allocation.payment_id,
      membershipMonth: allocation.membership_month,
      amountAllocated: Number(allocation.amount_allocated),
      createdAt: allocation.created_at
    });
    allocationsByAthleteId.set(allocation.athlete_id, existing);
  }

  return allocationsByAthleteId;
}

export async function loadMembershipExemptionsByAthleteId(clubId: string, athleteIds: string[]) {
  const exemptionsByAthleteId = new Map<string, MembershipExemptionRecord[]>();

  if (athleteIds.length === 0) {
    return exemptionsByAthleteId;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("membership_month_exemptions")
    .select("id, athlete_id, membership_month, reason, note, created_at")
    .eq("club_id", clubId)
    .is("deleted_at", null)
    .is("voided_at", null)
    .in("athlete_id", athleteIds)
    .order("membership_month", { ascending: true });

  if (error) {
    if (isMembershipFoundationMissingError(error)) {
      return exemptionsByAthleteId;
    }

    throw new Error(`Unable to load membership exemptions: ${error.message}`);
  }

  for (const exemption of data as ExemptionRow[]) {
    const existing = exemptionsByAthleteId.get(exemption.athlete_id) ?? [];
    existing.push({
      id: exemption.id,
      athleteId: exemption.athlete_id,
      membershipMonth: exemption.membership_month,
      reason: exemption.reason,
      note: exemption.note,
      createdAt: exemption.created_at
    });
    exemptionsByAthleteId.set(exemption.athlete_id, existing);
  }

  return exemptionsByAthleteId;
}

export async function createPaymentRecord(input: CreatePaymentInput) {
  const admin = createAdminSupabaseClient();
  const payload = {
    club_id: input.clubId,
    athlete_id: input.athleteId,
    amount: input.amount,
    payment_method: mapPaymentMethodToDatabase(input.paymentMethod),
    payment_date: input.paymentDate,
    created_by: input.createdBy
  };
  const { data, error } = await admin.from("payments").insert(payload).select("id").single();

  if (isPaymentMethodConstraintError(error)) {
    const { data: fallbackData, error: fallbackError } = await admin.from("payments").insert({
      ...payload,
      payment_method: input.paymentMethod
    }).select("id").single();

    if (fallbackError) {
      throw fallbackError;
    }

    return fallbackData.id as string;
  }

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function createPaymentAllocations(input: {
  clubId: string;
  athleteId: string;
  paymentId: string;
  months: string[];
  monthlyFee: number;
}) {
  if (input.months.length === 0) {
    return;
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("membership_payment_allocations").insert(
    input.months.map((month) => ({
      club_id: input.clubId,
      athlete_id: input.athleteId,
      payment_id: input.paymentId,
      membership_month: month,
      amount_allocated: input.monthlyFee
    }))
  );

  if (error) {
    throw error;
  }
}

export async function createAthleteMembership(input: CreateAthleteMembershipInput) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("athlete_memberships").insert({
    club_id: input.clubId,
    athlete_id: input.athleteId,
    start_month: input.startMonth,
    monthly_fee: input.monthlyFee ?? DEFAULT_MONTHLY_MEMBERSHIP_FEE,
    status: "active",
    created_by_user_profile_id: input.createdByUserProfileId
  });

  if (error) {
    throw error;
  }
}

function mapPaymentMethodToDatabase(method: PaymentMethod) {
  return method === "bank_transfer" ? "Трансакциска сметка" : "Готовина";
}

function mapPaymentMethodFromDatabase(method: string): PaymentMethod {
  if (method === "bank_transfer" || method === "Трансакциска сметка") {
    return "bank_transfer";
  }

  return "cash";
}

function isPaymentMethodConstraintError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as { code?: string; message?: string; details?: string };
  return (
    possibleError.code === "23514" &&
    [possibleError.message, possibleError.details].some((value) =>
      typeof value === "string" && value.toLowerCase().includes("payment_method")
    )
  );
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

export function isMembershipFoundationMissingError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as { code?: string; message?: string };
  return (
    possibleError.code === "PGRST205" &&
    typeof possibleError.message === "string" &&
    ["athlete_memberships", "membership_payment_allocations", "membership_month_exemptions"].some((table) =>
      possibleError.message?.includes(table)
    )
  );
}
