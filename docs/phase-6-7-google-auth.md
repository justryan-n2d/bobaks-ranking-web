# Phase 6.7 Google sign-in

Bobaks supports Google sign-in as a Supabase Auth login method. Google authentication is separate from the optional Roblox identity connection.

## Architecture

1. The account page starts Google OAuth from the browser.
2. The browser generates a PKCE verifier for the short OAuth transaction.
3. The verifier is stored in browser session storage.
4. Supabase Auth manages the provider OAuth state and redirects the user to Google.
5. After Google authentication, Supabase redirects to the fixed `/account/google-callback` callback with the authorization code.
6. Bobaks validates the state cookie, exchanges the code with Supabase Auth using the stored PKCE verifier, returns the session to the browser, then redirects to `/account`.

The Google OAuth flow does not use the Roblox Cloudflare credentials:

- `ROBLOX_CLIENT_ID`
- `ROBLOX_CLIENT_SECRET`
- `ROBLOX_REDIRECT_URI`
- `ROBLOX_OAUTH_COOKIE_SECRET`

No Google client secret is stored in this repository.


## Redirect configuration for the current preview

Use these exact values for the current Phase 6.7 preview:

- **Google Cloud Authorized JavaScript origin**
  `https://feat-phase-6-7-accounts-identity-20261005-bobaks-ranking-web.ryan-oledan0.workers.dev`
- **Google Cloud Authorized redirect URI**
  `https://zhrfozouzvxhpkylmpwh.supabase.co/auth/v1/callback`
- **Supabase Auth redirect allowlist**
  `https://feat-phase-6-7-accounts-identity-20261005-bobaks-ranking-web.ryan-oledan0.workers.dev/account/google-callback`
- **Bobaks request to Supabase**
  `redirect_to=https://feat-phase-6-7-accounts-identity-20261005-bobaks-ranking-web.ryan-oledan0.workers.dev/account/google-callback`

The Google redirect URI is the Supabase Auth callback. The Bobaks callback is the post-login redirect configured in Supabase Auth.

## Supabase configuration

Before Google sign-in can work for real users, enable the Google provider in the Supabase Auth Providers settings and add the Google OAuth Client ID and Client Secret.

The Google OAuth Client must use the Supabase Auth callback URL shown by the Supabase Dashboard. The application's post-login redirect must be included in Supabase Auth's allowed redirect URLs. For the current Phase 6.7 preview, use `https://feat-phase-6-7-accounts-identity-20261005-bobaks-ranking-web.ryan-oledan0.workers.dev/account/google-callback`; production will move to the custom domain when that domain is connected.

For local development, add the local application origin to Google's Authorized JavaScript origins and the local Supabase Auth callback URL as required by Supabase.

## Security notes

- The PKCE verifier never goes into the authorization URL.
- Supabase manages the OAuth provider state; Bobaks does not add dynamic state to the redirect URL.
- Google authorization codes are exchanged only with Supabase Auth.
- Google access or refresh tokens are not stored by Bobaks.
- The Google OAuth transaction state is short-lived browser session data.
