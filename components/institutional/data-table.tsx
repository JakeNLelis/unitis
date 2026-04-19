import { cn } from "@/lib/utils";
import type { InstitutionalDataTableProps } from "@/lib/types/institutional";

export function InstitutionalDataTable({
  headers,
  data,
  className,
  ...props
}: InstitutionalDataTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse", className)} {...props}>
        <thead>
          <tr className="bg-surface-low border-b border-border">
            {headers.map((header) => (
              <th
                key={header}
                className="py-3 px-6 text-left font-heading text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border last:border-0 hover:bg-surface-lowest transition-colors duration-150"
            >
              {Object.values(row).map((cell, j) => (
                <td
                  key={j}
                  className="py-4 px-6 text-sm font-medium text-foreground tabular-nums"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
