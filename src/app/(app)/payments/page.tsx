import { CreditCard, ShieldAlert } from "lucide-react";
import { PaymentsWorkflow } from "@/features/payments/components/payments-workflow";
import { getPaymentAthletesView } from "@/features/payments/server/payment-read-models";
import { getSessionContext } from "@/features/auth/server/session";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageContainer } from "@/shared/ui/page-container";

export default async function PaymentsPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext.clubId) {
    return (
      <PageContainer className="space-y-lg">
        <PageHeader />
        <EmptyState
          icon={ShieldAlert}
          title="Членарините не се достапни"
          description="Потребен е активен клубски профил за преглед на членарини."
        />
      </PageContainer>
    );
  }

  const athletes = await getPaymentAthletesView(sessionContext);
  const canCreate = sessionContext.role === "management" || sessionContext.role === "trainer";

  return (
    <PageContainer className="space-y-lg">
      <PageHeader />
      <PaymentsWorkflow athletes={athletes} canCreate={canCreate} />
    </PageContainer>
  );
}

function PageHeader() {
  return (
    <header className="rounded-panel border border-border/80 bg-surface p-lg shadow-surface">
      <div className="flex items-start gap-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-slate-950 text-gold shadow-soft">
          <CreditCard className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Членарини</h1>
          <p className="mt-sm text-body leading-7 text-muted-foreground">Следење на месечни уплати по спортист</p>
        </div>
      </div>
    </header>
  );
}
