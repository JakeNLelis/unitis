"use client";

import { archivo } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  CandidateRegistryProps,
  InstitutionalCandidate,
} from "@/lib/types/institutional";

export function CandidateRegistry({ candidates }: CandidateRegistryProps) {
  // Group candidates by position
  const groupedCandidates = candidates.reduce(
    (acc, candidate) => {
      if (!acc[candidate.position_title]) {
        acc[candidate.position_title] = [];
      }
      acc[candidate.position_title].push(candidate);
      return acc;
    },
    {} as Record<string, InstitutionalCandidate[]>,
  );

  if (candidates.length === 0) {
    return (
      <div className="border-2 border-dashed border-foreground/10 p-12 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          Registry Pending // No Approved Candidates
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(groupedCandidates).map(
        ([position, positionCandidates]) => (
          <section key={position} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3
                className={cn(
                  "text-xl font-black capitalize tracking-tighter",
                  archivo.className,
                )}
              >
                {position}
              </h3>

              <Badge
                variant="outline"
                className="rounded-none border-foreground/20 bg-transparent px-2 py-1 text-[10px] font-black text-muted-foreground"
              >
                {positionCandidates.length} registered
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positionCandidates.map((candidate) => (
                <Dialog key={candidate.candidate_id}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="group relative border-2 border-foreground/5 p-6 hover:border-foreground/20 hover:shadow-xs transition-all bg-white cursor-pointer text-left w-full"
                      aria-label={`View details of ${candidate.full_name}`}
                    >
                      <div className="flex gap-6 items-start">
                        <div className="relative">
                          {candidate.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={candidate.photo}
                              alt={candidate.full_name}
                              className="size-20 contrast-125 object-cover border-2 border-foreground"
                            />
                          ) : (
                            <div className="size-20 bg-muted flex items-center justify-center border-2 border-foreground">
                              <User className="size-8 text-foreground/20" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {candidate.partylist_acronym || "Independent"}
                            </p>
                            <h4
                              className={cn(
                                "text-xl font-black uppercase tracking-tight leading-none",
                                archivo.className,
                              )}
                            >
                              {candidate.full_name}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Decorative background acronym */}
                      <span className="absolute top-2 right-4 text-4xl font-black text-foreground/3 italic select-none">
                        {candidate.partylist_acronym || "IND"}
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold uppercase tracking-tight">
                        Candidate Profile
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4 text-left">
                      <div className="flex gap-4 items-start">
                        {candidate.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={candidate.photo}
                            alt={candidate.full_name}
                            className="size-20 object-cover border-2 border-foreground rounded"
                          />
                        ) : (
                          <div className="size-20 bg-muted flex items-center justify-center border-2 border-foreground rounded">
                            <User className="size-8 text-foreground/20" />
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {candidate.position_title}
                          </p>
                          <h4 className={cn("text-xl font-black uppercase tracking-tight", archivo.className)}>
                            {candidate.full_name}
                          </h4>
                          {candidate.course_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {candidate.course_acronym ? `[${candidate.course_acronym}] ` : ""}{candidate.course_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          Affiliation
                        </h5>
                        <p className="text-sm font-bold">
                          {candidate.partylist_name ? (
                            <>
                              {candidate.partylist_name} ({candidate.partylist_acronym})
                            </>
                          ) : (
                            "Independent Candidate"
                          )}
                        </p>
                      </div>

                      {candidate.partylist_platform && (
                        <div className="border-t pt-4 space-y-2">
                          <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Partylist Platform / Advocacy
                          </h5>
                          <p className="text-xs leading-relaxed text-foreground bg-muted/30 p-3 border rounded border-border whitespace-pre-wrap">
                            {candidate.partylist_platform}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
