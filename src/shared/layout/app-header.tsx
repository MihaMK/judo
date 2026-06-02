import type { SessionContext } from "@/features/auth/domain/roles";
import { Avatar } from "@/shared/ui/avatar";
import { NotificationBell } from "@/shared/layout/notification-bell";

type AppHeaderProps = {
  sessionContext: SessionContext;
  title?: string;
  subtitle?: string;
};

export function AppHeader({
  sessionContext,
  title = "Judo Drim",
  subtitle = "Мобилен оперативен систем за џудо клуб"
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/78 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[4.75rem] w-full max-w-6xl items-center justify-between gap-md px-md sm:px-lg lg:px-xl">
        <div className="min-w-0">
          <p className="truncate text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">{subtitle}</p>
          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h1>
        </div>
        <div className="flex items-center gap-sm">
          <NotificationBell />
          <Avatar name={sessionContext.displayName} size="md" />
        </div>
      </div>
    </header>
  );
}
