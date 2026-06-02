import { redirect } from "next/navigation";
import { BootstrapProfileCard } from "@/features/auth/components/bootstrap-profile-card";
import { getSessionContext } from "@/features/auth/server/session";
import { PageShell } from "@/shared/layout/page-shell";
import { mk } from "@/shared/i18n/mk";

export const dynamic = "force-dynamic";

export default async function BootstrapPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated) {
    redirect("/login");
  }

  if (sessionContext.userProfileId) {
    redirect("/today");
  }

  return (
    <PageShell
      title={mk.auth.bootstrapTitle}
      description={mk.auth.bootstrapDescription}
    >
      <BootstrapProfileCard />
    </PageShell>
  );
}
