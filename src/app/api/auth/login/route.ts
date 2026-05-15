export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, SessionData } from "@/lib/auth/session";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      userId: user.id,
      publicKey: user.wallet?.publicKey,
    });

    const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);
    session.userId = user.id;
    session.email = user.email;
    await session.save();

    return res;
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}