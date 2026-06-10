import { CalendarDays, ShieldAlert } from "lucide-react";
import { getSessionContext } from "@/features/auth/server/session";
import { SchedulerManagementScreen } from "@/features/scheduler/components/scheduler-management-screen";
import { isSchedulerSchemaMissingError, loadSchedulerManagementView } from "@/features/scheduler/server/scheduler-persistence";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageContainer } from "@/shared/ui/page-container";

type SchedulePageProps = {
  searchParams?: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const sessionContext = await getSessionContext();
  const params = await searchParams;
  const now = new Date();
  const year = parseNumber(params?.year, now.getFullYear());
  const month = parseNumber(params?.month, now.getMonth() + 1);

  if (!sessionContext.clubId || (sessionContext.role !== "management" && sessionContext.role !== "trainer")) {
    return (
      <PageContainer className="space-y-lg">
        <PageHeader />
        <EmptyState
          icon={ShieldAlert}
          title="Распоредот е достапен за управа и тренери"
          description="Родителскиот пристап до распоред ќе биде достапен во следна фаза."
        />
      </PageContainer>
    );
  }

  let view;

  try {
    view = await loadSchedulerManagementView({
      clubId: sessionContext.clubId,
      year,
      month
    });
  } catch (error) {
    if (!isSchedulerSchemaMissingError(error)) {
      throw error;
    }

    return (
      <PageContainer className="space-y-lg">
        <PageHeader />
        <EmptyState
          icon={ShieldAlert}
          title="Распоредот не е подготвен"
          description="Применете ја scheduler миграцијата во Supabase, па освежете ја страницата."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-lg">
      <PageHeader />
      <SchedulerManagementScreen view={view} />
    </PageContainer>
  );
}

function PageHeader() {
  return (
    <header className="rounded-panel border border-border/80 bg-surface p-lg shadow-surface">
      <div className="flex items-start gap-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-slate-950 text-gold shadow-soft">
          <CalendarDays className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Распоред на тренинзи</h1>
          <p className="mt-sm text-body leading-7 text-muted-foreground">
            Неделни термини, месечно генерирање, откажување и презакажување.
          </p>
        </div>
      </div>
    </header>
  );
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
