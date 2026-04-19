"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteSEBOfficer } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeleteOfficerButtonProps } from "@/lib/types/admin-officers";

export function DeleteOfficerButton({
  sebOfficerId,
  officerName,
  showLabel = false,
}: DeleteOfficerButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteSEBOfficer(sebOfficerId);

    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    setOpen(false);
    setIsDeleting(false);
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant={showLabel ? "destructive" : "ghost"}
        size={showLabel ? "sm" : "icon"}
        className={
          showLabel
            ? "h-9 px-3"
            : "size-10 text-destructive hover:text-destructive md:size-8"
        }
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={`Delete officer ${officerName}`}
      >
        <Trash2 className="size-4" />
        {showLabel ? "Delete" : null}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete SEB Officer Account</DialogTitle>
            <DialogDescription>
              This will permanently remove {officerName}&apos;s account access.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Officer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
