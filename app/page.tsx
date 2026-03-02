import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ElectionsList } from "@/components/elections-list";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center gap-6">
            <Logo size="lg" color="blue" />
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance">
                Modernizing Democracy at Visayas State University
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/auth/login">
                Sign in
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Elections */}
      <div className="container max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Active elections</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Participate in ongoing or upcoming elections
            </p>
          </div>
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
