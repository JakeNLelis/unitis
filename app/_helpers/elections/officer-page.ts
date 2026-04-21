import { Badge } from "@/components/ui/badge";

export function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-600 rounded-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="destructive"
          className="rounded-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5"
        >
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge
          variant="secondary"
          className="rounded-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5"
        >
          Pending
        </Badge>
      );
  }
}

export function isElectionManagerRole(
  role: string | null | undefined,
): role is "seb-officer" | "system-admin" {
  return role === "seb-officer" || role === "system-admin";
}