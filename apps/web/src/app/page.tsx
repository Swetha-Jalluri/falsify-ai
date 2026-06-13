import ApiStatusCard from "./components/ApiStatusCard";
import CompanyWatchlist from "./components/CompanyWatchlist";
import EvidencePanel from "./components/EvidencePanel";
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

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#0b0f1a]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-white">
              Falsify
            </span>
            <span className="hidden rounded-full border border-slate-700 px-2.5 py-0.5 text-xs text-slate-500 sm:block">
              Thesis Drift Detection
            </span>
          </div>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-blue-400">
            Early Preview
          </span>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="px-6 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Investment Thesis{" "}
              <span className="text-blue-400">Drift Detection</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Monitor whether an investor&apos;s original thesis for a public
              company is still supported by fresh evidence from SEC filings,
              earnings calls, financial metrics, and news.
            </p>
            <div className="flex justify-center">
              <ApiStatusCard />
            </div>
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="border-t border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
              How It Works
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 text-3xl">{f.icon}</div>
                  <h3 className="mb-2 text-sm font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Demo Workflow ── */}
        <section className="border-t border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-3xl">

            <div className="mb-2 flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Try the Demo</h2>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-medium text-blue-400">
                Live API
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Add companies and investment theses below — they are stored in
              the backend and returned via the real API.
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Demo data resets when the backend restarts.
            </p>

            {/* Step 1 — Companies */}
            <div className="mt-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Step 1 — Add Companies
              </p>
              <CompanyWatchlist />
            </div>

            {/* Step 2 — Theses */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Step 2 — Write Investment Theses
              </p>
              <InvestmentTheses />
            </div>

            {/* Step 3 — Evidence */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Step 3 — Log Evidence
              </p>
              <EvidencePanel />
            </div>

          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold text-slate-400">Falsify</p>
          <p className="mt-1 text-xs text-slate-600">
            Educational portfolio project only. Not financial advice. Data
            shown is for demonstration purposes only.
          </p>
        </div>
      </footer>

    </div>
  );
}
