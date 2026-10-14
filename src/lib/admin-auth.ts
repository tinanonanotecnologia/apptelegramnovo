import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "teleglass_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME?.trim() &&
      process.env.ADMIN_PASSWORD &&
      (process.env.ADMIN_SESSION_SECRET?.trim().length ?? 0) >= 32
  );
}

function secureEquals(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!isAdminAuthConfigured() || !expectedUsername || expectedPassword === undefined) {
    return false;
  }

  return secureEquals(username.trim(), expectedUsername) && secureEquals(password, expectedPassword);
}

function signPayload(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  }

  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAdminSessionToken(username: string) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
      nonce: randomBytes(16).toString("base64url"),
    })
  ).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token || !isAdminAuthConfigured()) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  let expectedSignature: string;
  try {
    expectedSignature = signPayload(payload);
  } catch {
    return false;
  }

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: unknown;
      exp?: unknown;
      nonce?: unknown;
    };
    const configuredUsername = process.env.ADMIN_USERNAME?.trim();

    return Boolean(
      configuredUsername &&
        typeof session.sub === "string" &&
        secureEquals(session.sub, configuredUsername) &&
        typeof session.exp === "number" &&
        session.exp > Math.floor(Date.now() / 1000) &&
        typeof session.nonce === "string"
    );
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}
