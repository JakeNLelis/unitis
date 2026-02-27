import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
      <p className="text-muted-foreground mb-8">
        You do not have permission to access this page.
      </p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
