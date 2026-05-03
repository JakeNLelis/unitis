import { createClient } from "@/lib/supabase/server";
import type { TurnoutSnapshot } from "@/lib/types/election";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
type TurnoutAdjustmentRow = {
  casted_votes_delta: number | null;
  expected_voters_value: number | null;
};

async function getBaseVoteCount(
  supabase: ServerSupabaseClient,
  electionId: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId)
    .eq("is_voted", true);

  if (error) {
    console.error("Error fetching vote count:", error);
    return null;
  }

  return count ?? 0;
}

async function getTurnoutAdjustmentRows(
  supabase: ServerSupabaseClient,
  electionId: string,
): Promise<TurnoutAdjustmentRow[] | null> {
  const { data, error } = await supabase
    .from("turnout_adjustments")
    .select("casted_votes_delta, expected_voters_value")
    .eq("election_id", electionId);

  if (error) {
    console.error("Error fetching adjustments:", error);
    return null;
  }

  return data || [];
}

function applyAdjustments(
  baseVoteCount: number,
  adjustments: TurnoutAdjustmentRow[],
): { castedVotes: number; expectedVoters: number | null } {
  let castedVotes = baseVoteCount;
  let expectedVoters: number | null = null;

  for (const adjustment of adjustments) {
    if (adjustment.casted_votes_delta !== null) {
      castedVotes += adjustment.casted_votes_delta;
    }

    if (adjustment.expected_voters_value !== null) {
      expectedVoters = adjustment.expected_voters_value;
    }
  }

  return { castedVotes, expectedVoters };
}

async function getExpectedVoterCount(
  supabase: ServerSupabaseClient,
  electionId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId);

  if (error) {
    console.error("Error fetching expected voter count:", error);
  }

  return count ?? 0;
}

/**
 * Server-side turnout read model
 * Aggregates current turnout data by:
 * 1. Counting valid votes from votes table
 * 2. Applying casted-vote adjustment deltas
 * 3. Retrieving expected-voter adjustments
 * 4. Calculating turnout percentage
 * 5. Returning complete TurnoutSnapshot
 */
export async function getTurnoutSnapshot(
  electionId: string,
): Promise<TurnoutSnapshot | null> {
  const supabase = await createClient();

  const baseVoteCount = await getBaseVoteCount(supabase, electionId);
  if (baseVoteCount === null) {
    return null;
  }

  const adjustments = await getTurnoutAdjustmentRows(supabase, electionId);
  if (adjustments === null) {
    return null;
  }

  const adjusted = applyAdjustments(baseVoteCount, adjustments);
  const expectedVoters = Math.max(
    0,
    adjusted.expectedVoters ??
      (await getExpectedVoterCount(supabase, electionId)),
  );
  const totalCastedVotes = Math.max(0, adjusted.castedVotes);

  // Step 4: Calculate turnout percentage
  // When expected_voters is 0, percentage is undefined (handled in display as "—")
  const turnoutPercentage =
    expectedVoters === 0 ? 0 : (totalCastedVotes / expectedVoters) * 100;

  // Step 5: Return complete snapshot
  return {
    election_id: electionId,
    casted_votes: totalCastedVotes,
    expected_voters: expectedVoters,
    turnout_percentage: Math.round(turnoutPercentage * 10) / 10, // Round to 1 decimal
    last_updated_at: new Date().toISOString(),
  };
}

/**
 * Get list of adjustments for an election
 * Used for audit trail and verification
 */
export async function getTurnoutAdjustments(electionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("turnout_adjustments")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching adjustments:", error);
    return [];
  }

  return data || [];
}
