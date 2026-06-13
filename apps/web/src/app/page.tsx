import ApiStatusCard from "./components/ApiStatusCard";
import CompanyWatchlist from "./components/CompanyWatchlist";
import DriftVerdictPanel from "./components/DriftVerdictPanel";
import EvidencePanel from "./components/EvidencePanel";
import InvestmentTheses from "./components/InvestmentTheses";

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Track Company",
    description: "Add a public company you want to monitor.",
  },
  {
    number: "02",
    title: "Define Thesis",
    description: "Write the original investment thesis to monitor.",
  },
  {
    number: "03",
    title: "Add Evidence",
    description: "Log sources that support or contradict the thesis.",
  },
  {
    number: "04",
    title: "Record Verdict",
    description: "Assess whether the thesis is holding or drifting.",
  },
];

const DEMO_STEPS = [
  {
    number: 1,
    label: "Step 1 — Track Company",
    description:
      "Start by adding the company whose thesis you want to monitor. Use the ticker, full name, and sector.",
    component: <CompanyWatchlist />,
  },
  {
    number: 2,
    label: "Step 2 — Define Investment Thesis",
    description:
      "Write the investment thesis in plain language. This is the claim Falsify will track for drift over time.",
    component: <InvestmentTheses />,
  },
  {
    number: 3,
    label: "Step 3 — Add Evidence",
    description:
      "Log a piece of evidence — a news article, filing, or earnings transcript — that either supports or contradicts the thesis. Copy the thesis ID from the row above.",
    component: <EvidencePanel />,
  },
  {
    number: 4,
    label: "Step 4 — Record Drift Verdict",
    description:
      "Based on the evidence, record your verdict on whether the thesis is still holding. Future releases will generate this automatically via AI.",
    component: <DriftVerdictPanel />,
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
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-blue-400">
              Early Preview
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="mb-6 inline-block rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-500">
              Agentic AI · Investment Research
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Know when your thesis{" "}
              <span className="text-blue-400">stops holding</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Falsify monitors investment theses against a continuous stream of
              evidence — SEC filings, earnings calls, financial metrics, and
              news — and surfaces drift before it becomes obvious.
            </p>
            <div className="flex justify-center">
              <ApiStatusCard />
            </div>
          </div>
        </section>

        {/* ── Workflow Overview Strip ── */}
        <section className="border-t border-slate-800 px-6 py-14">
          <div className="mx-auto max-w-5xl">
            <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
              How It Works
            </p>
            <div className="grid gap-0 sm:grid-cols-4">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.number} className="relative flex flex-col items-center text-center px-4">
                  {/* Connector line (not on last item) */}
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="absolute top-5 left-1/2 hidden h-px w-full bg-slate-700 sm:block" />
                  )}
                  {/* Number circle */}
                  <div className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-sm font-bold text-blue-400">
                    {step.number}
                  </div>
                  <p className="mb-1 text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs leading-relaxed text-slate-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Demo Workflow ── */}
        <section className="border-t border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-3xl">

            {/* Section intro */}
            <div className="mb-12">
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">Live Demo</h2>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-medium text-blue-400">
                  Connected to real API
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Walk through the full workflow below. Each step builds on the
                previous one — add a company, write a thesis, log evidence, then
                record a drift verdict.
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Data is stored in Supabase and persists across page reloads.
              </p>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-12">
              {DEMO_STEPS.map((step) => (
                <div key={step.number}>
                  {/* Step header */}
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-slate-400">
                      {step.number}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        {step.label}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Component */}
                  <div className="ml-12">
                    {step.component}
                  </div>

                  {/* Connector to next step */}
                  {step.number < DEMO_STEPS.length && (
                    <div className="ml-[15px] mt-6 flex items-center gap-3">
                      <div className="h-6 w-px bg-slate-700" />
                      <span className="text-xs text-slate-700">then</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 px-6 py-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-semibold text-slate-400">Falsify</p>
          <p className="mt-1 text-xs text-slate-600">
            Portfolio project — not financial advice. Data shown is for
            demonstration purposes only.
          </p>
        </div>
      </footer>

    </div>
  );
}
