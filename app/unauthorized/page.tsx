import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Shield, ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Plenum</h1>
            <p className="text-sm text-muted-foreground">
              University Election System
            </p>
          </div>
        </div>
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 size-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="size-5 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
