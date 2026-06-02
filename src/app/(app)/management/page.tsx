import { getSessionContext } from "@/features/auth/server/session";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { AthleteOverviewCards } from "@/features/athletes/components/athlete-overview-cards";
import {
  getManagementAthleteOverview,
  getTrainingGroupsView
} from "@/features/athletes/server/athlete-read-models";
import { PageShell } from "@/shared/layout/page-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import { Card } from "@/shared/ui/card";
import { mk } from "@/shared/i18n/mk";

export default async function ManagementPage() {
  const sessionContext = await getSessionContext();
  const athleteStats = await getManagementAthleteOverview(sessionContext);
  const groups = await getTrainingGroupsView(sessionContext);

  return (
    <PageShell title={mk.pages.management.title} description={mk.pages.management.description}>
      <div className="space-y-4">
        <AthleteOverviewCards stats={athleteStats} groups={groups} />
        {sessionContext.role === "management" ? (
          <Link href="/management/categories" className="block">
            <Card className="p-5 transition-all duration-ui hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-primary text-primary-foreground">
                  <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Категории и тежини</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Управување со возрасни категории, тежински категории и годишни генерации за натпреварувачка подготовка.
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ) : null}
        <EmptyState
          title={mk.pages.management.futureTitle}
          description={mk.pages.management.futureDescription}
        />
      </div>
    </PageShell>
  );
}
