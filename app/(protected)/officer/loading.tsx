import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-6 flex-1">
            <Skeleton className="h-20 w-64 md:w-96" />
            <Skeleton className="h-10 w-full max-w-xl" />
          </div>

          <div className="flex flex-col gap-2 w-full md:w-72">
            <Skeleton className="h-16 w-full rounded-none" />
            <Skeleton className="h-16 w-full rounded-none" />
          </div>
        </div>
      </section>

      {/* Synchronized Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border-b border-border">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-8 bg-background space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="border-2 border-foreground overflow-hidden">
          <div className="divide-y-2 divide-foreground">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 bg-background flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24 hidden md:block" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-8 border-2 border-foreground bg-surface-low space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-32 mt-6" />
          </div>
        ))}
      </section>
    </div>
  );
}
