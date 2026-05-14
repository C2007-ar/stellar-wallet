"use client";
import { useRates, } from "@/hooks/useRates";
import { convertToFiat, formatFiat } from "@/lib/rates/client";
import type { WalletBalance } from "@/types";

interface BalanceCardProps {
  balance: WalletBalance;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const { rates, loading } = useRates();
  const isXLM = balance.asset === "XLM";
  const amount = parseFloat(balance.balance);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isXLM ? "bg-sky-400" : "bg-indigo-400"
          }`}
        />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {balance.asset}
        </span>
      </div>

      <p className="text-3xl font-mono font-bold text-slate-100 tracking-tight">
        {amount.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 7,
        })}
        <span className="text-sm font-normal text-slate-400 ml-2">
          {balance.asset}
        </span>
      </p>

      {loading && (
        <p className="text-xs text-slate-500">Chargement des taux...</p>
      )}

      {rates && !loading && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
          {(["usd", "eur", "xof"] as const).map((currency) => (
            <div key={currency} className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500 uppercase">
                {currency}
              </span>
              <span className="text-xs font-mono text-slate-300">
                {formatFiat(
                  convertToFiat(
                    amount,
                    balance.asset as "XLM" | "USDC",
                    currency,
                    rates
                  ),
                  currency
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}