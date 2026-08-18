"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lookupSpecialElectionVoter } from "@/app/specialelection2026/actions";

export function SpecialElectionAccess({
  faculties,
}: {
  faculties: { value: string; label: string }[];
}) {
  const [faculty, setFaculty] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    studentName: string;
    email: string;
    googleFormUrl: string;
    facultyAssigned: string;
  } | null>(null);
  const [notFound, setNotFound] = useState<{
    message: string;
    facultyEmails: string;
    facultyCode: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setNotFound(null);
    setLoading(true);

    const result = await lookupSpecialElectionVoter(faculty, studentId);

    if ("error" in result && result.error) {
      setError(result.error);
    } else if ("notFound" in result && result.notFound) {
      setNotFound({
        message: result.message,
        facultyEmails: result.facultyEmails,
        facultyCode: result.facultyCode,
      });
    } else if ("success" in result && result.success) {
      setSuccess({
        studentName: result.studentName,
        email: result.email,
        googleFormUrl: result.googleFormUrl,
        facultyAssigned: result.facultyAssigned,
      });
    }

    setLoading(false);
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Special Election 2026</CardTitle>
        <CardDescription>
          Select your faculty and enter your student ID to verify your eligibility and access your assigned voting form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!success && !notFound && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <select
                id="faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select your faculty</option>
                {faculties.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID number</Label>
              <Input
                id="student-id"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 23-1-01457"
                inputMode="numeric"
                pattern="[0-9]{2}-[0-9]-[0-9]{5}"
                title="Use the format XX-X-XXXXX, for example 23-1-01457"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking..." : "Check eligibility"}
            </Button>
          </form>
        )}

        {success && (
          <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-green-600" />
              <div>
                <p className="font-semibold">Eligible voter confirmed</p>
                <p className="text-green-800">{success.studentName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Faculty assignment</p>
              <p>{success.facultyAssigned}</p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Use this email to access the ballot</p>
              <div className="space-y-1 rounded-md border border-green-300 bg-white p-3 text-sm text-green-900">
                <p>Use the email address you enrolled with at the university, or your student email in the format:</p>
                <p className="font-semibold">studentid@vsu.edu.ph</p>
                <p className="mt-2">
                  If neither works, email <a href="mailto:fcbaybayseb@vsu.edu.ph" className="underline">fcbaybayseb@vsu.edu.ph</a> for assistance.
                </p>
                <p className="mt-2 font-medium">
                  Do not request access. These ballot forms are whitelisted only for specific email addresses.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Assigned Google Form</p>
              <Link
                href={success.googleFormUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 underline underline-offset-4"
              >
                Open voting form
                <ExternalLink className="size-4" />
              </Link>
            </div>
          </div>
        )}

        {notFound && (
          <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <div>
                <p className="font-semibold">Student ID not found</p>
                <p>{notFound.message}</p>
              </div>
            </div>

            <p>
              If you believe this is a mistake, email <a href="mailto:fcbaybayseb@vsu.edu.ph" className="underline">fcbaybayseb@vsu.edu.ph</a> so the Faculty SEB can assist you and determine whether you should be added to the eligible voters list.
            </p>

            
          </div>
        )}
      </CardContent>
    </Card>
  );
}
