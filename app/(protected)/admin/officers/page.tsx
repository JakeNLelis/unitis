import { createClient } from "@/lib/supabase/server";
import { SEBOfficer } from "@/lib/types/auth";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DeleteOfficerButton } from "./delete-officer-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

async function getSEBOfficers(): Promise<SEBOfficer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seb_officers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching SEB officers:", error);
    return [];
  }

  return data as SEBOfficer[];
}

async function OfficersList() {
  const officers = await getSEBOfficers();

  if (officers.length === 0) {
    return (
      <div className="rounded-lg border bg-card py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No SEB officers found. Create your first officer to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {officers.map((officer) => (
          <div
            key={officer.seb_officer_id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-foreground">
                  {officer.faculty_code}
                </p>
                <p className="text-sm text-muted-foreground">
                  {officer.campus}
                </p>
                <p className="break-all text-sm text-muted-foreground">
                  {officer.email}
                </p>
              </div>
              <DeleteOfficerButton
                sebOfficerId={officer.seb_officer_id}
                officerName={`${officer.faculty_code} (${officer.campus})`}
                showLabel
              />
            </div>

            <div className="mt-3">
              <Badge variant={officer.is_chairperson ? "default" : "secondary"}>
                {officer.is_chairperson ? "Chairperson" : "SEB Officer"}
              </Badge>
            </div>

            <div className="mt-4 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium text-foreground">
                  {new Date(officer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-lg border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-muted/30">
                <TableHead>Faculty Code</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-22.5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.map((officer) => (
                <TableRow
                  key={officer.seb_officer_id}
                  className="hover:bg-accent/40"
                >
                  <TableCell className="font-medium">
                    {officer.faculty_code}
                  </TableCell>
                  <TableCell>{officer.campus}</TableCell>
                  <TableCell className="max-w-60 truncate">
                    {officer.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={officer.is_chairperson ? "default" : "secondary"}>
                      {officer.is_chairperson ? "Chairperson" : "SEB Officer"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(officer.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteOfficerButton
                      sebOfficerId={officer.seb_officer_id}
                      officerName={`${officer.faculty_code} (${officer.campus})`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function OfficersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEB Officers</h1>
          <p className="text-muted-foreground">Manage SEB Officer accounts</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/officers/new">
            <Plus className="size-4" />
            Add SEB Officer
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            <div className="space-y-3 md:hidden">
              {[1, 2].map(i => (
                <div key={i} className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-24 mt-4" />
                </div>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-lg border md:block">
              <div className="h-10 border-b bg-muted/50" />
              <div className="space-y-0 divide-y">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 flex items-center px-4 gap-4 bg-muted/10">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48 flex-1" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <OfficersList />
      </Suspense>
    </div>
  );
}
