import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You do not have permission to access this resource.",
  invalid_request: "The request was invalid. Please try again.",
  server_error: "A server error occurred. Please try again later.",
  otp_expired: "The link has expired. Please request a new one.",
};

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  const friendlyMessage =
    ERROR_MESSAGES[params?.error] ||
    (params?.error
      ? `Something went wrong (${params.error}).`
      : "An unspecified error occurred.");

  return (
    <p className="text-sm text-muted-foreground text-center">
      {friendlyMessage}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Plenum</h1>
            <p className="text-sm text-muted-foreground">
              University Election System
            </p>
          </div>
        </div>
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 size-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
            <CardDescription>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
