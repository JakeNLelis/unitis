"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updatePosition, deletePosition } from "../actions";
import type {
  PositionItemProps,
  PositionListProps,
} from "@/lib/types/officer-elections";

function PositionItem({ position, electionId, canEdit }: PositionItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(position.title);
  const [maxVotes, setMaxVotes] = useState(position.max_votes);

  async function handleUpdate() {
    setIsSaving(true);
    setError(null);
    const result = await updatePosition(
      position.position_id,
      electionId,
      title,
      maxVotes,
    );
    if (result && typeof result === "object" && "error" in result) {
      setError((result as any).error);
    } else {
      setIsEditing(false);
      router.refresh();
    }
    setIsSaving(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deletePosition(position.position_id);
    if (result && typeof result === "object" && "error" in result) {
      setError((result as any).error);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  }

  if (isEditing) {
    return (
      <div className="border rounded-lg p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Position title"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Votes</Label>
            <Input
              type="number"
              min={1}
              value={maxVotes}
              onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleUpdate} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setTitle(position.title);
              setMaxVotes(position.max_votes);
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">{position.title}</span>
        {position.required_for_partylist && (
          <Badge variant="outline" className="text-xs">
            required for partylist
          </Badge>
        )}
        {position.max_votes > 1 && (
          <Badge variant="secondary" className="text-xs">
            max {position.max_votes} votes
          </Badge>
        )}
      </div>
      {canEdit ? (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Read-only</span>
      )}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

export function PositionList({
  positions,
  electionId,
  canEdit,
}: PositionListProps) {
  return (
    <div className="space-y-2">
      {positions.map((pos) => (
        <PositionItem
          key={pos.position_id}
          position={pos}
          electionId={electionId}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
