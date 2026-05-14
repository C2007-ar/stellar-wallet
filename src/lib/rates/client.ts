const COINGECKO_URL = "https://api.coingecko.com/api/v3";

export interface Rates {
  XLM: {
    usd: number;
    eur: number;
    xof: number;
  };
  USDC: {
    usd: number;
    eur: number;
    xof: number;
  };
}

// Taux fixe CFA — 1 EUR = 655.957 XOF (parité fixe officielle)
const EUR_TO_XOF = 655.957;

export async function getRates(): Promise<Rates> {
  const res = await fetch(
    `${COINGECKO_URL}/simple/price?ids=stellar,usd-coin&vs_currencies=usd,eur`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) throw new Error("Impossible de récupérer les taux");

  const data = await res.json();

  const xlmUsd = data.stellar.usd;
  const xlmEur = data.stellar.eur;
  const usdcUsd = data["usd-coin"].usd;
  const usdcEur = data["usd-coin"].eur;

  return {
    XLM: {
      usd: xlmUsd,
      eur: xlmEur,
      xof: xlmEur * EUR_TO_XOF,
    },
    USDC: {
      usd: usdcUsd,
      eur: usdcEur,
      xof: usdcEur * EUR_TO_XOF,
    },
  };
}

export function convertToFiat(
  amount: number,
  asset: "XLM" | "USDC",
  currency: "usd" | "eur" | "xof",
  rates: Rates
): number {
  return amount * rates[asset][currency];
}

export function convertFromFiat(
  amount: number,
  asset: "XLM" | "USDC",
  currency: "usd" | "eur" | "xof",
  rates: Rates
): number {
  return amount / rates[asset][currency];
}

export function formatFiat(amount: number, currency: "usd" | "eur" | "xof"): string {
  const locales: Record<string, string> = {
    usd: "en-US",
    eur: "fr-FR",
    xof: "fr-BJ",
  };
  const currencies: Record<string, string> = {
    usd: "USD",
    eur: "EUR",
    xof: "XOF",
  };
  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency: currencies[currency],
    maximumFractionDigits: currency === "xof" ? 0 : 2,
  }).format(amount);
}