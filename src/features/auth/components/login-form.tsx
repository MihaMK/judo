"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signInWithPassword, type LoginState } from "@/features/auth/server/actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { mk } from "@/shared/i18n/mk";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInWithPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-foreground">{mk.auth.email}</span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          className="mt-2 h-11"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-foreground">{mk.auth.password}</span>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-2 h-11"
          required
        />
      </label>

      {state.message ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{state.message}</div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {isPending ? mk.auth.signingIn : mk.auth.signIn}
      </Button>
    </form>
  );
}
