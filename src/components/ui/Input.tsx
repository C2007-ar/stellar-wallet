import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`bg-slate-800 border ${
          error ? "border-red-500" : "border-slate-700"
        } text-slate-100 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-500 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}