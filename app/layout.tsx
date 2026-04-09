import type { Metadata } from "next";
import "./main.css";
import { inter, archivo, ericaOne } from "@/lib/fonts";

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
      <body className={`${inter.className} font-sans antialiased text-foreground bg-background`}>
        {children}
      </body>
    </html>
  );
}
