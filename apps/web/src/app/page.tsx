import ApiStatusCard from "./components/ApiStatusCard";
import CompanyWatchlist from "./components/CompanyWatchlist";
import InvestmentTheses from "./components/InvestmentTheses";

const features = [
  {
    title: "Thesis Monitoring",
    description:
      "Track your original investment thesis over time and receive alerts when key assumptions show signs of deterioration.",
    icon: "📋",
  },
  {
    title: "Evidence-Backed Verdicts",
    description:
      "Every signal is grounded in primary sources — SEC filings, earnings call transcripts, financial metrics, and curated news.",
    icon: "🔍",
  },
  {
    title: "Agentic Drift Detection",
    description:
      "Autonomous AI agents continuously scan for contradicting evidence and surface material changes before they become obvious.",
    icon: "⚡",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 font-sans flex flex-col">
      {/* Nav */}
      <header className="border-b border-slate-800 px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-white">
          Falsify
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-block mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-400">
          Early Preview
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Investment Thesis{" "}
          <span className="text-blue-400">Drift Detection</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Monitor whether an investor&apos;s original thesis for a public company
          is still supported by fresh evidence from SEC filings, earnings calls,
          financial metrics, and news.
        </p>

        <ApiStatusCard />

        {/* Feature cards */}
        <div className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 text-left backdrop-blur-sm"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-2 text-sm font-semibold text-white">
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">
                {f.description}
              </p>
            </div>
          ))}
        </div>


        {/* Demo workflow */}
        <div className="mt-24 w-full max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Try the Demo</h2>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-medium text-blue-400">
              Live API
            </span>
          </div>
          <p className="mb-1 text-sm text-slate-400">
            Add companies and investment theses — these are stored in the
            backend and returned via the real API.
          </p>
          <p className="mb-8 text-xs text-slate-600">
            Demo data resets when the backend restarts.
          </p>

          <div className="flex flex-col gap-6">
            <CompanyWatchlist />
            <InvestmentTheses />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-5 text-center text-xs text-slate-600">
        Educational portfolio project only. Not financial advice.
      </footer>
    </div>
  );
}
