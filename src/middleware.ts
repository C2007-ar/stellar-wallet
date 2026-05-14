import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, SessionData } from "@/lib/auth/session";

const PUBLIC_ROUTES = ["/auth"];
const PROTECTED_ROUTES = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);

  // Route protégée sans session → redirect vers /auth
  if (isProtected && !session.userId) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // Déjà connecté → redirect vers /dashboard
  if (isPublic && session.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};