"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, User } from "lucide-react";
import type { CandidateWithDetails } from "@/lib/types/election";

export function CandidateDetailDialog({
  candidate,
  children,
}: {
  candidate: CandidateWithDetails;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-tight">
            Candidate Application Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Header Profile Summary */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-border">
            <div className="shrink-0">
              {candidate.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={candidate.photo}
                  alt={candidate.full_name}
                  className="size-24 object-cover border-2 border-foreground rounded"
                />
              ) : (
                <div className="size-24 bg-muted flex items-center justify-center border-2 border-foreground rounded">
                  <User className="size-10 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                  {candidate.full_name}
                </h3>
                <p className="text-sm font-mono text-muted-foreground">
                  {candidate.student_id}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge variant="outline" className="text-xs uppercase">
                  {candidate.positions?.title || "No Position"}
                </Badge>
                <Badge variant="secondary" className="text-xs uppercase">
                  {candidate.partylists?.acronym || "Independent"}
                </Badge>
                <Badge
                  className={
                    candidate.application_status === "approved"
                      ? "bg-green-600 text-white"
                      : candidate.application_status === "rejected"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-amber-500 text-white"
                  }
                >
                  {candidate.application_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Detailed Data Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Email Address
                </h4>
                <p className="text-sm font-semibold">{candidate.email}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Academic Course
                </h4>
                <p className="text-sm font-semibold">
                  {candidate.courses?.acronym
                    ? `${candidate.courses.acronym} — ${candidate.courses.name}`
                    : candidate.courses?.name || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Age
                  </h4>
                  <p className="text-sm font-semibold">{candidate.age || "—"}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Date of Birth
                  </h4>
                  <p className="text-sm font-semibold">
                    {candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Current Address
                </h4>
                <p className="text-sm font-medium">{candidate.current_address || "—"}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Permanent Address
                </h4>
                <p className="text-sm font-medium">{candidate.permanent_address || "—"}</p>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="pt-4 border-t border-border space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Submitted Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {candidate.cog_link ? (
                <a
                  href={candidate.cog_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border bg-muted/40 hover:bg-muted/80 hover:text-primary transition-all rounded text-sm font-bold uppercase tracking-wide"
                >
                  <span>Certificate of Grades</span>
                  <ExternalLink className="size-4" />
                </a>
              ) : (
                <div className="p-3 border border-dashed border-border text-center text-xs text-muted-foreground italic rounded">
                  COG Missing
                </div>
              )}

              {candidate.cor_link ? (
                <a
                  href={candidate.cor_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border bg-muted/40 hover:bg-muted/80 hover:text-primary transition-all rounded text-sm font-bold uppercase tracking-wide"
                >
                  <span>Registration Form</span>
                  <ExternalLink className="size-4" />
                </a>
              ) : (
                <div className="p-3 border border-dashed border-border text-center text-xs text-muted-foreground italic rounded">
                  COR Missing
                </div>
              )}

              {candidate.good_moral_link ? (
                <a
                  href={candidate.good_moral_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border bg-muted/40 hover:bg-muted/80 hover:text-primary transition-all rounded text-sm font-bold uppercase tracking-wide"
                >
                  <span>Good Moral Character</span>
                  <ExternalLink className="size-4" />
                </a>
              ) : (
                <div className="p-3 border border-dashed border-border text-center text-xs text-muted-foreground italic rounded">
                  Good Moral Missing
                </div>
              )}
            </div>
          </div>

          {/* Audit Details */}
          {(candidate.approved_by_display || candidate.rejection_reason) && (
            <div className="pt-4 border-t border-border bg-muted/20 p-4 rounded space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Audit Trail Log
              </h4>
              {candidate.approved_by_display && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Processed By:</span>{" "}
                  {candidate.approved_by_display} ({candidate.approved_by_role})
                  {candidate.approved_at && (
                    <>
                      {" "}
                      on <span className="font-semibold text-foreground">{new Date(candidate.approved_at).toLocaleString()}</span>
                    </>
                  )}
                </div>
              )}
              {candidate.rejection_reason && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded">
                  <p className="font-semibold uppercase tracking-wide text-[10px] mb-1">
                    Rejection Reason
                  </p>
                  <p className="font-medium">{candidate.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
