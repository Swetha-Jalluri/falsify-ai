"use client";

import { useEffect, useState } from "react";
import {
  fetchTheses,
  createThesis,
  type Thesis,
  type ThesisRequest,
} from "@/lib/api";

const EMPTY: ThesisRequest = { company_ticker: "", thesis_text: "" };

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  invalidated: "bg-red-500/15 text-red-400",
  monitoring: "bg-yellow-500/15 text-yellow-400",
};

export default function InvestmentTheses() {
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [form, setForm] = useState<ThesisRequest>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTheses()
      .then(setTheses)
      .catch(() => setError("Could not load theses."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createThesis(form);
      setTheses((prev) => [...prev, created]);
      setForm(EMPTY);
    } catch {
      setError("Failed to add thesis.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
      <h2 className="mb-1 text-base font-semibold text-white">
        Investment Theses
      </h2>
      <p className="mb-5 text-xs text-slate-500">
        Write the original thesis you want Falsify to monitor for drift.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Ticker</label>
          <input
            required
            placeholder="e.g. AAPL"
            value={form.company_ticker}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                company_ticker: e.target.value.toUpperCase(),
              }))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Thesis</label>
          <textarea
            required
            rows={4}
            placeholder="Describe your investment thesis — e.g. Apple's pricing power and ecosystem lock-in will sustain 15%+ margins through 2026."
            value={form.thesis_text}
            onChange={(e) =>
              setForm((f) => ({ ...f, thesis_text: e.target.value }))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto sm:self-start"
        >
          {submitting ? "Adding…" : "Add Thesis"}
        </button>
      </form>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {loading ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : theses.length === 0 ? (
        <p className="text-xs text-slate-500">No theses yet. Add one above.</p>
      ) : (
        <ul className="divide-y divide-slate-700/50">
          {theses.map((t) => (
            <li key={t.id} className="py-4">
              <div className="mb-2 flex items-center gap-3">
                <span className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-blue-400">
                  {t.company_ticker}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                    STATUS_STYLES[t.status] ?? "bg-slate-700 text-slate-400"
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {t.thesis_text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
