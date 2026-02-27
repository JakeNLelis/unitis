"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createElection } from "../actions";
import { ELECTION_TYPES } from "@/lib/types/election";

export default function NewElectionPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createElection(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/officer/elections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Elections
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Election</CardTitle>
          <CardDescription>
            Set up a new election with voting and candidacy filing periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Election Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. SSC General Election 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="election_type">Election Type</Label>
              <Select name="election_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ELECTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Candidacy Filing Period</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set when candidates can submit their application. The filing
                deadline must be before the election starts.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidacy_start_date">Filing Opens</Label>
                  <Input
                    id="candidacy_start_date"
                    name="candidacy_start_date"
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidacy_end_date">Filing Deadline</Label>
                  <Input
                    id="candidacy_end_date"
                    name="candidacy_end_date"
                    type="datetime-local"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Election Voting Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Voting Starts</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Voting Ends</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Election"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/officer/elections")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
