export const DEFAULT_MONTHLY_MEMBERSHIP_FEE = 1000;
export const PAYMENT_METHODS = ["cash", "bank_transfer"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type MembershipStatus = "paid" | "overdue" | "unknown";

export type MembershipPaymentRecord = {
  id: string;
  athleteId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  monthsCovered: number;
  createdAt: string;
};

export type MembershipSummary = {
  monthlyFee: number;
  status: MembershipStatus;
  paidThroughDate: string | null;
  paidThroughLabel: string | null;
  monthsOverdue: number;
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

export function calculatePaidThroughDate(input: {
  existingPaidThroughDate: string | null;
  paymentDate: string;
  amount: number;
  monthlyFee: number;
}) {
  const months = calculateMonthsCovered(input.amount, input.monthlyFee);

  if (months <= 0) {
    return input.existingPaidThroughDate;
  }

  const paymentMonth = firstDayOfMonth(input.paymentDate);
  const existingPaidThrough = input.existingPaidThroughDate ? firstDayOfMonth(input.existingPaidThroughDate) : null;
  const startMonth = existingPaidThrough ? addMonths(existingPaidThrough, 1) : paymentMonth;

  return toIsoDate(addMonths(startMonth, months - 1));
}

export function calculateMembershipSummary(input: {
  monthlyFee: number;
  payments: MembershipPaymentRecord[];
  today?: Date;
}): MembershipSummary {
  const sortedPayments = [...input.payments].sort((first, second) => {
    const byDate = first.paymentDate.localeCompare(second.paymentDate);
    return byDate !== 0 ? byDate : first.createdAt.localeCompare(second.createdAt);
  });
  let paidThroughDate: string | null = null;

  for (const payment of sortedPayments) {
    paidThroughDate = calculatePaidThroughDate({
      existingPaidThroughDate: paidThroughDate,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      monthlyFee: input.monthlyFee
    });
  }

  const currentMonth = toIsoDate(firstDayOfMonth(input.today ?? new Date()));
  const status: MembershipStatus = paidThroughDate && paidThroughDate >= currentMonth ? "paid" : "overdue";
  const monthsOverdue = status === "paid" ? 0 : calculateMonthsOverdue(paidThroughDate, currentMonth);

  return {
    monthlyFee: input.monthlyFee,
    status,
    paidThroughDate,
    paidThroughLabel: paidThroughDate ? formatMonthLabel(paidThroughDate) : null,
    monthsOverdue,
    recentPayments: [...sortedPayments].reverse().slice(0, 5)
  };
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

function calculateMonthsOverdue(paidThroughDate: string | null, currentMonth: string) {
  if (!paidThroughDate) {
    return 1;
  }

  const firstUnpaid = addMonths(firstDayOfMonth(paidThroughDate), 1);
  const current = firstDayOfMonth(currentMonth);
  const months =
    (current.getUTCFullYear() - firstUnpaid.getUTCFullYear()) * 12 +
    current.getUTCMonth() -
    firstUnpaid.getUTCMonth() +
    1;
  return Math.max(months, 1);
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
