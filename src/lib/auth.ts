import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  isLoggedIn: boolean;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "change-me-to-a-random-32-char-secret!",
  cookieName: "cms-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export function isAuthenticated(session: SessionData): boolean {
  return session.isLoggedIn === true && !!session.userId;
}

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  return apiKey === process.env.API_KEY;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireAuth(request: NextRequest): Promise<SessionData | null> {
  if (validateApiKey(request)) {
    return { isLoggedIn: true, userId: "api", role: "admin", email: "api@system", name: "API" };
  }
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return null;
  }
  return session;
}
