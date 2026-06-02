"use server";

import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { getServerEnv, isServiceRoleConfigured, isSupabaseConfigured } from "@/shared/config/env";
import { mk } from "@/shared/i18n/mk";

export type LoginState = {
  message?: string;
};

export async function signInWithPassword(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { message: mk.auth.missingConfig };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: mk.auth.emailPasswordRequired };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { message: error.message };
  }

  redirect("/today");
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function bootstrapManagementProfile() {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return {
      ok: false,
      message: mk.auth.missingConfig
    };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      ok: false,
      message: userError.message
    };
  }

  if (!user?.email) {
    return {
      ok: false,
      message: mk.auth.loginRequired
    };
  }

  const serverEnv = getServerEnv();
  const normalizedEmail = user.email.toLowerCase();

  if (!serverEnv.bootstrapAllowedEmails.includes(normalizedEmail)) {
    return {
      ok: false,
      message: `${mk.auth.emailNotAllowlisted} (${normalizedEmail})`
    };
  }

  const admin = createAdminSupabaseClient();

  const { data: existingProfile, error: existingProfileError } = await admin
    .from("user_profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingProfileError) {
    return {
      ok: false,
      message: existingProfileError.message
    };
  }

  if (existingProfile) {
    redirect("/today");
  }

  const insertPayload = {
    auth_user_id: user.id,
    club_id: serverEnv.bootstrapClubId,
    role: "management",
    display_name: user.email,
    is_active: true
  };

  const { data: insertedProfile, error: insertError } = await admin
    .from("user_profiles")
    .insert(insertPayload)
    .select("id, auth_user_id, club_id, role")
    .single();

  if (insertError) {
    return {
      ok: false,
      message: insertError.message
    };
  }

  if (!insertedProfile) {
    return {
      ok: false,
      message: mk.auth.insertMissing
    };
  }

  redirect("/today");
}
