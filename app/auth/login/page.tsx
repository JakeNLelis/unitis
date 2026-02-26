import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function LoginGate() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/protected");
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
      <Suspense>
        <LoginGate />
      </Suspense>
    </div>
  );
}
