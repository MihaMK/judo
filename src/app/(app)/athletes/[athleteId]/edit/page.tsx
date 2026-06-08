import { notFound, redirect } from "next/navigation";
import { AthleteForm } from "@/features/athletes/components/athlete-form";
import { updateAthleteAction } from "@/features/athletes/server/actions";
import { getAthleteProfileView, getTrainingGroupsView } from "@/features/athletes/server/athlete-read-models";
import { getSessionContext } from "@/features/auth/server/session";
import { getBeltRanksView, getCategoryManagementView } from "@/features/categories/server/category-read-models";
import { mk } from "@/shared/i18n/mk";
import { PageShell } from "@/shared/layout/page-shell";

type EditAthletePageProps = {
  params: Promise<{
    athleteId: string;
  }>;
};

export default async function EditAthletePage({ params }: EditAthletePageProps) {
  const { athleteId } = await params;
  const sessionContext = await getSessionContext();

  if (sessionContext.role !== "management") {
    redirect(`/athletes/${athleteId}`);
  }

  const athlete = await getAthleteProfileView(athleteId, sessionContext);

  if (!athlete) {
    notFound();
  }

  const groups = await getTrainingGroupsView(sessionContext);
  const [ageGroups, beltRanks] = await Promise.all([
    loadOptionalAgeGroups(sessionContext.clubId),
    loadOptionalBeltRanks()
  ]);
  const action = updateAthleteAction.bind(null, athlete.id);

  return (
    <PageShell title={mk.athletes.editTitle} description={mk.athletes.editDescription}>
      <AthleteForm action={action} groups={groups} ageGroups={ageGroups} beltRanks={beltRanks} athlete={athlete} />
    </PageShell>
  );
}

async function loadOptionalAgeGroups(clubId: string | null) {
  try {
    return await getCategoryManagementView(clubId);
  } catch (error) {
    if (isCategorySchemaCacheError(error)) {
      return [];
    }

    throw error;
  }
}

async function loadOptionalBeltRanks() {
  try {
    return await getBeltRanksView();
  } catch (error) {
    if (isCategorySchemaCacheError(error)) {
      return [];
    }

    throw error;
  }
}

function isCategorySchemaCacheError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("PGRST205") ||
    (error.message.includes("competition_age_groups") && error.message.includes("schema cache")) ||
    error.message.includes("age_groups") ||
    error.message.includes("weight_categories") ||
    error.message.includes("belt_ranks") ||
    error.message.includes("belt_rank_id")
  );
}
