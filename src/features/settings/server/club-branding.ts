import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/shared/config/env";

const CLUB_BRANDING_BUCKET = "club-branding";

type ClubBrandingRow = {
  name: string;
  logo_path: string | null;
};

export type ClubBrandingView = {
  clubName: string;
  logoUrl: string | null;
};

export async function getClubBrandingView(clubId: string | null): Promise<ClubBrandingView> {
  if (!clubId || !isSupabaseConfigured()) {
    return {
      clubName: "Judo Drim",
      logoUrl: null
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("name, logo_path")
    .eq("id", clubId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return {
      clubName: "Judo Drim",
      logoUrl: null
    };
  }

  const club = data as ClubBrandingRow;

  return {
    clubName: club.name,
    logoUrl: club.logo_path ? await createClubLogoSignedUrl(club.logo_path) : null
  };
}

export async function updateClubLogoPath(input: {
  clubId: string;
  logoPath: string;
}): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("clubs")
    .update({
      logo_path: input.logoPath,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.clubId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to update club logo: ${error.message}`);
  }
}

async function createClubLogoSignedUrl(logoPath: string) {
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.storage.from(CLUB_BRANDING_BUCKET).createSignedUrl(logoPath, 60 * 60);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
