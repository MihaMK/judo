type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type ServerEnv = {
  supabaseServiceRoleKey: string;
  bootstrapAllowedEmails: string[];
  bootstrapClubId: string;
};

export function getPublicEnv(): PublicEnv {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  };
}

export function isSupabaseConfigured() {
  const env = getPublicEnv();

  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function getServerEnv(): ServerEnv {
  return {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    bootstrapAllowedEmails: parseEmailList(process.env.JUDO_BOOTSTRAP_ALLOWED_EMAILS),
    bootstrapClubId: process.env.JUDO_BOOTSTRAP_CLUB_ID ?? "11111111-1111-4111-8111-111111111111"
  };
}

export function isServiceRoleConfigured() {
  return Boolean(getServerEnv().supabaseServiceRoleKey);
}

function parseEmailList(value: string | undefined) {
  return (
    value
      ?.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}
