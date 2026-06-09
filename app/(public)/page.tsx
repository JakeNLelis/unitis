import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ElectionsList } from "@/components/elections-list";
import HeroSection from "@/components/hero-section";
import FeatureSection from "@/components/feature-section";
import FeatureBento from "@/components/feature-bento";

export default function Home() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <HeroSection />
      {/* Features */}
      <FeatureSection />

      {/* Asymmetric bento feature grid */}
      <FeatureBento />

      <div className="container max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <ElectionsList />
        </Suspense>
      </div>
    </main>
  );
}
