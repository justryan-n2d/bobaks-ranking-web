# Phase 6.7 Google sign-in

Bobaks supports Google sign-in as a Supabase Auth login method. Google authentication is separate from the optional Roblox identity connection.

## Architecture

1. The account page starts Google OAuth from the browser.
2. The browser generates a PKCE verifier and a random Bobaks transaction state.
3. The verifier and state are stored in browser session storage for the short OAuth transaction.
4. Supabase Auth manages the provider OAuth state and redirects the user to Google.
5. After Google authentication, Supabase redirects to `/account/google-callback` with the authorization code. The Bobaks transaction state is carried as the `bobaks_state` query parameter.
6. Bobaks verifies `bobaks_state`, exchanges the code with Supabase Auth using the PKCE verifier, stores the resulting normal Bobaks auth session, then redirects to `/account`.

The Google OAuth flow does not use the Roblox Cloudflare credentials:

- `ROBLOX_CLIENT_ID`
- `ROBLOX_CLIENT_SECRET`
- `ROBLOX_REDIRECT_URI`
- `ROBLOX_OAUTH_COOKIE_SECRET`

No Google client secret is stored in this repository.

## Supabase configuration

Before Google sign-in can work for real users, enable the Google provider in the Supabase Auth Providers settings and add the Google OAuth Client ID and Client Secret.

The Google OAuth Client must use the Supabase Auth callback URL shown by the Supabase Dashboard. The application's post-login redirect must be included in Supabase Auth's allowed redirect URLs. For the current Phase 6.7 preview, use `https://feat-phase-6-7-accounts-identity-20261005-bobaks-ranking-web.ryan-oled0.workers.dev/account/google-callback`; production will move to the custom domain when that domain is connected.

For local development, add the local application origin to Google's Authorized JavaScript origins and the local Supabase Auth callback URL as required by Supabase.

## Security notes

- The PKCE verifier never goes into the authorization URL.
- State is validated before the authorization code is exchanged.
- Google authorization codes are exchanged only with Supabase Auth.
- Google access or refresh tokens are not stored by Bobaks.
- The Google OAuth transaction state is short-lived browser session data.
