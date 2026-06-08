import type { SessionContext } from "@/features/auth/domain/roles";
import { ClubBrand } from "@/shared/layout/club-brand";
import { NavigationList } from "@/shared/layout/navigation-list";
import { UserMenu } from "@/shared/layout/user-menu";

type DesktopSidebarProps = {
  sessionContext: SessionContext;
};

export function DesktopSidebar({ sessionContext }: DesktopSidebarProps) {
  return (
    <aside className="fixed inset-y-md left-md z-40 hidden w-20 overflow-hidden rounded-panel border border-white/10 bg-slate-950 text-white shadow-raised md:flex md:flex-col lg:w-72">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_35%_0%,rgba(217,173,78,0.28),transparent_58%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/20 via-white/8 to-transparent" aria-hidden="true" />

      <div className="relative border-b border-white/10 p-sm lg:p-md">
        <div className="lg:hidden">
          <ClubBrand clubName={sessionContext.clubName ?? undefined} logoUrl={sessionContext.clubLogoUrl} compact />
        </div>
        <div className="hidden lg:block">
          <ClubBrand clubName={sessionContext.clubName ?? undefined} logoUrl={sessionContext.clubLogoUrl} />
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto py-sm">
        <NavigationList role={sessionContext.role} variant="sidebar" />
      </div>

      <div className="relative border-t border-white/10 p-sm lg:p-md">
        <div className="lg:hidden">
          <UserMenu sessionContext={sessionContext} compact />
        </div>
        <div className="hidden lg:block">
          <UserMenu sessionContext={sessionContext} />
        </div>
      </div>
    </aside>
  );
}
