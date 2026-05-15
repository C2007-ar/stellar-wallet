import Link from "next/link";

const DEMO_ACCOUNTS = [
  {
    email: "testdiasporaconnect1@gmail.com",
    password: "g585456",
    label: "Compte démo 1",
  },
  {
    email: "test2diasporaconnect@gmail.com",
    password: "h232578",
    label: "Compte démo 2",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm">✦</span>
          </div>
          <span className="font-bold text-slate-100">Diaspora Connect</span>
          <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
            SMARTMINDS
          </span>
        </div>
        <Link
          href="/auth"
          className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
          Se connecter
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-mono text-sky-400">Propulsé par la blockchain Stellar</span>
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Envoyez de l'argent en
          <span className="text-sky-400"> Afrique de l'Ouest</span>
          <br />sans frais excessifs
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Diaspora Connect vous permet d'envoyer des fonds vers vos proches
          en quelques secondes, avec des frais inférieurs à <span className="text-sky-400 font-semibold">0.00002 USD</span> par transfert —
          contre 5 à 45 USD via les canaux traditionnels.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/auth"
            className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-lg transition-all text-sm"
          >
            Créer mon wallet gratuit
          </Link>
          <a
            href="#demo"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-8 py-3 rounded-lg transition-all text-sm"
          >
            Voir la démo
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-8 w-full max-w-2xl">
          {[
            { value: "< 0.00002$", label: "Frais par transfert" },
            { value: "3-5 sec", label: "Temps de confirmation" },
            { value: "99.99%", label: "Économie vs SWIFT" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-sky-400">{stat.value}</span>
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800/50 border-y border-slate-800 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">
            Pourquoi choisir Diaspora Connect ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Ultra rapide",
                desc: "Vos transferts sont confirmés sur la blockchain Stellar en 3 à 5 secondes, peu importe la destination.",
              },
              {
                icon: "🔒",
                title: "Sécurisé",
                desc: "Vos clés sont chiffrées avec AES-256-GCM. En mode Freighter, elles ne quittent jamais votre appareil.",
              },
              {
                icon: "💱",
                title: "Multi-devises",
                desc: "Envoyez en XLM ou USDC, visualisez en USD, EUR ou XOF (Franc CFA). Taux mis à jour en temps réel.",
              },
              {
                icon: "💸",
                title: "Frais minimes",
                desc: "Moins de 0.00002 USD par transaction. Économisez jusqu'à 99.99% par rapport aux virements bancaires.",
              },
              {
                icon: "🌍",
                title: "Pour la diaspora",
                desc: "Conçu spécialement pour les transferts vers l'Afrique de l'Ouest, avec support du Franc CFA.",
              },
              {
                icon: "🦺",
                title: "Custodial & Non-custodial",
                desc: "Choisissez entre un wallet géré par la plateforme ou connectez votre propre wallet Freighter.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-3"
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-semibold text-slate-100">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparatif frais */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          Comparatif des frais de transfert
        </h2>
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Service</th>
                <th className="text-center px-6 py-4 text-slate-400 font-medium">Frais</th>
                <th className="text-center px-6 py-4 text-slate-400 font-medium">Délai</th>
              </tr>
            </thead>
            <tbody>
              {[
                { service: "✦ Diaspora Connect", frais: "< 0.00002 USD", delai: "3-5 secondes", highlight: true },
                { service: "Western Union", frais: "5 - 15 USD", delai: "Minutes à jours", highlight: false },
                { service: "SWIFT bancaire", frais: "15 - 45 USD", delai: "1 - 5 jours", highlight: false },
                { service: "Ethereum", frais: "0.50 - 5 USD", delai: "12-30 secondes", highlight: false },
              ].map((row) => (
                <tr
                  key={row.service}
                  className={`border-b border-slate-700 last:border-0 ${
                    row.highlight ? "bg-sky-500/5" : ""
                  }`}
                >
                  <td className={`px-6 py-4 font-medium ${row.highlight ? "text-sky-400" : "text-slate-300"}`}>
                    {row.service}
                  </td>
                  <td className={`px-6 py-4 text-center font-mono ${row.highlight ? "text-green-400 font-bold" : "text-slate-400"}`}>
                    {row.frais}
                  </td>
                  <td className={`px-6 py-4 text-center ${row.highlight ? "text-green-400 font-bold" : "text-slate-400"}`}>
                    {row.delai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comptes démo */}
      <section id="demo" className="bg-slate-800/50 border-y border-slate-800 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            Testez la plateforme gratuitement
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-xl mx-auto">
            Utilisez l'un de nos comptes de démonstration pour explorer toutes les fonctionnalités
            de Diaspora Connect sans créer de compte.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {DEMO_ACCOUNTS.map((account) => (
              <div
                key={account.email}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {account.label.slice(-1)}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-100">{account.label}</span>
                </div>
                <div className="flex flex-col gap-2 bg-slate-900 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono uppercase">Email</span>
                    <span className="text-xs font-mono text-sky-400">{account.email}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono uppercase">Mot de passe</span>
                    <span className="text-xs font-mono text-sky-400">{account.password}</span>
                  </div>
                </div>
                <Link
                  href="/auth"
                  className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all text-center"
                >
                  Se connecter avec ce compte
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl font-bold">
          Prêt à envoyer votre premier transfert ?
        </h2>
        <p className="text-slate-400 max-w-xl">
          Créez votre wallet en moins de 2 minutes et commencez à envoyer
          des fonds vers l'Afrique de l'Ouest à moindre coût.
        </p>
        <Link
          href="/auth"
          className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-10 py-4 rounded-lg transition-all text-sm"
        >
          Créer mon wallet gratuit →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs">✦</span>
            </div>
            <span className="text-sm font-bold text-slate-300">Diaspora Connect</span>
            <span className="text-xs text-slate-500">by SMARTMINDS</span>
          </div>
          <span className="text-xs text-slate-500">
            Propulsé par Stellar Network · Réseau de test
          </span>
        </div>
      </footer>

    </main>
  );
}