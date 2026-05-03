"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updatePartylistRequiredPositions } from "../actions";
import type { OfficerPositionSummary } from "@/lib/types/officer-elections";

export function PartylistRequiredSettings({
  electionId,
  positions,
  canEdit,
}: {
  electionId: string;
  positions: OfficerPositionSummary[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    () =>
      new Set(
        positions
          .filter((position) => position.required_for_partylist)
          .map((position) => position.position_id),
      ),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderedPositions = useMemo(
    () => [...positions].sort((a, b) => a.title.localeCompare(b.title)),
    [positions],
  );

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    const result = await updatePartylistRequiredPositions(
      electionId,
      Array.from(selected),
    );

    if (result && "error" in result) {
      setError((result as any).error);
      setIsSaving(false);
      return;
    }

    router.refresh();
    setIsSaving(false);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Selected positions must be filled before a partylist can be registered.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {orderedPositions.map((position) => {
          const inputId = `required-${position.position_id}`;
          const checked = selected.has(position.position_id);

          return (
            <div
              key={position.position_id}
              className="flex items-center gap-2 rounded border border-border px-3 py-2"
            >
              <Checkbox
                id={inputId}
                checked={checked}
                onCheckedChange={(value) => {
                  const next = new Set(selected);
                  if (value === true) {
                    next.add(position.position_id);
                  } else {
                    next.delete(position.position_id);
                  }
                  setSelected(next);
                }}
                disabled={!canEdit || isSaving}
              />
              <Label htmlFor={inputId} className="text-sm cursor-pointer">
                {position.title}
              </Label>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button onClick={handleSave} disabled={!canEdit || isSaving}>
        {isSaving ? "Saving..." : "Save Partylist Requirements"}
      </Button>
    </div>
  );
}
