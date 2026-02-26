import { requireSystemAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { Suspense } from "react";

async function AdminNav() {
  const profile = await requireSystemAdmin();

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-semibold text-lg">
              Plenum
            </Link>
            <div className="flex gap-4">
              <Link
                href="/admin/officers"
                className="text-sm hover:text-primary"
              >
                SEB Officers
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense
        fallback={
          <nav className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <span className="font-semibold text-lg">Plenum</span>
              </div>
            </div>
          </nav>
        }
      >
        <AdminNav />
      </Suspense>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
