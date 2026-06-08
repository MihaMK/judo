import { createServerSupabaseClient } from "@/services/supabase/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { isSupabaseConfigured } from "@/shared/config/env";
import { isAppRole, type SessionContext } from "../domain/roles";

type ClubBrandingRow = {
  name: string;
  logo_path: string | null;
};

export async function getSessionContext(): Promise<SessionContext> {
  if (!isSupabaseConfigured()) {
    return {
      userId: null,
      userProfileId: null,
      role: "management",
      clubId: null,
      clubName: null,
      clubLogoUrl: null,
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
      clubName: null,
      clubLogoUrl: null,
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
      clubName: null,
      clubLogoUrl: null,
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

  const clubBranding = await loadClubBranding(supabase, userProfile.club_id);

  return {
    userId: user.id,
    userProfileId: userProfile.id,
    role: userProfile.role,
    clubId: userProfile.club_id,
    clubName: clubBranding.name,
    clubLogoUrl: clubBranding.logoUrl,
    parentGuardianIds: parentProfiles?.map((profile) => profile.guardian_id) ?? [],
    displayName: userProfile.display_name ?? user.email ?? "Корисник",
    isAuthenticated: true
  };
}

async function loadClubBranding(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  clubId: string
) {
  const { data, error } = await supabase
    .from("clubs")
    .select("name, logo_path")
    .eq("id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return { name: "Judo Drim", logoUrl: null };
  }

  const club = data as ClubBrandingRow;

  return {
    name: club.name,
    logoUrl: club.logo_path ? await createClubLogoSignedUrl(club.logo_path) : null
  };
}

async function createClubLogoSignedUrl(logoPath: string) {
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.storage.from("club-branding").createSignedUrl(logoPath, 60 * 60);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
