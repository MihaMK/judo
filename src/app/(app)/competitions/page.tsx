import { PageShell } from "@/shared/layout/page-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import { mk } from "@/shared/i18n/mk";

export default function CompetitionsPage() {
  return (
    <PageShell title={mk.pages.competitions.title} description={mk.pages.competitions.description}>
      <EmptyState
        title={mk.pages.competitions.emptyTitle}
        description={mk.pages.competitions.emptyDescription}
      />
    </PageShell>
  );
}
