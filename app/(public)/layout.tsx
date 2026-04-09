"use client";

import HeaderSection from "@/components/header-section";
import FooterSection from "@/components/footer-section";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const headerColor = pathname === "/" ? "blue" : "white";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeaderSection color={headerColor} />

      <div className="flex-1">
        {children}
      </div>

      <FooterSection />
    </div>
  );
}
