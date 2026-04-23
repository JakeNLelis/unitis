import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseOption } from "@/lib/types/public";
import type { ApplicationFormProps } from "@/lib/types/public";
import { ApplicationForm } from "@/app/(public)/elections/[id]/apply/application-form";

type CandidacyStatus = "open" | "not_started" | "ended" | "not_configured";

export function ApplyPageHeader({
  electionName,
  electionType,
}: {
  electionName: string;
  electionType: string;
}) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold">Candidacy Application</h1>
      <p className="text-lg text-muted-foreground">{electionName}</p>
      <Badge variant="outline">{electionType}</Badge>
    </div>
  );
}

export function FilingWindowCard({
  startDate,
  endDate,
  open,
}: {
  startDate: string;
  endDate: string;
  open: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Filing Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">
          {new Date(startDate).toLocaleString()} –{" "}
          {new Date(endDate).toLocaleString()}
        </p>
        {open && (
          <Badge className="mt-2 bg-green-600">Filing is currently open</Badge>
        )}
      </CardContent>
    </Card>
  );
}

export function ApplyStatusCard({
  status,
  startDate,
  endDate,
}: {
  status: CandidacyStatus;
  startDate?: string | null;
  endDate?: string | null;
}) {
  return (
    <Card>
      <CardContent className="pt-6 text-center space-y-2">
        {status === "not_started" && startDate ? (
          <>
            <p className="text-lg font-medium">
              Candidacy filing has not started yet
            </p>
            <p className="text-muted-foreground">
              Filing opens on {new Date(startDate).toLocaleString()}
            </p>
          </>
        ) : null}
        {status === "ended" && endDate ? (
          <>
            <p className="text-lg font-medium">
              Candidacy filing period has ended
            </p>
            <p className="text-muted-foreground">
              The deadline was {new Date(endDate).toLocaleString()}
            </p>
          </>
        ) : null}
        {(status === "not_configured" || !startDate || !endDate) && (
          <p className="text-muted-foreground">
            Candidacy filing is not available for this election.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ApplyFormCard(props: ApplicationFormProps) {
  return <ApplicationForm {...props} />;
}

export function NoPositionsCard() {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-muted-foreground">
          No positions have been defined for this election yet. Please check
          back later.
        </p>
      </CardContent>
    </Card>
  );
}
