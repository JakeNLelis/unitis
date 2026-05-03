export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function formatDisplayDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDisplayTimeRange(
  startIso: string,
  endIso: string,
): string {
  const start = new Date(startIso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = new Date(endIso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${start} - ${end}`;
}
