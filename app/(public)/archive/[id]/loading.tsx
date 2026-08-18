import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-foreground pb-8">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-3/4" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-none" />
              <Skeleton className="h-10 w-32 rounded-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 border-2 border-foreground bg-surface-low space-y-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>

          <div className="space-y-6 mt-12">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-48" />
              <div className="h-px flex-1 bg-border/60" />
            </div>
            
            <Card className="rounded-none border-2 border-foreground/10 shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-full divide-y-2 divide-foreground/10">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30">
                      <Skeleton className="h-4 w-24 col-span-5" />
                      <Skeleton className="h-4 w-20 col-span-4" />
                      <Skeleton className="h-4 w-16 col-span-3" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                        <Skeleton className="h-4 w-40 col-span-5" />
                        <Skeleton className="h-4 w-32 col-span-4" />
                        <Skeleton className="h-4 w-12 col-span-3" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
