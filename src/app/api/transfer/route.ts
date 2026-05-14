import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as StellarSdk from "@stellar/stellar-sdk";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { decryptSecretKey } from "@/lib/crypto/vault";
import { buildAndSubmitPayment, isValidStellarAddress, accountExists } from "@/lib/stellar/client";

const MAX_TRANSFER_XLM = 10000;
const MAX_TRANSFER_USDC = 5000;

const TransferSchema = z.object({
  toAddress: z.string(),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,7})?$/, "Montant invalide")
    .refine((v) => parseFloat(v) > 0, "Le montant doit être positif")
    .refine(
      (v) => parseFloat(v) >= 0.0000001,
      "Montant minimum : 0.0000001"
    ),
  asset: z.enum(["XLM", "USDC"]).default("XLM"),
  memo: z.string().max(28).optional(),
}).refine(
  (data) => {
    const amount = parseFloat(data.amount);
    if (data.asset === "XLM") return amount <= MAX_TRANSFER_XLM;
    if (data.asset === "USDC") return amount <= MAX_TRANSFER_USDC;
    return true;
  },
  {
    message: "Montant dépasse la limite autorisée",
    path: ["amount"],
  }
);

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    if (!checkRateLimit(session.userId)) {
      return NextResponse.json(
        { error: "Trop de requêtes — réessaie dans une minute" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { toAddress, amount, asset, memo } = TransferSchema.parse(body);

    if (!isValidStellarAddress(toAddress)) {
      return NextResponse.json(
        { error: "Adresse Stellar invalide" },
        { status: 400 }
      );
    }

    const exists = await accountExists(toAddress);
    if (!exists) {
      return NextResponse.json(
        { error: "Ce compte Stellar n'existe pas sur le réseau" },
        { status: 400 }
      );
    }
    const wallet = await db.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet introuvable" },
        { status: 404 }
      );
    }

    const secretKey = decryptSecretKey({
      encryptedData: wallet.encryptedSecret,
      iv: wallet.secretIv,
      tag: wallet.secretTag,
    });

    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);

    const txHash = await buildAndSubmitPayment({
      sourceKeypair,
      destination: toAddress,
      amount,
      asset,
      memo,
    });

    await db.transaction.create({
      data: {
        txHash,
        senderId: session.userId,
        toAddress,
        amount,
        asset,
        memo,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({ txHash, success: true });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error("Transfer error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}