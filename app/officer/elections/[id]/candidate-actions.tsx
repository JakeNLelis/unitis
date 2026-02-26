"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCandidateStatus } from "../actions";

export function CandidateActions({
  candidateId,
  currentStatus,
  //electionId,
}: {
  candidateId: string;
  currentStatus: string;
  electionId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleStatusChange(status: "approved" | "rejected") {
    setIsLoading(true);
    const result = await updateCandidateStatus(candidateId, status);
    if (result?.error) {
      alert(result.error);
    }
    setIsLoading(false);
    router.refresh();
  }

  if (currentStatus !== "pending") {
    return (
      <span className="text-xs text-muted-foreground capitalize">
        {currentStatus}
      </span>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="default"
        className="h-7 text-xs"
        disabled={isLoading}
        onClick={() => handleStatusChange("approved")}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 text-xs"
        disabled={isLoading}
        onClick={() => handleStatusChange("rejected")}
      >
        Reject
      </Button>
    </div>
  );
}
