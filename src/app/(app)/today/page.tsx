import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Camera,
  CheckCircle2,
  Clock3,
  CreditCard,
  MessageSquare,
  Plus,
  UserRoundPlus,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSessionContext } from "@/features/auth/server/session";
import { isSchedulerSchemaMissingError, loadTodayTrainingSessions } from "@/features/scheduler/server/scheduler-persistence";
import { getTodayCommandCenterView, type TodayCommandCenterView } from "@/features/today/server/today-read-models";
import type { TrainingSessionSummary } from "@/features/scheduler/domain/scheduler";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageContainer } from "@/shared/ui/page-container";
import { StatCard } from "@/shared/ui/stat-card";
import { cn } from "@/shared/lib/cn";
import { formatDateMk } from "@/shared/lib/date-format";

type KpiItem = {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
};

type AttentionItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "warning" | "danger" | "primary" | "neutral";
};

type QuickAction = {
  label: string;
  description: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
};

const quickActions: QuickAction[] = [
  {
    label: "Присуство",
    description: "Отвори дневен список",
    href: "/attendance",
    icon: CheckCircle2
  },
  {
    label: "Уплата",
    description: "Евидентирај членарина",
    href: "/payments",
    icon: CreditCard
  },
  {
    label: "Нов член",
    description: "Додај спортист",
    href: "/athletes/new",
    icon: Plus
  },
  {
    label: "Порака",
    description: "Испрати преку профил на спортист",
    href: "/athletes",
    icon: MessageSquare
  }
];

export default async function TodayPage() {
  const sessionContext = await getSessionContext();
  const todayView = await getTodayCommandCenterView(sessionContext);
  const now = new Date();
  const today = getTodayDateSkopje(now);
  let trainingsToday: TrainingSessionSummary[] = [];

  if (sessionContext.clubId) {
    try {
      trainingsToday = await loadTodayTrainingSessions({ clubId: sessionContext.clubId, date: today });
    } catch (error) {
      if (!isSchedulerSchemaMissingError(error)) {
        throw error;
      }
    }
  }
  const featuredTraining = trainingsToday[0] ?? null;
  const otherTrainings = trainingsToday.slice(1);
  const kpis = buildKpis(todayView, trainingsToday);
  const attentionItems = buildAttentionItems(todayView);

  return (
    <PageContainer className="space-y-xl">
      <section className="relative overflow-hidden rounded-panel border border-border/80 bg-slate-950 p-lg text-white shadow-raised md:p-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(217,173,78,0.24),transparent_34rem)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black/30" aria-hidden="true" />
        <div className="relative flex flex-col gap-lg lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="border-gold/30 bg-gold/15 text-gold">Judo Drim</Badge>
            <h1 className="mt-md text-3xl font-semibold tracking-tight md:text-4xl">
              {getGreeting(now)}, {getFirstName(sessionContext.displayName)}
            </h1>
            <p className="mt-sm text-body leading-7 text-slate-300">
              Денешен оперативен преглед за тренинзи, задачи и брзи акции.
            </p>
          </div>
          <div className="rounded-card border border-white/10 bg-white/[0.06] p-md shadow-soft backdrop-blur">
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-slate-400">Денес</p>
            <p className="mt-xs text-card-title font-semibold text-white">{formatDateMk(now)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-md sm:grid-cols-2 xl:grid-cols-4" aria-label="Дневни показатели">
        {kpis.map((item) => (
          <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} description={item.description} />
        ))}
      </section>

      <section className="grid gap-lg lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <div className="space-y-lg">
          <Card variant="elevated" className="overflow-hidden">
            <div className="border-b border-border/80 bg-subdued/60 p-md">
              <div className="flex items-center justify-between gap-md">
                <div>
                  <p className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">Следно</p>
                  <h2 className="mt-xs text-section-title font-semibold text-foreground">Следен тренинг</h2>
                </div>
                <Badge tone="primary">денес</Badge>
              </div>
            </div>
            {featuredTraining ? (
              <CardContent className="p-lg">
                <div className="grid gap-lg md:grid-cols-[1fr_auto] md:items-end">
                  <TrainingFeature training={featuredTraining} />
                  <Link
                    href="/attendance"
                    className="inline-flex min-h-control-lg items-center justify-center gap-sm rounded-button bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors duration-ui hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    Започни присуство
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-lg">
                <EmptyState
                  icon={CalendarClock}
                  title="Нема тренинзи денес"
                  description="Кога ќе се генерира месечниот распоред, следниот тренинг ќе се појави овде."
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Останати тренинзи</CardTitle>
            </CardHeader>
            <CardContent>
              {otherTrainings.length > 0 ? (
                <div className="grid gap-sm sm:grid-cols-2">
                  {otherTrainings.map((training) => (
                    <div key={training.id} className="rounded-card border border-border bg-muted/30 p-md">
                      <div className="flex items-center justify-between gap-md">
                        <div>
                          <p className="text-xl font-semibold text-foreground">{training.time}</p>
                          <p className="mt-xs text-body text-muted-foreground">{training.groupName}</p>
                        </div>
                        <div className="rounded-full border border-border bg-surface px-3 py-1 text-caption font-semibold text-muted-foreground">
                          {training.athleteCount} спортисти
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Clock3}
                  title="Нема други тренинзи денес"
                  description="Следниот тренинг е единствената активност во денешниот распоред."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle>Бара внимание</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-sm">
                {attentionItems.map((item) => (
                  <AttentionLink key={item.label} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Брзи акции</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-1">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.label} action={action} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}

function TrainingFeature({ training }: { training: TrainingSessionSummary }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-card bg-slate-950 text-xl font-semibold text-gold shadow-soft">
          {training.groupName.slice(0, 3)}
        </span>
        <div>
          <p className="text-4xl font-semibold tracking-tight text-foreground">{training.time}</p>
          <p className="mt-xs text-body text-muted-foreground">
            {training.groupName} · {training.athleteCount} спортисти
          </p>
        </div>
      </div>
      <p className="mt-lg max-w-2xl text-body leading-7 text-muted-foreground">
        Подгответе го списокот за присуство пред почетокот на тренингот.
      </p>
    </div>
  );
}

function AttentionLink({ item }: { item: AttentionItem }) {
  return (
    <Link
      href={item.href}
      className="group flex items-center justify-between gap-md rounded-card border border-border bg-surface p-md shadow-soft transition-all duration-ui hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <span className="flex min-w-0 items-center gap-sm">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-card border", getAttentionToneClasses(item.tone))}>
          <item.icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body font-semibold text-foreground">{item.label}</span>
          <span className="mt-0.5 block truncate text-caption text-muted-foreground">{item.description}</span>
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-ui group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-slate-950 text-gold shadow-soft">
        <action.icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-body font-semibold text-foreground">{action.label}</span>
        <span className="mt-0.5 block text-caption leading-5 text-muted-foreground">{action.description}</span>
      </span>
    </>
  );

  const className =
    "flex min-h-20 items-center gap-md rounded-card border border-border bg-surface p-md text-left shadow-soft transition-all duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

  if (action.disabled || !action.href) {
    return (
      <div className={cn(className, "cursor-not-allowed opacity-70")} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={action.href} className={cn(className, "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface")}>
      {content}
    </Link>
  );
}

function buildKpis(todayView: TodayCommandCenterView, trainings: TrainingSessionSummary[]): KpiItem[] {
  return [
    {
      label: "Активни членови",
      value: todayView.activeAthletes,
      description: `Во ${todayView.activeGroupsWithAthletes} активни ${todayView.activeGroupsWithAthletes === 1 ? "група" : "групи"}`,
      icon: Users
    },
    {
      label: "Неплатени членарини",
      value: todayView.unpaidMemberships,
      description: "Пресметано од зачувани уплати",
      icon: CreditCard
    },
    {
      label: "Тренинзи денес",
      value: trainings.length,
      description: trainings[0] ? `Прв тренинг во ${trainings[0].time}` : "Нема тренинзи денес",
      icon: CalendarClock
    },
    {
      label: "Отсутни > 30 дена",
      value: todayView.absentOver30Days,
      description: "Според евиденција на присуство",
      icon: AlertTriangle
    }
  ];
}

function buildAttentionItems(todayView: TodayCommandCenterView): AttentionItem[] {
  return [
    {
      label: `${todayView.unpaidMemberships} неплатени членарини`,
      description: "Проверка пред крај на месец",
      href: "/payments",
      icon: CreditCard,
      tone: "warning"
    },
    {
      label: `${todayView.absentOver30Days} отсутни повеќе од 30 дена`,
      description: "Потребен контакт со родител",
      href: "/attendance",
      icon: AlertTriangle,
      tone: "danger"
    },
    {
      label: `${todayView.athletesWithoutPhoto} спортисти без фотографија`,
      description: "Дополнување на профил",
      href: "/athletes",
      icon: Camera,
      tone: "primary"
    },
    {
      label: `${todayView.incompleteAthleteProfiles} спортисти без комплетен профил`,
      description: "Недостасуваат основни податоци",
      href: "/athletes",
      icon: UserRoundPlus,
      tone: "neutral"
    }
  ];
}

function getAttentionToneClasses(tone: AttentionItem["tone"]) {
  switch (tone) {
    case "warning":
      return "border-warning/60 bg-warning text-warning-foreground";
    case "danger":
      return "border-danger/60 bg-danger text-danger-foreground";
    case "primary":
      return "border-primary/20 bg-primary/10 text-primary";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function getGreeting(date: Date) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Добро утро";
  }

  if (hour < 18) {
    return "Добар ден";
  }

  return "Добра вечер";
}

function getFirstName(displayName: string) {
  return displayName.trim().split(/\s+/)[0] || "тренеру";
}

function getTodayDateSkopje(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
