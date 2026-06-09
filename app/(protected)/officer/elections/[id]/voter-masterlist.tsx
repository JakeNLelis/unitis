"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { VoterMasterlistProps } from "@/lib/types/officer-elections";

export function VoterMasterlist({
  electionId,
  voters,
  canEdit,
  faculties,
  courses,
  electionType,
  electionFacultyId,
}: VoterMasterlistProps) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  // Search and attendance filters
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<
    "all" | "voted" | "not-voted"
  >("all");

  // Selection states for adding voters
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.is_voted).length;
  const notVotedCount = totalVoters - votedCount;

  // Filter courses based on selected faculty (or fixed faculty if Faculty-Wide)
  const effectiveFacultyId = electionType === "Faculty-Wide" ? electionFacultyId : selectedFacultyId;
  const filteredCoursesForAdd = effectiveFacultyId
    ? courses.filter((c) => c.faculty_id === effectiveFacultyId)
    : courses;

  async function handleAdd() {
    if (!canEdit) return;
    if (!rawText.trim()) return;
    setError(null);
    setSuccessMsg(null);

    // Validate inputs
    if (electionType !== "Faculty-Wide" && !selectedFacultyId) {
      setError("Please select a Faculty for the student IDs being added.");
      return;
    }
    if (!selectedCourseId) {
      setError("Please select a Course for the student IDs being added.");
      return;
    }

    setLoading(true);

    const result = await addVoterMasterlist(
      electionId,
      rawText,
      electionType === "Faculty-Wide" ? null : selectedFacultyId,
      selectedCourseId,
    );

    setLoading(false);

    if ("error" in result) {
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
    if (!canEdit) return;
    const result = await removeVoter(voterId);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleClear() {
    if (!canEdit) return;
    setClearLoading(true);
    const result = await clearVoterMasterlist(electionId);
    setClearLoading(false);

    if ("error" in result) {
      setError(result.error);
      setClearOpen(false);
      return;
    }

    setClearOpen(false);
    router.refresh();
  }

  // Filtered voters list for the table
  const filteredVoters = voters.filter((voter) => {
    const matchesSearch = voter.student_id
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesFilter =
      attendanceFilter === "all"
        ? true
        : attendanceFilter === "voted"
          ? voter.is_voted
          : !voter.is_voted;
    return matchesSearch && matchesFilter;
  });

  const previewIds = rawText
    .split(/\s+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  return (
    <div className="space-y-6">
      {!canEdit && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm text-amber-800 text-sm">
          <p className="font-bold uppercase tracking-wide text-xs mb-1">
            Voter Masterlist Locked
          </p>
          <p className="text-xs text-amber-700">
            Voter masterlist updates are disabled once the voting period
            commences.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm flex-wrap">
        <Badge variant="secondary" className="font-bold">
          {totalVoters} total
        </Badge>
        <Badge className="bg-green-600 font-bold">{votedCount} voted</Badge>
        <Badge variant="outline" className="font-bold">
          {notVotedCount} pending
        </Badge>
      </div>

      {canEdit && (
        <div className="space-y-4 border border-border p-4 bg-muted/20">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Add Voters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {electionType !== "Faculty-Wide" && (
              <div className="space-y-1">
                <Label
                  htmlFor="faculty-select"
                  className="text-xs font-bold uppercase"
                >
                  Faculty / College *
                </Label>
                <select
                  id="faculty-select"
                  value={selectedFacultyId}
                  onChange={(e) => {
                    setSelectedFacultyId(e.target.value);
                    setSelectedCourseId(""); // reset course on faculty change
                  }}
                  className="w-full h-10 border border-input px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="">-- Select Faculty --</option>
                  {faculties.map((fac) => (
                    <option key={fac.faculty_id} value={fac.faculty_id}>
                      {fac.acronym ? `[${fac.acronym}] ` : ""}
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <Label
                htmlFor="course-select"
                className="text-xs font-bold uppercase"
              >
                Course / Program *
              </Label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-10 border border-input px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <option value="">-- Select Course --</option>
                {filteredCoursesForAdd.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.acronym ? `[${c.acronym}] ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voter-ids" className="text-xs font-bold uppercase">
              Paste Student IDs
            </Label>
            <Textarea
              id="voter-ids"
              placeholder="e.g. 23-1-01457 23-1-01458 23-1-01459"
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setError(null);
                setSuccessMsg(null);
              }}
              rows={3}
              className="font-mono text-sm"
            />
            {previewIds.length > 0 && (
              <p className="text-xs text-muted-foreground font-medium">
                {previewIds.length} ID{previewIds.length !== 1 ? "s" : ""}{" "}
                detected for bulk upload
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded p-2.5">
              {successMsg}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={loading || previewIds.length === 0}
              size="sm"
              className="font-bold uppercase tracking-wider text-xs"
            >
              {loading ? "Adding..." : "Add to Masterlist"}
            </Button>

            {notVotedCount > 0 && (
              <Dialog open={clearOpen} onOpenChange={setClearOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold uppercase tracking-wider text-xs"
                  >
                    Clear Non-Voted
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tight">
                      Clear Voter Masterlist
                    </DialogTitle>
                    <DialogDescription>
                      This will remove {notVotedCount} voter
                      {notVotedCount !== 1 ? "s" : ""} who have not voted yet.
                      Voters who already voted will be kept.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 pt-4">
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
        </div>
      )}

      {/* Attendance & Search Controls */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Voter Attendance list
          </h3>
          <div className="flex bg-muted/60 p-0.5 rounded-sm shrink-0">
            <button
              onClick={() => setAttendanceFilter("all")}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                attendanceFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAttendanceFilter("voted")}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                attendanceFilter === "voted"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Voted
            </button>
            <button
              onClick={() => setAttendanceFilter("not-voted")}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                attendanceFilter === "not-voted"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Not Voted
            </button>
          </div>
        </div>

        <div className="relative">
          <Input
            placeholder="Search by Student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full font-mono text-sm h-10"
          />
        </div>
      </div>

      {/* Voter list Table */}
      {filteredVoters.length > 0 ? (
        <div className="border border-border max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted border-b border-border z-10">
              <tr className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-4 py-3">Student ID</th>
                {electionType !== "Faculty-Wide" && (
                  <th className="text-left px-4 py-3">Faculty</th>
                )}
                <th className="text-left px-4 py-3">Course</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredVoters.map((voter) => (
                <tr
                  key={voter.voter_id}
                  className="border-b border-border hover:bg-muted/30 last:border-0 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-sm">
                    {voter.student_id}
                  </td>
                  {electionType !== "Faculty-Wide" && (
                    <td className="px-4 py-3 uppercase font-bold text-muted-foreground">
                      {voter.faculties?.acronym || "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 uppercase font-bold text-muted-foreground">
                    {voter.courses?.acronym || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {voter.is_voted ? (
                      <Badge className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider">
                        Voted
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider"
                      >
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canEdit && !voter.is_voted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer px-2"
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
      ) : (
        <div className="border border-border border-dashed p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            No matching voter records found.
          </p>
        </div>
      )}
    </div>
  );
}
