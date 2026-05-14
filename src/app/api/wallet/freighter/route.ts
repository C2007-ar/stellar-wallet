import { NextRequest, NextResponse } from "next/server";
import { getBalances, isValidStellarAddress } from "@/lib/stellar/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("publicKey");

    if (!publicKey || !isValidStellarAddress(publicKey)) {
      return NextResponse.json({ error: "Adresse invalide" }, { status: 400 });
    }

    const balances = await getBalances(publicKey);
    return NextResponse.json({ balances });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}