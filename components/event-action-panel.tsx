import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Vote,
  Activity,
  ShieldCheck,
  ArrowRight,
  FileText,
  Users,
  ClipboardList,
} from "lucide-react";
import type { ElectionState } from "@/lib/types/election";

interface EventActionPanelProps {
  electionId: string;
  electionName: string;
  state: ElectionState;
}

export function EventActionPanel({
  electionId,
  electionName,
  state,
}: EventActionPanelProps) {
  const actions =
    state === "active"
      ? [
          {
            href: `/elections/${electionId}/vote`,
            label: "Vote now",
            icon: Vote,
            description: "Cast your ballot in this active election.",
          },
          {
            href: `/elections/${electionId}/turnout`,
            label: "Live turnout",
            icon: Activity,
            description: "View live participation and turnout updates.",
          },
        ]
      : state === "upcoming"
        ? [
            {
              href: `/elections/${electionId}/check-eligibility`,
              label: "Check Eligibility",
              icon: ShieldCheck,
              description: "Verify that you can participate in this election.",
            },
            {
              href: `/elections/${electionId}/apply`,
              label: "Apply as candidate",
              icon: FileText,
              description: "Start your candidacy application.",
            },
            {
              href: `/elections/${electionId}/status`,
              label: "Check candidacy status",
              icon: ClipboardList,
              description: "View the status of your submitted application.",
            },
            {
              href: `/elections/${electionId}/candidates`,
              label: "View candidates",
              icon: Users,
              description: "Browse the current candidate list.",
            },
            {
              href: `/elections/${electionId}/register-partylist`,
              label: "Register partylist",
              icon: Users,
              description: "Register a partylist for this election.",
            },
          ]
        : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Actions</CardTitle>
        <CardDescription>
          {electionName} actions for the current election state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This election has ended. Detailed results are available in Archive.
          </p>
        ) : (
          actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group block rounded-lg border p-4 transition-colors hover:bg-accent/60 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      {action.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 mt-1 text-muted-foreground group-hover:text-foreground" />
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
