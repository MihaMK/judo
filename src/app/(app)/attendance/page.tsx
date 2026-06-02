import { CalendarCheck, ShieldAlert } from "lucide-react";
import { AttendanceWorkflow } from "@/features/attendance/components/attendance-workflow";
import { isAttendanceSchemaMissingError, loadAttendanceTrainingOptions } from "@/features/attendance/server/attendance-persistence";
import { getSessionContext } from "@/features/auth/server/session";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageContainer } from "@/shared/ui/page-container";

export default async function AttendancePage() {
  const sessionContext = await getSessionContext();

  if (sessionContext.role === "parent" || !sessionContext.clubId) {
    return (
      <PageContainer className="space-y-lg">
        <PageHeader />
        <EmptyState
          icon={ShieldAlert}
          title="Присуството е достапно за тренери"
          description="Родителскиот преглед ќе биде достапен во следна фаза. Уредување на присуство е само за тренери и управа."
        />
      </PageContainer>
    );
  }

  let trainings;

  try {
    trainings = await loadAttendanceTrainingOptions({
      clubId: sessionContext.clubId,
      sessionDate: getTodayDate()
    });
  } catch (error) {
    if (!isAttendanceSchemaMissingError(error)) {
      throw error;
    }

    return (
      <PageContainer className="space-y-lg">
        <PageHeader />
        <EmptyState
          icon={ShieldAlert}
          title="Присуството не е подготвено"
          description="Недостасува attendance schema во Supabase. Применете ја attendance миграцијата и освежете ја страницата."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-lg">
      <PageHeader />
      <AttendanceWorkflow trainings={trainings} />
    </PageContainer>
  );
}

function PageHeader() {
  return (
    <header className="rounded-panel border border-border/80 bg-surface p-lg shadow-surface">
      <div className="flex items-start gap-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-slate-950 text-gold shadow-soft">
          <CalendarCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Присуство</h1>
          <p className="mt-sm text-body leading-7 text-muted-foreground">Изберете тренинг за евиденција</p>
        </div>
      </div>
    </header>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
