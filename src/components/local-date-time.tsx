"use client";

import { useEffect, useState } from "react";
import { formatLocalDateTime } from "@/lib/date-time";

export function LocalDateTime({
  value,
  fallback = "Unavailable",
}: {
  value: string | null | undefined;
  fallback?: string;
}) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setFormatted(formatLocalDateTime(value, timeZone));
  }, [value]);

  return (
    <time dateTime={value ?? undefined}>
      {formatted ?? fallback}
    </time>
  );
}
