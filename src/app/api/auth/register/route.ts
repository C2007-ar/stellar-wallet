import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { getIronSession } from "iron-session";
import { db } from "@/lib/db";
import { generateKeypair, fundTestnetAccount } from "@/lib/stellar/client";
import { encryptSecretKey } from "@/lib/crypto/vault";
import { SESSION_OPTIONS, SessionData } from "@/lib/auth/session";

const RegisterSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court (min 8 caractères)"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = RegisterSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email déjà utilisé" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const { publicKey, secretKey } = generateKeypair();
    const encrypted = encryptSecretKey(secretKey);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        wallet: {
          create: {
            publicKey,
            encryptedSecret: encrypted.encryptedData,
            secretIv: encrypted.iv,
            secretTag: encrypted.tag,
            walletType: "CUSTODIAL",
          },
        },
      },
    });

    if (process.env.STELLAR_NETWORK !== "mainnet") {
      fundTestnetAccount(publicKey).catch(console.error);
    }

    const res = NextResponse.json({ userId: user.id, publicKey });

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