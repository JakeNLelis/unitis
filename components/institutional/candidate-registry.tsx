import { archivo } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
                <div
                  key={candidate.candidate_id}
                  className="group relative border-2 border-foreground/5 p-6 hover:border-foreground/20 transition-all bg-white"
                >
                  <div className="flex gap-6 items-start">
                    <div className="relative">
                      {candidate.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={candidate.photo}
                          alt={candidate.full_name}
                          className="size-20 bg-muted grayscale contrast-125 object-cover border-2 border-foreground"
                        />
                      ) : (
                        <div className="size-20 bg-muted flex items-center justify-center border-2 border-foreground">
                          <User className="size-8 text-foreground/20" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-foreground text-background p-1">
                        <Shield className="size-3" />
                      </div>
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

                  {/* Decorative background number */}
                  <span className="absolute top-2 right-4 text-4xl font-black text-foreground/3 italic select-none">
                    {candidate.partylist_acronym
                      ? candidate.partylist_acronym
                      : "IND"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
