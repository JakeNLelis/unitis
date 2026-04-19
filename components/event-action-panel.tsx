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
import type { EventActionPanelProps } from "@/lib/types/components";

export function EventActionPanel({
  electionId,
  electionName,
  state,
  variant = "default",
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
              href: `/elections/${electionId}/register-partylist`,
              label: "Register partylist",
              icon: Users,
              description: "Register a partylist for this election.",
            },
          ]
        : [];

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-3">
        {actions.length === 0 ? (
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Registry Locked // Session Concluded
          </p>
        ) : (
          actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 border-2 border-foreground/10 px-4 py-3 hover:border-foreground hover:bg-primary hover:text-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Icon className="size-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  {action.label}
                </span>
                <ArrowRight className="size-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            );
          })
        )}
      </div>
    );
  }

  return (
    <Card className="rounded-none border-2 border-foreground shadow-none">
      <CardHeader className="border-b-2 border-foreground/10">
        <CardTitle className="text-sm font-black uppercase tracking-[0.3em]">
          Institutional Actions
        </CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Metadata-driven session controls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground font-bold italic">
            This election has ended. Detailed results are available in Archive.
          </p>
        ) : (
          actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group block border-2 border-foreground/5 p-4 hover:border-foreground/20 hover:bg-muted/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      {action.label}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 mt-1 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
