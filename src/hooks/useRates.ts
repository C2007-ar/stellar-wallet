"use client";
import { useState, useEffect } from "react";
import type { Rates } from "@/lib/rates/client";

export function useRates() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rates")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de récupérer les taux");
        return res.json();
      })
      .then((data) => setRates(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { rates, loading, error };
}