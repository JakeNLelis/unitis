"use client";

import { LogoutButton } from "@/components/logout-button";
import { NavLink } from "@/components/nav-link";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProtectedTopNavProps } from "@/lib/types/components";

export function ProtectedTopNav({
  homeHref,
  links,
  identityText,
}: ProtectedTopNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-8">
              <Link href={homeHref} className="flex items-center gap-2 group">
                <Logo size="sm" color="blue" />
              </Link>

              <div className="hidden md:flex gap-6">
                {links.map((link) => (
                  <NavLink key={link.href} href={link.href} exact={link.exact}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{identityText}</span>
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <LogoutButton />
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Toggle protected navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "fixed inset-0 top-14 z-30 md:hidden transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-md",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none",
        )}
      >
        <nav className="flex flex-col h-full p-6">
          <div className="space-y-2 border-b pb-4">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground">
              {identityText}
            </p>
          </div>

          <div className="flex-1 pt-4 space-y-2">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href ||
                  pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <LogoutButton />
          </div>
        </nav>
      </div>
    </>
  );
}

export function ProtectedTopNavFallback() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center">
        <Logo size="sm" color="blue" />
      </div>
    </nav>
  );
}
