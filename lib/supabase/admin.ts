import { createClient } from "@/lib/supabase/server";

/**
 * This project is intentionally using the authenticated server client instead of a
 * service-role client. Keeping this helper returning the authenticated client
 * preserves the existing admin code paths while avoiding the TypeScript void error.
 */
export async function createAdminClient() {
  return createClient();
}
