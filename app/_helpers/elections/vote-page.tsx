import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VotingClosedCard({
  electionName,
  startLabel,
  isUpcoming,
}: {
  electionName: string;
  startLabel: string;
  isUpcoming: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6 text-center space-y-4">
        <h2 className="text-2xl font-bold">
          {isUpcoming ? "Voting Closed" : "Already Voted"}
        </h2>
        <p className="text-muted-foreground">
          {isUpcoming
            ? `Voting opens on ${startLabel}.`
            : `You have already submitted your ballot for ${electionName}.`}
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function VoteLoadingCard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-48 bg-muted/50 rounded-lg animate-pulse" />
    </div>
  );
}

export function VotingInfoCard({
  electionName,
  alreadyVoted,
  votingOpensAt,
}: {
  electionName: string;
  alreadyVoted: boolean;
  votingOpensAt: string;
}) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Elections
      </Link>
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          {alreadyVoted ? (
            <>
              <div className="mx-auto size-12 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold">Already Voted</h2>
              <p className="text-muted-foreground">
                You have already submitted your ballot for{" "}
                <span className="font-semibold">{electionName}</span>.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Voting Closed</h2>
              <p className="text-muted-foreground">
                Voting opens on {votingOpensAt}.
              </p>
            </>
          )}
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function VoteHeader({
  electionName,
  electionType,
  userEmail,
}: {
  electionName: string;
  electionType: string;
  userEmail: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{electionName}</h1>
      <p className="text-muted-foreground">{electionType}</p>
      <p className="text-sm text-muted-foreground mt-1">
        Voting as <span className="font-medium">{userEmail}</span>
      </p>
    </div>
  );
}
