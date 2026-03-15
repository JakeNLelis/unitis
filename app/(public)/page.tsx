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

      {/* Elections */}
      <div className="container max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Active elections</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Participate in ongoing or upcoming elections
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/archive">View archive</Link>
          </Button>
        </div>
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
