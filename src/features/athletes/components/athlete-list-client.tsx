"use client";

import Link from "next/link";
import { ChevronRight, Plus, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { cn } from "@/shared/lib/cn";
import type { AthleteListItem, TrainingGroup } from "../domain/athlete";
import { AthleteStatusBadge } from "./athlete-status-badge";

type AthleteListClientProps = {
  athletes: AthleteListItem[];
  groups: TrainingGroup[];
  canCreate: boolean;
};

type StatusFilter = "all" | "active" | "inactive";
type GenderFilter = "all" | "male" | "female";

export function AthleteListClient({ athletes, groups, canCreate }: AthleteListClientProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const filteredAthletes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("mk-MK");

    return athletes.filter((athlete) => {
      const isInactive = athlete.status === "inactive";
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? !isInactive : isInactive);
      const matchesGroup = groupFilter === "all" || athlete.groupName === groupFilter;
      const matchesGender = genderFilter === "all";

      if (!matchesStatus || !matchesGroup || !matchesGender) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        athlete.fullName,
        athlete.groupName,
        athlete.primaryGuardianName,
        athlete.primaryGuardianPhone ?? ""
      ]
        .join(" ")
        .toLocaleLowerCase("mk-MK");

      return searchableText.includes(normalizedQuery);
    });
  }, [athletes, genderFilter, groupFilter, query, statusFilter]);

  const hasSearch = query.trim().length > 0;
  const hasFilter = statusFilter !== "all" || genderFilter !== "all" || groupFilter !== "all";

  return (
    <div className="space-y-lg">
      <Card variant="elevated">
        <CardContent className="space-y-md p-md">
          <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Пребарај спортист..."
                className="h-12 pl-12 text-base"
              />
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

          <div className="grid gap-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px]">
            <SegmentedFilter
              label="Статус"
              options={[
                { value: "all", label: "Сите" },
                { value: "active", label: "Активни" },
                { value: "inactive", label: "Неактивни" }
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
            />

            <SegmentedFilter
              label="Пол"
              options={[
                { value: "all", label: "Сите" },
                { value: "male", label: "Машки" },
                { value: "female", label: "Женски" }
              ]}
              value={genderFilter}
              onChange={(value) => setGenderFilter(value as GenderFilter)}
              helper="Пол не е дел од тековната athlete schema."
            />

            <label className="space-y-xs">
              <span className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">Група</span>
              <Select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
                <option value="all">Сите групи</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-md">
        <p className="text-body text-muted-foreground">
          Прикажани <span className="font-semibold text-foreground">{filteredAthletes.length}</span> од {athletes.length} спортисти
        </p>
        <Badge tone="neutral">List view</Badge>
      </div>

      {filteredAthletes.length > 0 ? (
        <div className="grid gap-sm">
          {filteredAthletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={hasSearch ? Search : UsersRound}
          title={getEmptyTitle(athletes.length, hasSearch, hasFilter)}
          description={getEmptyDescription(athletes.length, hasSearch, hasFilter)}
          action={
            canCreate && athletes.length === 0 ? (
              <Link
                href="/athletes/new"
                className="inline-flex min-h-control items-center justify-center gap-2 rounded-button bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-colors duration-ui hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Нов спортист
              </Link>
            ) : null
          }
        />
      )}
    </div>
  );
}

function AthleteCard({ athlete }: { athlete: AthleteListItem }) {
  return (
    <Link href={`/athletes/${athlete.id}`} className="group block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
      <article className="rounded-card border border-border bg-surface p-md shadow-soft transition-all duration-ui group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-surface">
        <div className="flex items-center gap-md">
          <Avatar name={athlete.fullName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:justify-between">
              <h2 className="truncate text-section-title font-semibold text-foreground">{athlete.fullName}</h2>
              <AthleteStatusBadge status={athlete.status} />
            </div>
            <div className="mt-xs flex flex-wrap items-center gap-xs text-body text-muted-foreground">
              <span>{athlete.groupName}</span>
              <span aria-hidden="true">·</span>
              <span>Пол неевидентиран</span>
              <span aria-hidden="true">·</span>
              <span>{athlete.primaryGuardianName}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-ui group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
      </article>
    </Link>
  );
}

function SegmentedFilter({
  label,
  options,
  value,
  helper,
  onChange
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  helper?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-xs">
      <div className="flex items-center justify-between gap-sm">
        <span className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        {helper ? <span className="text-caption text-muted-foreground">{helper}</span> : null}
      </div>
      <div className="grid grid-cols-3 gap-xs rounded-card border border-border bg-muted/45 p-xs">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 rounded-button px-3 text-sm font-semibold transition-colors duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
              value === option.value ? "bg-slate-950 text-white shadow-soft" : "text-muted-foreground hover:bg-surface hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getEmptyTitle(total: number, hasSearch: boolean, hasFilter: boolean) {
  if (total === 0) {
    return "Нема активни спортисти";
  }

  if (hasSearch) {
    return "Не се пронајдени спортисти";
  }

  if (hasFilter) {
    return "Нема спортисти за избраниот филтер";
  }

  return "Не се пронајдени спортисти";
}

function getEmptyDescription(total: number, hasSearch: boolean, hasFilter: boolean) {
  if (total === 0) {
    return "Кога ќе се внесе првиот спортист, директориумот ќе се појави овде.";
  }

  if (hasSearch) {
    return "Пробајте со друго име, родител или телефонски број.";
  }

  if (hasFilter) {
    return "Сменете ги филтрите за да го проширите списокот.";
  }

  return "Пробајте со друг критериум за пребарување.";
}
