"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Diaspora Connect Wallet
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "login" ? "Connecte-toi à ton wallet" : "Crée ton wallet Stellar"}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex bg-slate-900 rounded-lg p-1">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "login"
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => { setMode("login"); setError(null); }}
            >
              Connexion
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "register"
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => { setMode("register"); setError(null); }}
            >
              Inscription
            </button>
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="toi@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button onClick={handleSubmit} isLoading={loading}>
            {mode === "login" ? "Se connecter" : "Créer mon wallet Diaspora Connect"}
          </Button>
        </div>

        {mode === "register" && (
          <p className="text-xs text-slate-500 text-center">
            Un wallet Stellar est automatiquement créé et financé sur le testnet.
          </p>
        )}

      </div>
    </main>
  );
}