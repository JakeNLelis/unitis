"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BackToRegistryLink() {
  const pathname = usePathname();

  const registryPath = pathname.startsWith("/admin/elections")
    ? "/admin/elections"
    : "/officer/elections";

  return (
    <Link
      href={registryPath}
      className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-all flex items-center gap-2"
    >
      ← Back to System Index
    </Link>
  );
}
