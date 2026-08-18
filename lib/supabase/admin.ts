/**
 * Service-role access is intentionally disabled for this project.
 * All database access must go through the authenticated app client and
 * row-level security policies instead of the service-role key.
 */
export async function createAdminClient() {
  throw new Error(
    "Service-role client is disabled in this project. Use the authenticated Supabase client and RLS instead.",
  );
}
