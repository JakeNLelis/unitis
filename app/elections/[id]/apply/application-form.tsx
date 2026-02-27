"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { submitCandidacyApplication } from "./actions";
import { CandidacyFormData, CouncilType, CandidacyType } from "./types";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Dynamically import PDFPreview to avoid SSR issues
const PDFPreview = dynamic(() => import("./pdf-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
      <p className="text-muted-foreground text-sm">Loading PDF preview...</p>
    </div>
  ),
});

interface Position {
  position_id: string;
  title: string;
}

interface Course {
  course_id: string;
  name: string;
  acronym: string | null;
}

interface Partylist {
  partylist_id: string;
  name: string;
  acronym: string;
}

export function ApplicationForm({
  electionId,
  electionName,
  electionType,
  positions,
  courses,
  partylists,
}: {
  electionId: string;
  electionName: string;
  electionType: string;
  positions: Position[];
  courses: Course[];
  partylists: Partylist[];
}) {
  // Determine default council type from election type
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

  // DB-specific fields (not shown in PDF)
  const [positionId, setPositionId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [partylistId, setPartylistId] = useState("independent");
  const [cogLink, setCogLink] = useState("");
  const [corLink, setCorLink] = useState("");
  const [goodMoralLink, setGoodMoralLink] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const update = useCallback(
    (field: keyof CandidacyFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handlePositionChange = (pid: string) => {
    setPositionId(pid);
    const pos = positions.find((p) => p.position_id === pid);
    if (pos) {
      update("position", pos.title);
    }
  };

  const handlePartylistChange = (pid: string) => {
    setPartylistId(pid);
    if (pid === "independent") {
      setFormData((prev) => ({
        ...prev,
        candidacyType: "Independent" as CandidacyType,
        partyName: "",
      }));
    } else {
      const pl = partylists.find((p) => p.partylist_id === pid);
      setFormData((prev) => ({
        ...prev,
        candidacyType: "Political Party" as CandidacyType,
        partyName: pl ? `${pl.acronym} — ${pl.name}` : "",
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Validate all required fields
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
    } else {
      setSuccess(true);
      if (result.credentials) {
        setCredentials(result.credentials);
      }
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-bold">Application Submitted!</h2>
            <p className="text-muted-foreground">
              Your candidacy application for <strong>{electionName}</strong> has
              been submitted successfully. The election officers will review
              your application.
            </p>
            <p className="text-sm text-muted-foreground">
              Please download and print the PDF form, sign it with a blue pen,
              and submit the hard copy to the USEB Officers.
            </p>
            <Badge variant="secondary">Status: Pending Review</Badge>
          </CardContent>
        </Card>

        {/* PDF for download/print after submission */}
        <div className="h-[70vh] min-h-[500px]">
          <PDFPreview data={formData} />
        </div>

        {credentials && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg">Your Login Credentials</CardTitle>
              <CardDescription>
                An account has been created for you. Save these credentials —
                you&apos;ll use them to log in and track your application
                status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted rounded-md p-4 space-y-2 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-semibold">{credentials.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Password: </span>
                  <span className="font-semibold">{credentials.password}</span>
                </div>
              </div>
              <div className="bg-accent border border-primary/20 rounded-md p-3 text-sm text-foreground">
                <strong>Important:</strong> Please write down or screenshot
                these credentials. You will not be able to see the password
                again.
              </div>
              <Button asChild className="w-full">
                <a href="/auth/login">Go to Login</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {!credentials && (
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You already have an account from a previous application. Log in
                with your existing credentials to check your status.
              </p>
              <Button asChild>
                <a href="/auth/login">Go to Login</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className="space-y-6 order-2 lg:order-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {/* Council Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Council Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {(["USSC", "FSSC"] as CouncilType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="councilType"
                      value={type}
                      checked={formData.councilType === type}
                      onChange={(e) => update("councilType", e.target.value)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm">
                      {type === "USSC"
                        ? "USSC (University SSC)"
                        : "FSSC (Faculty/College SSC)"}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">1x1 Photo *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {formData.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.photo}
                    alt="Candidate"
                    className="w-20 h-20 object-cover border rounded"
                  />
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center text-xs text-muted-foreground">
                    No photo
                  </div>
                )}
                <div className="space-y-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-auto"
                  />
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => update("photo", "")}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Position *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {positions.map((pos) => (
                  <label
                    key={pos.position_id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="position"
                      value={pos.position_id}
                      checked={positionId === pos.position_id}
                      onChange={() => handlePositionChange(pos.position_id)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm">{pos.title}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Candidacy Type & Partylist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Partylist Affiliation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={partylistId} onValueChange={handlePartylistChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select partylist or Independent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">
                    Independent (No Partylist)
                  </SelectItem>
                  {partylists.map((p) => (
                    <SelectItem key={p.partylist_id} value={p.partylist_id}>
                      {p.acronym} — {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If your partylist is not listed,{" "}
                <a
                  href={`/elections/${electionId}/register-partylist`}
                  className="text-primary underline"
                  target="_blank"
                >
                  register it here
                </a>
                .
              </p>

              {formData.candidacyType === "Political Party" && (
                <div className="space-y-2">
                  <Label htmlFor="campaignManager">Campaign Manager *</Label>
                  <Input
                    id="campaignManager"
                    value={formData.campaignManager}
                    onChange={(e) => update("campaignManager", e.target.value)}
                    placeholder="Enter campaign manager name"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>All fields are required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Last Name, First Name, Middle Name"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min={16}
                    max={65}
                    value={formData.age}
                    onChange={(e) => update("age", e.target.value)}
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Date of Birth *</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => update("birthday", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => update("studentId", e.target.value)}
                    placeholder="20-1-00001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAddress">Current Address *</Label>
                <Input
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => update("currentAddress", e.target.value)}
                  placeholder="Enter current address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permanentAddress">Permanent Address *</Label>
                <Input
                  id="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={(e) => update("permanentAddress", e.target.value)}
                  placeholder="Enter permanent address"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty *</Label>
                  <Input
                    id="faculty"
                    value={formData.faculty}
                    onChange={(e) => update("faculty", e.target.value)}
                    placeholder="e.g. College of Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => update("department", e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => update("contactNumber", e.target.value)}
                    placeholder="09XX-XXX-XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course / Program */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Course / Program *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.course_id} value={course.course_id}>
                      {course.acronym
                        ? `${course.acronym} — ${course.name}`
                        : course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Document Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Document Links</CardTitle>
              <CardDescription>
                Provide links to your uploaded documents (e.g., Google Drive
                links). All are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cogLink">Certificate of Grades (COG) *</Label>
                <Input
                  id="cogLink"
                  type="url"
                  value={cogLink}
                  onChange={(e) => setCogLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corLink">
                  Certificate of Registration (COR) *
                </Label>
                <Input
                  id="corLink"
                  type="url"
                  value={corLink}
                  onChange={(e) => setCorLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goodMoralLink">
                  Certificate of Good Moral Character *
                </Label>
                <Input
                  id="goodMoralLink"
                  type="url"
                  value={goodMoralLink}
                  onChange={(e) => setGoodMoralLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Date of Filing (read-only) */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Date of Filing</Label>
                <Input
                  value={formData.date}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Automatically set to today&apos;s date
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit Candidacy Application"}
          </Button>
        </form>
      </div>

      {/* Right: PDF Preview */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-4 lg:self-start h-[85vh] min-h-[600px]">
        <PDFPreview data={formData} />
      </div>
    </div>
  );
}
