import { requireSystemAdmin } from "@/lib/auth";
import { Suspense } from "react";
import {
  ProtectedTopNav,
  ProtectedTopNavFallback,
} from "@/components/institutional/protected-top-nav";

async function AdminNav() {
  const profile = await requireSystemAdmin();

  return (
    <ProtectedTopNav
      homeHref="/"
      identityText={profile.email}
      links={[
        { href: "/admin/officers", label: "SEB Officers" },
        { href: "/admin/elections", label: "Elections" },
        { href: "/admin/academics", label: "Academics" },
      ]}
    />
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<ProtectedTopNavFallback />}>
        <AdminNav />
      </Suspense>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
