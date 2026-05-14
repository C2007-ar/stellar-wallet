export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);

    if (!session.userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      publicKey: user.wallet?.publicKey,
      walletType: user.wallet?.walletType,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}