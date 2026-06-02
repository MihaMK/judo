import { PageShell } from "@/shared/layout/page-shell";
import { SkeletonBlock } from "@/shared/ui/skeleton-block";
import { mk } from "@/shared/i18n/mk";

export default function Loading() {
  return (
    <PageShell title={mk.common.loading}>
      <div className="space-y-3">
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-24" />
      </div>
    </PageShell>
  );
}
