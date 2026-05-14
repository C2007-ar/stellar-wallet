"use client";
import { useSession } from "@/hooks/useSession";
import { useWallet } from "@/hooks/useWallet";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TxHistory } from "@/components/wallet/TxHistory";
import { TransferForm } from "@/components/transfer/TransferForm";
import { FreighterCard } from "@/components/wallet/FreighterCard";
import { Button } from "@/components/ui/Button";
import type { WalletBalance } from "@/types";

export default function DashboardPage() {
  const { user, loading: sessionLoading, logout } = useSession();
  const { wallet, loading: walletLoading, refetch } = useWallet();

  if (sessionLoading || walletLoading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-slate-400">Chargement du wallet Diaspora Connect...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/auth";
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex gap-3 w-3/4 md:w-1/2">
          <span className="font-bold text-slate-100 w-1/3 md:w-1/6">Diaspora Connect Wallet</span>
          <span className="text-xs font-mono text-amber-400 py-8 px-0.5">
            SMARTMINDS
          </span>
        </div>
        <div className="flex items-center gap-4 w-1/4 mr-10 md:w-1/2">
          <span className="text-sm text-slate-400 hidden md:block">{user.email}</span>
          <Button variant="secondary" onClick={logout}>
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Adresse publique custodial */}
        {wallet && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="w-2/3">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Adresse Pubique
              </p>
              <p className="text-sm font-mono text-sky-400 truncate">{wallet.publicKey}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(wallet.publicKey)}
            >
              Copier
            </Button>
          </div>
        )}

        {/* Freighter */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Wallet non-custodial
          </h2>
          <FreighterCard />
        </div>

        {/* Soldes custodial */}
        {wallet && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Soldes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wallet.balances.map((b: WalletBalance) => (
  <BalanceCard key={b.asset} balance={b} />
))}
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Nouveau transfert
            </h2>
            <TransferForm onSuccess={() => refetch()} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Historique
            </h2>
            {wallet ? (
              <TxHistory history={wallet.history} publicKey={wallet.publicKey} />
            ) : (
              <p className="text-sm text-slate-400">Aucune donnée</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
