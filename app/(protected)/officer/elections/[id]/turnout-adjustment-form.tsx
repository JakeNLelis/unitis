"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitTurnoutAdjustment } from "../actions";
import type { TurnoutAdjustmentFormProps } from "@/lib/types/officer-elections";

export function TurnoutAdjustmentForm({
  electionId,
  canEdit,
}: TurnoutAdjustmentFormProps) {
  const [castedVotesDelta, setCastedVotesDelta] = useState("");
  const [expectedVotersValue, setExpectedVotersValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const parsedDelta =
      castedVotesDelta.trim() === "" ? null : Number(castedVotesDelta);
    const parsedExpected =
      expectedVotersValue.trim() === "" ? null : Number(expectedVotersValue);

    const result = await submitTurnoutAdjustment(electionId, {
      casted_votes_delta: parsedDelta ?? undefined,
      expected_voters_value: parsedExpected ?? undefined,
      reason: reason.trim() || undefined,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setCastedVotesDelta("");
      setExpectedVotersValue("");
      setReason("");
    }

    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Turnout adjustment</CardTitle>
        <CardDescription>
          Update turnout counts for offline votes or expected voter corrections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="castedVotesDelta">Offline votes to add</Label>
            <Input
              id="castedVotesDelta"
              type="number"
              min="0"
              step="1"
              value={castedVotesDelta}
              onChange={(e) => setCastedVotesDelta(e.target.value)}
              placeholder="e.g. 5"
              disabled={!canEdit || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedVotersValue">Expected voters total</Label>
            <Input
              id="expectedVotersValue"
              type="number"
              min="0"
              step="1"
              value={expectedVotersValue}
              onChange={(e) => setExpectedVotersValue(e.target.value)}
              placeholder="e.g. 120"
              disabled={!canEdit || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Corrected offline ballot tally"
              disabled={!canEdit || isSubmitting}
            />
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-md border border-green-600/20 bg-green-600/10 p-3 text-sm text-green-700">
              Turnout adjustment saved.
            </div>
          ) : null}

          <Button type="submit" disabled={!canEdit || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save turnout adjustment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
