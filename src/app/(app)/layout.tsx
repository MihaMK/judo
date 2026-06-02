import { redirect } from "next/navigation";
import { AppShell } from "@/shared/layout/app-shell";
import { getSessionContext } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

export default async function AuthenticatedAppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated) {
    redirect("/login");
  }

  if (!sessionContext.userProfileId) {
    redirect("/unassigned");
  }

  return <AppShell sessionContext={sessionContext}>{children}</AppShell>;
}
