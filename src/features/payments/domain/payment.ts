export const DEFAULT_MONTHLY_MEMBERSHIP_FEE = 1000;
export const PAYMENT_METHODS = ["cash", "bank_transfer"] as const;
export const MEMBERSHIP_NON_PAYABLE_MONTHS = [7] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type MembershipStatus = "paid" | "overdue" | "not_payable" | "unknown";

export type MembershipPaymentRecord = {
  id: string;
  athleteId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  monthsCovered: number;
  createdAt: string;
};

export type MembershipAllocationRecord = {
  id: string;
  athleteId: string;
  paymentId: string;
  membershipMonth: string;
  amountAllocated: number;
  createdAt: string;
};

export type MembershipExemptionRecord = {
  id: string;
  athleteId: string;
  membershipMonth: string;
  reason: string;
  note: string;
  createdAt: string;
};

export type AthleteMembershipRecord = {
  id: string;
  athleteId: string;
  startMonth: string;
  monthlyFee: number;
  status: "active" | "paused" | "inactive";
};

export type MembershipMonthPreview = {
  month: string;
  label: string;
  reason?: "july" | "exempt";
};

export type PaymentAllocationPreview = {
  monthsCovered: number;
  amountUsed: number;
  remainder: number;
  coveredMonths: MembershipMonthPreview[];
  skippedMonths: MembershipMonthPreview[];
};

export type MembershipSummary = {
  monthlyFee: number;
  status: MembershipStatus;
  startMonth: string | null;
  paidThroughDate: string | null;
  paidThroughLabel: string | null;
  monthsOverdue: number;
  paidMembershipMonths: string[];
  exemptMembershipMonths: string[];
  recentPayments: MembershipPaymentRecord[];
};

export type PaymentAthlete = {
  id: string;
  fullName: string;
  photoUrl?: string | null;
  groupName: string;
  guardianNames: string[];
  guardianPhones: string[];
  membership: MembershipSummary;
};

export function calculateMonthsCovered(amount: number, monthlyFee: number) {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(monthlyFee) || monthlyFee <= 0) {
    return 0;
  }

  return Math.floor(amount / monthlyFee);
}

export function calculatePaymentAllocationPreview(input: {
  amount: number;
  monthlyFee: number;
  startMonth: string | null;
  paidMembershipMonths: string[];
  exemptMembershipMonths: string[];
  today?: Date;
}): PaymentAllocationPreview {
  const monthsCovered = calculateMonthsCovered(input.amount, input.monthlyFee);
  const amountUsed = monthsCovered * input.monthlyFee;
  const startMonth = input.startMonth ? toMonthStartIso(input.startMonth) : toMonthStartIso(input.today ?? new Date());
  const paidMonths = new Set(input.paidMembershipMonths.map(toMonthStartIso));
  const exemptMonths = new Set(input.exemptMembershipMonths.map(toMonthStartIso));
  const coveredMonths: MembershipMonthPreview[] = [];
  const skippedMonths: MembershipMonthPreview[] = [];

  let cursor = firstDayOfMonth(startMonth);
  let guard = 0;

  while (coveredMonths.length < monthsCovered && guard < 240) {
    const month = toMonthStartIso(cursor);

    if (paidMonths.has(month)) {
      cursor = addMonths(cursor, 1);
      guard += 1;
      continue;
    }

    if (isNonPayableMembershipMonth(month)) {
      skippedMonths.push({ month, label: formatMonthLabel(month), reason: "july" });
      cursor = addMonths(cursor, 1);
      guard += 1;
      continue;
    }

    if (exemptMonths.has(month)) {
      skippedMonths.push({ month, label: formatMonthLabel(month), reason: "exempt" });
      cursor = addMonths(cursor, 1);
      guard += 1;
      continue;
    }

    coveredMonths.push({ month, label: formatMonthLabel(month) });
    cursor = addMonths(cursor, 1);
    guard += 1;
  }

  return {
    monthsCovered,
    amountUsed,
    remainder: Math.max(input.amount - amountUsed, 0),
    coveredMonths,
    skippedMonths
  };
}

export function calculateMembershipSummary(input: {
  monthlyFee: number;
  membership: AthleteMembershipRecord | null;
  payments: MembershipPaymentRecord[];
  allocations: MembershipAllocationRecord[];
  exemptions: MembershipExemptionRecord[];
  today?: Date;
}): MembershipSummary {
  const sortedPayments = [...input.payments].sort((first, second) => {
    const byDate = first.paymentDate.localeCompare(second.paymentDate);
    return byDate !== 0 ? byDate : first.createdAt.localeCompare(second.createdAt);
  });
  const startMonth = input.membership?.startMonth ? toMonthStartIso(input.membership.startMonth) : null;
  const monthlyFee = input.membership?.monthlyFee ?? input.monthlyFee;
  const exemptMonths = [...new Set(input.exemptions.map((exemption) => toMonthStartIso(exemption.membershipMonth)))];
  const paidMonthsFromAllocations = [...new Set(input.allocations.map((allocation) => toMonthStartIso(allocation.membershipMonth)))].sort();
  const paidMembershipMonths = paidMonthsFromAllocations.length > 0
    ? paidMonthsFromAllocations
    : deriveLegacyPaidMonths({ startMonth, payments: sortedPayments, monthlyFee, exemptMonths });
  const currentMonth = toMonthStartIso(input.today ?? new Date());
  const paidThroughDate = calculatePaidThroughMonth({
    startMonth,
    paidMembershipMonths,
    exemptMembershipMonths: exemptMonths,
    today: input.today
  });

  let status: MembershipStatus = "unknown";
  if (startMonth) {
    if (isNonPayableMembershipMonth(currentMonth) || exemptMonths.includes(currentMonth)) {
      status = "not_payable";
    } else if (paidMembershipMonths.includes(currentMonth)) {
      status = "paid";
    } else {
      status = "overdue";
    }
  }

  return {
    monthlyFee,
    status,
    startMonth,
    paidThroughDate,
    paidThroughLabel: paidThroughDate ? formatMonthLabel(paidThroughDate) : null,
    monthsOverdue: status === "overdue"
      ? calculateMonthsOverdue({ startMonth, paidMembershipMonths, exemptMembershipMonths: exemptMonths, today: input.today })
      : 0,
    paidMembershipMonths,
    exemptMembershipMonths: exemptMonths,
    recentPayments: [...sortedPayments].reverse().slice(0, 5)
  };
}

export function isNonPayableMembershipMonth(value: string | Date) {
  const monthNumber = firstDayOfMonth(value).getUTCMonth() + 1;
  return MEMBERSHIP_NON_PAYABLE_MONTHS.includes(monthNumber as (typeof MEMBERSHIP_NON_PAYABLE_MONTHS)[number]);
}

export function formatPaymentMethod(method: PaymentMethod) {
  return method === "bank_transfer" ? "Трансакциска сметка" : "Готовина";
}

export function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("mk-MK", {
    month: "long",
    year: "numeric"
  }).format(new Date(`${value.slice(0, 7)}-01T00:00:00Z`));
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString("mk-MK")} ден.`;
}

export function toMonthStartIso(value: string | Date) {
  return toIsoDate(firstDayOfMonth(value));
}

function calculatePaidThroughMonth(input: {
  startMonth: string | null;
  paidMembershipMonths: string[];
  exemptMembershipMonths: string[];
  today?: Date;
}) {
  if (!input.startMonth || input.paidMembershipMonths.length === 0) {
    return null;
  }

  const paidMonths = new Set(input.paidMembershipMonths.map(toMonthStartIso));
  const exemptMonths = new Set(input.exemptMembershipMonths.map(toMonthStartIso));
  let cursor = firstDayOfMonth(input.startMonth);
  let lastCovered: string | null = null;
  let guard = 0;

  while (guard < 240) {
    const month = toMonthStartIso(cursor);

    if (isNonPayableMembershipMonth(month) || exemptMonths.has(month)) {
      cursor = addMonths(cursor, 1);
      guard += 1;
      continue;
    }

    if (!paidMonths.has(month)) {
      break;
    }

    lastCovered = month;
    cursor = addMonths(cursor, 1);
    guard += 1;
  }

  return lastCovered;
}

function calculateMonthsOverdue(input: {
  startMonth: string | null;
  paidMembershipMonths: string[];
  exemptMembershipMonths: string[];
  today?: Date;
}) {
  if (!input.startMonth) {
    return 0;
  }

  const currentMonth = firstDayOfMonth(input.today ?? new Date());
  const paidMonths = new Set(input.paidMembershipMonths.map(toMonthStartIso));
  const exemptMonths = new Set(input.exemptMembershipMonths.map(toMonthStartIso));
  let cursor = firstDayOfMonth(input.startMonth);
  let overdue = 0;
  let guard = 0;

  while (cursor <= currentMonth && guard < 240) {
    const month = toMonthStartIso(cursor);

    if (!isNonPayableMembershipMonth(month) && !exemptMonths.has(month) && !paidMonths.has(month)) {
      overdue += 1;
    }

    cursor = addMonths(cursor, 1);
    guard += 1;
  }

  return overdue;
}

function deriveLegacyPaidMonths(input: {
  startMonth: string | null;
  payments: MembershipPaymentRecord[];
  monthlyFee: number;
  exemptMonths: string[];
}) {
  if (!input.startMonth || input.payments.length === 0) {
    return [];
  }

  const paidMonths = new Set<string>();

  for (const payment of input.payments) {
    const preview = calculatePaymentAllocationPreview({
      amount: payment.amount,
      monthlyFee: input.monthlyFee,
      startMonth: input.startMonth,
      paidMembershipMonths: [...paidMonths],
      exemptMembershipMonths: input.exemptMonths
    });

    for (const month of preview.coveredMonths) {
      paidMonths.add(month.month);
    }
  }

  return [...paidMonths].sort();
}

function firstDayOfMonth(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00Z`) : value;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
