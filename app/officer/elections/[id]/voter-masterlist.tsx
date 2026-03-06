"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addVoterMasterlist,
  removeVoter,
  clearVoterMasterlist,
} from "../actions";

interface Voter {
  voter_id: string;
  student_id: string;
  is_voted: boolean;
}

interface VoterMasterlistProps {
  electionId: string;
  voters: Voter[];
}

export function VoterMasterlist({ electionId, voters }: VoterMasterlistProps) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.is_voted).length;
  const notVotedCount = totalVoters - votedCount;

  async function handleAdd() {
    if (!rawText.trim()) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = await addVoterMasterlist(electionId, rawText);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    const msgs: string[] = [];
    if (result.added) msgs.push(`${result.added} added`);
    if (result.skipped) msgs.push(`${result.skipped} duplicates skipped`);
    setSuccessMsg(msgs.join(", "));
    setRawText("");
    router.refresh();
  }

  async function handleRemove(voterId: string) {
    const result = await removeVoter(voterId);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleClear() {
    setClearLoading(true);
    const result = await clearVoterMasterlist(electionId);
    setClearLoading(false);

    if (result.error) {
      setError(result.error);
      setClearOpen(false);
      return;
    }

    setClearOpen(false);
    router.refresh();
  }

  // Preview parsed IDs from the textarea
  const previewIds = rawText
    .split(/\s+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-3 text-sm">
        <Badge variant="secondary">{totalVoters} total</Badge>
        <Badge className="bg-green-600">{votedCount} voted</Badge>
        <Badge variant="outline">{notVotedCount} not yet voted</Badge>
      </div>

      {/* Add IDs form */}
      <div className="space-y-2">
        <Label htmlFor="voter-ids">
          Paste Student IDs (separated by spaces, tabs, or newlines)
        </Label>
        <Textarea
          id="voter-ids"
          placeholder="20-1-01457 20-1-01458 20-1-01459&#10;20-2-00123 20-2-00124"
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setError(null);
            setSuccessMsg(null);
          }}
          rows={4}
          className="font-mono text-sm"
        />
        {previewIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {previewIds.length} ID{previewIds.length !== 1 ? "s" : ""} detected
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
          {error}
        </p>
      )}

      {successMsg && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
          {successMsg}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={handleAdd}
          disabled={loading || previewIds.length === 0}
          size="sm"
        >
          {loading ? "Adding..." : "Add to Masterlist"}
        </Button>

        {notVotedCount > 0 && (
          <Dialog open={clearOpen} onOpenChange={setClearOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Clear Non-Voted
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Clear Voter Masterlist</DialogTitle>
                <DialogDescription>
                  This will remove {notVotedCount} voter
                  {notVotedCount !== 1 ? "s" : ""} who have not voted yet.
                  Voters who already voted will be kept.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setClearOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClear}
                  disabled={clearLoading}
                >
                  {clearLoading ? "Clearing..." : "Clear"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Voter list */}
      {voters.length > 0 && (
        <div className="border rounded-lg max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Student ID</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {voters.map((voter) => (
                <tr key={voter.voter_id} className="border-t hover:bg-muted/50">
                  <td className="px-3 py-2 font-mono">{voter.student_id}</td>
                  <td className="px-3 py-2">
                    {voter.is_voted ? (
                      <Badge className="bg-green-600 text-xs">Voted</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {!voter.is_voted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleRemove(voter.voter_id)}
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
