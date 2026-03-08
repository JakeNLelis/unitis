import { Logo } from "./logo";
import Link from "next/link";

function FooterSection() {
  return (
    <footer className="flex flex-col px-12 py-6 text-[10px]">
      <div className="flex justify-between mb-6">
        <div className="flex flex-col w-48 gap-2">
          <Logo size="sm" color="blue" />
          <p className="w-full text-gray-600">
            The official digital election management system of the Visayas State
            University Student Electoral Board.
          </p>
        </div>
        <div className="flex flex-col w-36 gap-2">
          <h4 className="font-bold tracking-[0.1em]">ELECTION</h4>
          <ul className="text-gray-600 space-y-1">
            <li>
              <Link href="/">Active Elections</Link>
            </li>
            <li>
              <Link href="/">Upcoming Events</Link>
            </li>
            <li>
              <Link href="/">Archived Results</Link>
            </li>
            <li>
              <Link href="/">Eligibility Check</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col w-36 gap-2">
          <h4 className="font-bold tracking-[0.1em]">GOVERNANCE</h4>
          <ul className="text-gray-600 space-y-1">
            <li>
              <Link href="/">Student Electoral Board</Link>
            </li>
            <li>
              <Link href="/">SEB Code</Link>
            </li>
            <li>
              <Link href="/">Constitution Guidlines</Link>
            </li>
            <li>
              <Link href="/">Security Protocols</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col w-36 gap-2">
          <h4 className="font-bold tracking-[0.1em]">SUPPORT</h4>
          <ul className="text-gray-600 space-y-1">
            <li>
              <Link href="/">Help Center</Link>
            </li>
            <li>
              <Link href="/">Voter Guide</Link>
            </li>
            <li>
              <Link href="/">Report an Issue</Link>
            </li>
            <li>
              <Link href="/">Contact SEB</Link>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <div className="md:border-t md:border-gray/20 flex flex-col items-center gap-4 justify-center pt-4 px-12 md:justify-between md:flex-row">
          <p className="">@ 2026 Plenum System. All rights reserved</p>
          <div className="flex gap-3">
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
