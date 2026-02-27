"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      disabled={isLoading}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="size-4" />
      {isLoading ? "Logging out..." : "Log out"}
    </Button>
  );
}
