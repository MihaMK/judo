import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";
import { isAppRole, type SessionContext } from "../domain/roles";

export async function getSessionContext(): Promise<SessionContext> {
  if (!isSupabaseConfigured()) {
    return {
      userId: null,
      userProfileId: null,
      role: "management",
      clubId: null,
      parentGuardianIds: [],
      displayName: "Основен корисник",
      isAuthenticated: false
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      userProfileId: null,
      role: "management",
      clubId: null,
      parentGuardianIds: [],
      displayName: "Основен корисник",
      isAuthenticated: false
    };
  }

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("id, club_id, role, display_name")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!userProfile || !isAppRole(userProfile.role)) {
    return {
      userId: user.id,
      userProfileId: null,
      role: "parent",
      clubId: null,
      parentGuardianIds: [],
      displayName: user.email ?? "Неповрзан корисник",
      isAuthenticated: true
    };
  }

  const { data: parentProfiles } = await supabase
    .from("parent_profiles")
    .select("guardian_id")
    .eq("user_profile_id", userProfile.id)
    .eq("is_active", true)
    .is("deleted_at", null);

  return {
    userId: user.id,
    userProfileId: userProfile.id,
    role: userProfile.role,
    clubId: userProfile.club_id,
    parentGuardianIds: parentProfiles?.map((profile) => profile.guardian_id) ?? [],
    displayName: userProfile.display_name ?? user.email ?? "Корисник",
    isAuthenticated: true
  };
}
