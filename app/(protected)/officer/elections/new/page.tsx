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
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createElection } from "../actions";
import { ELECTION_TYPES } from "@/lib/types/election";
import { DateTimeRangePicker } from "./date-time-range-picker";

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/officer/elections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Elections
        </Link>
      </div>

      <Card className="w-full">
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
            <DateTimeRangePicker
              title="Candidacy Filing Period"
              description="Set when candidates can submit their application. The filing deadline must be before the election starts."
              startLabel="Filing opens time"
              endLabel="Filing deadline time"
              startName="candidacy_start_date"
              endName="candidacy_end_date"
            />
            <DateTimeRangePicker
              title="Election Voting Period"
              startLabel="Voting starts time"
              endLabel="Voting ends time"
              startName="start_date"
              endName="end_date"
              required
            />
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
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
