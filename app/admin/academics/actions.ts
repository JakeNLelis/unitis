"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";

type ActionResult = { error?: string; success?: boolean };

async function requireAdmin(): Promise<ActionResult | null> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "system-admin") {
    return { error: "Unauthorized" };
  }
  return null;
}

// ── Faculties ──

export async function createFaculty(formData: FormData): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const name = (formData.get("name") as string)?.trim();
  const acronym = (formData.get("acronym") as string)?.trim() || null;

  if (!name) return { error: "Faculty name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("faculties").insert({ name, acronym });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteFaculty(facultyId: string): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();

  // Check if faculty has departments
  const { data: deps } = await supabase
    .from("departments")
    .select("department_id")
    .eq("faculty_id", facultyId)
    .limit(1);

  if (deps && deps.length > 0) {
    return {
      error:
        "Cannot delete faculty with existing departments. Remove its departments first.",
    };
  }

  const { error } = await supabase
    .from("faculties")
    .delete()
    .eq("faculty_id", facultyId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Departments ──

export async function createDepartment(
  formData: FormData,
): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const faculty_id = formData.get("faculty_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const acronym = (formData.get("acronym") as string)?.trim() || null;

  if (!faculty_id) return { error: "Please select a faculty." };
  if (!name) return { error: "Department name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("departments")
    .insert({ faculty_id, name, acronym });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteDepartment(
  departmentId: string,
): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();

  // Check if department has courses
  const { data: courses } = await supabase
    .from("courses")
    .select("course_id")
    .eq("department_id", departmentId)
    .limit(1);

  if (courses && courses.length > 0) {
    return {
      error:
        "Cannot delete department with existing courses. Remove its courses first.",
    };
  }

  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("department_id", departmentId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Courses ──

export async function createCourse(formData: FormData): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const department_id = formData.get("department_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const acronym = (formData.get("acronym") as string)?.trim() || null;

  if (!department_id) return { error: "Please select a department." };
  if (!name) return { error: "Course name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("courses")
    .insert({ department_id, name, acronym });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteCourse(courseId: string): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("course_id", courseId);

  if (error) return { error: error.message };
  return { success: true };
}
