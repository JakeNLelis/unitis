"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BallotSubmission } from "@/lib/types/public";
import {
  ensureVotingVoterRecord,
  getApprovedVotingCandidates,
  getVotingElection,
  getVotingMasterlistVoter,
  getVotingPositions,
  getVotingUser,
  isVotingWindowOpen,
  submitBallotRecord,
  updateVotingVoterEmail,
  validateVotingSelections,
} from "@/app/_helpers/elections/vote-actions";

// @CodeScene(disable:"Complex Method")
export async function submitBallot(data: BallotSubmission) {
  const { electionId, studentId, selections } = data;

  if (!studentId?.trim()) {
    return { error: "Student ID is required." };
  }

  const votingUser = await getVotingUser();
  if ("error" in votingUser) {
    return votingUser;
  }

  const electionResult = await getVotingElection(electionId);
  if ("error" in electionResult) {
    return electionResult;
  }

  if (!isVotingWindowOpen(electionResult.election)) {
    return { error: "Voting is not currently open for this election." };
  }

  const trimmedId = studentId.trim();
  const masterlistResult = await getVotingMasterlistVoter(
    electionId,
    trimmedId,
  );
  let voterId: string;

  if ("error" in masterlistResult) {
    const voterResult = await ensureVotingVoterRecord(
      electionId,
      trimmedId,
      votingUser.email,
    );

    if ("error" in voterResult) {
      return voterResult;
    }

    voterId = voterResult.voterId;
  } else {
    voterId = masterlistResult.voter.voter_id;
    await updateVotingVoterEmail(voterId, votingUser.email);
  }

  const positions = await getVotingPositions(electionId);
  if (positions.length === 0) {
    return { error: "No positions found for this election." };
  }

  const validCandidates = await getApprovedVotingCandidates(electionId);
  const candidateMap = new Map(
    validCandidates.map((candidate) => [candidate.candidate_id, candidate]),
  );
  const selectionCheck = validateVotingSelections(
    positions,
    selections,
    candidateMap,
  );
  if ("error" in selectionCheck) {
    return selectionCheck;
  }

  return submitBallotRecord(voterId, selectionCheck.selectedCandidateIds);
}

/**
 * Fetch vote counts per candidate per position for an election.
 * Structured so a future realtime/websocket layer can provide the same shape.
 */
// @CodeScene(disable:"Complex Method","Large Method")
export async function getElectionResults(electionId: string) {
  const adminSupabase = await createAdminClient();

  type PositionRow = {
    position_id: string;
    title: string;
    max_votes: number;
  };

  type CandidateRow = {
    candidate_id: string;
    position_id: string;
    full_name: string;
    partylists: Array<{ name: string; acronym: string }> | null;
  };

  type VoteCountRow = {
    candidate_id: string;
  };

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
    for (const vc of voteCounts as VoteCountRow[]) {
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
  const results = (positions as PositionRow[]).map((position) => {
    const positionCandidates = (candidates as CandidateRow[])
      .filter(
        (candidate: CandidateRow) =>
          candidate.position_id === position.position_id,
      )
      .map((candidate: CandidateRow) => {
        const partylist = candidate.partylists?.[0] ?? null;

        return {
          candidate_id: candidate.candidate_id,
          full_name: candidate.full_name,
          partylist,
          vote_count: countMap[candidate.candidate_id] || 0,
        };
      })
      .sort(
        (a: { vote_count: number }, b: { vote_count: number }) =>
          b.vote_count - a.vote_count,
      );

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
