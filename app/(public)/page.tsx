import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ElectionsList } from "@/components/elections-list";
import HeroSection from "@/components/hero-section";
import FeatureSection from "@/components/feature-section";

export default function Home() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <HeroSection />
      {/* Features */}
      <FeatureSection />

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
