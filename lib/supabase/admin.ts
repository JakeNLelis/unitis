import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with service role key for admin operations.
 * Use this only in server-side code for operations like creating/deleting users.
 * This client bypasses RLS.
 */
export async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
