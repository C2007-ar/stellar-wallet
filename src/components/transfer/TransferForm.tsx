"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTransfer } from "@/hooks/useTransfer";
import { useRates } from "@/hooks/useRates";
import { useFreighter } from "@/hooks/useFreighter";
import { convertFromFiat, convertToFiat, formatFiat } from "@/lib/rates/client";

interface TransferFormProps {
  onSuccess?: (txHash: string) => void;
}

type Currency = "XLM" | "USDC" | "USD" | "EUR" | "XOF";
type WalletMode = "custodial" | "freighter";

export function TransferForm({ onSuccess }: TransferFormProps) {
  const { transfer, loading: custodialLoading, error: custodialError, txHash, reset } = useTransfer();
  const { rates } = useRates();
  const { isConnected, publicKey, signAndSubmit, loading: freighterLoading, error: freighterError } = useFreighter();

  const [walletMode, setWalletMode] = useState<WalletMode>("custodial");
  const [form, setForm] = useState({
    toAddress: "",
    amount: "",
    currency: "XLM" as Currency,
    memo: "",
  });

  const loading = walletMode === "custodial" ? custodialLoading : freighterLoading;
  const error = walletMode === "custodial" ? custodialError : freighterError;
  const isFiat = ["USD", "EUR", "XOF"].includes(form.currency);
  const fiatToCrypto = { USD: "usd", EUR: "eur", XOF: "xof" } as const;

  const getCryptoAmount = (): string => {
    if (!isFiat || !rates || !form.amount) return form.amount;
    const fiatKey = fiatToCrypto[form.currency as "USD" | "EUR" | "XOF"];
    const converted = convertFromFiat(parseFloat(form.amount), "XLM", fiatKey, rates);
    return converted.toFixed(7);
  };

  const getPreview = (): string | null => {
    if (!rates || !form.amount || parseFloat(form.amount) <= 0) return null;
    const amount = parseFloat(form.amount);
    if (isFiat) {
      const fiatKey = fiatToCrypto[form.currency as "USD" | "EUR" | "XOF"];
      const xlm = convertFromFiat(amount, "XLM", fiatKey, rates);
      return `≈ ${xlm.toFixed(4)} XLM`;
    } else {
      const asset = form.currency as "XLM" | "USDC";
      const usd = convertToFiat(amount, asset, "usd", rates);
      const xof = convertToFiat(amount, asset, "xof", rates);
      return `≈ ${formatFiat(usd, "usd")} · ${formatFiat(xof, "xof")}`;
    }
  };

  const handleSubmit = async () => {
    const cryptoAmount = getCryptoAmount();
    const asset = isFiat ? "XLM" : (form.currency as "XLM" | "USDC");

    let hash: string | null = null;

    if (walletMode === "freighter") {
      hash = await signAndSubmit({
        toAddress: form.toAddress,
        amount: cryptoAmount,
        asset,
        memo: form.memo || undefined,
      });
    } else {
      hash = await transfer({
        toAddress: form.toAddress,
        amount: cryptoAmount,
        asset,
        memo: form.memo || undefined,
      });
    }

    if (hash && onSuccess) onSuccess(hash);
  };

  if (txHash) {
    return (
      <div className="bg-slate-800 border border-green-500/30 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <span className="text-green-400 text-lg">✓</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-400">Transfert réussi</p>
            <p className="text-xs text-slate-400">Transaction confirmée</p>
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Hash de transaction</p>
          <p className="text-xs font-mono text-sky-400 break-all">{txHash}</p>
        </div>
        <Button variant="secondary" onClick={reset}>
          Nouveau transfert
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4">

      {/* Choix du wallet */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Wallet source
        </label>
        <div className="flex bg-slate-900 rounded-lg p-1 gap-1">
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              walletMode === "custodial"
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setWalletMode("custodial")}
          >
            Custodial
          </button>
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              walletMode === "freighter"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => isConnected && setWalletMode("freighter")}
            disabled={!isConnected}
          >
            Freighter {!isConnected && "(non connecté)"}
          </button>
        </div>
      </div>

      <Input
        label="Adresse destinataire"
        placeholder="G... (56 caractères)"
        value={form.toAddress}
        onChange={(e) => setForm((f) => ({ ...f, toAddress: e.target.value }))}
      />

      <div className="flex gap-3">
        <div className="flex-1 w-1/2">
          <Input
            label="Montant"
            placeholder="0.00"
            type="number"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Devise
          </label>
          <select
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-sky-500 transition-all"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Currency }))}
          >
            <optgroup label="Crypto">
              <option value="XLM">XLM</option>
              <option value="USDC">USDC</option>
            </optgroup>
            <optgroup label="Fiat">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="XOF">XOF</option>
            </optgroup>
          </select>
        </div>
      </div>

      {getPreview() && (
        <div className="bg-slate-900 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">Vous envoyez</span>
          <span className="text-xs font-mono text-sky-400">{getPreview()}</span>
        </div>
      )}

      <Input
        label="Mémo (optionnel)"
        placeholder="Référence paiement..."
        maxLength={28}
        value={form.memo}
        onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
      />

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button onClick={handleSubmit} isLoading={loading}>
        {isFiat
          ? `Envoyer ${form.amount || "0"} ${form.currency} en XLM`
          : `Envoyer ${form.currency}`}
        {walletMode === "freighter" && " via Freighter"}
      </Button>
    </div>
  );
}
