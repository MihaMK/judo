"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { getSessionContext } from "@/features/auth/server/session";

type ActionState = {
  message?: string;
  ok?: boolean;
};

export async function createAgeGroupAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const access = await assertManagementAccess();
  if (!access.ok) return { message: access.message };

  const name = text(formData, "name");
  const code = text(formData, "code") || slugify(name);
  const categoryType = text(formData, "categoryType") || "general";

  if (!name || !code) return { message: "Име и код се задолжителни." };

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("competition_age_groups").insert({
    club_id: access.clubId,
    name,
    code,
    category_type: categoryType,
    min_age: numberOrNull(formData, "minAge"),
    max_age: numberOrNull(formData, "maxAge"),
    display_order: numberOrNull(formData, "displayOrder") ?? 100,
    is_active: true
  });

  if (error) return { message: error.message };
  revalidatePath("/management/categories");
  return { ok: true, message: "Возрасната категорија е додадена." };
}

export async function updateAgeGroupAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const id = text(formData, "id");
  const name = text(formData, "name");
  const code = text(formData, "code");
  const categoryType = text(formData, "categoryType") || "general";

  if (!id || !name || !code) return;

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("competition_age_groups")
    .update({
      name,
      code,
      category_type: categoryType,
      min_age: numberOrNull(formData, "minAge"),
      max_age: numberOrNull(formData, "maxAge"),
      display_order: numberOrNull(formData, "displayOrder") ?? 100,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("club_id", access.clubId);

  if (error) return;
  revalidatePath("/management/categories");
}

export async function toggleAgeGroupAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const admin = createAdminSupabaseClient();
  await admin
    .from("competition_age_groups")
    .update({ is_active: text(formData, "isActive") !== "true", updated_at: new Date().toISOString() })
    .eq("id", text(formData, "id"))
    .eq("club_id", access.clubId);

  revalidatePath("/management/categories");
}

export async function createWeightCategoryAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const access = await assertManagementAccess();
  if (!access.ok) return { message: access.message };

  const ageGroupId = text(formData, "ageGroupId");
  const label = text(formData, "label");
  const gender = text(formData, "gender");

  if (!ageGroupId || !label || !["M", "F"].includes(gender)) {
    return { message: "Категорија, пол и ознака се задолжителни." };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("competition_weight_categories").insert({
    club_id: access.clubId,
    age_group_id: ageGroupId,
    gender,
    label,
    max_weight_kg: numberOrNull(formData, "maxWeightKg"),
    is_open_ended: text(formData, "isOpenEnded") === "on",
    display_order: numberOrNull(formData, "displayOrder") ?? 100,
    is_active: true
  });

  if (error) return { message: error.message };
  revalidatePath("/management/categories");
  return { ok: true, message: "Тежинската категорија е додадена." };
}

export async function updateWeightCategoryAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const id = text(formData, "id");
  const label = text(formData, "label");
  const gender = text(formData, "gender");

  if (!id || !label || !["M", "F"].includes(gender)) {
    return;
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("competition_weight_categories")
    .update({
      gender,
      label,
      max_weight_kg: numberOrNull(formData, "maxWeightKg"),
      is_open_ended: text(formData, "isOpenEnded") === "on",
      display_order: numberOrNull(formData, "displayOrder") ?? 100,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("club_id", access.clubId);

  if (error) return;
  revalidatePath("/management/categories");
}

export async function toggleWeightCategoryAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const admin = createAdminSupabaseClient();
  await admin
    .from("competition_weight_categories")
    .update({ is_active: text(formData, "isActive") !== "true", updated_at: new Date().toISOString() })
    .eq("id", text(formData, "id"))
    .eq("club_id", access.clubId);

  revalidatePath("/management/categories");
}

async function assertManagementAccess(): Promise<{ ok: true; clubId: string } | { ok: false; message: string }> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { ok: false, message: "Потребна е најава." };
  }

  if (sessionContext.role !== "management") {
    return { ok: false, message: "Само управата може да уредува категории." };
  }

  return { ok: true, clubId: sessionContext.clubId };
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberOrNull(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9а-шѓќљњџчјжѕ-]+/g, "");
}
