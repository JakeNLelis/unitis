"use client";

import { useMemo, useState } from "react";
import { registerPartylist } from "../actions";
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
import { Badge } from "@/components/ui/badge";
import type {
  CourseOption,
  PartylistRegistrationCandidateDraft,
  PartylistRegistrationPosition,
} from "@/lib/types/public";
import type { CandidacyFormData } from "@/lib/types/candidacy";
import { calculateAgeFromBirthDate } from "@/lib/utils";
import { Edit, Trash2, UserPlus, ShieldAlert } from "lucide-react";
import CandidateDialogWizard from "./candidate-dialog-wizard";
import createEmptyCandidate from "./create-empty-candidate";
import toInputDate from "./to-input-date";
import usePartylistPdf from "./use-partylist-pdf";

export function PartylistRegistrationForm({
  electionId,
  electionName,
  electionType,
  positions,
  courses,
  ownerCampus,
  ownerFacultyCode,
}: {
  electionId: string;
  electionName: string;
  electionType: string;
  positions: PartylistRegistrationPosition[];
  courses: CourseOption[];
  ownerCampus?: string | null;
  ownerFacultyCode?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { downloadState, pdfPayload, setPdfPayload } = usePartylistPdf();

  const requiredPositionIds = useMemo(
    () =>
      new Set(
        positions
          .filter((position) => position.required_for_partylist)
          .map((position) => position.position_id),
      ),
    [positions],
  );

  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const position of positions) {
      initial[position.position_id] = position.required_for_partylist;
    }
    return initial;
  });

  const [candidateMap, setCandidateMap] = useState<
    Record<string, PartylistRegistrationCandidateDraft[]>
  >(() => {
    const initial: Record<string, PartylistRegistrationCandidateDraft[]> = {};
    for (const position of positions) {
      initial[position.position_id] = [];
    }
    return initial;
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePositionId, setActivePositionId] = useState<string | null>(null);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState<number | null>(null);

  const [dialogInitialData, setDialogInitialData] = useState<PartylistRegistrationCandidateDraft>(createEmptyCandidate());
  const [dialogInitialAnswers, setDialogInitialAnswers] = useState({
    bonafide: null as boolean | null,
    failingGrades: null as boolean | null,
    amaranth: null as boolean | null,
    convicted: null as boolean | null,
  });

  const handleOpenAddDialog = (positionId: string) => {
    setActivePositionId(positionId);
    setActiveCandidateIndex(null);
    setDialogInitialAnswers({
      bonafide: null,
      failingGrades: null,
      amaranth: null,
      convicted: null,
    });
    setDialogInitialData({
      ...createEmptyCandidate(),
      position_id: positionId,
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (positionId: string, index: number) => {
    setActivePositionId(positionId);
    setActiveCandidateIndex(index);
    const existing = candidateMap[positionId]?.[index];
    setDialogInitialData(existing || {
      ...createEmptyCandidate(),
      position_id: positionId,
    });
    setDialogInitialAnswers({
      bonafide: true,
      failingGrades: existing?.has_two_failing_grades || false,
      amaranth: false,
      convicted: false,
    });
    setDialogOpen(true);
  };

  const handleRemoveCandidate = (positionId: string, index: number) => {
    const list = [...(candidateMap[positionId] || [])];
    list.splice(index, 1);
    setCandidateMap(prev => ({ ...prev, [positionId]: list }));
    if (list.length === 0) {
      setEnabledMap(prev => ({ ...prev, [positionId]: false }));
    }
  };

  const handleSaveCandidate = (finalCandidate: PartylistRegistrationCandidateDraft, answers: any) => {
    const candidateToSave = {
      ...finalCandidate,
      has_two_failing_grades: !!answers.failingGrades,
      bonafide: !!answers.bonafide,
      amaranth: !!answers.amaranth,
      convicted: !!answers.convicted,
    };
    
    setCandidateMap(prev => {
      const list = [...(prev[activePositionId!] || [])];
      if (activeCandidateIndex !== null) {
        list[activeCandidateIndex] = candidateToSave;
      } else {
        list.push(candidateToSave);
      }
      return { ...prev, [activePositionId!]: list };
    });
    setEnabledMap(prev => ({
      ...prev,
      [activePositionId!]: true,
    }));
    setDialogOpen(false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("election_id", electionId);

    const selectedCandidates: PartylistRegistrationCandidateDraft[] = [];

    for (const position of positions) {
      const candidates = candidateMap[position.position_id] || [];

      if (requiredPositionIds.has(position.position_id) && candidates.length === 0) {
        setError(`A candidate is required for ${position.title}.`);
        setLoading(false);
        return;
      }

      for (const candidate of candidates) {
        selectedCandidates.push(candidate);
      }
    }

    if (selectedCandidates.length === 0) {
      setError("Please encode at least one partylist candidate.");
      setLoading(false);
      return;
    }

    formData.set("candidate_slate", JSON.stringify(selectedCandidates));

    try {
      const result = await registerPartylist(formData);

      if ("error" in result) {
        setError(result.error || "Partylist registration failed.");
        setLoading(false);
        return;
      }

      const partylistName = String(formData.get("name") || "Partylist").trim();
      const managerName = String(formData.get("registered_by_name") || "").trim();
      const councilType = electionType === "Campus-Wide" ? "USSC" : "FSSC";

      const candidatesForPdf = selectedCandidates.map((candidate) => {
        const course = courses.find(
          (course) => course.course_id === candidate.course_id,
        );
        const position = positions.find(
          (item) => item.position_id === candidate.position_id,
        );

        const formDataPdf: CandidacyFormData = {
          councilType,
          photo: candidate.photo,
          candidacyType: "Political Party",
          partyName: partylistName,
          campaignManager: managerName,
          position: position?.title || "",
          fullName: candidate.full_name,
          age: calculateAgeFromBirthDate(candidate.birth_date),
          birthday: toInputDate(candidate.birth_date),
          studentId: candidate.student_id,
          currentAddress: candidate.current_address,
          permanentAddress: candidate.permanent_address,
          faculty: candidate.faculty,
          department: candidate.department,
          email: candidate.email,
          contactNumber: candidate.contact_number,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        };

        return {
          position: position?.title || "",
          fullName: candidate.full_name,
          degreeProgram: course
            ? course.acronym
              ? `${course.acronym} - ${course.name}`
              : course.name
            : "",
          formData: formDataPdf,
        };
      });

      setPdfPayload({
        electionName,
        partylistName,
        managerName,
        candidates: candidatesForPdf,
      });

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 bg-card overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-primary/60 w-full" />
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2 shadow-inner">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-3 max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Registration Submitted
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your partylist registration has been submitted successfully and is
              now pending review by the electoral board.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3 w-full max-w-sm">
            <Button
              className="w-full font-semibold shadow-sm"
              size="lg"
              variant="outline"
              disabled={downloadState === "generating"}
              onClick={() => {
                if (pdfPayload) {
                  setPdfPayload({ ...pdfPayload });
                }
              }}
            >
              {downloadState === "generating"
                ? "Generating PDF..."
                : "Re-download Registration PDF"}
            </Button>
            <Button
              className="w-full font-semibold shadow-sm"
              size="lg"
              onClick={() => window.location.reload()}
            >
              Register Another Partylist
            </Button>
            <Button
              variant="ghost"
              className="w-full mt-2 text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href={`/elections/${electionId}`}>Return to Election Page</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Partylist Registration
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Register your political party and submit your slate of candidates for
          the upcoming election.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20 font-medium shadow-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Representative Information</CardTitle>
          <CardDescription>Fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registered_by_name">Your Full Name *</Label>
              <Input
                id="registered_by_name"
                name="registered_by_name"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registered_by_email">Your Email *</Label>
              <Input
                id="registered_by_email"
                name="registered_by_email"
                type="email"
                placeholder="juan@vsu.edu.ph"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Partylist Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partylist Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. SAMAHAN Partylist"
                required
                autoComplete="off"
                className="h-14 border-2 border-foreground rounded-none text-xl font-bold placeholder:font-medium placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acronym">Acronym *</Label>
              <Input
                id="acronym"
                name="acronym"
                placeholder="UM"
                required
                className="uppercase"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform / Advocacy</Label>
            <Textarea
              id="platform"
              name="platform"
              placeholder="Describe your partylist's platform and advocacy..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Candidate Slate</CardTitle>
          <CardDescription>
            Add nominee candidates for each position slot. Required positions must be filled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {positions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No positions defined for this election yet.
            </p>
          ) : (
            <div className="space-y-4">
              {positions.map((position) => {
                const candidates = candidateMap[position.position_id] || [];
                const isRequired = requiredPositionIds.has(position.position_id);
                const maxVotes = position.max_votes || 1;
                const isFilled = candidates.length > 0;
                const canAddMore = candidates.length < maxVotes;

                return (
                  <div key={position.position_id} className="border border-border p-5 bg-card flex flex-col gap-4 transition-all hover:bg-muted/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground text-sm">{position.title}</h3>
                          {isRequired && (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-destructive border-destructive/30 bg-destructive/5 font-bold">
                              Required
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                            {candidates.length} / {maxVotes} Slot{maxVotes !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {isRequired && !isFilled && (
                          <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                            <ShieldAlert className="w-3 h-3" /> Minimum 1 candidate required
                          </p>
                        )}
                      </div>
                      
                      <Button
                        type="button"
                        size="sm"
                        variant={isRequired && !isFilled ? "default" : "outline"}
                        className="w-full sm:w-auto shadow-sm"
                        onClick={() => handleOpenAddDialog(position.position_id)}
                        disabled={!canAddMore}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Nominee
                      </Button>
                    </div>

                    {candidates.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {candidates.map((candidate, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-md border bg-background hover:border-primary/50 transition-colors group">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {candidate.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={candidate.photo} alt={candidate.full_name} className="w-12 h-12 rounded object-cover border shrink-0" />
                              ) : (
                                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0 border">
                                  <UserPlus className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold truncate" title={candidate.full_name}>{candidate.full_name}</p>
                                <p className="text-xs text-muted-foreground truncate" title={`${candidate.faculty} / ${candidate.department}`}>
                                  {candidate.faculty} / {candidate.department}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEditDialog(position.position_id, idx)}
                                title="Edit Nominee"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveCandidate(position.position_id, idx)}
                                title="Remove Nominee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6 border-t border-border">
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto h-12 px-8 font-bold text-base shadow-md"
          disabled={loading || downloadState === "generating"}
        >
          {loading || downloadState === "generating" ? "Processing..." : "Submit Partylist Registration"}
        </Button>
      </div>

      {dialogOpen && activePositionId && (
        <CandidateDialogWizard
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={dialogInitialData}
          initialScreeningAnswers={dialogInitialAnswers}
          courses={courses}
          positionTitle={positions.find(p => p.position_id === activePositionId)?.title || "this position"}
          electionType={electionType}
          ownerFacultyCode={ownerFacultyCode}
          onSave={handleSaveCandidate}
        />
      )}
    </form>
  );
}

export default PartylistRegistrationForm;
