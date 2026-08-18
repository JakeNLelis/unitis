import Link from "next/link";
import { SpecialElectionAccess } from "@/components/special-election-access";

const requiredFacultyList = [
  "FC",
  "FAFS",
  "FE",
  "FFES",
  "FHSS",
  "FME",
  "FNMS",
  "FON",
  "FTE",
  "FVM",
];

function getFacultyOptions() {
  return requiredFacultyList.map((faculty) => ({
    value: faculty,
    label: faculty,
  }));
}

export default function SpecialElection2026Page() {
  const faculties = getFacultyOptions();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            University Election Special Access
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Special Election 2026</h1>
        </div>

        <SpecialElectionAccess faculties={faculties} />
      </div>
    </div>
  );
}
