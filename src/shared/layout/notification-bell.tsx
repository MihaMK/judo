"use client";

import { useState } from "react";
import { Bell, Inbox } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type NotificationBellProps = {
  count?: number;
};

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-button border border-border/80 bg-surface text-muted-foreground shadow-soft transition-all duration-ui hover:-translate-y-0.5 hover:border-primary/25 hover:text-foreground hover:shadow-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-label="Известувања"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {count > 0 ? (
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-danger-foreground">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-panel border border-border bg-surface p-sm shadow-raised">
          <div className="rounded-card bg-muted/45 p-md">
            <p className="text-card-title font-semibold text-foreground">Известувања</p>
            <p className="mt-1 text-caption text-muted-foreground">Центар за клубски пораки и потсетници.</p>
          </div>
          <div className={cn("mt-sm rounded-card border border-dashed border-border bg-surface p-md text-center")}>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-sm text-body font-medium text-foreground">Нема нови известувања</p>
            <p className="mt-xs text-caption leading-5 text-muted-foreground">Известувањата ќе се појават тука во следна фаза.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
