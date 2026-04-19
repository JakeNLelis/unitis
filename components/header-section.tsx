"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeaderSectionProps } from "@/lib/types/components";

function HeaderSection({ color = "blue" }: HeaderSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isBlue = color === "blue";

  const navLinks = [
    { href: "#", label: "Contact Us" },
    { href: "#", label: "Active Elections" },
    { href: "#", label: "Upcomings" },
    { href: "/archive", label: "Archive" },
  ];

  return (
    <header
      className={cn(
        "py-4 sticky top-0 z-50 transition-all duration-300",
        isBlue
          ? "bg-[#00C2FF] border-b border-white/15"
          : "bg-background/95 backdrop-blur-md border-b border-border",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="lg" color={isBlue ? "white" : "blue"} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "font-medium transition-colors",
                isBlue
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "md:hidden p-2 rounded-lg transition-colors",
            isBlue
              ? "text-white hover:bg-white/10"
              : "text-foreground hover:bg-surface-low",
          )}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          "fixed inset-0 top-18 z-40 md:hidden transition-all duration-300 ease-in-out",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none",
          isBlue ? "bg-[#00C2FF]" : "bg-background",
        )}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8 p-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-2xl font-black uppercase tracking-tighter transition-all duration-300",
                isOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
                isBlue ? "text-white" : "text-foreground",
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {link.label}
            </Link>
          ))}

          <div className="w-12 h-1 bg-current opacity-20 mt-4" />

          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className={cn(
              "px-8 py-4 text-sm font-black uppercase tracking-widest border-2 transition-all",
              isBlue
                ? "border-white text-white hover:bg-white hover:text-[#00C2FF]"
                : "border-foreground text-foreground hover:bg-foreground hover:text-background",
            )}
          >
            Access Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default HeaderSection;
