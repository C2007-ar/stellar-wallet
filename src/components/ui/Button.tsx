import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  isLoading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-sky-500 hover:bg-sky-400 text-white",
    secondary:
      "bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white",
    danger: "bg-red-500 hover:bg-red-400 text-white",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
}