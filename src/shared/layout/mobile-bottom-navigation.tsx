import type { AppRole } from "@/features/auth/domain/roles";
import { NavigationList } from "@/shared/layout/navigation-list";

type MobileBottomNavigationProps = {
  role: AppRole;
};

export function MobileBottomNavigation({ role }: MobileBottomNavigationProps) {
  return (
    <nav
      className="fixed inset-x-sm bottom-sm z-40 rounded-[1.75rem] border border-border/80 bg-surface/92 px-xs py-xs shadow-raised backdrop-blur-2xl md:hidden"
      aria-label="Мобилна навигација"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <NavigationList role={role} variant="mobile" />
    </nav>
  );
}
