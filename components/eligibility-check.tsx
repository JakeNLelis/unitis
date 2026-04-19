"use client";

import { useState } from "react";
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
import { AlertCircle } from "lucide-react";
import {
  checkEligibilityAndSendOtp,
  verifyEligibilityOtp,
} from "@/app/(public)/elections/[id]/check-eligibility/actions";
import type { EligibilityCheckProps } from "@/lib/types/components";

type Step = "id-entry" | "otp-entry" | "verified";

export function EligibilityCheck({
  electionId,
  electionName,
}: EligibilityCheckProps) {
  const [step, setStep] = useState<Step>("id-entry");
  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckEligibility(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await checkEligibilityAndSendOtp(electionId, studentId);

    if (result.error) {
      setError(result.error);
    } else if (result.success && result.email) {
      setEmail(result.email);
      setStep("otp-entry");
    }

    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyEligibilityOtp(email, otp);

    if (result.error) {
      setError(result.error);
    } else {
      setStep("verified");
    }

    setLoading(false);
  }

  if (step === "verified") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="size-14 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-2xl text-green-600">✓</span>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">You are eligible to vote</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your identity has been verified for{" "}
            <span className="font-medium">{electionName}</span>. You may proceed
            to cast your vote when the election period is ongoing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {step === "id-entry" ? "Check eligibility" : "Enter OTP"}
        </CardTitle>
        <CardDescription>
          {step === "id-entry"
            ? "Enter your VSU student ID number to check if you are eligible to vote."
            : `A one-time password was sent to ${email}. Enter it below to confirm your identity.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <AlertCircle className="size-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {step === "id-entry" ? (
          <form onSubmit={handleCheckEligibility} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID number</Label>
              <Input
                id="student-id"
                placeholder="e.g. 20-1-01457"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                An OTP will be sent to{" "}
                {studentId ? (
                  <span className="font-medium">
                    {studentId.trim()}@vsu.edu.ph
                  </span>
                ) : (
                  "your VSU email address"
                )}
                .
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking..." : "Check eligibility"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-time password</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 8-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("id-entry");
                setOtp("");
                setError("");
              }}
            >
              Use a different ID
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
