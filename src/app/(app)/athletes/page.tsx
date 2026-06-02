import Link from "next/link";
import { CircleSlash, Plus, UserCheck, Users } from "lucide-react";
import { AthleteListClient } from "@/features/athletes/components/athlete-list-client";
import { getAthleteListView, getManagementAthleteOverview, getTrainingGroupsView } from "@/features/athletes/server/athlete-read-models";
import { getSessionContext } from "@/features/auth/server/session";
import { PageContainer } from "@/shared/ui/page-container";
import { StatCard } from "@/shared/ui/stat-card";

export default async function AthletesPage() {
  const sessionContext = await getSessionContext();
  const [athletes, stats, groups] = await Promise.all([
    getAthleteListView(sessionContext),
    getManagementAthleteOverview(sessionContext),
    getTrainingGroupsView(sessionContext)
  ]);
  const canCreate = sessionContext.role === "management";

  return (
    <PageContainer className="space-y-lg">
      <header className="rounded-panel border border-border/80 bg-surface p-lg shadow-surface">
        <div className="flex flex-col gap-md lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-slate-950 text-gold shadow-soft">
              <Users className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Спортисти</h1>
              <p className="mt-sm text-body leading-7 text-muted-foreground">Управување со спортисти и членови на клубот</p>
            </div>
          </div>

          {canCreate ? (
            <Link
              href="/athletes/new"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors duration-ui hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Нов спортист
            </Link>
          ) : null}
        </div>
      </header>

      <section className="grid gap-sm md:grid-cols-3" aria-label="Преглед на спортисти">
        <StatCard icon={Users} label="Вкупно спортисти" value={stats.totalAthletes} />
        <StatCard icon={UserCheck} label="Активни" value={stats.activeAthletes + stats.pausedAthletes} />
        <StatCard icon={CircleSlash} label="Неактивни" value={stats.inactiveAthletes} />
      </section>

      <AthleteListClient athletes={athletes} groups={groups} canCreate={canCreate} />
    </PageContainer>
  );
}
