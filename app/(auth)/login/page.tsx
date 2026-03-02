import { LoginForm } from "@/components/login-form";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/logo";

function redirectByRole(role: string | undefined) {
  switch (role) {
    case "system-admin":
      redirect("/admin");
    case "seb-officer":
      redirect("/officer");
    case "candidate":
      redirect("/candidate");
    default:
      redirect("/");
  }
}

async function LoginGate() {
  const user = await getCurrentUser();
  if (user) {
    const profile = await getCurrentProfile();
    redirectByRole(profile?.role);
  }

  return (
    <div className="w-full max-w-sm">
      <LoginForm />
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <Logo size="lg" color="blue" />
          <p className="text-sm text-muted-foreground">
            University Election System
          </p>
        </div>
        <Suspense>
          <LoginGate />
        </Suspense>
      </div>
    </div>
  );
}
