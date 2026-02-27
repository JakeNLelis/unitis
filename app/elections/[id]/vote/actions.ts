"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayStr } from "@/lib/utils";

interface BallotSubmission {
  electionId: string;
  studentId: string;
  /** Map of positionId → array of selected candidateIds */
  selections: Record<string, string[]>;
}

export async function submitBallot(data: BallotSubmission) {
  const { electionId, studentId, selections } = data;

  if (!studentId?.trim()) {
    return { error: "Student ID is required." };
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to vote." };
  }

  const adminSupabase = await createAdminClient();

  // Fetch election and validate voting period
  const { data: election, error: electionError } = await adminSupabase
    .from("elections")
    .select("election_id, name, start_date, end_date, is_archived")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    return { error: "Election not found." };
  }

  if (election.is_archived) {
    return { error: "This election has been archived." };
  }

  // Use string-based date comparison to avoid UTC timezone mismatch
  const today = getTodayStr();
  const start = election.start_date.slice(0, 10);
  const end = election.end_date.slice(0, 10);

  if (today < start || today > end) {
    return { error: "Voting is not currently open for this election." };
  }

  const userEmail = user.email;
  if (!userEmail) {
    return { error: "Could not determine your email address." };
  }

  const trimmedId = studentId.trim();

  // Check if a voter masterlist exists for this election
  const { count: masterlistCount } = await adminSupabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId);

  let voterId: string;

  if (masterlistCount && masterlistCount > 0) {
    // Masterlist exists — the student must be in it
    const { data: masterlistVoter } = await adminSupabase
      .from("voters")
      .select("voter_id, is_voted")
      .eq("election_id", electionId)
      .eq("student_id", trimmedId)
      .single();

    if (!masterlistVoter) {
      return {
        error:
          "Your student ID is not in the voter masterlist for this election.",
      };
    }

    if (masterlistVoter.is_voted) {
      return { error: "This student ID has already voted in this election." };
    }

    // Update the email on the voter record
    await adminSupabase
      .from("voters")
      .update({ email: userEmail })
      .eq("voter_id", masterlistVoter.voter_id);

    voterId = masterlistVoter.voter_id;
  } else {
    // No masterlist — auto-register voter (open election)
    const { data: existingVoter } = await adminSupabase
      .from("voters")
      .select("voter_id, is_voted")
      .eq("election_id", electionId)
      .eq("student_id", trimmedId)
      .single();

    if (existingVoter) {
      if (existingVoter.is_voted) {
        return {
          error: "This student ID has already voted in this election.",
        };
      }
      voterId = existingVoter.voter_id;
    } else {
      const { data: newVoter, error: voterError } = await adminSupabase
        .from("voters")
        .insert({
          election_id: electionId,
          student_id: trimmedId,
          email: userEmail,
          is_voted: false,
        })
        .select("voter_id")
        .single();

      if (voterError || !newVoter) {
        return { error: "Failed to register voter. Please try again." };
      }
      voterId = newVoter.voter_id;
    }
  }

  // Fetch positions with max_votes for validation
  const { data: positions } = await adminSupabase
    .from("positions")
    .select("position_id, title, max_votes")
    .eq("election_id", electionId);

  if (!positions || positions.length === 0) {
    return { error: "No positions found for this election." };
  }

  // Validate selections
  const allCandidateIds: string[] = [];

  // Collect all selected candidate IDs first
  for (const position of positions) {
    const selected = selections[position.position_id] || [];

    if (selected.length > position.max_votes) {
      return {
        error: `You selected ${selected.length} candidates for "${position.title}" but the maximum is ${position.max_votes}.`,
      };
    }

    allCandidateIds.push(...selected);
  }

  if (allCandidateIds.length === 0) {
    return { error: "You must select at least one candidate." };
  }

  // Fetch all selected candidates in a single query instead of N+1
  const { data: validCandidates } = await adminSupabase
    .from("candidates")
    .select("candidate_id, position_id, application_status")
    .in("candidate_id", allCandidateIds);

  if (!validCandidates || validCandidates.length !== allCandidateIds.length) {
    return { error: "Invalid candidate selection." };
  }

  // Validate each candidate belongs to the correct position and is approved
  const candidateMap = new Map(validCandidates.map((c) => [c.candidate_id, c]));

  for (const position of positions) {
    const selected = selections[position.position_id] || [];
    for (const candidateId of selected) {
      const candidate = candidateMap.get(candidateId);
      if (!candidate) {
        return { error: "Invalid candidate selection." };
      }
      if (candidate.position_id !== position.position_id) {
        return { error: "Candidate does not belong to the selected position." };
      }
      if (candidate.application_status !== "approved") {
        return { error: "You can only vote for approved candidates." };
      }
    }
  }

  // Create vote record
  const { data: vote, error: voteError } = await adminSupabase
    .from("votes")
    .insert({
      voter_id: voterId,
    })
    .select("vote_id")
    .single();

  if (voteError || !vote) {
    return { error: "Failed to record vote. Please try again." };
  }

  // Insert vote selections
  const voteSelections = allCandidateIds.map((candidateId) => ({
    vote_id: vote.vote_id,
    candidate_id: candidateId,
  }));

  const { error: selectionsError } = await adminSupabase
    .from("vote_selections")
    .insert(voteSelections);

  if (selectionsError) {
    // Rollback: delete the vote record
    await adminSupabase.from("votes").delete().eq("vote_id", vote.vote_id);
    return { error: "Failed to record selections. Please try again." };
  }

  // Mark voter as voted
  const { error: updateError } = await adminSupabase
    .from("voters")
    .update({ is_voted: true })
    .eq("voter_id", voterId);

  if (updateError) {
    // This shouldn't fail but log it
    console.error("Failed to update voter status:", updateError);
  }

  return { success: true };
}

/**
 * Fetch vote counts per candidate per position for an election.
 * Structured so a future realtime/websocket layer can provide the same shape.
 */
export async function getElectionResults(electionId: string) {
  const adminSupabase = await createAdminClient();

  // Fetch positions
  const { data: positions } = await adminSupabase
    .from("positions")
    .select("position_id, title, max_votes")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  if (!positions) {
    return { error: "Could not fetch positions." };
  }

  // Fetch approved candidates with vote counts
  const { data: candidates } = await adminSupabase
    .from("candidates")
    .select("candidate_id, position_id, full_name, partylists(name, acronym)")
    .eq("election_id", electionId)
    .eq("application_status", "approved");

  if (!candidates) {
    return { error: "Could not fetch candidates." };
  }

  // Count votes per candidate
  const { data: voteCounts } = await adminSupabase
    .from("vote_selections")
    .select("candidate_id, votes!inner(voter_id, voters!inner(election_id))")
    .eq("votes.voters.election_id", electionId);

  // Build a count map
  const countMap: Record<string, number> = {};
  if (voteCounts) {
    for (const vc of voteCounts) {
      countMap[vc.candidate_id] = (countMap[vc.candidate_id] || 0) + 1;
    }
  }

  // Total voters who voted
  const { count: totalVoters } = await adminSupabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId)
    .eq("is_voted", true);

  // Structure results by position
  const results = positions.map((position) => {
    const positionCandidates = candidates
      .filter((c) => c.position_id === position.position_id)
      .map((c) => {
        const pl = c.partylists as unknown as {
          name: string;
          acronym: string;
        } | null;
        return {
          candidate_id: c.candidate_id,
          full_name: c.full_name,
          partylist: pl,
          vote_count: countMap[c.candidate_id] || 0,
        };
      })
      .sort((a, b) => b.vote_count - a.vote_count);

    return {
      position_id: position.position_id,
      title: position.title,
      max_votes: position.max_votes,
      candidates: positionCandidates,
    };
  });

  return {
    results,
    totalVoters: totalVoters || 0,
  };
}
