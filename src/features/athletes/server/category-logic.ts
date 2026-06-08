"use server";

import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/shared/config/env";

export type AthleteCategoryGender = "M" | "Ж";

export type AthleteCategoryLookupInput = {
  birthDate: string;
  gender: AthleteCategoryGender;
  weight: number | null;
};

export type AthleteCategoryLookupResult = {
  age: number | null;
  ageGroupName: string;
  weightCategoryName: string;
};

export type AthleteCategoryResult = AthleteCategoryLookupResult;

type AgeGroupRow = {
  id: string;
  name: string;
  min_age: number | null;
  max_age: number | null;
};

type WeightCategoryRow = {
  name: string;
  age_group_id: string;
  min_weight: number | string | null;
  max_weight: number | string | null;
};

export async function calculateAthleteCategory(input: AthleteCategoryLookupInput): Promise<AthleteCategoryLookupResult> {
  const dob = parseBirthDate(input.birthDate);

  if (!dob) {
    return emptyCategoryResult(null);
  }

  const age = calculateAge(dob);

  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return emptyCategoryResult(age);
  }

  const admin = createAdminSupabaseClient();
  const { data: ageGroup, error: ageGroupError } = await admin
    .from("age_groups")
    .select("id, name, min_age, max_age")
    .or(`min_age.is.null,min_age.lte.${age}`)
    .or(`max_age.is.null,max_age.gte.${age}`)
    .order("min_age", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (ageGroupError || !ageGroup) {
    return emptyCategoryResult(age);
  }

  const ageGroupRow = ageGroup as AgeGroupRow;

  if (!Number.isFinite(input.weight) || input.weight === null || input.weight <= 0) {
    return {
      age,
      ageGroupName: ageGroupRow.name,
      weightCategoryName: ""
    };
  }

  const { data: weightCategory, error: weightCategoryError } = await admin
    .from("weight_categories")
    .select("name, age_group_id, min_weight, max_weight")
    .eq("age_group_id", ageGroupRow.id)
    .eq("gender", input.gender)
    .or(`min_weight.is.null,min_weight.lt.${input.weight}`)
    .or(`max_weight.is.null,max_weight.gte.${input.weight}`)
    .order("max_weight", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (weightCategoryError || !weightCategory) {
    return {
      age,
      ageGroupName: ageGroupRow.name,
      weightCategoryName: ""
    };
  }

  const weightCategoryRow = weightCategory as WeightCategoryRow;

  return {
    age,
    ageGroupName: ageGroupRow.name,
    weightCategoryName: formatWeightCategoryLabel(weightCategoryRow)
  };
}

function emptyCategoryResult(age: number | null): AthleteCategoryLookupResult {
  return {
    age,
    ageGroupName: "",
    weightCategoryName: ""
  };
}

function parseBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateAge(dob: Date) {
  return new Date().getUTCFullYear() - dob.getUTCFullYear();
}

function formatWeightCategoryLabel(category: WeightCategoryRow) {
  const minWeight = toNumber(category.min_weight);
  const maxWeight = toNumber(category.max_weight);

  if (minWeight === null && maxWeight === null) {
    return category.name;
  }

  if (minWeight === null && maxWeight !== null) {
    return `0 kg - ${formatWeight(maxWeight)} kg`;
  }

  if (minWeight !== null && maxWeight === null) {
    return `над ${formatWeight(minWeight)} kg`;
  }

  if (minWeight !== null && maxWeight !== null) {
    return `${formatWeight(minWeight)} kg - ${formatWeight(maxWeight)} kg`;
  }

  return category.name;
}

function toNumber(value: number | string | null) {
  if (value === null) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatWeight(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.?0+$/, "");
}
