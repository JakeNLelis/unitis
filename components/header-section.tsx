import Link from "next/link";
import MenuIcon from "@/public/icon-menu.svg";
import { Logo } from "./logo";
import Image from "next/image";

interface HeaderSectionProps {
  color?: "blue" | "white";
}

function HeaderSection({ color = "blue" }: HeaderSectionProps) {
  const isBlue = color === "blue";

  return (
    <header
      className={`py-4 top-0 z-10 ${
        isBlue
          ? "bg-[#00C2FF] border-b border-white/15 md:border-none"
          : "bg-background border-b border-border"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="lg" color={isBlue ? "white" : "blue"} />
        </Link>
        <div className="hidden md:block">
          <nav className="flex gap-8 text-sm">
            <a
              href="#"
              className={`${
                isBlue
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              } transition`}
            >
              Contact Us
            </a>
            <a
              href="#"
              className={`${
                isBlue
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              } transition`}
            >
              Active Elections
            </a>
            <a
              href="#"
              className={`${
                isBlue
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              } transition`}
            >
              Upcommings
            </a>
            <a
              href="/archive"
              className={`${
                isBlue
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              } transition`}
            >
              Archive
            </a>
          </nav>
        </div>
        <Image
          src={MenuIcon}
          alt="Menu"
          className={`md:hidden ${isBlue ? "" : "brightness-0"}`}
        />
      </div>
    </header>
  );
}

export default HeaderSection;
