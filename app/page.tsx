import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Plenum</h1>
      <Link href="/auth/login">
        <Button>Login</Button>
      </Link>
    </main>
  );
}
