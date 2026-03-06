import { LogoutButton } from "@/components/logout-button";
import { NavLink } from "@/components/nav-link";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="size-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-base tracking-tight">
                  Plenum
                </span>
              </Link>
              <div className="flex gap-6">
                <NavLink href="/candidate">My Applications</NavLink>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
