import { NextResponse } from "next/server";
import { getRates } from "@/lib/rates/client";

export async function GET() {
  try {
    const rates = await getRates();
    return NextResponse.json(rates);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Impossible de récupérer les taux" },
      { status: 500 }
    );
  }
}