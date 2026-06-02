import { PageShell } from "@/shared/layout/page-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import { mk } from "@/shared/i18n/mk";

export default function NotificationsPage() {
  return (
    <PageShell title={mk.pages.notifications.title} description={mk.pages.notifications.description}>
      <EmptyState
        title={mk.pages.notifications.emptyTitle}
        description={mk.pages.notifications.emptyDescription}
      />
    </PageShell>
  );
}
