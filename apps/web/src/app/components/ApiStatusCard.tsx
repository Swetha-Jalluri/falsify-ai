"use client";

import { useEffect, useState } from "react";
import { fetchHealth, type HealthResponse } from "@/lib/api";

type State =
  | { phase: "loading" }
  | { phase: "ok"; data: HealthResponse }
  | { phase: "error"; message: string };

export default function ApiStatusCard() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    fetchHealth()
      .then((data) => setState({ phase: "ok", data }))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Could not reach backend";
        setState({ phase: "error", message });
      });
  }, []);

  return (
    <div className="mt-10 w-full max-w-sm rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 text-left backdrop-blur-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        API Status
      </p>

      {state.phase === "loading" && (
        <p className="text-sm text-slate-400">Connecting…</p>
      )}

      {state.phase === "error" && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <p className="text-sm text-red-400">Offline — {state.message}</p>
        </div>
      )}

      {state.phase === "ok" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Connected
            </span>
          </div>
          <Row label="App" value={state.data.app_name} />
          <Row label="Version" value={state.data.version} />
          <Row label="Env" value={state.data.environment} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-300">{value}</span>
    </div>
  );
}
