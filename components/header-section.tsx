import Link from "next/link";
import MenuIcon from "@/public/icon-menu.svg";
import { Logo } from "./logo";
import Image from "next/image";

function HeaderSection() {
  return (
    <header className="py-4 border-b border-white/15 md:border-none top-0 z-10 bg-[#00C2FF]">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="lg" color="white" />
        </Link>
        <div className="hidden md:block">
          <nav className="flex gap-8 text-sm ">
            <a href="#" className=" text-white/70 hover:text-white transition">
              Contact Us
            </a>
            <a href="#" className=" text-white/70 hover:text-white transition">
              Active Elections
            </a>
            <a href="#" className=" text-white/70 hover:text-white transition">
              Upcommings
            </a>
            <a
              href="/archive"
              className=" text-white/70 hover:text-white transition"
            >
              Archive
            </a>
          </nav>
        </div>
        <Image src={MenuIcon} alt="Menu" className="md:hidden" />
      </div>
    </header>
  );
}

export default HeaderSection;
