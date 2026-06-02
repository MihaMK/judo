import { redirect } from "next/navigation";
import { getSessionContext } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated) {
    redirect("/login");
  }

  if (!sessionContext.userProfileId) {
    redirect("/unassigned");
  }

  redirect("/today");
}
