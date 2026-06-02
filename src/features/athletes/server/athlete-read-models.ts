import type { SessionContext } from "@/features/auth/domain/roles";
import {
  foundationAthletes,
  foundationTrainingGroups
} from "@/features/athletes/data/foundation-athletes";
import { loadPersistedAthletes, loadPersistedTrainingGroups } from "@/features/athletes/server/athlete-persistence";
import { mk } from "@/shared/i18n/mk";
import type {
  AthleteListItem,
  AthleteOverviewStats,
  AthleteProfile,
  AthleteProfileView,
  TrainingGroup
} from "@/features/athletes/domain/athlete";

const parentVisibleGuardianId = "guardian-mila-stojanovska";

export async function getAthleteListView(sessionContext: SessionContext): Promise<AthleteListItem[]> {
  const athletes = await getVisibleAthletes(sessionContext);
  const groups = await getVisibleTrainingGroups(sessionContext);

  return athletes.map((athlete) => toAthleteListItem(athlete, groups));
}

export async function getAthleteProfileView(
  athleteId: string,
  sessionContext: SessionContext
): Promise<AthleteProfileView | null> {
  const athletes = await getVisibleAthletes(sessionContext);
  const athlete = athletes.find((item) => item.id === athleteId);

  if (!athlete) {
    return null;
  }

  const groups = await getVisibleTrainingGroups(sessionContext);
  const group = getTrainingGroupById(athlete.groupId, groups);

  return {
    ...athlete,
    group,
    sections: [
      {
        id: "attendance",
        title: mk.athletes.sections.attendance,
        description: "Историјата на присуство и записите од тренинзи ќе се додадат во фазата за присуство.",
        status: "deferred"
      },
      {
        id: "payments",
        title: mk.athletes.sections.payments,
        description: "Статусот на членарини и историјата на плаќања ќе се додадат во фазата за членарини.",
        status: "deferred"
      },
      {
        id: "competitions",
        title: mk.athletes.sections.competitions,
        description: "Подготовка, родителски потврди и резултати од натпревари ќе се додадат подоцна.",
        status: "deferred"
      },
      {
        id: "progression",
        title: mk.athletes.sections.progression,
        description: "Појаси, напредок и долгорочна историја ќе се додадат по основните оперативни процеси.",
        status: "deferred"
      }
    ]
  };
}

export async function getManagementAthleteOverview(sessionContext: SessionContext): Promise<AthleteOverviewStats> {
  const athletes = await getVisibleAthletes(sessionContext);
  const groups = await getVisibleTrainingGroups(sessionContext);

  return {
    totalAthletes: athletes.length,
    activeAthletes: athletes.filter((athlete) => athlete.status === "active").length,
    pausedAthletes: athletes.filter((athlete) => athlete.status === "paused").length,
    inactiveAthletes: athletes.filter((athlete) => athlete.status === "inactive").length,
    groupCount: groups.length
  };
}

export async function getTrainingGroupsView(sessionContext: SessionContext): Promise<TrainingGroup[]> {
  return getVisibleTrainingGroups(sessionContext);
}

async function getVisibleTrainingGroups(sessionContext: SessionContext): Promise<TrainingGroup[]> {
  const persistedGroups = sessionContext.clubId ? await loadPersistedTrainingGroups(sessionContext.clubId) : null;
  const groups = persistedGroups ?? foundationTrainingGroups;

  if (sessionContext.role === "parent") {
    const visibleAthletes = await getVisibleAthletes(sessionContext);
    const visibleGroupIds = new Set(visibleAthletes.map((athlete) => athlete.groupId));
    return groups.filter((group) => visibleGroupIds.has(group.id));
  }

  return groups;
}

async function getVisibleAthletes(sessionContext: SessionContext): Promise<AthleteProfile[]> {
  if (sessionContext.clubId) {
    const persistedAthletes = await loadPersistedAthletes(
      sessionContext.clubId,
      sessionContext.parentGuardianIds,
      sessionContext.role === "parent"
    );

    if (persistedAthletes) {
      return persistedAthletes;
    }
  }

  if (sessionContext.role === "parent") {
    return foundationAthletes.filter((athlete) =>
      athlete.guardians.some((guardian) => guardian.id === parentVisibleGuardianId)
    );
  }

  return foundationAthletes;
}

function toAthleteListItem(athlete: AthleteProfile, groups: TrainingGroup[]): AthleteListItem {
  const group = getTrainingGroupById(athlete.groupId, groups);
  const primaryGuardian = athlete.guardians.find((guardian) => guardian.isPrimaryContact) ?? athlete.guardians[0];

  return {
    id: athlete.id,
    fullName: athlete.fullName,
    birthDate: athlete.birthDate,
    birthYear: athlete.birthYear,
    status: athlete.status,
    groupName: group.name,
    currentBelt: athlete.currentBelt,
    primaryGuardianName: primaryGuardian?.fullName ?? "Нема доделен родител/старател",
    primaryGuardianPhone: primaryGuardian?.phone,
    guardianCount: athlete.guardians.length,
    profileSummary: athlete.profileSummary
  };
}

function getTrainingGroupById(groupId: string, groups: TrainingGroup[]): TrainingGroup {
  const group = groups.find((item) => item.id === groupId);

  if (!group) {
    return {
      id: groupId,
      name: "Нераспределена група",
      description: "Овој спортист нема активна тренинг група.",
      trainingDays: ""
    };
  }

  return group;
}
