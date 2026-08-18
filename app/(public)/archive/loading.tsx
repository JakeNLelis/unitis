import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <ul className="space-y-2 mt-2">
                        {[...Array(2)].map((_, k) => (
                          <li key={k} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-8" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="px-6 pb-6 pt-2">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
