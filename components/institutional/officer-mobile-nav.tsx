"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, Database, ShieldCheck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { archivo } from '@/lib/fonts';

interface OfficerMobileNavProps {
  displayName?: string | null;
  logoutButton: React.ReactNode;
}

export function OfficerMobileNav({ displayName, logoutButton }: OfficerMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/officer", label: "Overview", icon: LayoutDashboard },
    { href: "/officer/elections", label: "Election Registry", icon: Database },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 border-2 border-foreground hover:bg-surface-low transition-colors z-50 relative"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Full-screen Institutional Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background transition-all duration-300 md:hidden",
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-12">
          {/* User Status Block */}
          <div className="mb-12 border-l-4 border-primary pl-6 py-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
              <ShieldCheck className="size-3" />
              Authenticated Session
            </div>
            <h2 className={cn("text-2xl font-black uppercase tracking-tight", archivo.className)}>
              {displayName || "Officer Access"}
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between p-6 border-2 border-transparent hover:border-foreground hover:bg-surface-low transition-all"
              >
                <div className="flex items-center gap-4">
                  <link.icon className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className={cn("text-xl font-black uppercase tracking-tighter", archivo.className)}>
                    {link.label}
                  </span>
                </div>
                <div className="size-2 rounded-full bg-border group-hover:bg-primary transition-colors" />
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto pt-8 border-t border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Access</span>
              <span className="text-sm font-bold italic text-foreground opacity-60">Session Ver. 26.4.9</span>
            </div>
            {logoutButton}
          </div>
        </div>
      </div>
    </>
  );
}
