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

export function ApplicationForm({
  electionId,
  electionName,
  electionType,
  positions,
  courses,
}: ApplicationFormProps) {
  const defaultCouncil: CouncilType =
    electionType === "University-Wide" ? "USSC" : "FSSC";

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
  const [downloadState, setDownloadState] = useState<
    "idle" | "generating" | "done" | "failed"
  >("idle");

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
      setDownloadState("generating");
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
      update("photo", reader.result as string);
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

    const result = await submitCandidacyApplication(fd);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setPdfPayload(formData);
    setLoading(false);
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
