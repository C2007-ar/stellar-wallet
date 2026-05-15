import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, SessionData } from "@/lib/auth/session";

const DEMO_EMAILS = [
  "testdiasporaconnect1@gmail.com",
  "test2diasporaconnect@gmail.com",
];

const DemoSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = DemoSchema.parse(body);

    if (!DEMO_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Compte non autorisé" }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    const res = NextResponse.json({
      userId: user.id,
      publicKey: user.wallet?.publicKey,
      success: true,
    });

    const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);
    session.userId = user.id;
    session.email = user.email;
    await session.save();

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}