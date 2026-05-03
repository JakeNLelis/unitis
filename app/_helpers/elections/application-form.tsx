"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationFormProps } from "@/lib/types/public";
import type {
  CandidacyFormData,
  CouncilType,
} from "@/app/(public)/elections/[id]/apply/types";
import { calculateAgeFromBirthDate } from "@/lib/utils";

export function ApplicationSuccessCard({
  electionId,
  electionName,
}: {
  electionId: string;
  electionName: string;
}) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto size-12 rounded-full bg-green-600/10 flex items-center justify-center">
            <span className="text-lg font-bold text-green-600">✓</span>
          </div>
          <h2 className="text-xl font-bold">Application Submitted!</h2>
          <p className="text-muted-foreground">
            Your candidacy application for <strong>{electionName}</strong> has
            been submitted successfully. Your PDF form has been automatically
            downloaded.
          </p>
          <p className="text-sm text-muted-foreground">
            Please print the PDF form, sign it with a blue pen, and submit the
            hard copy to the USEB Officers.
          </p>
          <Badge variant="secondary">Status: Pending Review</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            You can track your candidacy status using your email and OTP code.
          </p>
          <Button asChild>
            <Link href={`/elections/${electionId}/status`}>
              Check Application Status
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionCard({
  title,
  children,
  description,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// @CodeScene(disable:"Large Method")
export function ApplicationFormLayout({
  electionType,
  positions,
  courses,
  formData,
  positionId,
  courseId,
  cogLink,
  corLink,
  goodMoralLink,
  error,
  loading,
  onSubmit,
  onPhotoUpload,
  onUpdate,
  onPositionChange,
  onCourseChange,
  onRemovePhoto,
  setCogLink,
  setCorLink,
  setGoodMoralLink,
}: Pick<ApplicationFormProps, "electionType" | "positions" | "courses"> & {
  formData: CandidacyFormData;
  positionId: string;
  courseId: string;
  cogLink: string;
  corLink: string;
  goodMoralLink: string;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: (field: keyof CandidacyFormData, value: string) => void;
  onPositionChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onRemovePhoto: () => void;
  setCogLink: (value: string) => void;
  setCorLink: (value: string) => void;
  setGoodMoralLink: (value: string) => void;
}) {
  const resolvedCouncilType: CouncilType =
    electionType === "University-Wide" ? "USSC" : "FSSC";
  const derivedAge = calculateAgeFromBirthDate(formData.birthday);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <SectionCard title="Council Type">
          <p className="text-sm font-medium">
            {resolvedCouncilType === "USSC"
              ? "USSC (University SSC)"
              : "FSSC (Faculty/College SSC)"}
          </p>
        </SectionCard>

        <SectionCard title="1x1 Photo *">
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
                onChange={onPhotoUpload}
                className="w-auto"
              />
              {formData.photo && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Position *">
          <div className="grid grid-cols-2 gap-2">
            {positions.map((position) => (
              <label
                key={position.position_id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="position"
                  value={position.position_id}
                  checked={positionId === position.position_id}
                  onChange={() => onPositionChange(position.position_id)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">{position.title}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Affiliation">
          <p className="text-sm text-muted-foreground">
            This form is for independent candidates only.
          </p>
        </SectionCard>

        <SectionCard
          title="Personal Information"
          description="All fields are required"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => onUpdate("fullName", e.target.value)}
                placeholder="Last Name, First Name, Middle Name"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="birthday">Date of Birth *</Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => onUpdate("birthday", e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age (Auto-computed)</Label>
                <Input
                  id="age"
                  value={derivedAge}
                  readOnly
                  className="bg-muted/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => onUpdate("studentId", e.target.value)}
                  placeholder="23-1-01457"
                  pattern={String.raw`^\d{2}-\d-\d{5}$`}
                  title="Use format xx-x-xxxxx, e.g. 23-1-01457"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAddress">Current Address *</Label>
              <Input
                id="currentAddress"
                value={formData.currentAddress}
                onChange={(e) => onUpdate("currentAddress", e.target.value)}
                placeholder="Enter current address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentAddress">Permanent Address *</Label>
              <Input
                id="permanentAddress"
                value={formData.permanentAddress}
                onChange={(e) => onUpdate("permanentAddress", e.target.value)}
                placeholder="Enter permanent address"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onUpdate("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => onUpdate("contactNumber", e.target.value)}
                  placeholder="09XX-XXX-XXXX"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Course / Program *">
          <div className="space-y-4">
            <Select value={courseId} onValueChange={onCourseChange}>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Input
                  id="faculty"
                  value={formData.faculty}
                  readOnly
                  className="bg-muted/60"
                  placeholder="Auto-filled from selected course"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  readOnly
                  className="bg-muted/60"
                  placeholder="Auto-filled from selected course"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Document Links"
          description="Provide links to your uploaded documents (e.g., Google Drive links). All are required."
        >
          <div className="space-y-4">
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
          </div>
        </SectionCard>

        <SectionCard title="Date of Filing">
          <div className="space-y-2">
            <Label>Date of Filing</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={formData.date}
                readOnly
                className="h-11 pl-10 bg-muted/70 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically set to today&apos;s date
            </p>
          </div>
        </SectionCard>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Submitting..." : "Submit Candidacy Application"}
        </Button>
      </form>
    </div>
  );
}
