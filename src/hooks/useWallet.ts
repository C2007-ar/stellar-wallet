"use client";
import { useState, useEffect, useCallback } from "react";
import type { WalletInfo } from "/home/carmel/stellar-wallet/src/types";

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallet");
      if (!res.ok) throw new Error("Impossible de charger le wallet");
      const data = await res.json();
      setWallet(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { wallet, loading, error, refetch: fetchWallet };
}