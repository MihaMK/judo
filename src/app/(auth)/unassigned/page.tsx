import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/features/auth/server/session";
import { PageShell } from "@/shared/layout/page-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import { mk } from "@/shared/i18n/mk";

export const dynamic = "force-dynamic";

export default async function UnassignedPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated) {
    redirect("/login");
  }

  if (sessionContext.userProfileId) {
    redirect("/today");
  }

  return (
    <PageShell title={mk.auth.unassignedTitle} description={mk.auth.unassignedDescription}>
      <div className="space-y-4">
        <EmptyState
          title={mk.auth.unassignedCardTitle}
          description={mk.auth.unassignedCardDescription}
        />
        <Link
          href="/bootstrap"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:opacity-95"
        >
          {mk.auth.openBootstrap}
        </Link>
      </div>
    </PageShell>
  );
}
