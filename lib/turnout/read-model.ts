import { createClient } from "@/lib/supabase/server";
import type { TurnoutSnapshot } from "@/lib/types/election";

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

  const { count: voteCount, error: voteError } = await supabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId)
    .eq("is_voted", true);

  if (voteError) {
    console.error("Error fetching vote count:", voteError);
    return null;
  }

  const baseVoteCount = voteCount ?? 0;

  // Get sum of casted_votes_delta adjustments
  const { data: adjustments, error: adjustmentError } = await supabase
    .from("turnout_adjustments")
    .select("casted_votes_delta, expected_voters_value")
    .eq("election_id", electionId);

  if (adjustmentError) {
    console.error("Error fetching adjustments:", adjustmentError);
    return null;
  }

  // Step 2: Apply adjustment deltas
  let totalCastedVotes = baseVoteCount;
  let expectedVoters: number | null = null;

  if (adjustments && adjustments.length > 0) {
    for (const adj of adjustments) {
      // Sum up all casted_votes_delta
      if (adj.casted_votes_delta !== null) {
        totalCastedVotes += adj.casted_votes_delta;
      }
      // Use the LATEST expected_voters_value (most recent takes precedence)
      if (adj.expected_voters_value !== null) {
        expectedVoters = adj.expected_voters_value;
      }
    }
  }

  // Step 3: If no explicit expected_voters adjustment, use database value
  if (expectedVoters === null) {
    const { count: expectedCount, error: expectedError } = await supabase
      .from("voters")
      .select("*", { count: "exact", head: true })
      .eq("election_id", electionId);

    if (expectedError) {
      console.error("Error fetching expected voter count:", expectedError);
    }

    expectedVoters = expectedCount ?? 0;
  }

  // Ensure non-negative values
  totalCastedVotes = Math.max(0, totalCastedVotes);
  expectedVoters = Math.max(0, expectedVoters ?? 0);

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
