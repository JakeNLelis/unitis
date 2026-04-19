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

  const campus_id = formData.get("campus_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const acronym = (formData.get("acronym") as string)?.trim() || null;

  if (!campus_id) return { error: "Please select a campus." };
  if (!name) return { error: "Faculty name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("faculties")
    .insert({ campus_id, name, acronym });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Duplicate faculty name or acronym within the selected campus.",
      };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function updateFacultyName(
  facultyId: string,
  name: string,
  acronym: string | null,
): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const nextName = name?.trim();
  const nextAcronym = acronym?.trim() || null;
  if (!facultyId) return { error: "Faculty ID is required." };
  if (!nextName) return { error: "Faculty name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("faculties")
    .update({ name: nextName, acronym: nextAcronym })
    .eq("faculty_id", facultyId);

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Duplicate faculty name within the selected campus.",
      };
    }
    return { error: error.message };
  }

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

export async function updateDepartmentName(
  departmentId: string,
  name: string,
  acronym: string | null,
): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const nextName = name?.trim();
  const nextAcronym = acronym?.trim() || null;
  if (!departmentId) return { error: "Department ID is required." };
  if (!nextName) return { error: "Department name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("departments")
    .update({ name: nextName, acronym: nextAcronym })
    .eq("department_id", departmentId);

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

export async function updateCourseName(
  courseId: string,
  name: string,
  acronym: string | null,
): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const nextName = name?.trim();
  const nextAcronym = acronym?.trim() || null;
  if (!courseId) return { error: "Course ID is required." };
  if (!nextName) return { error: "Course name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("courses")
    .update({ name: nextName, acronym: nextAcronym })
    .eq("course_id", courseId);

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

// ── Campuses ──

export async function createCampus(formData: FormData): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const name = (formData.get("name") as string)?.trim();

  if (!name) return { error: "Campus name is required." };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("campuses").insert({ name });

  if (error) {
    if (error.code === "23505") {
      return { error: `Campus \"${name}\" already exists.` };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function updateCampusName(
  campusId: string,
  name: string,
): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const nextName = name?.trim();
  if (!campusId) return { error: "Campus ID is required." };
  if (!nextName) return { error: "Campus name is required." };

  const supabase = await createAdminClient();

  const { data: campus, error: campusLookupError } = await supabase
    .from("campuses")
    .select("name")
    .eq("campus_id", campusId)
    .single();

  if (campusLookupError || !campus) {
    return { error: "Campus not found." };
  }

  const previousName = campus.name;

  const { error: updateCampusError } = await supabase
    .from("campuses")
    .update({ name: nextName })
    .eq("campus_id", campusId);

  if (updateCampusError) {
    if (updateCampusError.code === "23505") {
      return { error: `Campus "${nextName}" already exists.` };
    }
    return { error: updateCampusError.message };
  }

  const { error: updateOfficersError } = await supabase
    .from("seb_officers")
    .update({ campus: nextName })
    .eq("campus", previousName);

  if (updateOfficersError) {
    return { error: updateOfficersError.message };
  }

  return { success: true };
}

export async function deleteCampus(campusId: string): Promise<ActionResult> {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();

  const { data: campus, error: campusError } = await supabase
    .from("campuses")
    .select("campus_id, name")
    .eq("campus_id", campusId)
    .single();

  if (campusError || !campus) {
    return { error: "Campus not found." };
  }

  const { count: facultyCount } = await supabase
    .from("faculties")
    .select("faculty_id", { count: "exact", head: true })
    .eq("campus_id", campusId);

  if (facultyCount && facultyCount > 0) {
    return {
      error: `Cannot delete campus \"${campus.name}\" because ${facultyCount} facult${facultyCount === 1 ? "y" : "ies"} still belong to it.`,
    };
  }

  const { count } = await supabase
    .from("seb_officers")
    .select("seb_officer_id", { count: "exact", head: true })
    .eq("campus", campus.name);

  if (count && count > 0) {
    return {
      error: `Cannot delete campus \"${campus.name}\" because ${count} officer${count !== 1 ? "s" : ""} still use${count !== 1 ? "" : "s"} it.`,
    };
  }

  const { error } = await supabase
    .from("campuses")
    .delete()
    .eq("campus_id", campusId);

  if (error) return { error: error.message };
  return { success: true };
}
