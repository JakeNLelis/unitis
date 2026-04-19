"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

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
import { createSEBOfficer } from "../actions";
import type { NewOfficerFormProps } from "@/lib/types/admin-officers";

export function NewOfficerForm({
  facultyOptionsByCampus,
  campuses,
}: NewOfficerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facultyCode, setFacultyCode] = useState("");
  const [campus, setCampus] = useState("");
  const router = useRouter();

  const campusFacultyOptions = campus
    ? facultyOptionsByCampus[campus] || []
    : [];

  const setupError = Object.values(facultyOptionsByCampus).every(
    (options) => options.length === 0,
  )
    ? "No faculty acronyms found. Add faculty acronyms in Academics first."
    : campuses.length === 0
      ? "No campuses found. Add a campus in Academics first."
      : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!facultyCode || !campus) {
      setError("Please select a faculty code and campus.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("faculty_code", facultyCode);
    formData.set("campus", campus);

    const result = await createSEBOfficer(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // If successful, the action redirects to /admin/officers
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create SEB Officer</CardTitle>
        <CardDescription>
          Add a new SEB Officer with faculty and campus values managed in
          Academics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campus">Campus</Label>
            <Select
              value={campus}
              onValueChange={(value) => {
                setCampus(value);
                setFacultyCode("");
              }}
            >
              <SelectTrigger id="campus">
                <SelectValue
                  placeholder={
                    campuses.length > 0
                      ? "Select campus"
                      : "No campuses available"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campusName) => (
                  <SelectItem key={campusName} value={campusName}>
                    {campusName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="faculty_code">Faculty Code</Label>
            <Select
              value={facultyCode}
              onValueChange={setFacultyCode}
              disabled={!campus || campusFacultyOptions.length === 0}
            >
              <SelectTrigger id="faculty_code">
                <SelectValue
                  placeholder={
                    !campus
                      ? "Select campus first"
                      : campusFacultyOptions.length > 0
                        ? "Select faculty code"
                        : "No faculty codes for selected campus"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {campusFacultyOptions.map((faculty) => (
                  <SelectItem
                    key={`${campus}-${faculty.code}`}
                    value={faculty.code}
                  >
                    {faculty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {setupError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{setupError}</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || Boolean(setupError)}>
              {isLoading ? "Creating..." : "Create Officer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/officers")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
