"use client";

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { registerPartylist } from "../actions";
import PartylistRegistrationPDF from "./partylist-registration-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  };
}

function CandidateCard({
  position,
  required,
  candidate,
  enabled,
  courses,
  onEnabledChange,
  onCandidateChange,
  onPhotoUpload,
}: {
  position: PartylistRegistrationPosition;
  required: boolean;
  candidate: PartylistRegistrationCandidateDraft;
  enabled: boolean;
  courses: CourseOption[];
  onEnabledChange: (next: boolean) => void;
  onCandidateChange: (
    key: keyof PartylistRegistrationCandidateDraft,
    value: string,
  ) => void;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const selectedCourse = courses.find(
    (course) => course.course_id === candidate.course_id,
  );
  const derivedAge = calculateAgeFromBirthDate(candidate.birth_date);

  return (
    <Card className={enabled ? "" : "opacity-70"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base">{position.title}</CardTitle>
          <div className="flex items-center gap-2">
            {required && <Badge variant="outline">Required</Badge>}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={enabled}
                disabled={required}
                onCheckedChange={(value) => onEnabledChange(value === true)}
                id={`include-${position.position_id}`}
              />
              <Label
                htmlFor={`include-${position.position_id}`}
                className="text-sm"
              >
                Include candidate
              </Label>
            </div>
          </div>
        </div>
        <CardDescription>
          {required
            ? "This position must have a candidate before registration."
            : "Optional slot. Include only if your partylist has a nominee."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={candidate.full_name}
                  onChange={(event) =>
                    onCandidateChange("full_name", event.target.value)
                  }
                  placeholder="Last Name, First Name, Middle Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Student ID *</Label>
                <Input
                  value={candidate.student_id}
                  onChange={(event) =>
                    onCandidateChange("student_id", event.target.value)
                  }
                  placeholder="23-1-01457"
                  pattern="^\\d{2}-\\d-\\d{5}$"
                  title="Use format xx-x-xxxxx, e.g. 23-1-01457"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={candidate.email}
                  onChange={(event) =>
                    onCandidateChange("email", event.target.value)
                  }
                  placeholder="candidate@vsu.edu.ph"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number *</Label>
                <Input
                  value={candidate.contact_number}
                  onChange={(event) =>
                    onCandidateChange("contact_number", event.target.value)
                  }
                  placeholder="09XXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={candidate.birth_date}
                  onChange={(event) =>
                    onCandidateChange("birth_date", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Age (Auto-computed)</Label>
                <Input value={derivedAge} readOnly className="bg-muted/60" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course / Degree Program *</Label>
              <Select
                value={candidate.course_id}
                onValueChange={(value) => {
                  onCandidateChange("course_id", value);
                  const selected = courses.find(
                    (course) => course.course_id === value,
                  );
                  onCandidateChange("faculty", selected?.faculty_name || "");
                  onCandidateChange(
                    "department",
                    selected?.department_name || "",
                  );
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
              {selectedCourse && (
                <p className="text-xs text-muted-foreground">
                  {selectedCourse.faculty_name} /{" "}
                  {selectedCourse.department_name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Current Address *</Label>
              <Input
                value={candidate.current_address}
                onChange={(event) =>
                  onCandidateChange("current_address", event.target.value)
                }
                placeholder="Current address"
              />
            </div>

            <div className="space-y-2">
              <Label>Permanent Address *</Label>
              <Input
                value={candidate.permanent_address}
                onChange={(event) =>
                  onCandidateChange("permanent_address", event.target.value)
                }
                placeholder="Permanent address"
              />
            </div>

            <div className="space-y-2">
              <Label>1x1 Photo *</Label>
              <Input type="file" accept="image/*" onChange={onPhotoUpload} />
              {candidate.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={candidate.photo}
                  alt={`${position.title} candidate preview`}
                  className="w-16 h-16 rounded object-cover border"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>COG Link *</Label>
                <Input
                  value={candidate.cog_link}
                  onChange={(event) =>
                    onCandidateChange("cog_link", event.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>COR Link *</Label>
                <Input
                  value={candidate.cor_link}
                  onChange={(event) =>
                    onCandidateChange("cor_link", event.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Good Moral Link *</Label>
                <Input
                  value={candidate.good_moral_link}
                  onChange={(event) =>
                    onCandidateChange("good_moral_link", event.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Candidate entry for this position is currently skipped.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

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

  function updateCandidate(
    positionId: string,
    key: keyof PartylistRegistrationCandidateDraft,
    value: string,
  ) {
    setCandidateMap((previous) => ({
      ...previous,
      [positionId]: {
        ...previous[positionId],
        [key]: value,
      },
    }));
  }

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
    const councilType = electionType === "University-Wide" ? "USSC" : "FSSC";

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
            Fill candidate details per position. Required positions must always
            be filled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {positions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No positions defined for this election yet.
            </p>
          ) : (
            <div className="space-y-4">
              {positions.map((position) => (
                <CandidateCard
                  key={position.position_id}
                  position={position}
                  required={requiredPositionIds.has(position.position_id)}
                  enabled={enabledMap[position.position_id]}
                  candidate={candidateMap[position.position_id]}
                  courses={courses}
                  onEnabledChange={(next) => {
                    if (requiredPositionIds.has(position.position_id)) {
                      return;
                    }
                    setEnabledMap((previous) => ({
                      ...previous,
                      [position.position_id]: next,
                    }));
                  }}
                  onCandidateChange={(key, value) =>
                    updateCandidate(position.position_id, key, value)
                  }
                  onPhotoUpload={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateCandidate(
                        position.position_id,
                        "photo",
                        String(reader.result || ""),
                      );
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Registering..." : "Register Partylist"}
      </Button>
    </form>
  );
}
