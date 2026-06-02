import { CirclePause, ListChecks, Users, UsersRound } from "lucide-react";
import { mk } from "@/shared/i18n/mk";
import { Card } from "@/shared/ui/card";
import { SectionHeader } from "@/shared/ui/section-header";
import { StatCard } from "@/shared/ui/stat-card";
import type { AthleteOverviewStats, TrainingGroup } from "../domain/athlete";

type AthleteOverviewCardsProps = {
  stats: AthleteOverviewStats;
  groups: TrainingGroup[];
};

export function AthleteOverviewCards({ stats, groups }: AthleteOverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard icon={Users} label={mk.common.total} value={stats.totalAthletes} />
      <StatCard icon={ListChecks} label={mk.common.active} value={stats.activeAthletes} />
      <StatCard icon={CirclePause} label={mk.common.paused} value={stats.pausedAthletes} />
      <StatCard icon={UsersRound} label={mk.navigation.groups} value={stats.groupCount} />

      <Card className="p-5 md:col-span-4">
        <SectionHeader title={mk.navigation.groups} />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:border-primary/50">
              <p className="text-sm font-semibold text-foreground">{group.name}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.description}</p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{group.trainingDays}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
