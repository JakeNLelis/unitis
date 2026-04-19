"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, getSystemAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
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
  const faculty_code = (formData.get("faculty_code") as string)
    ?.trim()
    .toUpperCase();
  const campus = (formData.get("campus") as string)?.trim();

  if (!email || !password || !faculty_code || !campus) {
    return { error: "Missing required fields" };
  }

  const normalizedFacultyCode = faculty_code.toUpperCase();

  const supabase = await createAdminClient();

  const { data: campusMatch, error: campusLookupError } = await supabase
    .from("campuses")
    .select("campus_id, name")
    .eq("name", campus)
    .limit(1)
    .maybeSingle();

  if (campusLookupError) {
    return { error: campusLookupError.message };
  }

  if (!campusMatch?.name) {
    return {
      error: "Invalid campus. Please select a campus from Academics.",
    };
  }

  const { data: campusScopedFaculty, error: campusScopedFacultyError } =
    await supabase
      .from("faculties")
      .select("acronym")
      .eq("campus_id", campusMatch.campus_id)
      .ilike("acronym", normalizedFacultyCode)
      .limit(1)
      .maybeSingle();

  if (campusScopedFacultyError) {
    return { error: campusScopedFacultyError.message };
  }

  if (!campusScopedFaculty?.acronym) {
    return {
      error: "Selected faculty code is not available in the selected campus.",
    };
  }

  const canonicalFacultyCode = campusScopedFaculty.acronym.trim().toUpperCase();

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
    faculty_code: canonicalFacultyCode,
    campus: campusMatch.name,
    email,
  });

  if (officerError) {
    // Rollback: delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);

    if (
      officerError.code === "23505" &&
      officerError.message.includes("seb_officers_campus_faculty_code_uidx")
    ) {
      return {
        error: `Faculty code "${canonicalFacultyCode}" already exists in ${campusMatch.name}.`,
      };
    }

    return { error: officerError.message };
  }

  redirect("/admin/officers");
}

export async function deleteSEBOfficer(sebOfficerId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "system-admin") {
    return { error: "Unauthorized" };
  }

  if (!sebOfficerId) {
    return { error: "Missing officer ID" };
  }

  const supabase = await createAdminClient();

  const { data: officer, error: officerError } = await supabase
    .from("seb_officers")
    .select("seb_officer_id, user_id")
    .eq("seb_officer_id", sebOfficerId)
    .single();

  if (officerError || !officer) {
    return { error: "SEB officer not found" };
  }

  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
    officer.user_id,
  );

  if (deleteUserError) {
    return { error: deleteUserError.message };
  }

  revalidatePath("/admin/officers");
  return { success: true };
}
