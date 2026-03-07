"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { sendVoterOtp, verifyVoterOtp } from "./actions";

interface Props {
  electionId: string;
  electionName: string;
}

type Step = "id-entry" | "otp-entry";

export function VoterValidationForm({ electionId, electionName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("id-entry");
  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await sendVoterOtp(electionId, studentId);

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

    const result = await verifyVoterOtp(email, otp);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Session is now set in cookies; redirect to the ballot
      router.push(`/elections/${electionId}/vote`);
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {step === "id-entry" ? "Voter verification" : "Enter OTP"}
        </CardTitle>
        <CardDescription>
          {step === "id-entry"
            ? `Verify your identity to vote in ${electionName}.`
            : `A one-time password was sent to ${email}. Enter it below to proceed to your ballot.`}
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
          <form onSubmit={handleSendOtp} className="space-y-4">
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
              {loading ? "Sending OTP..." : "Send OTP"}
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
              {loading ? "Verifying..." : "Verify and proceed to ballot"}
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
              disabled={loading}
            >
              Use a different ID
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
