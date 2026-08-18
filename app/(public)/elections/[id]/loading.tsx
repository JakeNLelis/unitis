import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="container max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-500">
      <div className="space-y-16">
        <div className="space-y-10">
          <div>
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="relative overflow-hidden bg-background">
            <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
              <div className="space-y-6 flex-1">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32 rounded-none" />
                  <Skeleton className="h-16 w-[80%] md:w-[90%]" />
                  <Skeleton className="h-16 w-[60%] md:w-[70%]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-4">
                  <div className="py-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="py-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </div>

              <div className="md:w-px md:h-64 bg-foreground/10 hidden md:block" />

              <div className="md:w-72 flex flex-col justify-center space-y-4">
                <Skeleton className="h-3 w-40" />
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <Skeleton className="h-10 w-10 md:h-12 md:w-12" />
                      <Skeleton className="h-2 w-6" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-8 w-full mt-4" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-none border-2 border-foreground/10 shadow-none">
              <CardHeader className="border-b-2 border-foreground/10">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-48 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border-2 border-foreground/5 p-4 flex justify-between items-center">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-10">
          <Skeleton className="h-10 w-64" />
          
          <div className="space-y-12">
            {[...Array(2)].map((_, sectionIndex) => (
              <section key={sectionIndex} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="border-2 border-foreground/5 p-6 flex gap-6 items-start">
                      <Skeleton className="h-20 w-20 border-2" />
                      <div className="flex-1 space-y-3 pt-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
