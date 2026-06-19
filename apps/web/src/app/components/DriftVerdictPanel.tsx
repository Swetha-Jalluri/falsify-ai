"use client";

import { useEffect, useState } from "react";
import {
  fetchDriftVerdicts,
  createDriftVerdict,
  generateDriftVerdict,
  type DriftVerdict,
  type DriftVerdictRequest,
} from "@/lib/api";

const EMPTY: DriftVerdictRequest = {
  thesis_id: "",
  company_ticker: "",
  verdict: "",
  confidence: 0.5,
  rationale: "",
};

const VERDICT_STYLES: Record<string, string> = {
  supported: "bg-emerald-500/15 text-emerald-400",
  weakening: "bg-yellow-500/15 text-yellow-400",
  contradicted: "bg-red-500/15 text-red-400",
  needs_more_evidence: "bg-slate-700 text-slate-400",
};

const VERDICT_LABELS: Record<string, string> = {
  supported: "Supported",
  weakening: "Weakening",
  contradicted: "Contradicted",
  needs_more_evidence: "Needs More Evidence",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Splits a rationale string into readable sentences for display.
// Sentences are split on ". " so each thought gets its own line.
function RationaleLines({ text, dim = false }: { text: string; dim?: boolean }) {
  const sentences = text
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));

  if (sentences.length <= 1) {
    return (
      <p className={`text-xs leading-relaxed ${dim ? "text-slate-500" : "text-slate-400"}`}>
        {text}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {sentences.map((sentence, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className={`mt-1 shrink-0 text-[10px] ${dim ? "text-slate-600" : "text-slate-600"}`}>
            ›
          </span>
          <span className={`text-xs leading-relaxed ${dim ? "text-slate-500" : "text-slate-400"}`}>
            {sentence}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function DriftVerdictPanel() {
  const [verdicts, setVerdicts] = useState<DriftVerdict[]>([]);
  const [form, setForm] = useState<DriftVerdictRequest>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate Verdict state
  const [generateThesisId, setGenerateThesisId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<DriftVerdict | null>(null);

  useEffect(() => {
    fetchDriftVerdicts()
      .then(setVerdicts)
      .catch(() => setError("Could not load drift verdicts."))
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof DriftVerdictRequest, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setGenerateError(null);
    setLastGenerated(null);
    try {
      const verdict = await generateDriftVerdict(generateThesisId.trim());
      setLastGenerated(verdict);
      setVerdicts((prev) => [verdict, ...prev]);
      setGenerateThesisId("");
    } catch {
      setGenerateError(
        "Failed to generate verdict. Check that the thesis ID exists and has linked evidence."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createDriftVerdict(form);
      setVerdicts((prev) => [created, ...prev]);
      setForm(EMPTY);
    } catch {
      setError("Failed to save drift verdict.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none";

  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
      <h2 className="mb-1 text-base font-semibold text-white">
        Drift Verdicts
      </h2>
      <p className="mb-5 text-xs text-slate-500">
        Record a verdict on whether a thesis is still holding. In a future
        release these will be generated automatically by the AI analyzer.
      </p>

      {/* ── Generate Verdict ── */}
      <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <p className="mb-1 text-sm font-medium text-slate-200">
          Generate Verdict
        </p>
        <p className="mb-3 text-xs text-slate-500">
          Generate a rule-based verdict from the evidence linked to a thesis.
          This counts supporting vs. contradicting evidence and writes the result
          automatically.{" "}
          <span className="text-slate-600">
            (Rule-based for now — will be replaced with AI analysis in a future
            release.)
          </span>
        </p>

        <form onSubmit={handleGenerate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">
              Thesis ID
            </label>
            <input
              required
              placeholder="Paste the thesis UUID"
              value={generateThesisId}
              onChange={(e) => setGenerateThesisId(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={generating}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 sm:self-end"
          >
            {generating ? "Analyzing…" : "Generate Verdict"}
          </button>
        </form>

        {generateError && (
          <p className="mt-3 text-xs text-red-400">{generateError}</p>
        )}

        {lastGenerated && (
          <div className="mt-3 rounded-md border border-emerald-800/50 bg-emerald-900/20 p-3">
            <p className="mb-1 text-xs font-medium text-emerald-400">
              Verdict generated
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-blue-400">
                {lastGenerated.company_ticker}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  VERDICT_STYLES[lastGenerated.verdict] ??
                  "bg-slate-700 text-slate-400"
                }`}
              >
                {VERDICT_LABELS[lastGenerated.verdict] ?? lastGenerated.verdict}
              </span>
              <span className="text-xs text-slate-500">
                {(lastGenerated.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="mt-2.5">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-slate-600">
                Reasoning
              </p>
              <RationaleLines text={lastGenerated.rationale} />
            </div>
          </div>
        )}
      </div>

      {/* ── Manual Verdict Entry ── */}
      <p className="mb-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
        Manual Entry
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
        {/* Row: Thesis ID + Ticker */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">
              Thesis ID
            </label>
            <input
              required
              placeholder="Paste the thesis UUID"
              value={form.thesis_id}
              onChange={(e) => set("thesis_id", e.target.value.trim())}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">
              Company Ticker
            </label>
            <input
              required
              placeholder="e.g. AMZN"
              value={form.company_ticker}
              onChange={(e) =>
                set("company_ticker", e.target.value.toUpperCase())
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Row: Verdict + Confidence */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">
              Verdict
            </label>
            <select
              required
              value={form.verdict}
              onChange={(e) => set("verdict", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select verdict…
              </option>
              <option value="supported">Supported</option>
              <option value="weakening">Weakening</option>
              <option value="contradicted">Contradicted</option>
              <option value="needs_more_evidence">Needs More Evidence</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">
              Confidence{" "}
              <span className="text-slate-600">
                ({(form.confidence * 100).toFixed(0)}%)
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={form.confidence}
              onChange={(e) => set("confidence", parseFloat(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Rationale */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Rationale
          </label>
          <textarea
            required
            rows={3}
            placeholder="Explain briefly why the thesis is in this state based on the evidence you have seen."
            value={form.rationale}
            onChange={(e) => set("rationale", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto sm:self-start"
        >
          {submitting ? "Saving…" : "Save Verdict"}
        </button>
      </form>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {/* Saved verdicts list */}
      {loading ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : verdicts.length === 0 ? (
        <p className="text-xs text-slate-500">
          No verdicts logged yet. Add the first one above.
        </p>
      ) : (
        <ul className="divide-y divide-slate-700/50">
          {verdicts.map((v) => (
            <li key={v.id} className="py-4">
              {/* Badges row */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-blue-400">
                  {v.company_ticker}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    VERDICT_STYLES[v.verdict] ?? "bg-slate-700 text-slate-400"
                  }`}
                >
                  {VERDICT_LABELS[v.verdict] ?? v.verdict}
                </span>
                <span className="text-xs text-slate-500">
                  {(v.confidence * 100).toFixed(0)}% confidence
                </span>
                {v.created_at && (
                  <span className="ml-auto text-xs text-slate-600">
                    {formatDate(v.created_at)}
                  </span>
                )}
              </div>

              {/* Reasoning */}
              <div className="mt-2">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-slate-600">
                  Reasoning
                </p>
                <RationaleLines text={v.rationale} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
