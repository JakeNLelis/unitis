import type { Metadata } from "next";
import { Inter, Erica_One } from "next/font/google";
import "./globals.css";

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

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

const ericaOne = Erica_One({
  variable: "--font-erica-one",
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ericaOne.variable}`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} antialiased`}>
        {children}
        <footer className="fixed bottom-2 right-3 text-[10px] text-muted-foreground/40 select-none pointer-events-none z-50 tracking-wider font-medium">
          UN.010.003
        </footer>
      </body>
    </html>
  );
}
