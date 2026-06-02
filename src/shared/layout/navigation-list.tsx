"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import type { AppRole } from "@/features/auth/domain/roles";
import { cn } from "@/shared/lib/cn";
import { getNavigationForRole, isActiveRoute } from "@/shared/layout/navigation";

type NavigationListProps = {
  role: AppRole;
  variant: "sidebar" | "mobile";
};

export function NavigationList({ role, variant }: NavigationListProps) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);

  if (variant === "mobile") {
    return (
      <div className="grid grid-cols-5 gap-1.5">
        {navigation.map((item) => {
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-card px-1 text-[11px] font-semibold transition-all duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                active ? "bg-slate-950 text-white shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-ui",
                  active ? "bg-gold text-gold-foreground" : "bg-transparent group-hover:bg-surface"
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="space-y-1.5 px-sm py-md" aria-label="Главна навигација">
      {navigation.map((item) => {
        const active = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex min-h-12 items-center justify-between rounded-card px-sm text-body font-semibold transition-all duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
              active ? "bg-white text-slate-950 shadow-soft" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {active ? <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gold" aria-hidden="true" /> : null}
            <span className="flex min-w-0 items-center gap-sm">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-button transition-colors duration-ui",
                  active ? "bg-slate-950 text-gold" : "bg-white/[0.06] text-slate-400 group-hover:text-gold"
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="hidden truncate lg:block">{item.label}</span>
            </span>
            <ChevronRight className={cn("hidden h-4 w-4 lg:block", active ? "opacity-80" : "opacity-0 group-hover:opacity-60")} aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
