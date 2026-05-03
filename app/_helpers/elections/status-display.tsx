import { Badge } from "@/components/ui/badge";

export function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-600">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "pending":
    default:
      return <Badge variant="secondary">Pending Review</Badge>;
  }
}

export function affiliationBadge(status: string | null) {
  if (!status) return null;

  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-600" variant="outline">
          Affiliation Verified
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Affiliation Rejected</Badge>;
    case "pending":
      return <Badge variant="secondary">Affiliation Pending</Badge>;
    default:
      return null;
  }
}

export function unwrap<T>(val: T[] | T | null): T | null {
  if (!val) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}
