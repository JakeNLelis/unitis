import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Shield } from "lucide-react";

export default function Page() {
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
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
