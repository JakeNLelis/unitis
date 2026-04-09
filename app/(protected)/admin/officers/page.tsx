import { createClient } from "@/lib/supabase/server";
import { SEBOfficer, ROLE_LABELS } from "@/lib/types/auth";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SEBOfficerWithAdmin extends SEBOfficer {
  system_administrators?: {
    username: string;
  };
}

async function getSEBOfficers(): Promise<SEBOfficerWithAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seb_officers")
    .select(
      `
      *,
      system_administrators (username)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching SEB officers:", error);
    return [];
  }

  return data as SEBOfficerWithAdmin[];
}

async function OfficersList() {
  const officers = await getSEBOfficers();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {officers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No SEB officers found. Create your first officer to get started.
              </TableCell>
            </TableRow>
          ) : (
            officers.map((officer) => (
              <TableRow key={officer.seb_officer_id}>
                <TableCell className="font-medium">{officer.name}</TableCell>
                <TableCell>{officer.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {ROLE_LABELS["seb-officer"]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {officer.system_administrators?.username || "-"}
                </TableCell>
                <TableCell>
                  {new Date(officer.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function OfficersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">SEB Officers</h1>
          <p className="text-muted-foreground">Manage SEB Officer accounts</p>
        </div>
        <Button asChild>
          <Link href="/admin/officers/new">
            <Plus className="size-4" />
            Add SEB Officer
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="border rounded-lg overflow-hidden">
            <div className="h-10 bg-muted/50 border-b" />
            <div className="space-y-0 divide-y">
              <div className="h-12 bg-muted/30 animate-pulse" />
              <div className="h-12 bg-muted/30 animate-pulse" />
              <div className="h-12 bg-muted/30 animate-pulse" />
            </div>
          </div>
        }
      >
        <OfficersList />
      </Suspense>
    </div>
  );
}
