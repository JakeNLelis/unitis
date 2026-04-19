import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { archivo } from "@/lib/fonts";
import { OfficerElectionRegistry } from "@/components/officer/election-registry";

export default function ElectionsPage() {
  return (
    <div className="container max-w-6xl mx-auto px-6 space-y-16 py-12">
      <div className="flex justify-between items-end border-b-2 border-foreground pb-10">
        <div className="space-y-4">
          <h1
            className={cn(
              "text-6xl font-black uppercase tracking-tighter leading-none",
              archivo.className,
            )}
          >
            Elections
          </h1>
          <p className="text-sm font-medium text-muted-foreground max-w-md">
            The authoritative registry of all university-wide and localized
            election cycles managed by the Student Election Board.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="rounded-none font-black uppercase tracking-widest h-14 px-8"
        >
          <Link href="/officer/elections/new">
            <Plus className="size-5 mr-3" />
            Initialize New Election
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-baseline justify-between mb-2">
          <h2
            className={cn(
              "text-xs font-black uppercase tracking-[0.25em] text-muted-foreground",
              archivo.className,
            )}
          >
            Election Registry
          </h2>
        </div>

        <Suspense
          fallback={
            <div className="space-y-4 border-y border-border divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-surface-low animate-pulse" />
              ))}
            </div>
          }
        >
          <OfficerElectionRegistry />
        </Suspense>
      </div>
    </div>
  );
}
