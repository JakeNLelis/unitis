"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "text-sm transition-colors relative py-1",
        isActive
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-[1.19rem] left-0 right-0 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
}
