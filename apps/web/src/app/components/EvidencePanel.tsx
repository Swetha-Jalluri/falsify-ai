"use client";

import { useEffect, useState } from "react";
import {
  fetchEvidence,
  createEvidence,
  type Evidence,
  type EvidenceRequest,
} from "@/lib/api";

const EMPTY: EvidenceRequest = {
  thesis_id: "",
  company_ticker: "",
  source_type: "",
  source_title: "",
  source_url: "",
  evidence_text: "",
  stance: "",
};

const STANCE_STYLES: Record<string, string> = {
  supports: "bg-emerald-500/15 text-emerald-400",
  contradicts: "bg-red-500/15 text-red-400",
  neutral: "bg-slate-700 text-slate-400",
};

export default function EvidencePanel() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [form, setForm] = useState<EvidenceRequest>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadEvidence() {
    fetchEvidence()
      .then(setEvidence)
      .catch(() => setError("Could not load evidence."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEvidence();

    // Refresh when InvestmentTheses imports SEC evidence
    window.addEventListener("sec-evidence-imported", loadEvidence);
    return () => window.removeEventListener("sec-evidence-imported", loadEvidence);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(field: keyof EvidenceRequest, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createEvidence(form);
      setEvidence((prev) => [created, ...prev]);
      setForm(EMPTY);
    } catch {
      setError("Failed to save evidence.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none";

  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
      <h2 className="mb-1 text-base font-semibold text-white">
        Manual Evidence Entry
      </h2>
      <p className="mb-5 text-xs text-slate-500">
        Manually log evidence that supports or contradicts a thesis. Automated
        ingestion from news and filings will replace this form in a future
        release.
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

        {/* Row: Source Type + Stance */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">
              Source Type
            </label>
            <select
              required
              value={form.source_type}
              onChange={(e) => set("source_type", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select type…
              </option>
              <option value="news">News</option>
              <option value="filing">SEC Filing</option>
              <option value="earnings">Earnings Call</option>
              <option value="analyst">Analyst Report</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Stance</label>
            <select
              required
              value={form.stance}
              onChange={(e) => set("stance", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select stance…
              </option>
              <option value="supports">Supports</option>
              <option value="contradicts">Contradicts</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>

        {/* Source Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Source Title
          </label>
          <input
            required
            placeholder="e.g. Amazon AI infrastructure demand remains strong"
            value={form.source_title}
            onChange={(e) => set("source_title", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Source URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Source URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/article"
            value={form.source_url}
            onChange={(e) => set("source_url", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Evidence Text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Evidence Text
          </label>
          <textarea
            required
            rows={4}
            placeholder="Paste or summarise the key passage that supports or contradicts the thesis."
            value={form.evidence_text}
            onChange={(e) => set("evidence_text", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto sm:self-start"
        >
          {submitting ? "Saving…" : "Save Evidence"}
        </button>
      </form>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {/* Saved evidence list */}
      {loading ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : evidence.length === 0 ? (
        <p className="text-xs text-slate-500">
          No evidence logged yet. Add the first entry above.
        </p>
      ) : (
        <ul className="divide-y divide-slate-700/50">
          {evidence.map((ev) => (
            <li key={ev.id} className="py-4">
              {/* Badges row */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-blue-400">
                  {ev.company_ticker}
                </span>
                <span className="rounded bg-slate-700/60 px-2 py-0.5 text-xs capitalize text-slate-400">
                  {ev.source_type}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                    STANCE_STYLES[ev.stance] ?? "bg-slate-700 text-slate-400"
                  }`}
                >
                  {ev.stance}
                </span>
              </div>

              {/* Title + optional link */}
              <p className="mb-1 text-sm font-medium text-slate-200">
                {ev.source_url ? (
                  <a
                    href={ev.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 hover:underline"
                  >
                    {ev.source_title}
                  </a>
                ) : (
                  ev.source_title
                )}
              </p>

              {/* Evidence text */}
              <p className="text-sm leading-relaxed text-slate-400">
                {ev.evidence_text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
