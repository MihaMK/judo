import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getSessionContext } from "@/features/auth/server/session";
import { mk } from "@/shared/i18n/mk";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const sessionContext = await getSessionContext();

  if (sessionContext.isAuthenticated && sessionContext.userProfileId) {
    redirect("/today");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{mk.app.name}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{mk.auth.loginTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{mk.auth.loginDescription}</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
