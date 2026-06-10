"use client";

import { useCallback, useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { submitCandidacyApplication } from "./actions";
import { CandidacyFormData, CouncilType } from "./types";
import type { ApplicationFormProps } from "@/lib/types/public";
import CandidacyPDF from "./candidacy-pdf";
import {
  ApplicationFormLayout,
  ApplicationSuccessCard,
} from "@/app/_helpers/elections/application-form";
import { calculateAgeFromBirthDate } from "@/lib/utils";
import { ChevronLeft, ArrowRight, ShieldAlert } from "lucide-react";

export function ApplicationForm({
  electionId,
  electionName,
  electionType,
  positions,
  courses,
  ownerCampus,
  ownerFacultyCode,
}: ApplicationFormProps) {
  const defaultCouncil: CouncilType =
    electionType === "Campus-Wide" ? "USSC" : "FSSC";

  const [screeningStep, setScreeningStep] = useState(0);
  const [screeningAnswers, setScreeningAnswers] = useState({
    bonafide: null as boolean | null,
    failingGrades: null as boolean | null,
    amaranth: null as boolean | null,
    convicted: null as boolean | null,
  });
  const [screeningPassed, setScreeningPassed] = useState<boolean | null>(null);

  const handleAnswer = (field: 'bonafide' | 'failingGrades' | 'amaranth' | 'convicted', value: boolean) => {
    const updated = { ...screeningAnswers, [field]: value };
    setScreeningAnswers(updated);

    if (field === 'bonafide' && value === false) {
      setScreeningPassed(false);
      return;
    }
    if (field === 'amaranth' && value === true) {
      setScreeningPassed(false);
      return;
    }
    if (field === 'convicted' && value === true) {
      setScreeningPassed(false);
      return;
    }

    if (screeningStep < 3) {
      setScreeningStep(prev => prev + 1);
    } else {
      setScreeningPassed(true);
    }
  };

  const handleBack = () => {
    if (screeningStep > 0) {
      setScreeningStep(prev => prev - 1);
    }
  };

  const [formData, setFormData] = useState<CandidacyFormData>({
    councilType: defaultCouncil,
    photo: "",
    candidacyType: "Independent",
    partyName: "",
    campaignManager: "",
    position: "",
    fullName: "",
    age: "",
    birthday: "",
    studentId: "",
    currentAddress: "",
    permanentAddress: "",
    faculty: "",
    department: "",
    email: "",
    contactNumber: "",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });

  const [positionId, setPositionId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [cogLink, setCogLink] = useState("");
  const [corLink, setCorLink] = useState("");
  const [goodMoralLink, setGoodMoralLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfPayload, setPdfPayload] = useState<CandidacyFormData | null>(null);


  useEffect(() => {
    setFormData((previous) => ({
      ...previous,
      councilType: defaultCouncil,
    }));
  }, [defaultCouncil]);

  useEffect(() => {
    if (!pdfPayload) {
      return;
    }

    const payload = pdfPayload;
    let revokedUrl = "";

    async function generateAndDownload() {
      try {
        const blob = await pdf(<CandidacyPDF data={payload} />).toBlob();

        const objectUrl = URL.createObjectURL(blob);
        revokedUrl = objectUrl;

        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `candidacy-application-${payload.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

      } catch (downloadError) {
        console.error(downloadError);
      }
    }

    generateAndDownload();

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [pdfPayload]);

  const update = useCallback(
    (field: keyof CandidacyFormData, value: string) => {
      setFormData((previous) => {
        if (field === "birthday") {
          return {
            ...previous,
            birthday: value,
            age: calculateAgeFromBirthDate(value),
          };
        }

        return { ...previous, [field]: value };
      });
    },
    [],
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIMENSION = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          update("photo", compressedBase64);
        } else {
          update("photo", String(reader.result || ""));
        }
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handlePositionChange = (selectedPositionId: string) => {
    setPositionId(selectedPositionId);
    const selectedPosition = positions.find(
      (position) => position.position_id === selectedPositionId,
    );
    if (selectedPosition) {
      update("position", selectedPosition.title);
    }
  };

  const handleCourseChange = (selectedCourseId: string) => {
    setCourseId(selectedCourseId);
    const selectedCourse = courses.find(
      (course) => course.course_id === selectedCourseId,
    );
    if (selectedCourse) {
      setFormData((previous) => ({
        ...previous,
        faculty: selectedCourse.faculty_name,
        department: selectedCourse.department_name,
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (
      !formData.fullName.trim() ||
      !formData.studentId.trim() ||
      !formData.email.trim() ||
      !formData.birthday.trim() ||
      !formData.currentAddress.trim() ||
      !formData.permanentAddress.trim() ||
      !formData.faculty.trim() ||
      !formData.department.trim() ||
      !formData.contactNumber.trim() ||
      !formData.photo
    ) {
      setError("Please fill in all required fields and upload your 1x1 photo.");
      return;
    }

    const computedAge = calculateAgeFromBirthDate(formData.birthday);
    if (!computedAge) {
      setError("Please provide a valid birthday.");
      return;
    }

    if (!positionId) {
      setError("Please select a position.");
      return;
    }

    if (!courseId) {
      setError("Please select your course / program.");
      return;
    }

    if (electionType === "Faculty-Wide" && ownerFacultyCode) {
      const selectedCourse = courses.find((c) => c.course_id === courseId);
      if (selectedCourse && selectedCourse.faculty_acronym !== ownerFacultyCode) {
        const ownerCourse = courses.find((c) => c.faculty_acronym === ownerFacultyCode);
        const ownerFacultyName = ownerCourse ? ownerCourse.faculty_name : ownerFacultyCode;
        setError(
          `You belong to ${selectedCourse.faculty_name}, which is not eligible for this ${ownerFacultyName} faculty-wide election.`,
        );
        return;
      }
    }

    if (!cogLink.trim() || !corLink.trim() || !goodMoralLink.trim()) {
      setError("Please provide all document links (COG, COR, Good Moral).");
      return;
    }

    setLoading(true);

    const fd = new FormData();
    fd.set("election_id", electionId);
    fd.set("position_id", positionId);
    fd.set("course_id", courseId);
    fd.set("full_name", formData.fullName);
    fd.set("student_id", formData.studentId);
    fd.set("email", formData.email);
    fd.set("age", computedAge);
    fd.set("birth_date", formData.birthday);
    fd.set("current_address", formData.currentAddress);
    fd.set("permanent_address", formData.permanentAddress);
    fd.set("faculty", formData.faculty);
    fd.set("department", formData.department);
    fd.set("contact_number", formData.contactNumber);
    fd.set("photo", formData.photo);
    fd.set("campaign_manager", "");
    fd.set("partylist_id", "independent");
    fd.set("cog_link", cogLink);
    fd.set("cor_link", corLink);
    fd.set("good_moral_link", goodMoralLink);
    fd.set("has_two_failing_grades", screeningAnswers.failingGrades ? "true" : "false");
    fd.set("bonafide", screeningAnswers.bonafide ? "true" : "false");
    fd.set("amaranth", screeningAnswers.amaranth ? "true" : "false");
    fd.set("convicted", screeningAnswers.convicted ? "true" : "false");

    try {
      const result = await submitCandidacyApplication(fd);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Application submission error:", err);
      setError("The uploaded images are way too big. Even after compression, the total size exceeds the server's 4.5MB limit. Please upload a smaller image.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setPdfPayload(formData);
    setLoading(false);
  }

  if (screeningPassed === false) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-card text-card-foreground border-2 border-destructive/50 rounded-lg p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-destructive/10 text-destructive mb-2">
            <ShieldAlert className="size-10" />
          </div>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-destructive">
            Application Rejected
          </h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            We regret to inform you that you do not meet the minimum eligibility requirements to run for office in this election.
          </p>
          
          <div className="bg-muted/50 p-5 rounded-md border border-border/60 text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason(s) for Ineligibility:</h4>
            <ul className="text-xs font-medium space-y-2 list-disc pl-4 text-foreground/80">
              {screeningAnswers.bonafide === false && (
                <li>You must be a bonafide VSU undergraduate student of the {ownerCampus || "designated"} campus.</li>
              )}
              {screeningAnswers.amaranth === true && (
                <li>Active staff members of the Amaranth Board are disqualified from filing candidacy.</li>
              )}
              {screeningAnswers.convicted === true && (
                <li>Candidates must not have been convicted of any violations of the University Rules and Regulations.</li>
              )}
            </ul>
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              onClick={() => window.location.href = `/elections/${electionId}`}
              className="w-full inline-flex items-center justify-center bg-foreground text-background font-bold uppercase tracking-wider py-4 hover:bg-foreground/90 transition-all rounded-none h-14 cursor-pointer"
            >
              Return to Election Page
              <ArrowRight className="size-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screeningPassed === null) {
    const questions = [
      {
        id: "bonafide",
        title: `Are you a bonafide VSU undergraduate student of the ${ownerCampus || "designated"} Campus?`,
        description: "Requires verifying student registration details and campus location.",
      },
      {
        id: "failingGrades",
        title: "Have you incurred two (2) previous failing grades from the last semester?",
        description: "Note: Incurring failing grades will flag the application but does not automatically disqualify you.",
      },
      {
        id: "amaranth",
        title: "Are you currently a staff member of the Amaranth Board?",
        description: "Amaranth Board staff members are ineligible to hold student council positions.",
      },
      {
        id: "convicted",
        title: "Have you been convicted of any violations of the University Rules and Regulations?",
        description: "Candidacy requires a clean disciplinary record with no major rules violations.",
      },
    ];

    const currentQuestion = questions[screeningStep];
    const progressPercent = (screeningStep / 4) * 100;

    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="bg-card text-card-foreground border-2 border-foreground rounded-none p-8 shadow-2xl space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
              <span>Eligibility Screening</span>
              <span>Question {screeningStep + 1} of 4</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div 
                className="bg-foreground h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
              {currentQuestion.title}
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              {currentQuestion.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleAnswer(currentQuestion.id as keyof typeof screeningAnswers, true)}
              className="group flex flex-col items-center justify-center p-6 border-2 border-foreground bg-card hover:bg-foreground hover:text-background transition-all duration-200 cursor-pointer animate-fade-in"
            >
              <span className="text-lg font-black uppercase tracking-widest">Yes</span>
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(currentQuestion.id as keyof typeof screeningAnswers, false)}
              className="group flex flex-col items-center justify-center p-6 border-2 border-foreground bg-card hover:bg-foreground hover:text-background transition-all duration-200 cursor-pointer animate-fade-in"
            >
              <span className="text-lg font-black uppercase tracking-widest">No</span>
            </button>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            {screeningStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center text-sm font-bold uppercase tracking-widest hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4 mr-2" />
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => window.location.href = `/elections/${electionId}`}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel filing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <ApplicationSuccessCard
        electionId={electionId}
        electionName={electionName}
      />
    );
  }

  return (
    <ApplicationFormLayout
      electionType={electionType}
      positions={positions}
      courses={courses}
      formData={formData}
      positionId={positionId}
      courseId={courseId}
      cogLink={cogLink}
      corLink={corLink}
      goodMoralLink={goodMoralLink}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      onPhotoUpload={handlePhotoUpload}
      onUpdate={update}
      onPositionChange={handlePositionChange}
      onCourseChange={handleCourseChange}
      onRemovePhoto={() => update("photo", "")}
      setCogLink={setCogLink}
      setCorLink={setCorLink}
      setGoodMoralLink={setGoodMoralLink}
    />
  );
}
