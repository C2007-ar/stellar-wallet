"use client";
import { useState, useEffect } from "react";

interface FreighterState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  loading: boolean;
  error: string | null;
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    isInstalled: false,
    isConnected: false,
    publicKey: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkFreighter();
  }, []);

  const checkFreighter = async () => {
    try {
      const freighter = (window as any).freighter;
      if (!freighter) {
        setState((s) => ({ ...s, isInstalled: false, loading: false }));
        return;
      }
      setState((s) => ({ ...s, isInstalled: true }));
      const isConnected = await freighter.isConnected();
      if (isConnected) {
        const { publicKey } = await freighter.getPublicKey();
        setState((s) => ({
          ...s,
          isConnected: true,
          publicKey,
          loading: false,
        }));
      } else {
        setState((s) => ({ ...s, isConnected: false, loading: false }));
      }
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message, loading: false }));
    }
  };

  const connect = async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const freighter = (window as any).freighter;
      if (!freighter) throw new Error("Freighter non installé");
      await freighter.requestAccess();
      const { publicKey } = await freighter.getPublicKey();
      setState((s) => ({
        ...s,
        isConnected: true,
        publicKey,
        loading: false,
      }));
      return publicKey;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message, loading: false }));
      return null;
    }
  };

  const signAndSubmit = async ({
    toAddress,
    amount,
    asset,
    memo,
  }: {
    toAddress: string;
    amount: string;
    asset: "XLM" | "USDC";
    memo?: string;
  }): Promise<string | null> => {
    try {
      if (!state.publicKey) throw new Error("Freighter non connecté");

      // 1. Construit la transaction XDR côté serveur
      const buildRes = await fetch("/api/transfer/freighter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPublicKey: state.publicKey,
          toAddress,
          amount,
          asset,
          memo,
        }),
      });

      const { xdr, error } = await buildRes.json();
      if (error) throw new Error(error);

      // 2. Signe avec Freighter côté client
      const freighter = (window as any).freighter;
      const { signedXDR } = await freighter.signTransaction(xdr, {
        network:
          process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
            ? "PUBLIC"
            : "TESTNET",
      });

      // 3. Soumet la transaction signée
      const submitRes = await fetch("/api/transfer/freighter/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedXdr: signedXDR,
          toAddress,
          amount,
          asset,
        }),
      });

      const result = await submitRes.json();
      if (result.error) throw new Error(result.error);

      return result.txHash;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message }));
      return null;
    }
  };

  const disconnect = () => {
    setState((s) => ({
      ...s,
      isConnected: false,
      publicKey: null,
    }));
  };

  return { ...state, connect, disconnect, signAndSubmit };
}