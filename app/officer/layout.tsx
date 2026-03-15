import { requireSEBOfficer } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { NavLink } from "@/components/nav-link";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";

async function OfficerNav() {
  const { profile } = await requireSEBOfficer();

  return (
    <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size="sm" color="blue" />
            </Link>
            <div className="flex gap-6">
              <NavLink href="/officer/elections">Elections</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium uppercase">
                {profile.display_name?.charAt(0) || "O"}
              </div>
              <span>{profile.display_name}</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense
        fallback={
          <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-14 items-center">
                <div className="flex items-center">
                  <Logo size="sm" color="blue" />
                </div>
              </div>
            </div>
          </nav>
        }
      >
        <OfficerNav />
      </Suspense>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
