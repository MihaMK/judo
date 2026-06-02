export type CategoryType = "youth" | "senior" | "veteran" | "general";
export type CategoryGender = "M" | "F";

export type WeightCategory = {
  id: string;
  gender: CategoryGender;
  label: string;
  maxWeightKg: number | null;
  isOpenEnded: boolean;
  displayOrder: number;
  isActive: boolean;
};

export type YearGenerationRule = {
  id: string;
  label: string;
  minAge: number | null;
  maxAge: number | null;
  displayOrder: number;
  isActive: boolean;
};

export type AgeCategoryGroup = {
  id: string;
  code: string;
  name: string;
  categoryType: CategoryType;
  minAge: number | null;
  maxAge: number | null;
  displayOrder: number;
  isActive: boolean;
  weights: WeightCategory[];
  yearRules: YearGenerationRule[];
};
