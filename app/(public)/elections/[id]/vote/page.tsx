import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BallotForm } from "./ballot-form";
import {
  VoteHeader,
  VoteLoadingCard,
  VotingInfoCard,
} from "@/app/_helpers/elections/vote-page";
import {
  buildPositionsWithCandidates,
  getApprovedVotingCandidates,
  getVotingElection,
  getVotingMasterlistVoter,
  getVotingPositions,
  getVotingUser,
  isVotingWindowOpen,
} from "@/app/_helpers/elections/vote-actions";

async function VotingContent({ electionId }: { electionId: string }) {
  const votingUser = await getVotingUser();
  if ("error" in votingUser) {
    redirect(`/elections/${electionId}/voter-validation`);
  }

  const electionResult = await getVotingElection(electionId);
  if ("error" in electionResult) {
    notFound();
  }

  const studentId = votingUser.email.split("@")[0];
  const voterResult = await getVotingMasterlistVoter(electionId, studentId);
  if ("error" in voterResult) {
    redirect(`/elections/${electionId}/voter-validation`);
  }

  const election = electionResult.election;
  const votingOpen = isVotingWindowOpen(election);
  const alreadyVoted = voterResult.voter.is_voted;

  if (!votingOpen || alreadyVoted) {
    return (
      <VotingInfoCard
        electionName={election.name}
        alreadyVoted={alreadyVoted}
        votingOpensAt={new Date(election.start_date).toLocaleString()}
      />
    );
  }

  const positions = await getVotingPositions(electionId);
  const candidates = await getApprovedVotingCandidates(electionId);
  const positionsWithCandidates = buildPositionsWithCandidates(
    positions,
    candidates,
  );

  return (
    <div className="space-y-6">
      <VoteHeader
        electionName={election.name}
        electionType={election.election_type}
        userEmail={votingUser.email}
      />

      <BallotForm
        electionId={electionId}
        electionName={election.name}
        studentId={studentId}
        positions={positionsWithCandidates}
      />
    </div>
  );
}

export default function VotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-10 px-4">
        <Suspense fallback={<VoteLoadingCard />}>
          <VotePageWrapper params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function VotePageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VotingContent electionId={id} />;
}
