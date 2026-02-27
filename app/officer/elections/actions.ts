"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSEBOfficer } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createElection(formData: FormData) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const election_type = formData.get("election_type") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const candidacy_start_date =
    (formData.get("candidacy_start_date") as string) || null;
  const candidacy_end_date =
    (formData.get("candidacy_end_date") as string) || null;

  if (!name || !election_type || !start_date || !end_date) {
    return { error: "Missing required fields" };
  }

  // Validate dates
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (endDate <= startDate) {
    return { error: "End date must be after start date" };
  }

  if (candidacy_end_date && candidacy_start_date) {
    const candStart = new Date(candidacy_start_date);
    const candEnd = new Date(candidacy_end_date);

    if (candEnd >= startDate) {
      return {
        error: "Candidacy filing deadline must be before election start date",
      };
    }

    if (candStart >= candEnd) {
      return {
        error: "Candidacy start date must be before candidacy end date",
      };
    }
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("elections")
    .insert({
      name,
      election_type,
      start_date,
      end_date,
      candidacy_start_date: candidacy_start_date || null,
      candidacy_end_date: candidacy_end_date || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Assign this election to the officer
  await supabase
    .from("seb_officers")
    .update({ election_id: data.election_id })
    .eq("seb_officer_id", officer.seb_officer_id);

  redirect(`/officer/elections/${data.election_id}`);
}

export async function createPosition(formData: FormData) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const election_id = formData.get("election_id") as string;
  const title = formData.get("title") as string;
  const max_votes = parseInt(formData.get("max_votes") as string) || 1;

  if (!election_id || !title) {
    return { error: "Missing required fields" };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { error } = await supabase.from("positions").insert({
    election_id,
    title,
    max_votes,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/officer/elections/${election_id}`);
}

export async function updateCandidateStatus(
  candidateId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return { error: "A rejection reason is required." };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const updateData: Record<string, unknown> = {
    application_status: status,
  };
  if (status === "rejected") {
    updateData.rejection_reason = rejectionReason!.trim();
  } else {
    updateData.rejection_reason = null;
  }

  const { error } = await supabase
    .from("candidates")
    .update(updateData)
    .eq("candidate_id", candidateId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePosition(
  positionId: string,
  electionId: string,
  title: string,
  maxVotes: number,
) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  if (!title.trim()) {
    return { error: "Position title is required" };
  }

  if (maxVotes < 1) {
    return { error: "Max votes must be at least 1" };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("positions")
    .update({ title: title.trim(), max_votes: maxVotes })
    .eq("position_id", positionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deletePosition(positionId: string) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("position_id", positionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
