import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import type { AgeCategoryGroup, CategoryType, WeightCategory, YearGenerationRule } from "../domain/category";

type AgeGroupRow = {
  id: string;
  code: string;
  name: string;
  category_type: CategoryType;
  min_age: number | null;
  max_age: number | null;
  display_order: number;
  is_active: boolean;
};

type WeightRow = {
  id: string;
  age_group_id: string;
  gender: "M" | "F";
  label: string;
  max_weight_kg: number | null;
  is_open_ended: boolean;
  display_order: number;
  is_active: boolean;
};

type YearRuleRow = {
  id: string;
  age_group_id: string;
  label: string;
  min_age: number | null;
  max_age: number | null;
  display_order: number;
  is_active: boolean;
};

export async function getCategoryManagementView(clubId: string | null): Promise<AgeCategoryGroup[]> {
  if (!clubId || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data: ageGroups, error: ageGroupError } = await supabase
    .from("competition_age_groups")
    .select("id, code, name, category_type, min_age, max_age, display_order, is_active")
    .eq("club_id", clubId)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (ageGroupError) {
    throw new Error(`Unable to load age categories: ${ageGroupError.message}`);
  }

  const ageGroupRows = ageGroups as AgeGroupRow[];
  const ageGroupIds = ageGroupRows.map((group) => group.id);

  if (ageGroupIds.length === 0) {
    return [];
  }

  const [{ data: weights, error: weightError }, { data: yearRules, error: yearRuleError }] = await Promise.all([
    supabase
      .from("competition_weight_categories")
      .select("id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order, is_active")
      .in("age_group_id", ageGroupIds)
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("athlete_year_generation_rules")
      .select("id, age_group_id, label, min_age, max_age, display_order, is_active")
      .in("age_group_id", ageGroupIds)
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
  ]);

  if (weightError) {
    throw new Error(`Unable to load weight categories: ${weightError.message}`);
  }

  if (yearRuleError) {
    throw new Error(`Unable to load year generation rules: ${yearRuleError.message}`);
  }

  const weightsByAgeGroup = groupByAgeGroup((weights as WeightRow[]).map(toWeightCategory));
  const rulesByAgeGroup = groupByAgeGroup((yearRules as YearRuleRow[]).map(toYearRule));

  return ageGroupRows.map((group) => ({
    id: group.id,
    code: group.code,
    name: group.name,
    categoryType: group.category_type,
    minAge: group.min_age,
    maxAge: group.max_age,
    displayOrder: group.display_order,
    isActive: group.is_active,
    weights: weightsByAgeGroup.get(group.id) ?? [],
    yearRules: rulesByAgeGroup.get(group.id) ?? []
  }));
}

function toWeightCategory(row: WeightRow): WeightCategory & { ageGroupId: string } {
  return {
    ageGroupId: row.age_group_id,
    id: row.id,
    gender: row.gender,
    label: row.label,
    maxWeightKg: row.max_weight_kg,
    isOpenEnded: row.is_open_ended,
    displayOrder: row.display_order,
    isActive: row.is_active
  };
}

function toYearRule(row: YearRuleRow): YearGenerationRule & { ageGroupId: string } {
  return {
    ageGroupId: row.age_group_id,
    id: row.id,
    label: row.label,
    minAge: row.min_age,
    maxAge: row.max_age,
    displayOrder: row.display_order,
    isActive: row.is_active
  };
}

function groupByAgeGroup<T extends { ageGroupId: string }>(items: T[]) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const existing = grouped.get(item.ageGroupId) ?? [];
    existing.push(item);
    grouped.set(item.ageGroupId, existing);
  }

  return grouped;
}
