import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as StellarSdk from "@stellar/stellar-sdk";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, SessionData } from "@/lib/auth/session";
import { horizon, STELLAR_NETWORK } from "@/lib/stellar/client";
import { db } from "@/lib/db";

const SubmitSchema = z.object({
  signedXdr: z.string(),
  toAddress: z.string(),
  amount: z.string(),
  asset: z.enum(["XLM", "USDC"]).default("XLM"),
});

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);

    if (!session.userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { signedXdr, toAddress, amount, asset } = SubmitSchema.parse(body);

    // Soumet la transaction signée par Freighter
    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK);
    const result = await horizon.submitTransaction(tx);

    await db.transaction.create({
      data: {
        txHash: result.hash,
        senderId: session.userId,
        toAddress,
        amount,
        asset,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({ txHash: result.hash, success: true });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}