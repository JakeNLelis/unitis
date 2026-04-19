import { requireElectionManager } from "@/lib/auth";
import { Suspense } from "react";
import FooterSection from "@/components/footer-section";
import {
  ProtectedTopNav,
  ProtectedTopNavFallback,
} from "@/components/institutional/protected-top-nav";

async function OfficerNav() {
  const { profile } = await requireElectionManager();

  return (
    <ProtectedTopNav
      homeHref="/officer"
      identityText={profile.email || profile.display_name}
      links={[
        { href: "/officer", label: "Overview", exact: true },
        { href: "/officer/elections", label: "Election Registry" },
      ]}
    />
  );
}

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Suspense fallback={<ProtectedTopNavFallback />}>
        <OfficerNav />
      </Suspense>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {children}
      </main>

      <FooterSection />
    </div>
  );
}
