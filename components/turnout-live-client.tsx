"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  subscribeTurnoutDeltas,
  unsubscribeTurnoutDeltas,
} from "@/lib/turnout/realtime";
import type { SharedTurnoutLiveClientProps } from "@/lib/types/components";

export function TurnoutLiveClient({
  electionId,
}: SharedTurnoutLiveClientProps) {
  const router = useRouter();

  useEffect(() => {
    const channel = subscribeTurnoutDeltas(electionId, () => {
      // Use startTransition or similar if needed, but refresh() is simple for now
      router.refresh();
    });

    return () => {
      void unsubscribeTurnoutDeltas(channel);
    };
  }, [electionId, router]);

  // Headless component: just logic
  return null;
}
