import { notFound } from "next/navigation";
import { AthleteProfileShell } from "@/features/athletes/components/athlete-profile-shell";
import { getAthleteProfileDossier } from "@/features/athletes/server/athlete-profile-dossier";
import { getAthleteProfileView } from "@/features/athletes/server/athlete-read-models";
import { getSessionContext } from "@/features/auth/server/session";
import { PageContainer } from "@/shared/ui/page-container";

type AthleteProfilePageProps = {
  params: Promise<{
    athleteId: string;
  }>;
};

export default async function AthleteProfilePage({ params }: AthleteProfilePageProps) {
  const { athleteId } = await params;
  const sessionContext = await getSessionContext();
  const athlete = await getAthleteProfileView(athleteId, sessionContext);

  if (!athlete) {
    notFound();
  }

  const dossier = await getAthleteProfileDossier(athlete, sessionContext);

  return (
    <PageContainer className="space-y-lg">
      <AthleteProfileShell
        athlete={athlete}
        dossier={dossier}
        canManage={sessionContext.role === "management"}
      />
    </PageContainer>
  );
}
