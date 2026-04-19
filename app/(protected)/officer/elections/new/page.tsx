"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createElection } from "../actions";
import { ELECTION_TYPES } from "@/lib/types/election";
import { DateTimeRangePicker } from "./date-time-range-picker";

export default function NewElectionPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const registryPath = pathname.startsWith("/admin/elections")
    ? "/admin/elections"
    : "/officer/elections";

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
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Back Navigation */}
      <div>
        <Link
          href={registryPath}
          className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Registry
        </Link>
      </div>

      {/* Hero Header */}
      <section className="pb-8 border-b-2 border-foreground">
        <h1 className="text-6xl md:text-7xl font-black font-heading tracking-tighter uppercase leading-[0.8] mb-4">
          Initialize
          <br />
          Election
        </h1>

        <p className="text-xl font-medium max-w-xl border-l-4 border-primary pl-4 py-1">
          Establish a new electoral event. Ensure all filing and voting periods
          are strictly verified.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-12">
        <input type="hidden" name="redirect_base" value={registryPath} />

        {/* Core Metadata Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
              >
                Official Election Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. SSC General Election 2026"
                required
                className="h-14 border-2 border-foreground rounded-none text-xl font-bold placeholder:font-medium placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-primary"
              />
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">
                This name will appear on all digital ballots and official
                reports.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="election_type"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
              >
                Election Classification
              </Label>
              <Select name="election_type" required>
                <SelectTrigger className="h-14 border-2 border-foreground rounded-none text-lg font-bold focus:ring-0">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground rounded-none">
                  {ELECTION_TYPES.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="font-bold py-3"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6 bg-surface-lowest border-2 border-foreground relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Info className="size-20" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="size-4" />
              Institutional Guidance
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex gap-2">
                <span className="text-primary font-bold">01</span>
                Ensure names are accurate. Post-initialization changes require
                audit clearance.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">02</span>
                Classification determines candidate eligibility rules and system
                constraints.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">03</span>
                The filing period must conclude before the voting period begins.
              </li>
            </ul>
          </div>
        </section>

        {/* Date/Time Configuration */}
        <section className="space-y-12">
          <DateTimeRangePicker
            title="Candidacy Filing Range"
            description="Operational window for candidate submission and vetting."
            startLabel="Opening Timestamp"
            endLabel="Deadline Timestamp"
            startName="candidacy_start_date"
            endName="candidacy_end_date"
          />

          <DateTimeRangePicker
            title="Voting Operational window"
            description="Active threshold for student participation and ballot casting."
            startLabel="Live Start Time"
            endLabel="Live End Time"
            startName="start_date"
            endName="end_date"
            required
          />
        </section>

        {/* Errors & Submission */}
        <section className="pt-8 border-t-2 border-foreground">
          {error && (
            <div className="mb-8 p-6 bg-destructive/10 border-2 border-destructive text-destructive flex items-center gap-4">
              <AlertCircle className="size-6 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1">
                  Validation Error
                </p>
                <p className="font-bold">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-low p-6 border-2 border-foreground">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full border-2 border-foreground flex items-center justify-center font-bold">
                !
              </div>
              <p className="text-xs font-bold leading-tight max-w-xs uppercase">
                By clicking &ldquo;Initialize Registry&rdquo;, you confirm that
                all parameters meet university electoral bypass standards.
              </p>
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none h-14 px-8 border-2 border-foreground rounded-none font-black uppercase tracking-widest hover:bg-surface-lowest transition-colors"
                onClick={() => router.push(registryPath)}
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none h-14 px-12 bg-foreground text-background rounded-none font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50"
              >
                {isLoading ? "Synchronizing..." : "Initialize Registry"}
              </Button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
