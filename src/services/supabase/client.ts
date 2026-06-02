"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/shared/config/env";

export function createClientSupabaseClient() {
  const env = getPublicEnv();

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
