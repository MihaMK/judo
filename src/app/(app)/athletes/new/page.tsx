import { redirect } from "next/navigation";
import { AthleteForm } from "@/features/athletes/components/athlete-form";
import { createAthleteAction } from "@/features/athletes/server/actions";
import { getTrainingGroupsView } from "@/features/athletes/server/athlete-read-models";
import { getSessionContext } from "@/features/auth/server/session";
import { getBeltRanksView, getCategoryManagementView } from "@/features/categories/server/category-read-models";
import { mk } from "@/shared/i18n/mk";
import { PageShell } from "@/shared/layout/page-shell";

export default async function NewAthletePage() {
  const sessionContext = await getSessionContext();

  if (sessionContext.role !== "management") {
    redirect("/athletes");
  }

  const groups = await getTrainingGroupsView(sessionContext);
  const [ageGroups, beltRanks] = await Promise.all([
    loadOptionalAgeGroups(sessionContext.clubId),
    loadOptionalBeltRanks()
  ]);

  return (
    <PageShell title={mk.athletes.createTitle} description={mk.athletes.createDescription}>
      <AthleteForm action={createAthleteAction} groups={groups} ageGroups={ageGroups} beltRanks={beltRanks} />
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
