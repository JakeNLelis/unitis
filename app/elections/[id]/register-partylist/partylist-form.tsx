"use client";

import { useState } from "react";
import { registerPartylist } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PartylistRegistrationForm({
  electionId,
  electionName,
}: {
  electionId: string;
  electionName: string;
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

    const result = await registerPartylist(formData);

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
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-bold">Partylist Registered!</h2>
          <p className="text-muted-foreground">
            Your partylist has been successfully registered for{" "}
            <strong>{electionName}</strong>. Candidates can now select your
            partylist when filing their Certificate of Candidacy.
          </p>
          <Badge variant="secondary">Status: Active</Badge>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Representative Information</CardTitle>
          <CardDescription>Fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registered_by_name">Your Full Name *</Label>
              <Input
                id="registered_by_name"
                name="registered_by_name"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registered_by_email">Your Email *</Label>
              <Input
                id="registered_by_email"
                name="registered_by_email"
                type="email"
                placeholder="juan@vsu.edu.ph"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Partylist Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partylist Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Unity Movement"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acronym">Acronym *</Label>
              <Input
                id="acronym"
                name="acronym"
                placeholder="UM"
                required
                className="uppercase"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform / Advocacy</Label>
            <Textarea
              id="platform"
              name="platform"
              placeholder="Describe your partylist's platform and advocacy..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Registering..." : "Register Partylist"}
      </Button>
    </form>
  );
}
