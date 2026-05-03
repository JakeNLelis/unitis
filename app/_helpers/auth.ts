import type { UserRole } from "@/lib/types/auth";
import { redirect } from "next/navigation";

export function redirectByRole(role: UserRole | undefined) {
  if (role === "system-admin") {
    return redirect("/admin");
  }

  if (role === "seb-officer") {
    return redirect("/officer");
  }

  if (role === "candidate") {
    return redirect("/candidate");
  }

  return redirect("/");
}
