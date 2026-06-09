"use client";

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { registerPartylist } from "../actions";
import PartylistRegistrationPDF from "./partylist-registration-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentIdInput } from "@/components/ui/student-id-input";
import { ContactNumberInput } from "@/components/ui/contact-number-input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PartylistRegistrationPDFProps,
  PartylistRegistrationPosition,
} from "@/lib/types/public";
import type { CandidacyFormData } from "@/lib/types/candidacy";
import { calculateAgeFromBirthDate } from "@/lib/utils";
import { Edit, Trash2, UserPlus, ShieldAlert, ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function toInputDate(value: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function createEmptyCandidate(): PartylistRegistrationCandidateDraft {
  return {
    position_id: "",
    course_id: "",
    full_name: "",
    student_id: "",
    email: "",
    age: "",
    birth_date: "",
    current_address: "",
    permanent_address: "",
    contact_number: "",
    photo: "",
    cog_link: "",
    cor_link: "",
    good_moral_link: "",
    faculty: "",
    department: "",
    has_two_failing_grades: false,
  };
}

// CandidateCard was replaced by the dialog wizard modal.

// @CodeScene(disable:"Large Method")
export function PartylistRegistrationForm({
  electionId,
  electionName,
  electionType,
  positions,
  courses,
}: {
  electionId: string;
  electionName: string;
  electionType: string;
  positions: PartylistRegistrationPosition[];
  courses: CourseOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadState, setDownloadState] = useState<
    "idle" | "generating" | "done" | "failed"
  >("idle");
  const [pdfPayload, setPdfPayload] =
    useState<PartylistRegistrationPDFProps | null>(null);

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
    Record<string, PartylistRegistrationCandidateDraft>
  >(() => {
    const initial: Record<string, PartylistRegistrationCandidateDraft> = {};
    for (const position of positions) {
      initial[position.position_id] = {
        ...createEmptyCandidate(),
        position_id: position.position_id,
      };
    }
    return initial;
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePositionId, setActivePositionId] = useState<string | null>(null);
  const [dialogStep, setDialogStep] = useState<'screening' | 'details'>('screening');
  const [dialogScreeningStep, setDialogScreeningStep] = useState(0);
  const [dialogScreeningAnswers, setDialogScreeningAnswers] = useState({
    bonafide: null as boolean | null,
    failingGrades: null as boolean | null,
    amaranth: null as boolean | null,
    convicted: null as boolean | null,
  });
  const [dialogScreeningPassed, setDialogScreeningPassed] = useState<boolean | null>(null);
  const [dialogCandidateData, setDialogCandidateData] = useState<PartylistRegistrationCandidateDraft>(createEmptyCandidate());
  const [dialogError, setDialogError] = useState<string | null>(null);

  const handleOpenAddDialog = (positionId: string) => {
    setActivePositionId(positionId);
    setDialogStep('screening');
    setDialogScreeningStep(0);
    setDialogScreeningAnswers({
      bonafide: null,
      failingGrades: null,
      amaranth: null,
      convicted: null,
    });
    setDialogScreeningPassed(null);
    setDialogCandidateData({
      ...createEmptyCandidate(),
      position_id: positionId,
    });
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (positionId: string) => {
    setActivePositionId(positionId);
    setDialogStep('screening');
    setDialogScreeningStep(0);
    setDialogScreeningPassed(null);
    const existing = candidateMap[positionId];
    setDialogCandidateData(existing || {
      ...createEmptyCandidate(),
      position_id: positionId,
    });
    setDialogScreeningAnswers({
      bonafide: true,
      failingGrades: existing?.has_two_failing_grades || false,
      amaranth: false,
      convicted: false,
    });
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleRemoveCandidate = (positionId: string) => {
    setCandidateMap(prev => ({
      ...prev,
      [positionId]: {
        ...createEmptyCandidate(),
        position_id: positionId,
      }
    }));
    setEnabledMap(prev => ({
      ...prev,
      [positionId]: false
    }));
  };

  const handleDialogScreeningAnswer = (field: 'bonafide' | 'failingGrades' | 'amaranth' | 'convicted', value: boolean) => {
    const updated = { ...dialogScreeningAnswers, [field]: value };
    setDialogScreeningAnswers(updated);

    if (field === 'bonafide' && value === false) {
      setDialogScreeningPassed(false);
      return;
    }
    if (field === 'amaranth' && value === true) {
      setDialogScreeningPassed(false);
      return;
    }
    if (field === 'convicted' && value === true) {
      setDialogScreeningPassed(false);
      return;
    }

    if (dialogScreeningStep < 3) {
      setDialogScreeningStep(prev => prev + 1);
    } else {
      setDialogScreeningPassed(true);
      setDialogStep('details');
    }
  };

  const handleDialogBack = () => {
    if (dialogScreeningStep > 0) {
      setDialogScreeningStep(prev => prev - 1);
    }
  };

  const handleSaveCandidate = () => {
    const position = positions.find(p => p.position_id === activePositionId);
    const positionTitle = position ? position.title : "this position";
    const validationError = validateCandidate(positionTitle, dialogCandidateData);
    
    if (validationError) {
      setDialogError(validationError);
      return;
    }
    
    const finalCandidate = {
      ...dialogCandidateData,
      has_two_failing_grades: !!dialogScreeningAnswers.failingGrades,
    };
    
    setCandidateMap(prev => ({
      ...prev,
      [activePositionId!]: finalCandidate,
    }));
    setEnabledMap(prev => ({
      ...prev,
      [activePositionId!]: true,
    }));
    setDialogOpen(false);
  };

  const handlePhotoUploadInDialog = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDialogCandidateData(prev => ({
        ...prev,
        photo: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    if (!pdfPayload) {
      return;
    }

    const payload = pdfPayload;

    let revokedUrl = "";

    async function generateAndDownload() {
      setDownloadState("generating");
      try {
        const blob = await pdf(
          <PartylistRegistrationPDF
            electionName={payload.electionName}
            partylistName={payload.partylistName}
            managerName={payload.managerName}
            candidates={payload.candidates}
          />,
        ).toBlob();

        const objectUrl = URL.createObjectURL(blob);
        revokedUrl = objectUrl;

        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `${payload.partylistName.replace(/\s+/g, "-").toLowerCase()}-partylist-registration.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        setDownloadState("done");
      } catch (downloadError) {
        console.error(downloadError);
        setDownloadState("failed");
      }
    }

    generateAndDownload();

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [pdfPayload]);



  function validateCandidate(
    positionTitle: string,
    candidate: PartylistRegistrationCandidateDraft,
  ) {
    if (
      !candidate.full_name ||
      !candidate.student_id ||
      !candidate.email ||
      !candidate.position_id ||
      !candidate.course_id ||
      !candidate.birth_date ||
      !candidate.current_address ||
      !candidate.permanent_address ||
      !candidate.contact_number ||
      !candidate.photo ||
      !candidate.cog_link ||
      !candidate.cor_link ||
      !candidate.good_moral_link
    ) {
      return `Candidate details are incomplete for ${positionTitle}.`;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) {
      return `Candidate email is invalid for ${positionTitle}.`;
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("election_id", electionId);

    const selectedCandidates: PartylistRegistrationCandidateDraft[] = [];

    for (const position of positions) {
      const enabled = enabledMap[position.position_id];
      const candidate = candidateMap[position.position_id];

      if (!enabled) {
        continue;
      }

      if (requiredPositionIds.has(position.position_id) && !enabled) {
        setError(`A candidate is required for ${position.title}.`);
        setLoading(false);
        return;
      }

      const candidateError = validateCandidate(position.title, candidate);
      if (candidateError) {
        setError(candidateError);
        setLoading(false);
        return;
      }

      selectedCandidates.push(candidate);
    }

    if (selectedCandidates.length === 0) {
      setError("Please encode at least one partylist candidate.");
      setLoading(false);
      return;
    }

    for (const requiredPositionId of requiredPositionIds) {
      if (!enabledMap[requiredPositionId]) {
        const requiredPosition = positions.find(
          (position) => position.position_id === requiredPositionId,
        );
        setError(
          `A candidate is required for ${requiredPosition?.title || "a required position"}.`,
        );
        setLoading(false);
        return;
      }
    }

    formData.set("candidate_slate", JSON.stringify(selectedCandidates));

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

      const formData: CandidacyFormData = {
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
        formData,
      };
    });

    setPdfPayload({
      electionName,
      partylistName,
      managerName,
      candidates: candidatesForPdf,
    });

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto size-12 rounded-full bg-green-600/10 flex items-center justify-center">
            <span className="text-lg font-bold text-green-600">&#10003;</span>
          </div>
          <h2 className="text-xl font-bold">Partylist registered</h2>
          <p className="text-muted-foreground">
            Your partylist has been successfully registered for{" "}
            <strong>{electionName}</strong>.
          </p>
          <Badge variant="secondary">Status: Active</Badge>
          <p className="text-sm text-muted-foreground">
            {downloadState === "generating" &&
              "Generating your registration PDF..."}
            {downloadState === "done" &&
              "PDF downloaded. Print and submit signed hard copies to the election board."}
            {downloadState === "failed" &&
              "PDF generation failed. Please reload this page and re-submit."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
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
                placeholder="Unity Movement"
                required
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
                const candidate = candidateMap[position.position_id];
                const isEnabled = enabledMap[position.position_id];
                const isRequired = requiredPositionIds.has(position.position_id);
                const hasCandidate = isEnabled && candidate && candidate.full_name;

                return (
                  <div key={position.position_id} className="border border-border p-5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-muted/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground text-sm">{position.title}</h3>
                        {isRequired && <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5">Required</Badge>}
                        {hasCandidate ? (
                          <Badge className="bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase tracking-wider h-5">Filled</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider h-5">Empty</Badge>
                        )}
                      </div>
                      {hasCandidate ? (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-semibold text-foreground text-sm">{candidate.full_name} ({candidate.student_id})</p>
                          <p className="text-muted-foreground">
                            Course: {courses.find(c => c.course_id === candidate.course_id)?.acronym || "N/A"} | Email: {candidate.email}
                          </p>
                          {candidate.has_two_failing_grades && (
                            <Badge variant="destructive" className="text-[9px] uppercase font-bold tracking-widest mt-1">
                              Flagged: Failing Grades
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {isRequired 
                            ? "This position requires a candidate slate nominee." 
                            : "Optional candidate position slot."}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasCandidate ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(position.position_id)}
                            className="cursor-pointer"
                          >
                            <Edit className="size-3.5 mr-1.5" />
                            Edit
                          </Button>
                          {!isRequired && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCandidate(position.position_id)}
                              className="cursor-pointer"
                            >
                              <Trash2 className="size-3.5 mr-1.5" />
                              Remove
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddDialog(position.position_id)}
                          className="border-2 border-foreground hover:bg-foreground hover:text-background font-black uppercase tracking-wider text-[11px] cursor-pointer h-9"
                        >
                          <UserPlus className="size-3.5 mr-1.5" />
                          Add Nominee
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tight font-black">
              {positions.find(p => p.position_id === activePositionId)?.title || "Candidate Details"}
            </DialogTitle>
          </DialogHeader>

          {dialogStep === 'screening' && (
            <div className="space-y-6 py-4">
              {dialogScreeningPassed === false ? (
                <div className="text-center space-y-4 border border-destructive/30 p-6 bg-destructive/5 rounded-md">
                  <div className="inline-flex items-center justify-center size-12 rounded-full bg-destructive/10 text-destructive mb-1">
                    <ShieldAlert className="size-6" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-destructive">Nominee Disqualified</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Based on the screening answers, this nominee does not meet the eligibility qualifications for candidacy.
                  </p>
                  <div className="bg-background border p-4 rounded text-left text-xs font-semibold text-foreground/80 space-y-2">
                    {dialogScreeningAnswers.bonafide === false && (
                      <p>• The nominee must be a bonafide undergraduate student of this campus.</p>
                    )}
                    {dialogScreeningAnswers.amaranth === true && (
                      <p>• The nominee must not be a staff member of the Amaranth Board.</p>
                    )}
                    {dialogScreeningAnswers.convicted === true && (
                      <p>• The nominee must not have been convicted of violations of University Rules and Regulations.</p>
                    )}
                  </div>
                  <Button type="button" onClick={() => setDialogOpen(false)} className="w-full">
                    Close Dialog
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Nominee Screening Questions</span>
                      <span>Question {dialogScreeningStep + 1} of 4</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-foreground h-full transition-all duration-300"
                        style={{ width: `${(dialogScreeningStep / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="min-h-[100px] flex flex-col justify-center space-y-2">
                    <h3 className="text-lg font-bold leading-snug">
                      {dialogScreeningStep === 0 && "Is the nominee a bonafide VSU undergraduate student of this campus?"}
                      {dialogScreeningStep === 1 && "Has the nominee incurred two (2) previous failing grades from the last semester?"}
                      {dialogScreeningStep === 2 && "Is the nominee currently a staff member of the Amaranth Board?"}
                      {dialogScreeningStep === 3 && "Has the nominee been convicted of any violations of the University Rules and Regulations?"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {dialogScreeningStep === 0 && "Requires student enrollment and registration verification."}
                      {dialogScreeningStep === 1 && "Note: Incuring failing grades flags the nominee but does not disqualify them."}
                      {dialogScreeningStep === 2 && "Amaranth Board staff members are ineligible to hold student council slots."}
                      {dialogScreeningStep === 3 && "Requires clean disciplinary record with the university."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogScreeningAnswer(
                        dialogScreeningStep === 0 ? 'bonafide' :
                        dialogScreeningStep === 1 ? 'failingGrades' :
                        dialogScreeningStep === 2 ? 'amaranth' : 'convicted',
                        true
                      )}
                      className="h-14 font-black uppercase text-xs tracking-wider border-2"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogScreeningAnswer(
                        dialogScreeningStep === 0 ? 'bonafide' :
                        dialogScreeningStep === 1 ? 'failingGrades' :
                        dialogScreeningStep === 2 ? 'amaranth' : 'convicted',
                        false
                      )}
                      className="h-14 font-black uppercase text-xs tracking-wider border-2"
                    >
                      No
                    </Button>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t text-xs">
                    {dialogScreeningStep > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDialogBack}
                        className="font-bold uppercase tracking-wider text-xs"
                      >
                        <ChevronLeft className="size-4 mr-1" /> Back
                      </Button>
                    ) : <span />}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDialogOpen(false)}
                      className="font-bold uppercase tracking-wider text-xs text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {dialogStep === 'details' && (
            <div className="space-y-4 py-2">
              {dialogError && (
                <div className="bg-destructive/10 text-destructive text-xs p-3 rounded border border-destructive/20 font-medium">
                  {dialogError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Full Name *</Label>
                  <Input
                    value={dialogCandidateData.full_name}
                    onChange={(event) =>
                      setDialogCandidateData(prev => ({ ...prev, full_name: event.target.value }))
                    }
                    placeholder="Last Name, First Name, Middle Name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Student ID *</Label>
                  <StudentIdInput
                    value={dialogCandidateData.student_id}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setDialogCandidateData(prev => ({ ...prev, student_id: event.target.value }))
                    }
                    placeholder="23-1-01457"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Email *</Label>
                  <Input
                    type="email"
                    value={dialogCandidateData.email}
                    onChange={(event) =>
                      setDialogCandidateData(prev => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="candidate@vsu.edu.ph"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Contact Number *</Label>
                  <ContactNumberInput
                    value={dialogCandidateData.contact_number}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setDialogCandidateData(prev => ({ ...prev, contact_number: event.target.value }))
                    }
                    placeholder="09XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs font-bold uppercase">Date of Birth *</Label>
                  <Input
                    type="date"
                    value={dialogCandidateData.birth_date}
                    onChange={(event) =>
                      setDialogCandidateData(prev => ({
                        ...prev,
                        birth_date: event.target.value,
                        age: calculateAgeFromBirthDate(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Age (Auto-computed)</Label>
                  <Input 
                    value={calculateAgeFromBirthDate(dialogCandidateData.birth_date) || ""} 
                    readOnly 
                    className="bg-muted/60" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Course / Degree Program *</Label>
                <Select
                  value={dialogCandidateData.course_id}
                  onValueChange={(value) => {
                    const selected = courses.find((course) => course.course_id === value);
                    setDialogCandidateData(prev => ({
                      ...prev,
                      course_id: value,
                      faculty: selected?.faculty_name || "",
                      department: selected?.department_name || "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.course_id} value={course.course_id}>
                        {course.acronym
                          ? `${course.acronym} - ${course.name}`
                          : course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {dialogCandidateData.course_id && (
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {dialogCandidateData.faculty} / {dialogCandidateData.department}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Current Address *</Label>
                <Input
                  value={dialogCandidateData.current_address}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({ ...prev, current_address: event.target.value }))
                  }
                  placeholder="Current address"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Permanent Address *</Label>
                <Input
                  value={dialogCandidateData.permanent_address}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({ ...prev, permanent_address: event.target.value }))
                  }
                  placeholder="Permanent address"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">1x1 Photo *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUploadInDialog}
                  className="cursor-pointer border border-input bg-background file:border-r file:border-input file:bg-muted file:px-3 file:mr-3 hover:bg-muted/10 transition-all text-xs"
                />
                {dialogCandidateData.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dialogCandidateData.photo}
                    alt="Nominee preview"
                    className="w-12 h-12 rounded object-cover border mt-1"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">COG Link *</Label>
                  <Input
                    value={dialogCandidateData.cog_link}
                    onChange={(event) =>
                      setDialogCandidateData(prev => ({ ...prev, cog_link: event.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">COR Link *</Label>
                  <Input
                    value={dialogCandidateData.cor_link}
                    onChange={(event) =>
                      setDialogCandidateData(prev => ({ ...prev, cor_link: event.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Good Moral Link *</Label>
                  <Input
                    value={dialogCandidateData.good_moral_link}
                    onChange={(event) =>
                      setDialogCandidateData(prev => ({ ...prev, good_moral_link: event.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveCandidate}>
                  Save Nominee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Registering..." : "Register Partylist"}
      </Button>
    </form>
  );
}
