export const ATHLETE_STATUSES = ["active", "paused", "inactive"] as const;
export const GUARDIAN_RELATIONSHIPS = ["mother", "father", "guardian", "other"] as const;

export type AthleteStatus = (typeof ATHLETE_STATUSES)[number];
export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIPS)[number];
export type AthleteGender = "M" | "Ж";

export type TrainingGroup = {
  id: string;
  name: string;
  description: string;
  trainingDays: string;
};

export type GuardianSummary = {
  id: string;
  fullName: string;
  relationship: GuardianRelationship;
  phone: string;
  email?: string;
  isPrimaryContact: boolean;
};

export type AthleteProfile = {
  id: string;
  fullName: string;
  birthDate: string;
  birthYear: number;
  gender?: AthleteGender | null;
  status: AthleteStatus;
  groupId: string;
  beltRankId?: string | null;
  currentBelt: string;
  weight?: number | null;
  photoUrl?: string | null;
  joinedAt: string;
  profileSummary: string;
  guardians: GuardianSummary[];
};

export type AthleteListItem = {
  id: string;
  fullName: string;
  birthDate: string;
  birthYear: number;
  gender?: AthleteGender | null;
  status: AthleteStatus;
  groupName: string;
  currentBelt: string;
  photoUrl?: string | null;
  primaryGuardianName: string;
  primaryGuardianPhone?: string;
  guardianCount: number;
  profileSummary: string;
};

export type AthleteProfileView = AthleteProfile & {
  group: TrainingGroup;
  sections: AthleteProfileSection[];
};

export type AthleteProfileSection = {
  id: "attendance" | "payments" | "competitions" | "progression";
  title: string;
  description: string;
  status: "deferred";
};

export type AthleteOverviewStats = {
  totalAthletes: number;
  activeAthletes: number;
  pausedAthletes: number;
  inactiveAthletes: number;
  groupCount: number;
};

export type GuardianOption = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
};
