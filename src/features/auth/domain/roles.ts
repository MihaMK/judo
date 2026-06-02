export const APP_ROLES = ["management", "trainer", "parent"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type SessionContext = {
  userId: string | null;
  userProfileId: string | null;
  role: AppRole;
  clubId: string | null;
  parentGuardianIds: string[];
  displayName: string;
  isAuthenticated: boolean;
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}
