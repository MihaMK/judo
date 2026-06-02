import type { SessionContext } from "@/features/auth/domain/roles";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import {
  DEFAULT_MONTHLY_MEMBERSHIP_FEE,
  calculateMembershipSummary,
  calculateMonthsCovered,
  type MembershipPaymentRecord,
  type MembershipSummary,
  type PaymentAthlete,
  type PaymentMethod
} from "../domain/payment";

type AthleteRow = {
  id: string;
  full_name: string;
  current_group_id: string | null;
};

type TrainingGroupRow = {
  id: string;
  name: string;
};

type GuardianRelationRow = {
  athlete_id: string;
  guardians: {
    full_name: string;
    phone: string;
  } | null;
};

type PaymentRow = {
  id: string;
  athlete_id: string;
  amount: number | string;
  payment_method: PaymentMethod;
  payment_date: string;
  created_at: string;
};

type MembershipSettingsRow = {
  monthly_fee_amount: number | string;
};

export async function getPaymentAthletesView(sessionContext: SessionContext): Promise<PaymentAthlete[]> {
  if (!sessionContext.clubId || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const visibleAthleteIds = sessionContext.role === "parent"
    ? await loadParentVisibleAthleteIds(sessionContext.clubId, sessionContext.parentGuardianIds)
    : [];

  let athleteQuery = supabase
    .from("athletes")
    .select("id, full_name, current_group_id")
    .eq("club_id", sessionContext.clubId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (sessionContext.role === "parent") {
    if (visibleAthleteIds.length === 0) {
      return [];
    }

    athleteQuery = athleteQuery.in("id", visibleAthleteIds);
  }

  const { data: athletes, error: athletesError } = await athleteQuery;

  if (athletesError) {
    throw new Error(`Unable to load payment athletes: ${athletesError.message}`);
  }

  const athleteRows = athletes as AthleteRow[];
  const athleteIds = athleteRows.map((athlete) => athlete.id);
  const [groupsById, guardiansByAthleteId, monthlyFee] = await Promise.all([
    loadGroupsById(sessionContext.clubId),
    loadGuardiansByAthleteId(sessionContext.clubId, athleteIds, sessionContext.role === "parent" ? sessionContext.parentGuardianIds : []),
    loadMonthlyFee(sessionContext.clubId)
  ]);
  const paymentsByAthleteId = await loadPaymentsByAthleteId(sessionContext.clubId, athleteIds, monthlyFee);

  return athleteRows.map((athlete) => {
    const guardians = guardiansByAthleteId.get(athlete.id) ?? [];

    return {
      id: athlete.id,
      fullName: athlete.full_name,
      groupName: athlete.current_group_id ? groupsById.get(athlete.current_group_id) ?? "Нераспределена група" : "Нераспределена група",
      guardianNames: guardians.map((guardian) => guardian.fullName),
      guardianPhones: guardians.map((guardian) => guardian.phone),
      membership: calculateMembershipSummary({
        monthlyFee,
        payments: paymentsByAthleteId.get(athlete.id) ?? []
      })
    };
  });
}

export async function getAthleteMembershipSummary(input: {
  clubId: string | null;
  athleteId: string;
}): Promise<MembershipSummary> {
  if (!input.clubId || !isSupabaseConfigured()) {
    return calculateMembershipSummary({ monthlyFee: DEFAULT_MONTHLY_MEMBERSHIP_FEE, payments: [] });
  }

  const monthlyFee = await loadMonthlyFee(input.clubId);
  const paymentsByAthleteId = await loadPaymentsByAthleteId(input.clubId, [input.athleteId], monthlyFee);

  return calculateMembershipSummary({
    monthlyFee,
    payments: paymentsByAthleteId.get(input.athleteId) ?? []
  });
}

export async function getMembershipDashboardSummary(sessionContext: SessionContext) {
  const athletes = await getPaymentAthletesView(sessionContext);

  return {
    activeAthletes: athletes.length,
    paidAthletes: athletes.filter((athlete) => athlete.membership.status === "paid").length,
    unpaidAthletes: athletes.filter((athlete) => athlete.membership.status === "overdue").length
  };
}

async function loadMonthlyFee(clubId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("club_membership_settings")
    .select("monthly_fee_amount")
    .eq("club_id", clubId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    if (isMembershipSchemaMissingError(error)) {
      return DEFAULT_MONTHLY_MEMBERSHIP_FEE;
    }

    throw new Error(`Unable to load membership settings: ${error.message}`);
  }

  return data ? Number((data as MembershipSettingsRow).monthly_fee_amount) : DEFAULT_MONTHLY_MEMBERSHIP_FEE;
}

async function loadPaymentsByAthleteId(clubId: string, athleteIds: string[], monthlyFee: number) {
  const paymentsByAthleteId = new Map<string, MembershipPaymentRecord[]>();

  if (athleteIds.length === 0) {
    return paymentsByAthleteId;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("membership_payments")
    .select("id, athlete_id, amount, payment_method, payment_date, created_at")
    .eq("club_id", clubId)
    .is("deleted_at", null)
    .in("athlete_id", athleteIds)
    .order("payment_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMembershipSchemaMissingError(error)) {
      return paymentsByAthleteId;
    }

    throw new Error(`Unable to load membership payments: ${error.message}`);
  }

  for (const payment of data as PaymentRow[]) {
    const existing = paymentsByAthleteId.get(payment.athlete_id) ?? [];
    const amount = Number(payment.amount);
    existing.push({
      id: payment.id,
      athleteId: payment.athlete_id,
      amount,
      paymentMethod: payment.payment_method,
      paymentDate: payment.payment_date,
      monthsCovered: calculateMonthsCovered(amount, monthlyFee),
      createdAt: payment.created_at
    });
    paymentsByAthleteId.set(payment.athlete_id, existing);
  }

  return paymentsByAthleteId;
}

async function loadGroupsById(clubId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_groups")
    .select("id, name")
    .eq("club_id", clubId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to load payment groups: ${error.message}`);
  }

  return new Map((data as TrainingGroupRow[]).map((group) => [group.id, group.name]));
}

async function loadGuardiansByAthleteId(clubId: string, athleteIds: string[], guardianScope: string[]) {
  const guardiansByAthleteId = new Map<string, Array<{ fullName: string; phone: string }>>();

  if (athleteIds.length === 0) {
    return guardiansByAthleteId;
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("athlete_guardians")
    .select("athlete_id, guardians!athlete_guardians_guardian_id_fkey(full_name, phone)")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .in("athlete_id", athleteIds);

  if (guardianScope.length > 0) {
    query = query.in("guardian_id", guardianScope);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load payment guardians: ${error.message}`);
  }

  for (const relation of data as unknown as GuardianRelationRow[]) {
    if (!relation.guardians) {
      continue;
    }

    const existing = guardiansByAthleteId.get(relation.athlete_id) ?? [];
    existing.push({
      fullName: relation.guardians.full_name,
      phone: relation.guardians.phone
    });
    guardiansByAthleteId.set(relation.athlete_id, existing);
  }

  return guardiansByAthleteId;
}

async function loadParentVisibleAthleteIds(clubId: string, parentGuardianIds: string[]) {
  if (parentGuardianIds.length === 0) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("athlete_guardians")
    .select("athlete_id")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .in("guardian_id", parentGuardianIds);

  if (error) {
    throw new Error(`Unable to load parent membership scope: ${error.message}`);
  }

  return [...new Set(data.map((row) => row.athlete_id))];
}

export function isMembershipSchemaMissingError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as { code?: string; message?: string };
  return (
    possibleError.code === "PGRST205" &&
    typeof possibleError.message === "string" &&
    (possibleError.message.includes("membership_payments") || possibleError.message.includes("club_membership_settings"))
  );
}
