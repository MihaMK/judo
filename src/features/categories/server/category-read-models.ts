import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/shared/config/env";
import type { AgeCategoryGroup, BeltRank, CategoryGender, WeightCategory } from "../domain/category";

type AgeGroupRow = {
  id: string;
  name: string;
  min_age: number | null;
  max_age: number | null;
  display_order: number;
  is_active: boolean;
};

type WeightRow = {
  id: string;
  age_group_id: string;
  gender: CategoryGender;
  name: string;
  min_weight: number | string | null;
  max_weight: number | string | null;
  display_order: number;
  is_active: boolean;
};

type BeltRankRow = {
  id: string;
  name: string;
  kyu_dan_value: number;
  rank_order: number;
  is_active?: boolean;
};

export async function getCategoryManagementView(clubId: string | null): Promise<AgeCategoryGroup[]> {
  void clubId;

  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return [];
  }

  const admin = createAdminSupabaseClient();
  const { data: ageGroups, error: ageGroupError } = await admin
    .from("age_groups")
    .select("id, name, min_age, max_age, display_order, is_active")
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (ageGroupError) {
    if (isSemanticCategorySchemaMissingError(ageGroupError)) {
      return [];
    }

    throw new Error(`Unable to load semantic age groups: ${ageGroupError.message}`);
  }

  const ageGroupRows = ageGroups as AgeGroupRow[];
  const ageGroupIds = ageGroupRows.map((group) => group.id);

  if (ageGroupIds.length === 0) {
    return [];
  }

  const { data: weights, error: weightError } = await admin
    .from("weight_categories")
    .select("id, age_group_id, gender, name, min_weight, max_weight, display_order, is_active")
    .in("age_group_id", ageGroupIds)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (weightError) {
    if (isSemanticCategorySchemaMissingError(weightError)) {
      return ageGroupRows.map((group) => toAgeGroup(group, []));
    }

    throw new Error(`Unable to load semantic weight categories: ${weightError.message}`);
  }

  const weightsByAgeGroup = groupByAgeGroup((weights as WeightRow[]).map(toWeightCategory));

  return ageGroupRows.map((group) => toAgeGroup(group, weightsByAgeGroup.get(group.id) ?? []));
}

export async function getBeltRanksView(): Promise<BeltRank[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const client = isServiceRoleConfigured() ? createAdminSupabaseClient() : await createServerSupabaseClient();
  const { data, error } = await client
    .from("belt_ranks")
    .select("id, name, kyu_dan_value, rank_order")
    .order("rank_order", { ascending: true });

  if (error) {
    if (isSemanticCategorySchemaMissingError(error)) {
      return [];
    }

    throw new Error(`Unable to load belt ranks: ${error.message}`);
  }

  return (data as BeltRankRow[]).map((rank) => ({
    id: rank.id,
    name: rank.name,
    kyuDanValue: rank.kyu_dan_value,
    rankOrder: rank.rank_order,
    isActive: rank.is_active ?? true
  }));
}
function toAgeGroup(row: AgeGroupRow, weights: WeightCategory[]): AgeCategoryGroup {
  return {
    id: row.id,
    name: row.name,
    minAge: row.min_age,
    maxAge: row.max_age,
    displayOrder: row.display_order,
    isActive: row.is_active,
    weights
  };
}

function toWeightCategory(row: WeightRow): WeightCategory {
  return {
    id: row.id,
    ageGroupId: row.age_group_id,
    gender: row.gender,
    name: row.name,
    minWeight: row.min_weight === null ? null : Number(row.min_weight),
    maxWeight: row.max_weight === null ? null : Number(row.max_weight),
    displayOrder: row.display_order,
    isActive: row.is_active
  };
}

function groupByAgeGroup(items: WeightCategory[]) {
  const grouped = new Map<string, WeightCategory[]>();

  for (const item of items) {
    const existing = grouped.get(item.ageGroupId) ?? [];
    existing.push(item);
    grouped.set(item.ageGroupId, existing);
  }

  return grouped;
}

export function isSemanticCategorySchemaMissingError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as { code?: string; message?: string };
  return (
    possibleError.code === "PGRST205" ||
    (typeof possibleError.message === "string" &&
      ["age_groups", "weight_categories", "belt_ranks", "belt_rank_id"].some((name) => possibleError.message?.includes(name)))
  );
}
