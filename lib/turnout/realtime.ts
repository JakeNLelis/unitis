import { createClient } from "@/lib/supabase/client";
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";

/**
 * Client-side realtime subscription helper for turnout delta updates
 * T012: Manages subscription lifecycle for incremental turnout changes
 *
 * Usage (in turnout-live-client.tsx):
 *   const subscription = subscribeTurnoutDeltas(electionId, (adjustment) => {
 *     console.log("Turnout updated:", adjustment);
 *     refreshSnapshot(); // Re-fetch aggregated snapshot
 *   });
 *
 *   // Later: unsubscribe when component unmounts
 *   await unsubscribeTurnoutDeltas(subscription);
 */

export interface TurnoutDeltaCallback {
  (
    adjustment: RealtimePostgresInsertPayload<Record<string, unknown>>["new"],
  ): void;
}

/**
 * Subscribe to realtime turnout adjustment updates for an active election
 * and voter status changes that affect turnout.
 * Returns the channel instance for manual unsubscribe if needed
 */
export function subscribeTurnoutDeltas(
  electionId: string,
  onUpdate: TurnoutDeltaCallback,
): RealtimeChannel | null {
  const supabase = createClient();

  const channel = supabase
    .channel(`turnout:${electionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "turnout_adjustments",
        filter: `election_id=eq.${electionId}`,
      },
      (payload) => {
        // Payload contains the new adjustment record
        if (payload.new) {
          onUpdate(payload.new);
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "voters",
        filter: `election_id=eq.${electionId}`,
      },
      (payload) => {
        // Voter status changes impact turnout counts
        if (payload.new) {
          onUpdate(payload.new);
        }
      },
    )
    .subscribe((status, err) => {
      if (err) {
        console.error(
          `Error subscribing to turnout updates for election ${electionId}:`,
          err,
        );
      }
      if (status === "SUBSCRIBED") {
        console.log(
          `Subscribed to realtime turnout updates for election ${electionId}`,
        );
      }
    });

  return channel;
}

/**
 * Unsubscribe from a turnout realtime channel
 * Safe to call even if subscription failed
 */
export async function unsubscribeTurnoutDeltas(
  channel: RealtimeChannel | null,
): Promise<void> {
  if (!channel) return;

  try {
    const supabase = createClient();
    await supabase.removeChannel(channel);
  } catch (error) {
    console.error("Error unsubscribing from turnout channel:", error);
  }
}

/**
 * Unsubscribe by channel name (alternative approach)
 */
export async function unsubscribeTurnoutDeltasByName(
  electionId: string,
): Promise<void> {
  const supabase = createClient();
  try {
    const channel = supabase
      .getChannels()
      .find((c) => c.topic === `turnout:${electionId}`);
    if (channel) {
      await supabase.removeChannel(channel);
    }
  } catch (error) {
    console.error("Error removing turnout channel by name:", error);
  }
}
