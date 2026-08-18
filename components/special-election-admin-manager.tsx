"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bulkInsertSpecialElectionStudents,
  createSpecialElectionRosterEntry,
  deleteSpecialElectionRosterEntry,
} from "@/app/(protected)/admin/special-election/actions";

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseBatchCsvRows(rawText: string) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return [] as Array<{ student_id: string; faculty_assigned: string; google_form_url: string }>;
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [] as Array<{ student_id: string; faculty_assigned: string; google_form_url: string }>;
  }

  const headerRow = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const hasHeader = headerRow.includes("studentid") && headerRow.includes("faculty") && headerRow.includes("ballotlink");

  const rows = hasHeader ? lines.slice(1) : lines;
  const indexes = hasHeader
    ? {
        studentId: headerRow.indexOf("studentid"),
        faculty: headerRow.indexOf("faculty"),
        ballotLink: headerRow.indexOf("ballotlink"),
      }
    : {
        studentId: 0,
        faculty: 1,
        ballotLink: 2,
      };

  return rows
    .map((line) => {
      const values = splitCsvLine(line);
      const studentId = (values[indexes.studentId] ?? "").trim();
      const facultyAssigned = (values[indexes.faculty] ?? "").trim();
      const googleFormUrl = (values[indexes.ballotLink] ?? "").trim();

      if (!studentId || !facultyAssigned || !googleFormUrl) {
        return null;
      }

      return {
        student_id: studentId,
        faculty_assigned: facultyAssigned,
        google_form_url: googleFormUrl,
      };
    })
    .filter(Boolean) as Array<{ student_id: string; faculty_assigned: string; google_form_url: string }>;
}

export function SpecialElectionAdminManager({
  entries,
}: {
  entries: Array<{
    faculty_assigned: string;
    student_id: string;
    google_form_url: string;
  }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleCount, setVisibleCount] = useState(25);

  const facultyOptions = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => entry.faculty_assigned).filter(Boolean))).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toUpperCase();

    const filtered = entries.filter((entry) => {
      const matchesFaculty =
        facultyFilter === "ALL" ||
        String(entry.faculty_assigned).toUpperCase() === facultyFilter;

      if (!matchesFaculty) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        String(entry.student_id).toUpperCase().includes(query) ||
        String(entry.faculty_assigned).toUpperCase().includes(query)
      );
    });

    filtered.sort((a, b) => {
      const left = String(a.student_id).toUpperCase();
      const right = String(b.student_id).toUpperCase();
      return sortOrder === "asc" ? left.localeCompare(right) : right.localeCompare(left);
    });

    return filtered;
  }, [entries, facultyFilter, searchQuery, sortOrder]);

  useEffect(() => {
    setVisibleCount(25);
  }, [facultyFilter, searchQuery, sortOrder]);

  const visibleEntries = filteredEntries.slice(0, visibleCount);
  const hasMore = filteredEntries.length > visibleEntries.length;

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await createSpecialElectionRosterEntry(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
    const form = document.getElementById("special-election-form") as HTMLFormElement | null;
    form?.reset();
  }

  async function handleDelete(studentId: string) {
    if (!confirm(`Remove ${studentId} from the special-election roster?`)) {
      return;
    }

    setError(null);
    setNotice(null);
    setLoading(true);
    const result = await deleteSpecialElectionRosterEntry(studentId);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
    setNotice(`Removed ${studentId}.`);
  }

  async function handleBulkImport() {
    const rows = parseBatchCsvRows(batchText);

    if (!rows.length) {
      setError("No valid rows found. Use headers studentid,faculty,ballotlink or three comma-separated values per row.");
      return;
    }

    setError(null);
    setNotice(null);
    setLoading(true);

    const result = await bulkInsertSpecialElectionStudents(rows);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setBatchText("");
    router.refresh();
    setNotice(`Imported ${rows.length} ballot row${rows.length === 1 ? "" : "s"}.`);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add eligible voter</CardTitle>
          <CardDescription>
            Add a student to the special-election roster by faculty assignment and voting link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="special-election-form"
            action={handleCreate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="faculty_assigned">Faculty assigned</Label>
              <Input id="faculty_assigned" name="faculty_assigned" placeholder="FC" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID</Label>
              <Input id="student_id" name="student_id" placeholder="23-1-01457" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="google_form_url">Google Form URL</Label>
              <Input id="google_form_url" name="google_form_url" type="url" placeholder="https://forms.gle/..." required />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={loading} className="gap-2">
                <Plus className="size-4" />
                {loading ? "Saving..." : "Save entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import ballot roster in bulk</CardTitle>
          <CardDescription>
            Paste CSV data or upload a .csv file. Use headers: studentid,faculty,ballotlink
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={batchText}
            onChange={(event) => setBatchText(event.target.value)}
            placeholder="studentid,faculty,ballotlink"
            className="min-h-36"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={handleBulkImport} disabled={loading || !batchText.trim()} className="gap-2">
              <Upload className="size-4" />
              {loading ? "Importing..." : "Import CSV rows"}
            </Button>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    const text = String(reader.result ?? "");
                    setBatchText(text);
                    setError(null);
                    setNotice(null);
                  };
                  reader.readAsText(file);
                  event.target.value = "";
                }}
              />
              Upload .csv
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          <CardDescription>
            Search and filter roster entries instead of loading the full list at once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="grid gap-3 px-6 pt-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="roster-search">Search student ID</Label>
              <Input
                id="roster-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="e.g. 25-1-00471"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roster-faculty-filter">Filter by faculty</Label>
              <select
                id="roster-faculty-filter"
                value={facultyFilter}
                onChange={(event) => setFacultyFilter(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ALL">All faculties</option>
                {facultyOptions.map((faculty) => (
                  <option key={faculty} value={faculty.toUpperCase()}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roster-sort-order">Sort by student ID</Label>
              <select
                id="roster-sort-order"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div className="px-6 text-sm text-muted-foreground">
            Showing {visibleEntries.length} of {filteredEntries.length} matching entries.
          </div>

          {entries.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No roster entries yet.</div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No entries match your current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Google Form</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleEntries.map((entry) => (
                    <TableRow key={entry.student_id}>
                      <TableCell>{entry.faculty_assigned}</TableCell>
                      <TableCell>{entry.student_id}</TableCell>
                      <TableCell className="max-w-48 truncate">
                        <a href={entry.google_form_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                          Open form
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(entry.student_id)}
                          className="gap-2"
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {hasMore && (
            <div className="px-6 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((count) => count + 25)}
              >
                Show 25 more
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
