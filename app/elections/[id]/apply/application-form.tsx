"use client";

import { useState } from "react";
import { submitCandidacyApplication } from "./actions";
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

interface Position {
  position_id: string;
  title: string;
}

interface Course {
  course_id: string;
  name: string;
  acronym: string | null;
}

export function ApplicationForm({
  electionId,
  electionName,
  positions,
  courses,
}: {
  electionId: string;
  electionName: string;
  positions: Position[];
  courses: Course[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("election_id", electionId);

    const result = await submitCandidacyApplication(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold">Application Submitted!</h2>
          <p className="text-muted-foreground">
            Your candidacy application for <strong>{electionName}</strong> has
            been submitted successfully. The election officers will review your
            application.
          </p>
          <Badge variant="secondary">Status: Pending Review</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID *</Label>
              <Input
                id="student_id"
                name="student_id"
                placeholder="2024-00001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan.delacruz@university.edu"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="16"
                max="65"
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Date of Birth</Label>
              <Input id="birth_date" name="birth_date" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_address">Current Address</Label>
            <Input
              id="current_address"
              name="current_address"
              placeholder="Your current address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permanent_address">Permanent Address</Label>
            <Input
              id="permanent_address"
              name="permanent_address"
              placeholder="Your permanent address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Election Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Election Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position_id">Position Applying For *</Label>
            <Select name="position_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.position_id} value={pos.position_id}>
                    {pos.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_id">Course / Program *</Label>
            <Select name="course_id" required>
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
            {courses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No courses available. Please contact the election officer.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Links</CardTitle>
          <CardDescription>
            Provide links to your uploaded documents (e.g., Google Drive links)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cog_link">Certificate of Grades (COG)</Label>
            <Input
              id="cog_link"
              name="cog_link"
              type="url"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor_link">Certificate of Registration (COR)</Label>
            <Input
              id="cor_link"
              name="cor_link"
              type="url"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="good_moral_link">
              Certificate of Good Moral Character
            </Label>
            <Input
              id="good_moral_link"
              name="good_moral_link"
              type="url"
              placeholder="https://drive.google.com/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Submitting..." : "Submit Candidacy Application"}
      </Button>
    </form>
  );
}
