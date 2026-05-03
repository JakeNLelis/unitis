import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading elections...</p>
              </CardContent>
            </Card>
          }
        >
          <ElectionsList />
        </Suspense>
      </div>
    </main>
  );
}
