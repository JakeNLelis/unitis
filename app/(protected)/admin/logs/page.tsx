import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import { archivo } from "@/lib/fonts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default async function AdminLogsPage() {
  const supabase = await createAdminClient();

  const { data: logs } = await supabase
    .from("admin_logs")
    .select("*, elections(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-8">
      <div>
        <h1
          className={cn(
            "text-3xl font-black uppercase tracking-tight",
            archivo.className,
          )}
        >
          Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Administrative action history across the system
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Actor</th>
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-left p-3 font-semibold">Description</th>
                  <th className="text-left p-3 font-semibold">Election</th>
                </tr>
              </thead>
              <tbody>
                {!logs || logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No audit log entries found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: Record<string, unknown>) => (
                    <tr
                      key={log.log_id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {log.actor_email}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {log.actor_role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono"
                        >
                          {log.action_type}
                        </Badge>
                      </td>
                      <td className="p-3 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {log.elections?.name || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
