import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as StellarSdk from "@stellar/stellar-sdk";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, SessionData } from "@/lib/auth/session";
import { horizon, STELLAR_NETWORK, isValidStellarAddress } from "@/lib/stellar/client";

const FreighterTransferSchema = z.object({
  fromPublicKey: z.string(),
  toAddress: z.string(),
  amount: z.string().regex(/^\d+(\.\d{1,7})?$/),
  asset: z.enum(["XLM", "USDC"]).default("XLM"),
  memo: z.string().max(28).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);

    if (!session.userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { fromPublicKey, toAddress, amount, asset, memo } =
      FreighterTransferSchema.parse(body);

    if (!isValidStellarAddress(fromPublicKey) || !isValidStellarAddress(toAddress)) {
      return NextResponse.json({ error: "Adresse invalide" }, { status: 400 });
    }

    const sourceAccount = await horizon.loadAccount(fromPublicKey);

    const stellarAsset =
      asset === "XLM"
        ? StellarSdk.Asset.native()
        : new StellarSdk.Asset(asset, process.env.USDC_ISSUER!);

    let txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_NETWORK,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: toAddress,
          asset: stellarAsset,
          amount,
        })
      )
      .setTimeout(30);

    if (memo) {
      txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memo));
    }

    const tx = txBuilder.build();

    // Retourne le XDR non signé — Freighter le signera côté client
    return NextResponse.json({ xdr: tx.toXDR() });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}