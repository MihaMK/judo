"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { mk } from "@/shared/i18n/mk";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-5 text-center shadow-soft">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-primary" aria-hidden="true" />
        <h1 className="text-lg font-semibold">Настана грешка</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Обидете се повторно. Ако проблемот продолжи, потребна е техничка проверка на процесот.
        </p>
        <Button className="mt-5" onClick={reset}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {mk.common.retry}
        </Button>
      </section>
    </main>
  );
}
