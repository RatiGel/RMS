import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE_NAME = "rms_session";
const EXPIRES_IN_DAYS = 7;

export interface SessionPayload {
  userId: string;
  orgId: string;
  role: string;
  name: string;
  orgName: string;
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN_DAYS}d`)
    .sign(SESSION_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
