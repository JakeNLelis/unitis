import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-semibold">
                Plenum
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link
                href="/candidate"
                className="text-muted-foreground hover:text-foreground"
              >
                My Applications
              </Link>
            </div>
            <LogoutButton />
          </div>
        </nav>
        <div className="flex-1 w-full max-w-5xl p-5">{children}</div>
      </div>
    </main>
  );
}
