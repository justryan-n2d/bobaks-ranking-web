import { describe, expect, it } from "vitest";
import { formatLocalDateTime } from "@/lib/date-time";

describe("formatLocalDateTime", () => {
  it("formats UTC timestamps in the requested local timezone", () => {
    expect(
      formatLocalDateTime("2026-10-07T04:40:32.019Z", "Asia/Manila"),
    ).toBe("Oct 7, 2026, 12:40 PM");

    expect(
      formatLocalDateTime("2026-10-07T04:40:32.019Z", "America/New_York"),
    ).toBe("Oct 7, 2026, 12:40 AM");
  });

  it("returns null for missing or invalid timestamps", () => {
    expect(formatLocalDateTime(null, "Asia/Manila")).toBeNull();
    expect(formatLocalDateTime("not-a-date", "Asia/Manila")).toBeNull();
  });
});
