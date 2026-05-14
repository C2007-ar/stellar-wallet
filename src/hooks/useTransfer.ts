"use client";
import { useState } from "react";
import type { TransferPayload } from "@/types/index";

export function useTransfer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const transfer = async (payload: TransferPayload) => {
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du transfert");
      }

      setTxHash(data.txHash);
      return data.txHash;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setTxHash(null);
  };

  return { transfer, loading, error, txHash, reset };
}
