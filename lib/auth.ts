// Minimal signed-cookie session for the /admin area. Uses Web Crypto (works
// in both the Node and Edge runtimes) so middleware can verify the cookie
// without a database round-trip.

export const ADMIN_COOKIE = "pfl_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
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
  const expectedId = process.env.ADMIN_ID ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  return (
    expectedId.length > 0 &&
    expectedPassword.length > 0 &&
    id === expectedId &&
    password === expectedPassword
  );
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
