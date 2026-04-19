"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  subscribeTurnoutDeltas,
  unsubscribeTurnoutDeltas,
} from "@/lib/turnout/realtime";
import type { TurnoutLiveClientProps } from "@/lib/types/public";

export function TurnoutLiveClient({ electionId }: TurnoutLiveClientProps) {
  const router = useRouter();

  useEffect(() => {
    const channel = subscribeTurnoutDeltas(electionId, () => {
      router.refresh();
    });

    return () => {
      void unsubscribeTurnoutDeltas(channel);
    };
  }, [electionId, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Realtime updates</CardTitle>
        <CardDescription>
          This page refreshes automatically when turnout changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Live turnout updates are subscribed in the background for active
          elections.
        </p>
      </CardContent>
    </Card>
  );
}
