import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export interface SessionData {
  userId?: string;
  email?: string;
}

export const SESSION_OPTIONS: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "stellar_wallet_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 2,
  },
};

// Pour les Server Components
export async function getSession() {
  const cookieStore = cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

// Pour les Route Handlers
export async function getSessionFromRequest(
  req: NextRequest,
  res: NextResponse
) {
  return getIronSession<SessionData>(req, res, SESSION_OPTIONS);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("Non authentifié");
  }
  return session as { userId: string; email: string };
}