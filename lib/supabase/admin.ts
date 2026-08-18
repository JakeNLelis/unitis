import { createClient } from "@/lib/supabase/server";

/**
 * Backward-compatible admin client helper.
 * Service-role access is disabled in this project, so this returns the
 * authenticated server client and relies on RLS + role checks.
 */
export async function createAdminClient() {
  return createClient();
}
