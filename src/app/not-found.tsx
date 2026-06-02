import Link from "next/link";
import { PageShell } from "@/shared/layout/page-shell";
import { mk } from "@/shared/i18n/mk";

export default function NotFound() {
  return (
    <PageShell title={mk.common.notFoundTitle} description={mk.common.notFoundDescription}>
      <Link
        href="/today"
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:opacity-95"
      >
        {mk.common.backHome}
      </Link>
    </PageShell>
  );
}
