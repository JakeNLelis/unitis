import Link from "next/link";
import { UsscPlebisciteAccess } from "@/components/ussc-plebiscite-access";

const facultyList = [
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
  return facultyList.map((faculty) => ({
    value: faculty,
    label: faculty,
  }));
}

export default function UsscPlebiscite2026Page() {
  const faculties = getFacultyOptions();

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <span aria-hidden="true">←</span> Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
            USSC Plebiscite 2026
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Verify your student voter eligibility and retrieve your assigned ballot form.
          </p>
        </div>

        <UsscPlebisciteAccess faculties={faculties} />
      </div>
    </main>
  );
}
