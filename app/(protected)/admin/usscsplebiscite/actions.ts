"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrChairperson } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/logging";

export type UsscPlebisciteStudentRow = {
  faculty_assigned: string;
  student_id: string;
  google_form_url: string;
  email_address?: string;
  alt_email_google_form_url?: string;
};

function normalizeUsscPlebisciteStudentRow(raw: UsscPlebisciteStudentRow) {
  const studentId = raw.student_id?.trim().toUpperCase();
  if (!/^\d{2}-\d-\d{5}$/.test(studentId ?? "")) {
    throw new Error(
      `Student ID must match the format XX-X-XXXXX (received: ${raw.student_id ?? ""}).`,
    );
  }

  return {
    faculty_assigned: raw.faculty_assigned.trim().toUpperCase(),
    student_id: studentId,
    google_form_url: raw.google_form_url.trim(),
    email_address: (raw.email_address ?? "").trim(),
    alt_email_google_form_url: (raw.alt_email_google_form_url ?? "").trim(),
  };
}

export async function insertSingleUsscPlebisciteStudent(
  row: UsscPlebisciteStudentRow,
) {
  await requireAdminOrChairperson();

  const supabase = await createClient();
  const normalized = normalizeUsscPlebisciteStudentRow(row);

  const { data, error } = await supabase
    .from("usscplebiscite2026")
    .upsert(normalized, { onConflict: "student_id" })
    .select();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function bulkInsertUsscPlebisciteStudents(
  rows: UsscPlebisciteStudentRow[],
) {
  await requireAdminOrChairperson();

  const supabase = await createClient();

  const normalizedRows = rows.map((row) =>
    normalizeUsscPlebisciteStudentRow(row),
  );

  const { data, error } = await supabase
    .from("usscplebiscite2026")
    .upsert(normalizedRows, { onConflict: "student_id" })
    .select();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data, inserted: normalizedRows.length };
}

export async function createUsscPlebisciteRosterEntry(formData: FormData) {
  await requireAdminOrChairperson();

  const facultyAssigned = (
    formData.get("faculty_assigned") as string | null
  )?.trim();
  const studentId = (formData.get("student_id") as string | null)?.trim();
  const googleFormUrl = (
    formData.get("google_form_url") as string | null
  )?.trim();
  const emailAddress =
    (formData.get("email_address") as string | null)?.trim() ?? "";
  const altEmailGoogleFormUrl =
    (formData.get("alt_email_google_form_url") as string | null)?.trim() ?? "";

  if (!facultyAssigned || !studentId || !googleFormUrl) {
    return { error: "Faculty, student ID, and Google Form URL are required." };
  }

  const result = await insertSingleUsscPlebisciteStudent({
    faculty_assigned: facultyAssigned,
    student_id: studentId,
    google_form_url: googleFormUrl,
    email_address: emailAddress,
    alt_email_google_form_url: altEmailGoogleFormUrl,
  });

  if ("error" in result && result.error) {
    return { error: result.error };
  }

  await logAdminAction(
    "voter.masterlist_added",
    `Added USSC plebiscite roster entry for ${studentId.toUpperCase()} (${facultyAssigned})`,
  );

  revalidatePath("/admin/usscsplebiscite");
  revalidatePath("/admin/usscplebiscite");
  revalidatePath("/usscplebiscite2026");
  return { success: true };
}

export async function deleteUsscPlebisciteRosterEntry(studentId: string) {
  await requireAdminOrChairperson();

  const normalizedStudentId = studentId?.trim().toUpperCase();
  if (!normalizedStudentId) {
    return { error: "Student ID is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("usscplebiscite2026")
    .delete()
    .eq("student_id", normalizedStudentId);

  if (error) {
    return { error: error.message };
  }

  await logAdminAction(
    "voter.removed",
    `Removed USSC plebiscite roster entry for ${normalizedStudentId}`,
  );

  revalidatePath("/admin/usscsplebiscite");
  revalidatePath("/admin/usscplebiscite");
  revalidatePath("/usscplebiscite2026");
  return { success: true };
}
