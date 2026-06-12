"use client";

import { useEffect, useState } from "react";
import {
  fetchCompanies,
  createCompany,
  type Company,
  type CompanyRequest,
} from "@/lib/api";

const EMPTY: CompanyRequest = { ticker: "", name: "", sector: "" };

export default function CompanyWatchlist() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<CompanyRequest>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .catch(() => setError("Could not load companies."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createCompany(form);
      setCompanies((prev) => [...prev, created]);
      setForm(EMPTY);
    } catch {
      setError("Failed to add company.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
      <h2 className="mb-1 text-base font-semibold text-white">
        Company Watchlist
      </h2>
      <p className="mb-5 text-xs text-slate-500">
        Track companies whose investment theses you want to monitor.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Ticker</label>
            <input
              required
              placeholder="e.g. AAPL"
              value={form.ticker}
              onChange={(e) =>
                setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Company Name</label>
            <input
              required
              placeholder="e.g. Apple Inc."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Sector</label>
            <input
              required
              placeholder="e.g. Technology"
              value={form.sector}
              onChange={(e) =>
                setForm((f) => ({ ...f, sector: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto sm:self-start"
        >
          {submitting ? "Adding…" : "Add Company"}
        </button>
      </form>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {loading ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : companies.length === 0 ? (
        <p className="text-xs text-slate-500">No companies yet. Add one above.</p>
      ) : (
        <ul className="divide-y divide-slate-700/50">
          {companies.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-blue-400">
                  {c.ticker}
                </span>
                <span className="text-slate-200">{c.name}</span>
              </div>
              <span className="text-xs text-slate-500">{c.sector}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
