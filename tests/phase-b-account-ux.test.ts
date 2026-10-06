import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase B account UX", () => {
  const account = readFileSync(resolve(process.cwd(), "src/components/account-page.tsx"), "utf8");
  const switchComponent = readFileSync(resolve(process.cwd(), "src/components/ui/switch.tsx"), "utf8");
  const callback = readFileSync(resolve(process.cwd(), "src/components/google-callback-page.tsx"), "utf8");

  it("uses an accessible switch for account settings instead of native setting checkboxes", () => {
    expect(switchComponent).toContain('role="switch"');
    expect(switchComponent).toContain("aria-checked={checked}");
    expect(switchComponent).toContain("onCheckedChange");
    expect(account).toContain('from "@/components/ui/switch"');
    expect(account).toContain("<Switch");
    expect(account).not.toContain('<input\n        type="checkbox"');
  });

  it("keeps legal consent as a native checkbox", () => {
    expect(account).toContain('id="account-legal-consent"');
    expect(account).toContain('type="checkbox"');
  });

  it("keeps Google as the only account sign-in surface", () => {
    expect(account).toContain("Continue with Google");
    expect(account).toContain("Google is the only account sign-in method available right now.");
    expect(account).not.toContain("or use email");
    expect(account).not.toContain("Create account");
    expect(account).not.toContain("Log in to Bobaks");
    expect(account).not.toContain('name=\"email\"');
    expect(account).not.toContain('type=\"password\"');
  });

  it("provides distinct loading and failure states for Google authentication", () => {
    expect(account).toContain("aria-busy={googleBusy}");
    expect(account).toContain("Redirecting to Google...");
    expect(callback).toContain('status, setStatus');
    expect(callback).toContain("Sign-in could not be completed");
    expect(callback).toContain("Try again");
    expect(callback).toContain('role={status === "working" ? "status" : "alert"}');
  });
});
