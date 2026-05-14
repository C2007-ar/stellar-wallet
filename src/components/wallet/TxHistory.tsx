import type { PaymentRecord } from "@/types/index";

interface TxHistoryProps {
  history: PaymentRecord[];
  publicKey: string;
}

export function TxHistory({ history, publicKey }: TxHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center text-slate-400 text-sm">
        Aucune transaction pour le moment
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-100">
          Transactions récentes
        </h3>
      </div>
      <ul>
        {history.map((tx) => {
          const isSender = tx.from === publicKey;
          return (
            <li
              key={tx.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-slate-700 last:border-0 hover:bg-slate-700/50 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSender ? "bg-red-500/10" : "bg-green-500/10"
                }`}
              >
                <span className={isSender ? "text-red-400" : "text-green-400"}>
                  {isSender ? "↑" : "↓"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100">
                  {isSender ? "Envoi" : "Réception"} {tx.asset}
                </p>
                <p className="text-xs font-mono text-slate-400 truncate">
                  {isSender ? tx.to : tx.from}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-mono font-semibold ${
                    isSender ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {isSender ? "-" : "+"}
                  {parseFloat(tx.amount).toFixed(2)} {tx.asset}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}