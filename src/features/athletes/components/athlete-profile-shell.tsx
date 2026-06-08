import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  CreditCard,
  Edit3,
  Scale,
  ShieldAlert,
  Trophy,
  UserRound,
  Weight,
  XCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AthleteProfileDossier } from "@/features/athletes/server/athlete-profile-dossier";
import { GuardianContactCard } from "@/features/athletes/components/guardian-contact-card";
import { formatCurrency, formatPaymentMethod, type MembershipSummary } from "@/features/payments/domain/payment";
import { WeightMeasurementForm } from "@/features/athletes/components/weight-measurement-form";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { StatCard } from "@/shared/ui/stat-card";
import { formatDateMk } from "@/shared/lib/date-format";
import type { AthleteProfileView, AthleteStatus } from "../domain/athlete";

type AthleteProfileShellProps = {
  athlete: AthleteProfileView;
  dossier: AthleteProfileDossier;
  canManage: boolean;
  canRecordWeight?: boolean;
};

export function AthleteProfileShell({ athlete, dossier, canManage, canRecordWeight = canManage }: AthleteProfileShellProps) {
  const guardian = athlete.guardians.find((item) => item.isPrimaryContact) ?? athlete.guardians[0] ?? null;
  const age = calculateAge(athlete.birthDate);
  const membershipStatus = getMembershipStatusLabel(dossier.membership);

  return (
    <div className="space-y-lg">
      <HeroCard athlete={athlete} age={age} ageGroupName={dossier.ageGroupName} canManage={canManage} />

      <section className="grid gap-sm md:grid-cols-4" aria-label="Брз преглед">
        <StatCard icon={CalendarCheck} label="Присуства (30 дена)" value={dossier.attendance.present30Days} />
        <StatCard icon={XCircle} label="Отсуства (30 дена)" value={dossier.attendance.absent30Days} />
        <StatCard icon={Weight} label="Последна тежина" value={athlete.weight == null ? "Нема податок" : `${athlete.weight} kg`} />
        <StatCard icon={CreditCard} label="Членарина" value={membershipStatus} />
      </section>

      <section className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-lg">
          <GuardianContactCard
            athleteId={athlete.id}
            athleteName={athlete.fullName}
            guardian={guardian}
            canManage={canManage}
          />
          <SportsCard athlete={athlete} ageGroupName={dossier.ageGroupName} weightCategoryName={dossier.weightCategoryName} />
          <AttendanceCard attendance={dossier.attendance} />
          <WeightHistoryCard athlete={athlete} weightHistory={dossier.weightHistory} canRecord={canRecordWeight} />
        </div>

        <aside className="space-y-lg xl:sticky xl:top-24 xl:self-start">
          <MembershipCard membership={dossier.membership} />
          <QuickActions athlete={athlete} canManage={canManage} />
        </aside>
      </section>
    </div>
  );
}

function HeroCard({
  athlete,
  age,
  ageGroupName,
  canManage
}: {
  athlete: AthleteProfileView;
  age: number;
  ageGroupName: string;
  canManage: boolean;
}) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="bg-slate-950 p-lg text-white">
        <div className="flex flex-col gap-lg lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-md sm:flex-row sm:items-center">
            <div className="relative w-fit">
              <Avatar src={athlete.photoUrl} name={athlete.fullName} size="xl" className="h-24 w-24 border-gold/30 bg-slate-900 text-2xl text-gold" />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <StatusMiniBadge status={athlete.status} />
              </span>
            </div>

            <div className="min-w-0 pt-sm sm:pt-0">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{athlete.fullName}</h1>
              <div className="mt-md grid gap-xs text-body text-slate-300">
                <p>
                  Појас: <span className="font-semibold text-white">{athlete.currentBelt}</span>
                </p>
                <p>{ageGroupName}</p>
                <p>{age} години (натпреварувачка возраст)</p>
              </div>
            </div>
          </div>

          {canManage ? (
            <Link
              href={`/athletes/${athlete.id}/edit`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border border-white/15 bg-white px-5 text-sm font-semibold text-slate-950 shadow-soft transition-colors duration-ui hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Уреди
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function SportsCard({
  athlete,
  ageGroupName,
  weightCategoryName
}: {
  athlete: AthleteProfileView;
  ageGroupName: string;
  weightCategoryName: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Спортски податоци</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-sm sm:grid-cols-2">
        <InfoTile icon={Trophy} label="Појас" value={athlete.currentBelt} />
        <InfoTile icon={Activity} label="Група" value={athlete.group.name} />
        <InfoTile icon={ShieldAlert} label="Возрасна група" value={ageGroupName} />
        <InfoTile icon={Weight} label="Тежина" value={athlete.weight == null ? "" : `${athlete.weight} kg`} />
        <InfoTile icon={UserRound} label="Пол" value={formatGender(athlete.gender)} />
        <InfoTile icon={Scale} label="Тежинска категорија" value={weightCategoryName} className="sm:col-span-2" />
      </CardContent>
    </Card>
  );
}

function MembershipCard({ membership }: { membership: MembershipSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Членарина</CardTitle>
      </CardHeader>
      <CardContent className="space-y-md">
        <div className="rounded-card border border-border bg-muted/45 p-md">
          <Badge tone={membership.status === "paid" ? "success" : "warning"}>{getMembershipStatusLabel(membership)}</Badge>
          <p className="mt-sm text-body text-muted-foreground">
            {membership.status === "paid" && membership.paidThroughLabel
              ? `Платено до: ${membership.paidThroughLabel}`
              : `Доцни: ${membership.monthsOverdue} ${membership.monthsOverdue === 1 ? "месец" : "месеци"}`}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-md">
          <p className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">Последни уплати</p>
          {membership.recentPayments.length > 0 ? (
            <div className="mt-sm grid gap-xs">
              {membership.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-md text-body">
                  <span className="text-foreground">{formatDateMk(payment.paymentDate)}</span>
                  <span className="text-right font-semibold text-foreground">{formatCurrency(payment.amount)}</span>
                  <span className="hidden text-caption text-muted-foreground sm:inline">{formatPaymentMethod(payment.paymentMethod)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-sm text-body text-muted-foreground">Нема евидентирани уплати.</p>
          )}
        </div>
        <Link
          href="/payments"
          className="inline-flex min-h-control w-full items-center justify-center gap-2 rounded-button bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-colors duration-ui hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Внеси уплата
        </Link>
      </CardContent>
    </Card>
  );
}

function AttendanceCard({ attendance }: { attendance: AthleteProfileDossier["attendance"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Присуство</CardTitle>
      </CardHeader>
      <CardContent className="space-y-md">
        {!attendance.available ? (
          <EmptyState
            icon={CalendarCheck}
            title="Присуството не е достапно"
            description="Attendance schema не е достапна или сè уште не е применета во Supabase."
          />
        ) : (
          <>
            <div className="grid gap-sm sm:grid-cols-2">
              <InfoTile icon={CalendarCheck} label="Присутен" value={String(attendance.present30Days)} />
              <InfoTile icon={XCircle} label="Отсутен" value={String(attendance.absent30Days)} />
            </div>

            <div className="rounded-card border border-border bg-muted/45 p-md">
              <p className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">Последни 30 дена</p>
              {attendance.recent.length > 0 ? (
                <div className="mt-sm grid gap-xs">
                  {attendance.recent.map((record) => (
                    <div key={`${record.date}-${record.status}`} className="flex items-center justify-between text-body">
                      <span className="text-foreground">{formatDateMk(record.date)}</span>
                      <span className={record.status === "present" ? "text-success-foreground" : "text-danger-foreground"}>
                        {record.status === "present" ? "✓" : "✕"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-sm text-body text-muted-foreground">Нема евидентирано присуство.</p>
              )}
            </div>

            <button
              type="button"
              disabled
              className="inline-flex min-h-control w-full items-center justify-center rounded-button border border-border bg-muted px-4 text-sm font-semibold text-muted-foreground"
            >
              Види цела историја
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WeightHistoryCard({
  athlete,
  weightHistory,
  canRecord
}: {
  athlete: AthleteProfileView;
  weightHistory: AthleteProfileDossier["weightHistory"];
  canRecord: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Историја на тежини</CardTitle>
      </CardHeader>
      <CardContent className="space-y-md">
        {!weightHistory.available ? (
          <EmptyState
            icon={Weight}
            title="Историјата не е достапна"
            description="Применете ја миграцијата за мерења за да се зачувува историја на тежини."
          />
        ) : weightHistory.recent.length > 0 ? (
          <div className="grid gap-sm">
            {weightHistory.recent.map((measurement) => (
              <div key={measurement.id} className="rounded-card border border-border bg-muted/45 p-md">
                <div className="flex items-center justify-between gap-md">
                  <div>
                    <p className="text-section-title font-semibold text-foreground">{formatWeight(measurement.weight)}</p>
                    <p className="mt-xs text-caption text-muted-foreground">{formatDateMk(measurement.measuredAt)}</p>
                  </div>
                  <Weight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                {measurement.note ? <p className="mt-sm text-body text-muted-foreground">{measurement.note}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Weight}
            title="Нема внесени мерења"
            description="Кога ќе се додаде првото мерење, историјата ќе се прикаже овде."
          />
        )}

        {canRecord ? (
          <WeightMeasurementForm athleteId={athlete.id} currentWeight={athlete.weight} />
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuickActions({ athlete, canManage }: { athlete: AthleteProfileView; canManage: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Брзи акции</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-sm">
        <QuickAction href="/attendance" icon={CalendarCheck} title="Евидентирај присуство" />
        <QuickAction href="/payments" icon={CreditCard} title="Внеси уплата" />
        {canManage ? <QuickAction href={`/athletes/${athlete.id}/edit`} icon={Edit3} title="Измени податоци" /> : null}
        <button
          type="button"
          disabled
          className="flex min-h-14 items-center gap-md rounded-card border border-border bg-muted px-md text-left text-muted-foreground"
        >
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">Деактивирај спортист</span>
        </button>
      </CardContent>
    </Card>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  className
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-border bg-muted/45 p-md ${className ?? ""}`}>
      <div className="flex items-start gap-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-border bg-surface">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">{label}</p>
          <p className="mt-xs break-words text-body font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, title }: { href: string; icon: LucideIcon; title: string }) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-md rounded-card border border-border bg-surface px-md text-left shadow-soft transition-all duration-ui hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <span className="font-semibold text-foreground">{title}</span>
    </Link>
  );
}

function StatusMiniBadge({ status }: { status: AthleteStatus }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full border border-white/15 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-950 shadow-soft">
      {getStatusLabel(status)}
    </span>
  );
}

function getStatusLabel(status: AthleteStatus) {
  const labels: Record<AthleteStatus, string> = {
    active: "Активен",
    paused: "Пауза",
    inactive: "Неактивен"
  };

  return labels[status];
}

function formatGender(gender?: AthleteProfileView["gender"]) {
  if (gender === "M") return "Машки";
  if (gender === "Ж") return "Женски";
  return "Нема внесен пол";
}

function getMembershipStatusLabel(membership: MembershipSummary) {
  if (membership.status === "paid") return "Платено";
  if (membership.status === "overdue") return "Доцни";
  return "Непознато";
}

function calculateAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  return new Date().getUTCFullYear() - birth.getUTCFullYear();
}

function formatWeight(value: number) {
  return `${value.toLocaleString("mk-MK", { maximumFractionDigits: 1 })} kg`;
}
