import type { Metadata } from "next";
import "./globals.css";
import { inter, archivo, ericaOne } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Plenum",
    template: "%s — Plenum",
  },
  description:
    "Secure, transparent election management for university student bodies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} ${ericaOne.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} font-sans antialiased text-foreground bg-background`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
