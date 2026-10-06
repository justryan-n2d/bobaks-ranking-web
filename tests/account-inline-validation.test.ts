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
    expect(account).toContain("border-[var(--signal-drop)] bg-[color-mix(in_srgb,var(--signal-drop)_5%,transparent)]");
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

  it("adds an accessible password visibility toggle", () => {
    expect(account).toContain('Eye, EyeOff');
    expect(account).toContain('type={showPassword ? "text" : "password"}');
    expect(account).toContain('aria-label={showPassword ? "Hide password" : "Show password"}');
    expect(account).toContain('aria-pressed={showPassword}');
    expect(account).toContain('setShowPassword((current) => !current)');
    expect(account).toContain('<Eye className="size-4" aria-hidden="true" />');
    expect(account).toContain('<EyeOff className="size-4" aria-hidden="true" />');
    expect(account).toContain('If this address can receive a Bobaks confirmation email, check your inbox shortly.');
  });

  it("uses custom validation for signup password length and legal consent", () => {
    expect(account).toContain('Password must be at least 8 characters.');
    expect(account).toContain('Please accept the Terms and Privacy Policy.');
    expect(account).toContain('aria-invalid={Boolean(fieldErrors.legal)}');
    expect(account).toContain("border-[var(--signal-drop)] bg-[color-mix(in_srgb,var(--signal-drop)_5%,transparent)]");
  });
});


describe("Account password reset UI", () => {
  const updatePassword = readFileSync(
    resolve(process.cwd(), "src/app/account/update-password/page.tsx"),
    "utf8",
  );

  it("provides show/hide controls for both new password fields", () => {
    expect(updatePassword).toContain('type={showPassword ? "text" : "password"}');
    expect(updatePassword).toContain('type={showConfirmation ? "text" : "password"}');
    expect(updatePassword).toContain('aria-label={showPassword ? "Hide password" : "Show password"}');
    expect(updatePassword).toContain('aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"}');
    expect(updatePassword).toContain('<Eye className="size-4" aria-hidden="true" />');
    expect(updatePassword).toContain('<EyeOff className="size-4" aria-hidden="true" />');
  });
});
