import { CalendarCheck, CreditCard, Home, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppRole } from "@/features/auth/domain/roles";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: AppRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Денес",
    href: "/today",
    icon: Home,
    roles: ["management", "trainer", "parent"]
  },
  {
    label: "Присуство",
    href: "/attendance",
    icon: CalendarCheck,
    roles: ["management", "trainer", "parent"]
  },
  {
    label: "Членарини",
    href: "/payments",
    icon: CreditCard,
    roles: ["management", "trainer", "parent"]
  },
  {
    label: "Спортисти",
    href: "/athletes",
    icon: Users,
    roles: ["management", "trainer", "parent"]
  },
  {
    label: "Подесувања",
    href: "/settings",
    icon: Settings,
    roles: ["management", "trainer", "parent"]
  }
];

export function getNavigationForRole(role: AppRole) {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function isActiveRoute(pathname: string, href: string) {
  if (href === "/today") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
