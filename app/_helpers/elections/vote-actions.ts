import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isDateTimeWindowOpen } from "@/lib/utils";

type VotingUser = {
  email: string;
};

type VotingElection = {
  election_id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
  is_archived: boolean;
};

type VotingVoter = {
  voter_id: string;
  is_voted: boolean;
};

type VotingPosition = {
  position_id: string;
  title: string;
  max_votes: number;
};

type VotingCandidate = {
  candidate_id: string;
  position_id: string;
  full_name: string;
  application_status: string;
};

export async function getVotingUser(): Promise<VotingUser | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const emailRaw = user?.email;
  const email = emailRaw?.toLowerCase();
  if (error || !email || !email.endsWith("@vsu.edu.ph")) {
    return {
      error:
        "Voter identity could not be verified. Please complete voter verification first.",
    };
  }

  return { email } satisfies VotingUser;
}

export async function getVotingElection(electionId: string) {
  const adminSupabase = await createAdminClient();

  const { data: election, error } = await adminSupabase
    .from("elections")
    .select(
      "election_id, name, election_type, start_date, end_date, is_archived",
    )
    .eq("election_id", electionId)
    .single();

  if (error || !election) {
    return { error: "Election not found." };
  }

  return { election: election as VotingElection };
}

export function isVotingWindowOpen(
  election: Pick<VotingElection, "start_date" | "end_date" | "is_archived">,
) {
  return (
    !election.is_archived &&
    isDateTimeWindowOpen(election.start_date, election.end_date)
  );
}

export async function getVotingMasterlistVoter(
  electionId: string,
  studentId: string,
) {
  const adminSupabase = await createAdminClient();
  const { data: voter } = await adminSupabase
    .from("voters")
    .select("voter_id, is_voted")
    .eq("election_id", electionId)
    .eq("student_id", studentId)
    .single();

  if (!voter) {
    return {
      error:
        "Your student ID is not in the voter masterlist for this election.",
    };
  }

  if ((voter as VotingVoter).is_voted) {
    return { error: "This student ID has already voted in this election." };
  }

  return { voter: voter as VotingVoter };
}

export async function ensureVotingVoterRecord(
  electionId: string,
  studentId: string,
  userEmail: string,
) {
  const adminSupabase = await createAdminClient();
  const { data: existingVoter } = await adminSupabase
    .from("voters")
    .select("voter_id, is_voted")
    .eq("election_id", electionId)
    .eq("student_id", studentId)
    .single();

  if (existingVoter) {
    if ((existingVoter as VotingVoter).is_voted) {
      return { error: "This student ID has already voted in this election." };
    }

    return { voterId: (existingVoter as VotingVoter).voter_id };
  }

  const { data: newVoter, error } = await adminSupabase
    .from("voters")
    .insert({
      election_id: electionId,
      student_id: studentId,
      email: userEmail,
      is_voted: false,
    })
    .select("voter_id")
    .single();

  if (error || !newVoter) {
    return { error: "Failed to register voter. Please try again." };
  }

  return { voterId: newVoter.voter_id };
}

export async function updateVotingVoterEmail(
  voterId: string,
  userEmail: string,
) {
  const adminSupabase = await createAdminClient();

  await adminSupabase
    .from("voters")
    .update({ email: userEmail })
    .eq("voter_id", voterId);
}

export async function getVotingPositions(electionId: string) {
  const adminSupabase = await createAdminClient();
  const { data: positions } = await adminSupabase
    .from("positions")
    .select("position_id, title, max_votes")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  return (positions || []) as VotingPosition[];
}

export async function getApprovedVotingCandidates(electionId: string) {
  const adminSupabase = await createAdminClient();
  const { data: candidates } = await adminSupabase
    .from("candidates")
    .select(
      "candidate_id, full_name, position_id, application_status, partylists(name, acronym)",
    )
    .eq("election_id", electionId)
    .eq("application_status", "approved");

  return (candidates || []).map((c: any) => ({
    ...c,
    partylists: Array.isArray(c.partylists)
      ? c.partylists[0] || null
      : c.partylists,
  })) as Array<
    VotingCandidate & {
      partylists: { name: string; acronym: string } | null;
    }
  >;
}

export function buildPositionsWithCandidates(
  positions: VotingPosition[],
  candidates: Array<
    VotingCandidate & { partylists: { name: string; acronym: string } | null }
  >,
) {
  return positions.map((position) => ({
    ...position,
    candidates: candidates
      .filter((candidate) => candidate.position_id === position.position_id)
      .map((candidate) => ({
        candidate_id: candidate.candidate_id,
        full_name: candidate.full_name,
        position_id: candidate.position_id,
        partylist: candidate.partylists,
      })),
  }));
}

export function validateVotingSelections(
  positions: VotingPosition[],
  selections: Record<string, string[]>,
  candidateMap: Map<
    string,
    VotingCandidate & { partylists: { name: string; acronym: string } | null }
  >,
) {
  const selectedCandidateIds: string[] = [];

  for (const position of positions) {
    const selected = selections[position.position_id] || [];
    if (selected.length > position.max_votes) {
      return {
        error: `You selected ${selected.length} candidates for "${position.title}" but the maximum is ${position.max_votes}.`,
      };
    }

    for (const candidateId of selected) {
      const candidate = candidateMap.get(candidateId);
      if (!candidate) {
        return { error: "Invalid candidate selection." };
      }
      if (candidate.position_id !== position.position_id) {
        return { error: "Candidate does not belong to the selected position." };
      }
    }

    selectedCandidateIds.push(...selected);
  }

  if (selectedCandidateIds.length === 0) {
    return { error: "You must select at least one candidate." };
  }

  return { selectedCandidateIds };
}

export async function submitBallotRecord(
  voterId: string,
  candidateIds: string[],
) {
  const adminSupabase = await createAdminClient();

  const { data: vote, error: voteError } = await adminSupabase
    .from("votes")
    .insert({ voter_id: voterId })
    .select("vote_id")
    .single();

  if (voteError || !vote) {
    return { error: "Failed to record vote. Please try again." };
  }

  const voteSelections = candidateIds.map((candidateId) => ({
    vote_id: vote.vote_id,
    candidate_id: candidateId,
  }));

  const { error: selectionsError } = await adminSupabase
    .from("vote_selections")
    .insert(voteSelections);

  if (selectionsError) {
    await adminSupabase.from("votes").delete().eq("vote_id", vote.vote_id);
    return { error: "Failed to record selections. Please try again." };
  }

  const { error: updateError } = await adminSupabase
    .from("voters")
    .update({ is_voted: true })
    .eq("voter_id", voterId);

  if (updateError) {
    console.error("Failed to update voter status:", updateError);
  }

  return { success: true };
}
