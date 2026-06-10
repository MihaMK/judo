"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, Plus, RotateCcw, XCircle } from "lucide-react";
import type { SchedulerManagementView, TrainingSessionSummary } from "@/features/scheduler/domain/scheduler";
import {
  cancelTrainingSessionAction,
  createExtraTrainingSessionAction,
  createScheduleTemplateAction,
  deactivateScheduleTemplateAction,
  generateMonthlySessionsAction,
  rescheduleTrainingSessionAction,
  type SchedulerActionState
} from "@/features/scheduler/server/actions";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/cn";
import { formatDateMk } from "@/shared/lib/date-format";

type SchedulerManagementScreenProps = {
  view: SchedulerManagementView;
};

const weekDays = [
  { value: 1, label: "Понеделник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четврток" },
  { value: 5, label: "Петок" },
  { value: 6, label: "Сабота" },
  { value: 7, label: "Недела" }
];

export function SchedulerManagementScreen({ view }: SchedulerManagementScreenProps) {
  const router = useRouter();
  const [message, setMessage] = useState<SchedulerActionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [scheduleGroupId, setScheduleGroupId] = useState(view.groups[0]?.id ?? "");
  const [scheduleDay, setScheduleDay] = useState("2");
  const [scheduleTime, setScheduleTime] = useState("18:30");
  const [extraGroupId, setExtraGroupId] = useState(view.groups[0]?.id ?? "");
  const [extraDate, setExtraDate] = useState(toDateInputValue(new Date()));
  const [extraTime, setExtraTime] = useState("18:30");
  const [extraNotes, setExtraNotes] = useState("");

  function runAction(action: () => Promise<SchedulerActionState>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-lg">
      {message ? (
        <div className={cn("rounded-card border px-4 py-3 text-sm font-semibold", message.ok ? "border-success/60 bg-success text-success-foreground" : "border-danger/60 bg-danger text-danger-foreground")}>
          {message.message}
        </div>
      ) : null}

      <section className="grid gap-lg xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
        <div className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle>Неделен распоред</CardTitle>
              <p className="text-body text-muted-foreground">Овие шаблони се користат за месечно генерирање на тренинзи.</p>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid gap-sm">
                <label className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">Група</label>
                <Select value={scheduleGroupId} onChange={(event) => setScheduleGroupId(event.target.value)}>
                  {view.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-sm sm:grid-cols-2">
                <div className="grid gap-sm">
                  <label className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ден</label>
                  <Select value={scheduleDay} onChange={(event) => setScheduleDay(event.target.value)}>
                    {weekDays.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-sm">
                  <label className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">Час</label>
                  <Input type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} />
                </div>
              </div>
              <Button
                type="button"
                disabled={isPending || !scheduleGroupId}
                onClick={() =>
                  runAction(() =>
                    createScheduleTemplateAction({
                      groupId: scheduleGroupId,
                      dayOfWeek: Number(scheduleDay),
                      startTime: scheduleTime
                    })
                  )
                }
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Додај неделен термин
              </Button>

              <div className="space-y-sm">
                {view.schedules.length === 0 ? (
                  <EmptyState
                    icon={Clock3}
                    title="Нема неделни термини"
                    description="Додајте ги стандардните термини за групите, па генерирајте месец."
                  />
                ) : (
                  view.schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between gap-md rounded-card border border-border bg-muted/30 p-md">
                      <div>
                        <p className="font-semibold text-foreground">{schedule.groupName}</p>
                        <p className="text-sm text-muted-foreground">
                          {weekDays.find((day) => day.value === schedule.dayOfWeek)?.label} · {schedule.startTime}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isPending}
                        onClick={() => runAction(() => deactivateScheduleTemplateAction({ scheduleId: schedule.id }))}
                      >
                        Деактивирај
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дополнителен тренинг</CardTitle>
              <p className="text-body text-muted-foreground">За втор тренинг во ист ден или тренинг во недела.</p>
            </CardHeader>
            <CardContent className="space-y-md">
              <Select value={extraGroupId} onChange={(event) => setExtraGroupId(event.target.value)}>
                {view.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
              <div className="grid gap-sm sm:grid-cols-2">
                <Input type="date" value={extraDate} onChange={(event) => setExtraDate(event.target.value)} />
                <Input type="time" value={extraTime} onChange={(event) => setExtraTime(event.target.value)} />
              </div>
              <Textarea
                value={extraNotes}
                onChange={(event) => setExtraNotes(event.target.value)}
                placeholder="Белешка за дополнителниот тренинг"
              />
              <Button
                type="button"
                disabled={isPending || !extraGroupId}
                onClick={() =>
                  runAction(() =>
                    createExtraTrainingSessionAction({
                      groupId: extraGroupId,
                      date: extraDate,
                      time: extraTime,
                      notes: extraNotes
                    })
                  )
                }
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Додај тренинг
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Месечен распоред</CardTitle>
                <p className="text-body text-muted-foreground">
                  {view.month.toString().padStart(2, "0")}.{view.year}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-sm">
                <Link
                  href={getMonthHref(view.year, view.month, -1)}
                  className="inline-flex min-h-control items-center justify-center rounded-button border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft transition-colors duration-ui hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  Претходен
                </Link>
                <Link
                  href={getMonthHref(view.year, view.month, 1)}
                  className="inline-flex min-h-control items-center justify-center rounded-button border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft transition-colors duration-ui hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  Следен
                </Link>
                <Button
                  type="button"
                  disabled={isPending || view.schedules.length === 0}
                  onClick={() => runAction(() => generateMonthlySessionsAction({ year: view.year, month: view.month }))}
                >
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Генерирај месец
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {view.sessions.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Нема генерирани тренинзи"
                description="Креирајте неделни термини и генерирајте го избраниот месец."
              />
            ) : (
              <div className="space-y-sm">
                {view.sessions.map((session) => (
                  <SessionRow key={session.id} session={session} disabled={isPending} runAction={runAction} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SessionRow({
  session,
  disabled,
  runAction
}: {
  session: TrainingSessionSummary;
  disabled: boolean;
  runAction: (action: () => Promise<SchedulerActionState>) => void;
}) {
  const [date, setDate] = useState(session.date);
  const [time, setTime] = useState(session.time);
  const [reason, setReason] = useState("");

  return (
    <div className={cn("rounded-card border p-md shadow-soft", session.status === "cancelled" ? "border-danger/40 bg-danger/10" : "border-border bg-surface")}>
      <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-sm">
            <p className="font-semibold text-foreground">{session.groupName}</p>
            <SessionStatusBadge session={session} />
          </div>
          <p className="mt-xs text-sm text-muted-foreground">
            {formatDateMk(new Date(`${session.date}T00:00:00`))} · {session.time} · {session.athleteCount} спортисти
          </p>
          {session.cancellationReason ? <p className="mt-xs text-sm text-danger-foreground">Причина: {session.cancellationReason}</p> : null}
        </div>
        <div className="grid gap-xs sm:grid-cols-[140px_110px_auto_auto]">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={session.status === "cancelled"} />
          <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} disabled={session.status === "cancelled"} />
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || session.status === "cancelled"}
            onClick={() => runAction(() => rescheduleTrainingSessionAction({ sessionId: session.id, date, time }))}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Презакажи
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || session.status === "cancelled"}
            onClick={() => runAction(() => cancelTrainingSessionAction({ sessionId: session.id, reason }))}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Откажи
          </Button>
        </div>
      </div>
      {session.status !== "cancelled" ? (
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Причина за откажување (опционално)"
          className="mt-sm"
        />
      ) : null}
    </div>
  );
}

function SessionStatusBadge({ session }: { session: TrainingSessionSummary }) {
  if (session.status === "cancelled") {
    return <Badge tone="danger">Откажан</Badge>;
  }

  if (session.status === "rescheduled") {
    return <Badge tone="warning">Презакажан</Badge>;
  }

  if (session.type === "extra") {
    return <Badge tone="primary">Дополнителен</Badge>;
  }

  if (session.status === "completed") {
    return <Badge tone="success">Завршен</Badge>;
  }

  return (
    <Badge tone="neutral">
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      Закажан
    </Badge>
  );
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonthHref(year: number, month: number, offset: -1 | 1) {
  const next = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `/management/schedule?year=${next.getUTCFullYear()}&month=${next.getUTCMonth() + 1}`;
}
