"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, Upload, Mail } from "lucide-react";
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
  bulkInsertUsscPlebisciteStudents,
  createUsscPlebisciteRosterEntry,
  deleteUsscPlebisciteRosterEntry,
  type UsscPlebisciteStudentRow,
} from "@/app/(protected)/admin/usscsplebiscite/actions";

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

function parseBatchCsvRows(rawText: string): UsscPlebisciteStudentRow[] {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return [];
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headerRow = splitCsvLine(lines[0]).map((cell) =>
    cell.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );

  const hasHeader =
    headerRow.some((h) => h.includes("studentid") || h === "id") &&
    headerRow.some((h) => h.includes("faculty") || h.includes("assigned")) &&
    headerRow.some((h) => h.includes("ballot") || h.includes("form") || h.includes("url"));

  const rows = hasHeader ? lines.slice(1) : lines;

  let studentIdIdx = 0;
  let facultyIdx = 1;
  let ballotLinkIdx = 2;
  let emailIdx = 3;
  let altLinkIdx = 4;

  if (hasHeader) {
    studentIdIdx = headerRow.findIndex((h) => h.includes("studentid") || h === "id");
    facultyIdx = headerRow.findIndex((h) => h.includes("faculty") || h.includes("assigned"));
    ballotLinkIdx = headerRow.findIndex((h) => h.includes("ballot") || h.includes("googleform") || h.includes("formurl"));
    emailIdx = headerRow.findIndex((h) => h.includes("email") && !h.includes("alt"));
    altLinkIdx = headerRow.findIndex((h) => h.includes("alt") || h.includes("change"));
  }

  return rows
    .map((line) => {
      const values = splitCsvLine(line);
      const studentId = (values[studentIdIdx] ?? "").trim();
      const facultyAssigned = (values[facultyIdx] ?? "").trim();
      const googleFormUrl = (values[ballotLinkIdx] ?? "").trim();
      const emailAddress = emailIdx >= 0 ? (values[emailIdx] ?? "").trim() : "";
      const altEmailGoogleFormUrl =
        altLinkIdx >= 0 ? (values[altLinkIdx] ?? "").trim() : "";

      if (!studentId || !facultyAssigned || !googleFormUrl) {
        return null;
      }

      return {
        student_id: studentId,
        faculty_assigned: facultyAssigned,
        google_form_url: googleFormUrl,
        email_address: emailAddress,
        alt_email_google_form_url: altEmailGoogleFormUrl,
      };
    })
    .filter(Boolean) as UsscPlebisciteStudentRow[];
}

export function UsscPlebisciteAdminManager({
  entries,
}: {
  entries: Array<{
    faculty_assigned: string;
    student_id: string;
    google_form_url: string;
    email_address?: string | null;
    alt_email_google_form_url?: string | null;
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
    return Array.from(
      new Set(entries.map((entry) => entry.faculty_assigned).filter(Boolean)),
    ).sort();
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
        String(entry.faculty_assigned).toUpperCase().includes(query) ||
        String(entry.email_address ?? "").toUpperCase().includes(query)
      );
    });

    filtered.sort((a, b) => {
      const left = String(a.student_id).toUpperCase();
      const right = String(b.student_id).toUpperCase();
      return sortOrder === "asc"
        ? left.localeCompare(right)
        : right.localeCompare(left);
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
    const result = await createUsscPlebisciteRosterEntry(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
    const form = document.getElementById(
      "ussc-plebiscite-form",
    ) as HTMLFormElement | null;
    form?.reset();
    setNotice("Student record added successfully.");
  }

  async function handleDelete(studentId: string) {
    if (!confirm(`Remove student ${studentId} from the roster?`)) {
      return;
    }

    setError(null);
    setNotice(null);
    setLoading(true);
    const result = await deleteUsscPlebisciteRosterEntry(studentId);
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
      setError(
        "No valid rows found. Use headers: studentid,faculty,ballotlink,email,altlink.",
      );
      return;
    }

    setError(null);
    setNotice(null);
    setLoading(true);

    const result = await bulkInsertUsscPlebisciteStudents(rows);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setBatchText("");
    router.refresh();
    setNotice(
      `Imported ${rows.length} roster record${rows.length === 1 ? "" : "s"}.`,
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground">
          {notice}
        </div>
      )}

      {/* Add Single Voter Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">
            Add Eligible Voter
          </CardTitle>
          <CardDescription>
            Register a single student to the plebiscite roster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="ussc-plebiscite-form"
            action={handleCreate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-1.5">
              <Label htmlFor="faculty_assigned" className="text-sm font-medium">
                Faculty Assigned
              </Label>
              <Input
                id="faculty_assigned"
                name="faculty_assigned"
                placeholder="FC"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student_id" className="text-sm font-medium">
                Student ID
              </Label>
              <Input
                id="student_id"
                name="student_id"
                placeholder="23-1-01457"
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="google_form_url" className="text-sm font-medium">
                Google Form Ballot URL
              </Label>
              <Input
                id="google_form_url"
                name="google_form_url"
                type="url"
                placeholder="https://forms.gle/..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email_address" className="text-sm font-medium">
                Authorized Email Address
              </Label>
              <Input
                id="email_address"
                name="email_address"
                type="email"
                placeholder="student@vsu.edu.ph"
              />
              <p className="text-xs text-muted-foreground">
                Masked on the public lookup page (e.g. v**a**...9@domain.com).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="alt_email_google_form_url"
                className="text-sm font-medium"
              >
                Change Request Form URL (Optional)
              </Label>
              <Input
                id="alt_email_google_form_url"
                name="alt_email_google_form_url"
                type="url"
                placeholder="https://forms.gle/change-email-form"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" disabled={loading} className="gap-1.5 font-medium">
                <Plus className="size-4" />
                {loading ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bulk CSV Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">
            Batch Import
          </CardTitle>
          <CardDescription>
            Import multiple students via CSV. Expected headers:{" "}
            <code className="font-mono text-xs">
              studentid,faculty,ballotlink,email,altlink
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={batchText}
            onChange={(event) => setBatchText(event.target.value)}
            placeholder="studentid,faculty,ballotlink,email,altlink"
            className="min-h-32 font-mono text-xs"
          />

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="button"
              onClick={handleBulkImport}
              disabled={loading || !batchText.trim()}
              className="gap-1.5 font-medium"
            >
              <Upload className="size-4" />
              {loading ? "Importing..." : "Import CSV Rows"}
            </Button>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
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

      {/* Roster List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">
            Roster Records
          </CardTitle>
          <CardDescription>
            Search and manage registered voters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="grid gap-3 px-6 pt-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="roster-search" className="text-xs font-medium">
                Search Student ID / Email
              </Label>
              <Input
                id="roster-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search..."
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="roster-faculty-filter"
                className="text-xs font-medium"
              >
                Filter Faculty
              </Label>
              <select
                id="roster-faculty-filter"
                value={facultyFilter}
                onChange={(event) => setFacultyFilter(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              >
                <option value="ALL">All faculties</option>
                {facultyOptions.map((faculty) => (
                  <option key={faculty} value={faculty.toUpperCase()}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="roster-sort-order"
                className="text-xs font-medium"
              >
                Sort Order
              </Label>
              <select
                id="roster-sort-order"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as "asc" | "desc")
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              >
                <option value="asc">Student ID (Ascending)</option>
                <option value="desc">Student ID (Descending)</option>
              </select>
            </div>
          </div>

          <div className="px-6 text-xs text-muted-foreground">
            Showing {visibleEntries.length} of {filteredEntries.length} matching entries.
          </div>

          {entries.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No roster entries found.
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No entries match your search.
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ballot Link</TableHead>
                    <TableHead>Change Link</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleEntries.map((entry) => (
                    <TableRow key={entry.student_id}>
                      <TableCell className="font-medium text-sm">
                        {entry.faculty_assigned}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.student_id}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {entry.email_address ? (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3 text-muted-foreground" />
                            {entry.email_address}
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-36 truncate text-xs">
                        <a
                          href={entry.google_form_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline hover:text-primary/80"
                        >
                          Ballot Form
                        </a>
                      </TableCell>
                      <TableCell className="max-w-36 truncate text-xs">
                        {entry.alt_email_google_form_url ? (
                          <a
                            href={entry.alt_email_google_form_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline hover:text-primary/80"
                          >
                            Change Form
                          </a>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.student_id)}
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {hasMore && (
            <div className="px-6 pb-4 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((count) => count + 25)}
                className="w-full text-xs"
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
