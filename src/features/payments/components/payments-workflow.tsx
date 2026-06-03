"use client";

import { useActionState, useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Search, ShieldAlert, UserPlus, Users } from "lucide-react";
import { createPayment, type PaymentActionState } from "@/features/payments/server/actions";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { StatCard } from "@/shared/ui/stat-card";
import { cn } from "@/shared/lib/cn";
import {
  calculateMonthsCovered,
  calculatePaidThroughDate,
  formatCurrency,
  formatMonthLabel,
  formatPaymentMethod,
  type PaymentAthlete,
  type PaymentMethod
} from "../domain/payment";

type PaymentsWorkflowProps = {
  athletes: PaymentAthlete[];
  canCreate: boolean;
};

type FilterMode = "all" | "unpaid" | "paid";

const initialState: PaymentActionState = {};

export function PaymentsWorkflow({ athletes, canCreate }: PaymentsWorkflowProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [state, formAction, isPending] = useActionState(createPayment, initialState);

  const filteredAthletes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("mk-MK");

    return athletes.filter((athlete) => {
      const isPaid = athlete.membership.status === "paid";
      const matchesFilter = filter === "all" || (filter === "paid" ? isPaid : !isPaid);
      const searchText = [athlete.fullName, athlete.groupName, ...athlete.guardianNames, ...athlete.guardianPhones]
        .join(" ")
        .toLocaleLowerCase("mk-MK");

      return matchesFilter && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [athletes, filter, query]);

  const unpaidAthletes = filteredAthletes.filter((athlete) => athlete.membership.status !== "paid");
  const paidAthletes = filteredAthletes.filter((athlete) => athlete.membership.status === "paid");
  const selectedAthlete = athletes.find((athlete) => athlete.id === selectedAthleteId) ?? null;

  if (athletes.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Нема активни спортисти"
        description="Членарините ќе се прикажат кога ќе постојат активни спортисти во клубот."
      />
    );
  }

  return (
    <div className="space-y-lg">
      <section className="grid gap-sm md:grid-cols-3" aria-label="Преглед на членарини">
        <StatCard
          icon={ShieldAlert}
          label="Неплатени"
          value={athletes.filter((athlete) => athlete.membership.status !== "paid").length}
          description="Спортисти чија членарина не го покрива тековниот месец."
        />
        <StatCard
          icon={CheckCircle2}
          label="Платени"
          value={athletes.filter((athlete) => athlete.membership.status === "paid").length}
          description="Спортисти со членарина платена за тековниот месец."
        />
        <StatCard
          icon={Users}
          label="Вкупно активни"
          value={athletes.length}
          description="Активни спортисти во тековниот клуб."
        />
      </section>

      <Card variant="elevated">
        <CardContent className="p-md">
          <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge tone="primary">Перзистентни уплати</Badge>
              <p className="mt-sm text-body text-muted-foreground">
                Статусот се пресметува од зачуваните уплати во табелата payments и месечна членарина од 1.000 ден.
              </p>
            </div>
            <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-80">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Пребарај спортист, родител или телефон"
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-3 gap-xs rounded-card border border-border bg-muted/45 p-xs">
                <FilterButton active={filter === "all"} label="Сите" onClick={() => setFilter("all")} />
                <FilterButton active={filter === "unpaid"} label="Неплатени" onClick={() => setFilter("unpaid")} />
                <FilterButton active={filter === "paid"} label="Платени" onClick={() => setFilter("paid")} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-lg">
          <PaymentSection
            title="Неплатени"
            description="Прво се прикажуваат спортистите што доцнат со членарина."
            emptyTitle="Сите членарини се платени"
            emptyDescription="Во тековниот преглед нема спортисти со неплатена членарина."
            athletes={unpaidAthletes}
            onOpenPayment={setSelectedAthleteId}
            status="unpaid"
            canCreate={canCreate}
          />

          <PaymentSection
            title="Платени"
            description="Спортисти со членарина што го покрива тековниот месец."
            emptyTitle="Нема евидентирани уплати"
            emptyDescription="Кога ќе се зачува уплата, статусот ќе се ажурира автоматски."
            athletes={paidAthletes}
            onOpenPayment={setSelectedAthleteId}
            status="paid"
            canCreate={canCreate}
          />
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <PaymentEntryPanel
            selectedAthlete={selectedAthlete}
            amount={amount}
            paymentMethod={paymentMethod}
            canCreate={canCreate}
            state={state}
            isPending={isPending}
            onAmountChange={setAmount}
            onPaymentMethodChange={setPaymentMethod}
            formAction={formAction}
            onClose={() => {
              setSelectedAthleteId(null);
              setAmount("");
              setPaymentMethod("cash");
            }}
          />
        </aside>
      </section>
    </div>
  );
}

function PaymentSection({
  title,
  description,
  emptyTitle,
  emptyDescription,
  athletes,
  status,
  canCreate,
  onOpenPayment
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  athletes: PaymentAthlete[];
  status: "paid" | "unpaid";
  canCreate: boolean;
  onOpenPayment: (athleteId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-md">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-xs text-body text-muted-foreground">{description}</p>
          </div>
          <Badge tone={status === "paid" ? "success" : "warning"}>{athletes.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {athletes.length === 0 ? (
          <EmptyState icon={status === "paid" ? CreditCard : CheckCircle2} title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="grid gap-sm">
            {athletes.map((athlete) => (
              <PaymentAthleteCard
                key={athlete.id}
                athlete={athlete}
                canCreate={canCreate}
                onOpenPayment={onOpenPayment}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentAthleteCard({
  athlete,
  canCreate,
  onOpenPayment
}: {
  athlete: PaymentAthlete;
  canCreate: boolean;
  onOpenPayment: (athleteId: string) => void;
}) {
  const paid = athlete.membership.status === "paid";

  return (
    <article className="rounded-card border border-border bg-surface p-md shadow-soft transition-all duration-ui hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface">
      <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-md">
          <Avatar name={athlete.fullName} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate text-body font-semibold text-foreground">{athlete.fullName}</h3>
            <div className="mt-xs flex flex-wrap items-center gap-xs text-caption text-muted-foreground">
              <span>{athlete.groupName}</span>
              <span aria-hidden="true">/</span>
              <span>{athlete.guardianNames[0] ?? "Нема родител/старател"}</span>
            </div>
            <p className="mt-xs text-sm font-medium text-foreground">
              {paid && athlete.membership.paidThroughLabel
                ? `Платено до ${athlete.membership.paidThroughLabel}`
                : `Доцни ${athlete.membership.monthsOverdue} ${athlete.membership.monthsOverdue === 1 ? "месец" : "месеци"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-sm sm:justify-end">
          <Badge tone={paid ? "success" : "warning"}>{paid ? "Платено" : "Доцни"}</Badge>
          <Button size="sm" variant="secondary" onClick={() => onOpenPayment(athlete.id)} disabled={!canCreate}>
            Внеси уплата
          </Button>
        </div>
      </div>
    </article>
  );
}

function PaymentEntryPanel({
  selectedAthlete,
  amount,
  paymentMethod,
  canCreate,
  state,
  isPending,
  formAction,
  onAmountChange,
  onPaymentMethodChange,
  onClose
}: {
  selectedAthlete: PaymentAthlete | null;
  amount: string;
  paymentMethod: PaymentMethod;
  canCreate: boolean;
  state: PaymentActionState;
  isPending: boolean;
  formAction: (formData: FormData) => void;
  onAmountChange: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onClose: () => void;
}) {
  const amountValue = Number(amount);
  const monthlyFee = selectedAthlete?.membership.monthlyFee ?? 1000;
  const paidMonths = Number.isFinite(amountValue) && amountValue > 0 ? calculateMonthsCovered(amountValue, monthlyFee) : 0;
  const remainder = Number.isFinite(amountValue) && amountValue > 0 ? amountValue % monthlyFee : 0;
  const previewPaidThrough =
    selectedAthlete && paidMonths > 0
      ? calculatePaidThroughDate({
          existingPaidThroughDate: selectedAthlete.membership.paidThroughDate,
          paymentDate: getTodayDate(),
          amount: amountValue,
          monthlyFee
        })
      : null;
  const previewPaidUntil = previewPaidThrough ? formatMonthLabel(previewPaidThrough) : "Нема цел месец";

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="border-b border-border/80 bg-slate-950 p-md text-white">
        <div className="flex items-center gap-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-card border border-gold/20 bg-gold/15 text-gold">
            <Banknote className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-card-title font-semibold">Внеси уплата</h2>
            <p className="mt-xs text-sm text-slate-300">Месечна членарина: {formatCurrency(monthlyFee)}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-md">
        {selectedAthlete ? (
          <form className="space-y-md" action={formAction}>
            <input type="hidden" name="athleteId" value={selectedAthlete.id} />
            <input type="hidden" name="paymentDate" value={getTodayDate()} />

            <div className="flex items-center gap-md rounded-card border border-border bg-muted/45 p-sm">
              <Avatar name={selectedAthlete.fullName} />
              <div className="min-w-0">
                <p className="truncate text-body font-semibold text-foreground">{selectedAthlete.fullName}</p>
                <p className="text-caption text-muted-foreground">{selectedAthlete.groupName}</p>
              </div>
            </div>

            <label className="block space-y-xs">
              <span className="text-sm font-semibold text-foreground">Износ</span>
              <Input
                name="amount"
                type="number"
                min={0}
                step={100}
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="Пр. 3000"
                disabled={!canCreate}
              />
            </label>

            <label className="block space-y-xs">
              <span className="text-sm font-semibold text-foreground">Начин на плаќање</span>
              <Select
                name="paymentMethod"
                value={paymentMethod}
                onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod)}
                disabled={!canCreate}
              >
                <option value="cash">{formatPaymentMethod("cash")}</option>
                <option value="bank_transfer">{formatPaymentMethod("bank_transfer")}</option>
              </Select>
            </label>

            <div className="rounded-card border border-border bg-subdued/60 p-md">
              <p className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">Пресметка</p>
              <p className="mt-xs text-2xl font-semibold text-foreground">{paidMonths} месеци</p>
              <p className="mt-xs text-body text-muted-foreground">Платено до: {previewPaidUntil}</p>
              {remainder > 0 ? (
                <p className="mt-sm text-sm text-warning-foreground">
                  Ќе се евидентираат {paidMonths} {paidMonths === 1 ? "месец" : "месеци"}. Остатокот не се обработува во V1.
                </p>
              ) : null}
            </div>

            {state.message ? (
              <p
                className={cn(
                  "rounded-card border p-sm text-sm",
                  state.ok
                    ? "border-success/60 bg-success text-success-foreground"
                    : "border-warning/60 bg-warning text-warning-foreground"
                )}
              >
                {state.message}
              </p>
            ) : null}

            <div className="flex flex-col gap-sm sm:flex-row">
              <Button type="submit" className="flex-1" disabled={!canCreate || paidMonths <= 0} isLoading={isPending}>
                Зачувај уплата
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Откажи
              </Button>
            </div>
          </form>
        ) : (
          <EmptyState
            icon={UserPlus}
            title={canCreate ? "Изберете спортист" : "Само за преглед"}
            description={
              canCreate
                ? "Кликнете Внеси уплата на спортист за да зачувате членарина."
                : "Родителскиот пристап е само за преглед на членарини."
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-button px-3 text-xs font-semibold transition-colors duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-sm",
        active ? "bg-slate-950 text-white shadow-soft" : "text-muted-foreground hover:bg-surface hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
