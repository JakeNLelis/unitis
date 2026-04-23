"use client";

import { useCallback, useEffect, useState } from "react";
import { submitCandidacyApplication } from "./actions";
import { CandidacyFormData, CouncilType, CandidacyType } from "./types";
import type { ApplicationFormProps } from "@/lib/types/public";
import {
  ApplicationFormLayout,
  ApplicationSuccessCard,
} from "@/app/_helpers/elections/application-form";

export function ApplicationForm({
  electionId,
  electionName,
  electionType,
  positions,
  courses,
  partylists,
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
  const [partylistId, setPartylistId] = useState("independent");
  const [cogLink, setCogLink] = useState("");
  const [corLink, setCorLink] = useState("");
  const [goodMoralLink, setGoodMoralLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debouncedPreviewData, setDebouncedPreviewData] =
    useState<CandidacyFormData>(formData);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedPreviewData(formData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const update = useCallback(
    (field: keyof CandidacyFormData, value: string) => {
      setFormData((previous) => ({ ...previous, [field]: value }));
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

  const handlePartylistChange = (selectedPartylistId: string) => {
    setPartylistId(selectedPartylistId);
    if (selectedPartylistId === "independent") {
      setFormData((previous) => ({
        ...previous,
        candidacyType: "Independent" as CandidacyType,
        partyName: "",
      }));
      return;
    }

    const selectedPartylist = partylists.find(
      (partylist) => partylist.partylist_id === selectedPartylistId,
    );
    setFormData((previous) => ({
      ...previous,
      candidacyType: "Political Party" as CandidacyType,
      partyName: selectedPartylist
        ? `${selectedPartylist.acronym} — ${selectedPartylist.name}`
        : "",
    }));
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
      !formData.age.trim() ||
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

    if (
      formData.candidacyType === "Political Party" &&
      !formData.campaignManager.trim()
    ) {
      setError("Please enter the campaign manager name for your party.");
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
    fd.set("age", formData.age);
    fd.set("birth_date", formData.birthday);
    fd.set("current_address", formData.currentAddress);
    fd.set("permanent_address", formData.permanentAddress);
    fd.set("faculty", formData.faculty);
    fd.set("department", formData.department);
    fd.set("contact_number", formData.contactNumber);
    fd.set("photo", formData.photo);
    fd.set("campaign_manager", formData.campaignManager);
    fd.set("partylist_id", partylistId);
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
    setLoading(false);
  }

  if (success) {
    return (
      <ApplicationSuccessCard
        electionId={electionId}
        electionName={electionName}
        previewData={debouncedPreviewData}
      />
    );
  }

  return (
    <ApplicationFormLayout
      electionId={electionId}
      electionName={electionName}
      electionType={electionType}
      positions={positions}
      courses={courses}
      partylists={partylists}
      formData={formData}
      positionId={positionId}
      courseId={courseId}
      partylistId={partylistId}
      cogLink={cogLink}
      corLink={corLink}
      goodMoralLink={goodMoralLink}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      onPhotoUpload={handlePhotoUpload}
      onUpdate={update}
      onPositionChange={handlePositionChange}
      onPartylistChange={handlePartylistChange}
      onCourseChange={handleCourseChange}
      onRemovePhoto={() => update("photo", "")}
      setCogLink={setCogLink}
      setCorLink={setCorLink}
      setGoodMoralLink={setGoodMoralLink}
    />
  );
}
