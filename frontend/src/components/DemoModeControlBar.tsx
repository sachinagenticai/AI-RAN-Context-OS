import { PauseCircle, PlayCircle, RefreshCcw, RotateCcw } from "lucide-react";
import type { DemoStatus } from "../lib/demoMode";

interface DemoModeControlBarProps {
  status: DemoStatus;
  cycle: number;
  activeIncidentId: string | null;
  progressLabel: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

const STATUS_STYLE: Record<DemoStatus, string> = {
  idle: "bg-slate-100 text-slate-700",
  running: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800"
};

export default function DemoModeControlBar({
  status,
  cycle,
  activeIncidentId,
  progressLabel,
  onStart,
  onPause,
  onResume,
  onReset
}: DemoModeControlBarProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-panel">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 animate-demo-glow bg-gradient-to-r from-sky via-aqua to-emerald-500" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 animate-demo-scan bg-gradient-to-r from-transparent via-sky/10 to-transparent" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Enterprise Demo Mode</p>
          <h3 className="mt-1 font-display text-lg text-ink">Autonomous Incident Simulation</h3>
          <p className="mt-2 text-sm text-slate-600">{progressLabel}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={["rounded-full px-2.5 py-1 font-semibold uppercase", STATUS_STYLE[status]].join(" ")}>{status}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">Cycle {cycle}</span>
            <span className="rounded-full bg-sky/10 px-2.5 py-1 font-semibold text-sky-800">{activeIncidentId ?? "No active incident"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onStart}
            disabled={status === "running"}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlayCircle size={16} />
            Start
          </button>
          <button
            type="button"
            onClick={onPause}
            disabled={status !== "running"}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-100 px-3.5 py-2 text-sm font-semibold text-amber-900 transition enabled:hover:-translate-y-0.5 enabled:hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PauseCircle size={16} />
            Pause
          </button>
          <button
            type="button"
            onClick={onResume}
            disabled={status !== "paused"}
            className="inline-flex items-center gap-2 rounded-xl border border-sky/30 bg-sky px-3.5 py-2 text-sm font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#008fdf] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw size={16} />
            Resume
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
