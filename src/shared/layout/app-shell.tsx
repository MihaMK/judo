import type { SessionContext } from "@/features/auth/domain/roles";
import { AppHeader } from "@/shared/layout/app-header";
import { DesktopSidebar } from "@/shared/layout/desktop-sidebar";
import { MobileBottomNavigation } from "@/shared/layout/mobile-bottom-navigation";

type AppShellProps = {
  children: React.ReactNode;
  sessionContext: SessionContext;
};

export function AppShell({ children, sessionContext }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <DesktopSidebar sessionContext={sessionContext} />

      <div className="flex min-h-dvh min-w-0 flex-col md:pl-[6.5rem] lg:pl-80">
        <AppHeader sessionContext={sessionContext} title={sessionContext.clubName ?? "Judo Drim"} />
        <main className="min-w-0 flex-1 pb-24 md:pb-lg">{children}</main>
      </div>

      <MobileBottomNavigation role={sessionContext.role} />
    </div>
  );
}
