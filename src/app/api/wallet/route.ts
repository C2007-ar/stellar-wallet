import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getBalances, getPaymentHistory } from "@/lib/stellar/client";

export async function GET() {
  try {
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
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

    const [balances, history] = await Promise.all([
      getBalances(wallet.publicKey),
      getPaymentHistory(wallet.publicKey, 10),
    ]);

    return NextResponse.json({
      publicKey: wallet.publicKey,
      walletType: wallet.walletType,
      balances,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}