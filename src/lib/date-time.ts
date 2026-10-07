export function formatLocalDateTime(value: string | null | undefined, timeZone?: string): string | null {
  if (!value) return null;

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      ...(timeZone ? { timeZone } : {}),
    }).format(new Date(timestamp));
  } catch {
    return null;
  }
}
