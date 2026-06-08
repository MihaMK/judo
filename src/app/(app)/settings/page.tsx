import { getSessionContext } from "@/features/auth/server/session";
import { ClubBrandingForm } from "@/features/settings/components/club-branding-form";
import { getClubBrandingView } from "@/features/settings/server/club-branding";
import { PageShell } from "@/shared/layout/page-shell";
import { EmptyState } from "@/shared/ui/empty-state";

export default async function SettingsPage() {
  const sessionContext = await getSessionContext();
  const branding = await getClubBrandingView(sessionContext.clubId);

  return (
    <PageShell
      title="Подесувања"
      description="Контролирани клубски подесувања без промена на оперативните процеси."
    >
      <div className="space-y-lg">
        <ClubBrandingForm
          clubName={branding.clubName}
          logoUrl={branding.logoUrl}
          canManage={sessionContext.role === "management"}
        />

        <EmptyState
          title="Следни подесувања"
          description="Тренери, групи и членарина ќе се додаваат во посебни контролирани фази."
        />
      </div>
    </PageShell>
  );
}
