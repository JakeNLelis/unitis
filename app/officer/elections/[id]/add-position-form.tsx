"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createPosition } from "../actions";

export function AddPositionForm({ electionId }: { electionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        + Add Position
      </Button>
    );
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    formData.set("election_id", electionId);

    const result = await createPosition(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="title" className="text-sm">
            Position Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. President"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="max_votes" className="text-sm">
            Max Votes
          </Label>
          <Input
            id="max_votes"
            name="max_votes"
            type="number"
            min={1}
            defaultValue={1}
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
