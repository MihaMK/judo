"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { bootstrapManagementProfile } from "@/features/auth/server/actions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { mk } from "@/shared/i18n/mk";

export function BootstrapProfileCard() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mk.auth.bootstrapCardTitle}</CardTitle>
        <CardDescription>{mk.auth.bootstrapCardDescription}</CardDescription>
      </CardHeader>

      <CardContent>
        {message ? <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</div> : null}

        <Button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await bootstrapManagementProfile();
              if (!result.ok) {
                setMessage(result.message);
              }
            });
          }}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {isPending ? mk.auth.bootstrapping : mk.auth.bootstrapAction}
        </Button>
      </CardContent>
    </Card>
  );
}
