"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/features/auth/server/session";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

type ActionState = {
  message?: string;
  ok?: boolean;
};

export async function createAgeGroupAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const access = await assertManagementAccess();
  if (!access.ok) return { message: access.message, ok: false };

  const name = text(formData, "name");

  if (!name) {
    return { message: "Името е задолжително.", ok: false };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("age_groups").insert({
    name,
    min_age: numberOrNull(formData, "minAge"),
    max_age: numberOrNull(formData, "maxAge"),
    display_order: numberOrNull(formData, "displayOrder") ?? 100,
    is_active: true
  });

  if (error) return { message: error.message, ok: false };
  revalidatePath("/management/categories");
  return { ok: true, message: "Возрасната категорија е додадена." };
}

export async function updateAgeGroupAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const id = text(formData, "id");
  const name = text(formData, "name");

  if (!id || !name) return;

  const admin = createAdminSupabaseClient();
  await admin
    .from("age_groups")
    .update({
      name,
      min_age: numberOrNull(formData, "minAge"),
      max_age: numberOrNull(formData, "maxAge"),
      display_order: numberOrNull(formData, "displayOrder") ?? 100,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .is("deleted_at", null);

  revalidatePath("/management/categories");
}

export async function toggleAgeGroupAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const admin = createAdminSupabaseClient();
  await admin
    .from("age_groups")
    .update({ is_active: text(formData, "isActive") !== "true", updated_at: new Date().toISOString() })
    .eq("id", text(formData, "id"))
    .is("deleted_at", null);

  revalidatePath("/management/categories");
}

export async function createWeightCategoryAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const access = await assertManagementAccess();
  if (!access.ok) return { message: access.message, ok: false };

  const ageGroupId = text(formData, "ageGroupId");
  const name = text(formData, "name");
  const gender = text(formData, "gender");

  if (!ageGroupId || !name || !["M", "Ж"].includes(gender)) {
    return { message: "Категорија, пол и назив се задолжителни.", ok: false };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("weight_categories").insert({
    age_group_id: ageGroupId,
    gender,
    name,
    min_weight: numberOrNull(formData, "minWeight"),
    max_weight: numberOrNull(formData, "maxWeight"),
    display_order: numberOrNull(formData, "displayOrder") ?? 100,
    is_active: true
  });

  if (error) return { message: error.message, ok: false };
  revalidatePath("/management/categories");
  return { ok: true, message: "Тежинската категорија е додадена." };
}

export async function updateWeightCategoryAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const id = text(formData, "id");
  const name = text(formData, "name");
  const gender = text(formData, "gender");

  if (!id || !name || !["M", "Ж"].includes(gender)) {
    return;
  }

  const admin = createAdminSupabaseClient();
  await admin
    .from("weight_categories")
    .update({
      gender,
      name,
      min_weight: numberOrNull(formData, "minWeight"),
      max_weight: numberOrNull(formData, "maxWeight"),
      display_order: numberOrNull(formData, "displayOrder") ?? 100,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .is("deleted_at", null);

  revalidatePath("/management/categories");
}

export async function toggleWeightCategoryAction(formData: FormData) {
  const access = await assertManagementAccess();
  if (!access.ok) return;

  const admin = createAdminSupabaseClient();
  await admin
    .from("weight_categories")
    .update({ is_active: text(formData, "isActive") !== "true", updated_at: new Date().toISOString() })
    .eq("id", text(formData, "id"))
    .is("deleted_at", null);

  revalidatePath("/management/categories");
}

async function assertManagementAccess(): Promise<{ ok: true } | { ok: false; message: string }> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.userProfileId || !sessionContext.clubId) {
    return { ok: false, message: "Потребна е најава." };
  }

  if (sessionContext.role !== "management") {
    return { ok: false, message: "Само управата може да уредува категории." };
  }

  return { ok: true };
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
