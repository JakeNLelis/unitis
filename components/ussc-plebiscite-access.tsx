"use client";

import { useRef, useState } from "react";
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
import { lookupUsscPlebisciteVoter } from "@/app/usscplebiscite2026/actions";
import { Turnstile, type TurnstileRef } from "@/components/turnstile";
import { ensureAbsoluteUrl } from "@/lib/utils";

interface FacultyOption {
  value: string;
  label: string;
}

interface SuccessState {
  studentName: string;
  maskedEmail: string;
  hasEmail: boolean;
  googleFormUrl: string;
  altEmailGoogleFormUrl: string;
  facultyAssigned: string;
}

interface NotFoundState {
  message: string;
  facultyEmails: string;
  facultyCode: string;
}

export function UsscPlebisciteAccess({
  faculties,
}: {
  faculties: FacultyOption[];
}) {
  const [faculty, setFaculty] = useState("");
  const [studentId, setStudentId] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [notFound, setNotFound] = useState<NotFoundState | null>(null);
  const turnstileRef = useRef<TurnstileRef>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setNotFound(null);
    setLoading(true);

    try {
      const result = await lookupUsscPlebisciteVoter(
        faculty,
        studentId,
        turnstileToken,
      );

      if ("error" in result && result.error) {
        setError(result.error);
        turnstileRef.current?.reset();
        setTurnstileToken("");
      } else if ("notFound" in result && result.notFound) {
        setNotFound({
          message: result.message,
          facultyEmails: result.facultyEmails,
          facultyCode: result.facultyCode,
        });
      } else if ("success" in result && result.success) {
        setSuccess({
          studentName: result.studentName,
          maskedEmail: result.maskedEmail,
          hasEmail: result.hasEmail,
          googleFormUrl: result.googleFormUrl,
          altEmailGoogleFormUrl: result.altEmailGoogleFormUrl,
          facultyAssigned: result.facultyAssigned,
        });
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSuccess(null);
    setNotFound(null);
    setError("");
    setStudentId("");
    setTurnstileToken("");
    turnstileRef.current?.reset();
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-heading font-semibold text-foreground">
          Voter Verification
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Select your faculty and enter your student ID to verify your status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {!success && !notFound && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="faculty" className="text-sm font-medium">
                Faculty
              </Label>
              <select
                id="faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="">Select faculty...</option>
                {faculties.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-id" className="text-sm font-medium">
                Student ID Number
              </Label>
              <Input
                id="student-id"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="23-1-01457"
                inputMode="text"
                pattern="[0-9]{2}-[0-9]-[0-9]{5}"
                title="Use format XX-X-XXXXX, e.g. 23-1-01457"
                className="h-9 font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: 23-1-01457
              </p>
            </div>

            <div className="flex justify-center py-2">
              <Turnstile
                ref={turnstileRef}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={loading}
            >
              {loading ? "Checking Roster..." : "Check Eligibility"}
            </Button>
          </form>
        )}

        {success && (
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 text-foreground pb-2 border-b border-border">
              <CheckCircle2 className="size-5 text-green-600 shrink-0" />
              <div>
                <p className="font-heading font-semibold text-base">
                  Eligible Voter Confirmed
                </p>
                <p className="text-xs text-muted-foreground">
                  Your record is registered in the official plebiscite roster.
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-md border border-border p-3">
                <dt className="text-xs text-muted-foreground uppercase font-semibold">
                  Faculty
                </dt>
                <dd className="font-medium text-foreground mt-0.5">
                  {success.facultyAssigned || faculty}
                </dd>
              </div>

              <div className="rounded-md border border-border p-3">
                <dt className="text-xs text-muted-foreground uppercase font-semibold">
                  Student ID
                </dt>
                <dd className="font-mono font-medium text-foreground mt-0.5">
                  {studentId}
                </dd>
              </div>

              <div className="sm:col-span-2 rounded-md border border-border p-3">
                <dt className="text-xs text-muted-foreground uppercase font-semibold">
                  Authorized Voting Email
                </dt>
                <dd className="font-mono text-sm text-foreground mt-1">
                  {success.hasEmail ? (
                    <span className="font-medium">{success.maskedEmail}</span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">
                      Official university email ({studentId}@vsu.edu.ph)
                    </span>
                  )}
                </dd>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Ensure you are logged into Google with this account to access the ballot.
                </p>
              </div>
            </dl>

            {success.googleFormUrl && (
              <div className="pt-1">
                <Button asChild className="w-full font-medium" size="lg">
                  <a
                    href={ensureAbsoluteUrl(success.googleFormUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Ballot Form</span>
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
            )}

            {success.altEmailGoogleFormUrl && (
              <div className="rounded-md bg-muted/40 border border-border p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">
                  Cannot access your authorized email?
                </p>
                <p>
                  Submit a request to update your email via the{" "}
                  <a
                    href={ensureAbsoluteUrl(success.altEmailGoogleFormUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-foreground font-medium hover:text-primary inline-flex items-center gap-1"
                  >
                    Alternate Email Form
                    <ExternalLink className="size-3" />
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        )}

        {notFound && (
          <div className="space-y-4">
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive space-y-2">
              <div className="flex items-center gap-2 font-medium font-heading">
                <AlertCircle className="size-4 shrink-0" />
                <span>Student ID Not Found</span>
              </div>
              <p className="text-xs text-destructive/90 leading-relaxed">
                {notFound.message}
              </p>
            </div>

            <div className="rounded-md border border-border p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground">Next steps</p>
              <p>
                If you believe this is a mistake, please contact{" "}
                <a
                  href="mailto:fcbaybayseb@vsu.edu.ph"
                  className="underline text-foreground font-medium hover:text-primary transition-colors"
                >
                  fcbaybayseb@vsu.edu.ph
                </a>{" "}
                for assistance.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full text-xs"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
