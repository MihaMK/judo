import { ShieldCheck, UserRound } from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { SessionContext } from "@/features/auth/domain/roles";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";

type UserMenuProps = {
  sessionContext: SessionContext;
  compact?: boolean;
};

const roleLabels: Record<SessionContext["role"], string> = {
  management: "Управа",
  trainer: "Тренер",
  parent: "Родител"
};

export function UserMenu({ sessionContext, compact = false }: UserMenuProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-sm rounded-card border border-white/10 bg-white/[0.04] p-sm shadow-soft">
        <Avatar name={sessionContext.displayName} size="md" />
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="rounded-card border border-white/10 bg-white/[0.05] p-sm shadow-soft">
      <div className="flex items-start gap-sm">
        <Avatar name={sessionContext.displayName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold text-white">{sessionContext.displayName}</p>
          <div className="mt-xs flex flex-wrap items-center gap-xs">
            <Badge className="border-gold/30 bg-gold/15 text-gold">{roleLabels[sessionContext.role]}</Badge>
            <span className="inline-flex items-center gap-1 text-caption text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Активна сесија
            </span>
          </div>
        </div>
      </div>
      <div className="mt-sm grid grid-cols-[1fr_auto] items-center gap-sm">
        <div className="flex items-center gap-xs text-caption text-slate-400">
          <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
          Профилот ќе биде достапен во следна фаза
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
