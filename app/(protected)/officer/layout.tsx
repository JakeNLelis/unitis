import { requireSEBOfficer } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { NavLink } from "@/components/nav-link";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ShieldCheck, LayoutDashboard, Database, UserCheck, Menu } from "lucide-react";
import FooterSection from "@/components/footer-section";
import { OfficerMobileNav } from "@/components/institutional/officer-mobile-nav";

async function OfficerNav() {
  const { profile } = await requireSEBOfficer();

  return (
    <nav className="sticky top-0 z-50 border-b border-foreground/10 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-10">
            <Link href="/officer" className="flex items-center gap-2 group">
              <Logo size="sm" color="blue" />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                href="/officer" 
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors text-foreground"
              >
                <LayoutDashboard className="size-4" />
                Overview
              </Link>
              <Link 
                href="/officer/elections" 
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors text-foreground"
              >
                <Database className="size-4" />
                Election Registry
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">
                <ShieldCheck className="size-3" />
                Officer Session
              </div>
              <span className="text-sm font-black uppercase tracking-tight tabular-nums">
                {profile.display_name}
              </span>
            </div>

            <div className="h-10 w-px bg-foreground/10 hidden sm:block" />
            
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <LogoutButton />
              </div>
              <OfficerMobileNav 
                displayName={profile.display_name} 
                logoutButton={<LogoutButton />} 
              />
            </div>
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
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Suspense
        fallback={
          <nav className="sticky top-0 z-50 border-b-4 border-foreground bg-background">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center">
              <Logo size="sm" color="blue" />
            </div>
          </nav>
        }
      >
        <OfficerNav />
      </Suspense>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {children}
      </main>

      <FooterSection />
    </div>
  );
}
