"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, getSystemAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createSEBOfficer(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "system-admin") {
    return { error: "Unauthorized" };
  }

  const systemAdmin = await getSystemAdmin();
  if (!systemAdmin) {
    return { error: "System admin not found" };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Missing required fields" };
  }

  const supabase = await createAdminClient();

  // Create user in auth.users using admin API
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user" };
  }

  // Create SEB officer record
  const { error: officerError } = await supabase.from("seb_officers").insert({
    user_id: authData.user.id,
    system_admin_id: systemAdmin.system_admin_id,
    name,
    email,
  });

  if (officerError) {
    // Rollback: delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { error: officerError.message };
  }

  redirect("/admin/officers");
}
