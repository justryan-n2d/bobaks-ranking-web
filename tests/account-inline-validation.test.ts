import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Account inline validation", () => {
  const account = readFileSync(
    resolve(process.cwd(), "src/components/account-page.tsx"),
    "utf8",
  );

  it("disables native browser validation so Bobaks controls the presentation", () => {
    expect(account).toContain('noValidate aria-busy={busy}');
  });

  it("provides inline email and password error states", () => {
    expect(account).toContain('Email is required.');
    expect(account).toContain('Password is required.');
    expect(account).toContain('border-destructive bg-destructive/5');
    expect(account).toContain('aria-invalid={Boolean(fieldErrors.email)}');
    expect(account).toContain('aria-invalid={Boolean(fieldErrors.password)}');
    expect(account).toContain('account-email-error');
    expect(account).toContain('account-password-error');
  });

  it("focuses the first invalid field and clears field errors while editing", () => {
    expect(account).toContain('emailRef.current?.focus()');
    expect(account).toContain('passwordRef.current?.focus()');
    expect(account).toContain('setEmail(event.target.value);');
    expect(account).toContain('clearFieldError("email")');
    expect(account).toContain('setPassword(event.target.value);');
    expect(account).toContain('clearFieldError("password")');
  });

  it("uses custom validation for signup password length and legal consent", () => {
    expect(account).toContain('Password must be at least 8 characters.');
    expect(account).toContain('Please accept the Terms and Privacy Policy.');
    expect(account).toContain('aria-invalid={Boolean(fieldErrors.legal)}');
    expect(account).toContain('border-destructive bg-destructive/5');
  });
});
