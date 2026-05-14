"use client";
import { useEffect, useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { useRates } from "@/hooks/useRates";
import { convertToFiat, formatFiat } from "@/lib/rates/client";
import { Button } from "@/components/ui/Button";
import type { WalletBalance } from "@/types";

export function FreighterCard() {
  const {
    isInstalled,
    isConnected,
    publicKey,
    loading,
    error,
    connect,
    disconnect,
  } = useFreighter();
  const { rates } = useRates();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    if (isConnected && publicKey) {
      setBalanceLoading(true);
      fetch(`/api/wallet/freighter?publicKey=${publicKey}`)
        .then((res) => res.json())
        .then((data) => setBalances(data.balances || []))
        .catch(console.error)
        .finally(() => setBalanceLoading(false));
    } else {
      setBalances([]);
    }
  }, [isConnected, publicKey]);

  if (!loading && !isInstalled) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            Freighter non installé
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Installe l'extension Chrome pour connecter ton wallet non-custodial
          </p>
        </div>
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary">Installer</Button>
        </a>
      </div>
    );
  }

  if (!loading && isInstalled && !isConnected) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            Freighter détecté
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Connecte ton wallet non-custodial Stellar
          </p>
        </div>
        <Button onClick={connect} isLoading={loading}>
          Connecter
        </Button>
      </div>
    );
  }

  if (isConnected && publicKey) {
    return (
      <div className="bg-slate-800 border border-indigo-500/30 rounded-xl p-5 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Freighter — Non-custodial
            </span>
          </div>
          <Button variant="secondary" onClick={disconnect}>
            Déconnecter
          </Button>
        </div>

        {/* Adresse */}
        <div className="bg-slate-900 rounded-lg px-3 py-2">
          <p className="text-xs text-slate-400 mb-1">Adresse publique</p>
          <p className="text-xs font-mono text-indigo-400 break-all">
            {publicKey}
          </p>
        </div>

        {/* Soldes */}
        {balanceLoading && (
          <p className="text-xs text-slate-500">Chargement des soldes...</p>
        )}

        {!balanceLoading && balances.length === 0 && (
          <p className="text-xs text-slate-500">Aucun solde trouvé</p>
        )}

        {!balanceLoading && balances.map((b) => {
          const amount = parseFloat(b.balance);
          return (
            <div
              key={b.asset}
              className="flex flex-col gap-2 border-t border-slate-700 pt-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-xs font-mono text-slate-400 uppercase">
                  {b.asset}
                </span>
              </div>
              <p className="text-2xl font-mono font-bold text-slate-100">
                {amount.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}
                <span className="text-sm font-normal text-slate-400 ml-2">
                  {b.asset}
                </span>
              </p>
              {rates && (
                <div className="grid grid-cols-3 gap-2">
                  {(["usd", "eur", "xof"] as const).map((currency) => (
                    <div key={currency} className="flex flex-col gap-0.5">
                      <span className="text-xs text-slate-500 uppercase">
                        {currency}
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        {formatFiat(
                          convertToFiat(
                            amount,
                            b.asset as "XLM" | "USDC",
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
        })}

        {/* Erreur */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

      </div>
    );
  }

  // État de chargement initial
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <p className="text-xs text-slate-500">Détection de Freighter...</p>
    </div>
  );
}