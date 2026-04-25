import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByEmail, type StoredUser, type UserRole } from "@/lib/users";

type SessionPayload = {
  email: string;
  role: UserRole;
  name: string;
};

const sessionCookieName = "sf_service_session";

function getAuthSecret() {
  return process.env.AUTH_SECRET || "sf-service-dev-secret-change-me";
}

export function isSecureCookieEnabled() {
  return process.env.NODE_ENV === "production";
}

function encode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user: StoredUser) {
  const payload = encode(
    JSON.stringify({
      email: user.email,
      role: user.role,
      name: user.name
    } satisfies SessionPayload)
  );

  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return null;
  }

  try {
    return JSON.parse(decode(payload)) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  const session = readSessionToken(token);

  if (!session) {
    return null;
  }

  return getUserByEmail(session.email) ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=login-required");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/login?error=admin-required");
  }

  return user;
}

export { sessionCookieName };
