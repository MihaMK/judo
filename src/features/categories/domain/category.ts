export type CategoryGender = "M" | "Ж";

export type WeightCategory = {
  id: string;
  ageGroupId: string;
  gender: CategoryGender;
  name: string;
  minWeight: number | null;
  maxWeight: number | null;
  displayOrder: number;
  isActive: boolean;
};

export type AgeCategoryGroup = {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  displayOrder: number;
  isActive: boolean;
  weights: WeightCategory[];
};

export type BeltRank = {
  id: string;
  name: string;
  kyuDanValue: number;
  rankOrder: number;
  isActive: boolean;
};
