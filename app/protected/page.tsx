import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types/auth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

async function DashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();

  // Redirect candidates to their dedicated dashboard
  if (profile?.role === "candidate") {
    redirect("/candidate");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{profile?.display_name || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            {profile ? (
              <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
            ) : (
              <Badge variant="outline">No role assigned</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {profile?.role === "system-admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>
              You have system administrator access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin"
              className="text-primary hover:underline font-medium"
            >
              Go to Admin Panel →
            </Link>
          </CardContent>
        </Card>
      )}

      {profile?.role === "seb-officer" && (
        <Card>
          <CardHeader>
            <CardTitle>Election Management</CardTitle>
            <CardDescription>You have SEB Officer access</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/officer"
              className="text-primary hover:underline font-medium"
            >
              Go to Officer Panel →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
