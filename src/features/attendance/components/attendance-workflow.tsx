"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Search, Users } from "lucide-react";
import { markAttendanceEntryAction } from "@/features/attendance/server/actions";
import type { AttendanceTrainingOption } from "@/features/attendance/domain/attendance";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/cn";

type AttendanceWorkflowProps = {
  trainings: AttendanceTrainingOption[];
};

type AttendanceMark = "present" | "absent";
type FilterMode = "all" | "absent";

export function AttendanceWorkflow({ trainings }: AttendanceWorkflowProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(trainings[0]?.groupId ?? "");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [saveLabel, setSaveLabel] = useState("Подготвено");
  const [isPending, startTransition] = useTransition();
  const selectedTraining = trainings.find((training) => training.groupId === selectedGroupId) ?? trainings[0] ?? null;
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>(() => buildInitialMarks(trainings));

  const visibleAthletes = useMemo(() => {
    if (!selectedTraining) {
      return [];
    }

    const normalizedQuery = query.trim().toLocaleLowerCase("mk-MK");

    return selectedTraining.session.athletes.filter((athlete) => {
      const mark = marks[athlete.id] ?? getInitialMark(athlete.existingStatus);
      const matchesFilter = filter === "all" || mark === "absent";
      const matchesSearch = !normalizedQuery || athlete.fullName.toLocaleLowerCase("mk-MK").includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [filter, marks, query, selectedTraining]);

  const counters = useMemo(() => {
    const athletes = selectedTraining?.session.athletes ?? [];
    const absent = athletes.filter((athlete) => (marks[athlete.id] ?? getInitialMark(athlete.existingStatus)) === "absent").length;
    const expected = athletes.length;

    return {
      expected,
      absent,
      present: expected - absent
    };
  }, [marks, selectedTraining]);

  function toggleAttendance(athleteId: string) {
    if (!selectedTraining) {
      return;
    }

    const previousMark = marks[athleteId] ?? "present";
    const nextMark: AttendanceMark = previousMark === "absent" ? "present" : "absent";

    setMarks((current) => ({ ...current, [athleteId]: nextMark }));
    setSaveLabel("Се зачувува...");

    startTransition(async () => {
      const result = await markAttendanceEntryAction({
        groupId: selectedTraining.groupId,
        sessionDate: selectedTraining.session.sessionDate,
        athleteId,
        status: nextMark
      });

      if (result.ok) {
        setSaveLabel("Зачувано");
        return;
      }

      setMarks((current) => ({ ...current, [athleteId]: previousMark }));
      setSaveLabel(result.message ?? "Не е зачувано");
    });
  }

  if (trainings.length === 0) {
    return (
      <EmptyState
        icon={Clock3}
        title="Нема тренинзи денес"
        description="Кога ќе постои активен распоред за денес, тренинзите ќе се појават овде."
      />
    );
  }

  return (
    <div className="space-y-lg">
      <section className="grid gap-sm sm:grid-cols-2 xl:grid-cols-3" aria-label="Избор на тренинг">
        {trainings.map((training) => {
          const selected = training.groupId === selectedTraining?.groupId;

          return (
            <button
              key={training.groupId}
              type="button"
              onClick={() => setSelectedGroupId(training.groupId)}
              className={cn(
                "rounded-card border p-md text-left shadow-soft transition-all duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                selected ? "border-primary/30 bg-slate-950 text-white shadow-raised" : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface"
              )}
              aria-pressed={selected}
            >
              <div className="flex items-center justify-between gap-md">
                <div className="min-w-0">
                  <p className={cn("truncate text-section-title font-semibold", selected ? "text-white" : "text-foreground")}>{training.groupName}</p>
                  <p className={cn("mt-xs text-body", selected ? "text-slate-300" : "text-muted-foreground")}>{training.trainingTime}</p>
                </div>
                <div className={cn("rounded-full border px-3 py-1 text-caption font-semibold", selected ? "border-gold/30 bg-gold/15 text-gold" : "border-border bg-muted text-muted-foreground")}>
                  {training.expectedAthletes} спортисти
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {selectedTraining ? (
        <>
          <Card variant="elevated" className="overflow-hidden">
            <div className="border-b border-border/80 bg-subdued/60 p-md">
              <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge tone="primary">Брз режим</Badge>
                  <h2 className="mt-sm text-section-title font-semibold text-foreground">{selectedTraining.groupName}</h2>
                  <p className="mt-xs text-body text-muted-foreground">{selectedTraining.trainingTime} · сите се присутни додека не означите отсутен</p>
                </div>
                <div className="inline-flex items-center gap-xs rounded-full border border-border bg-surface px-3 py-1 text-caption font-semibold text-muted-foreground shadow-soft">
                  <span className={cn("h-2 w-2 rounded-full", isPending ? "bg-warning-foreground" : "bg-success-foreground")} aria-hidden="true" />
                  {saveLabel}
                </div>
              </div>
            </div>
            <CardContent className="grid gap-sm p-md sm:grid-cols-3">
              <Counter label="Очекувани" value={counters.expected} />
              <Counter label="Присутни" value={counters.present} tone="present" />
              <Counter label="Отсутни" value={counters.absent} tone="absent" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Спортисти</CardTitle>
                  <p className="mt-xs text-body text-muted-foreground">Допрете картичка за да означите отсутен.</p>
                </div>
                <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
                  <div className="relative min-w-0 sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Пребарај спортист"
                      className="pl-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-xs rounded-card border border-border bg-muted/45 p-xs">
                    <FilterButton active={filter === "all"} label="Сите" onClick={() => setFilter("all")} />
                    <FilterButton active={filter === "absent"} label="Отсутни" onClick={() => setFilter("absent")} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedTraining.session.athletes.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Нема спортисти во оваа група"
                  description="Кога спортистите ќе бидат распределени во групата, ќе се појават во списокот за присуство."
                />
              ) : visibleAthletes.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Нема резултати"
                  description="Пробајте со друго име или сменете го филтерот."
                />
              ) : (
                <div className="grid gap-sm md:grid-cols-2">
                  {visibleAthletes.map((athlete) => {
                    const mark = marks[athlete.id] ?? getInitialMark(athlete.existingStatus);
                    const absent = mark === "absent";

                    return (
                      <button
                        key={athlete.id}
                        type="button"
                        onClick={() => toggleAttendance(athlete.id)}
                        className={cn(
                          "group flex min-h-20 items-center gap-md rounded-card border p-md text-left shadow-soft transition-all duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                          absent ? "border-danger/60 bg-danger text-danger-foreground" : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface"
                        )}
                        aria-pressed={absent}
                      >
                        <Avatar name={athlete.fullName} size="lg" className={absent ? "border-danger/60 bg-surface text-danger-foreground" : undefined} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body font-semibold">{athlete.fullName}</span>
                          <span className={cn("mt-1 flex flex-wrap items-center gap-xs text-caption", absent ? "text-danger-foreground/80" : "text-muted-foreground")}>
                            <span>{selectedTraining.groupName}</span>
                            <PaymentBadge />
                          </span>
                        </span>
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", absent ? "bg-danger-foreground text-danger" : "bg-success text-success-foreground")}>
                          {absent ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function Counter({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "present" | "absent" }) {
  return (
    <div
      className={cn(
        "rounded-card border p-md shadow-soft",
        tone === "present" && "border-success/60 bg-success text-success-foreground",
        tone === "absent" && "border-danger/60 bg-danger text-danger-foreground",
        tone === "neutral" && "border-border bg-surface text-foreground"
      )}
    >
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-xs text-caption font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-button px-3 text-sm font-semibold transition-colors duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        active ? "bg-slate-950 text-white shadow-soft" : "text-muted-foreground hover:bg-surface hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function PaymentBadge() {
  return <Badge tone="neutral">Членарина: непознато</Badge>;
}

function buildInitialMarks(trainings: AttendanceTrainingOption[]) {
  return Object.fromEntries(
    trainings.flatMap((training) =>
      training.session.athletes.map((athlete) => [athlete.id, getInitialMark(athlete.existingStatus)])
    )
  ) as Record<string, AttendanceMark>;
}

function getInitialMark(status: string): AttendanceMark {
  return status === "absent" ? "absent" : "present";
}
