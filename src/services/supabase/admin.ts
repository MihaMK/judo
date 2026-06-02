import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServerEnv, isServiceRoleConfigured, isSupabaseConfigured } from "@/shared/config/env";

export function createAdminSupabaseClient() {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    throw new Error("Supabase admin клиентот не е конфигуриран.");
  }

  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();

  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
