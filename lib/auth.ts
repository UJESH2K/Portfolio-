// Minimal signed-cookie session for /edit. Uses Web Crypto (works in both the
// Node and Edge runtimes) so middleware can verify the cookie without a
// database round-trip. No database anywhere: the login is fixed below.

export const ADMIN_COOKIE = "pfl_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/** The /edit login. Fixed here on purpose: no env vars, no database. */
const ADMIN_ID = "ujesh2024";
const ADMIN_PASSWORD = "733640";

// The key that signs session cookies must not be guessable whenever saving
// is possible, or anyone could forge a session and commit to the repo. So it
// comes from ADMIN_SESSION_SECRET if set, else from GITHUB_TOKEN (a secret in
// Vercel, and the thing saving needs). With neither, nothing can be saved,
// so a fixed key is harmless and keeps local logins working.
function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || (process.env.GITHUB_TOKEN ? `pfl-session:${process.env.GITHUB_TOKEN}` : "pfl-session:no-save");
}

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Buffer.from(sig).toString("base64url");
}

export function checkCredentials(id: string, password: string) {
  return id.trim() === ADMIN_ID && password === ADMIN_PASSWORD;
}

/** Builds a signed "expiry.signature" token to store in the session cookie. */
export async function createSessionToken() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = await hmac(payload, getSecret());
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload, getSecret());
  if (expected !== sig) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}
