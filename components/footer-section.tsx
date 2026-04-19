import { Logo } from "./logo";
import Link from "next/link";

function FooterSection() {
  return (
    <footer className="flex flex-col px-6 md:px-12 py-10 md:py-6 text-[10px] border-t border-border mt-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 mb-10 md:mb-6">
        <div className="flex flex-col w-full md:w-48 gap-3">
          <Logo size="sm" color="blue" />
          <p className="w-full text-muted-foreground leading-normal">
            The official digital election management system of the Visayas State
            University Student Electoral Board.
          </p>
        </div>
        
        <div className="flex flex-col w-full md:w-36 gap-3 md:gap-2">
          <h4 className="font-bold tracking-widest uppercase">Election</h4>
          <ul className="text-muted-foreground space-y-2 md:space-y-1">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Active Elections</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Upcoming Events</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Archived Results</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Eligibility Check</Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col w-full md:w-36 gap-3 md:gap-2">
          <h4 className="font-bold tracking-widest uppercase">Governance</h4>
          <ul className="text-muted-foreground space-y-2 md:space-y-1">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Student Electoral Board</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">SEB Code</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Constitution Guidelines</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Security Protocols</Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col w-full md:w-36 gap-3 md:gap-2">
          <h4 className="font-bold tracking-widest uppercase">Support</h4>
          <ul className="text-muted-foreground space-y-2 md:space-y-1">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Help Center</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Voter Guide</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Report an Issue</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Contact SEB</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 md:pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground">@ 2026 Plenum System. All rights reserved</p>
          <div className="flex gap-6 md:gap-3">
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
