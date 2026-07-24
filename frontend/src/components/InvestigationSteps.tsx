import { AlertTriangle, CheckCircle2, CircleDashed, LoaderCircle } from "lucide-react";
import type { InvestigationAgent } from "../types/domain";

interface InvestigationStepsProps {
  steps: InvestigationAgent[];
}

const formatDuration = (value: number | null): string => {
  if (value === null) {
    return "In queue";
  }

  if (value < 1000) {
    return `${value} ms`;
  }

  return `${(value / 1000).toFixed(2)} s`;
};

const formatTimestamp = (value: string | null): string => {
  if (!value) {
    return "Awaiting execution";
  }

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

export default function InvestigationSteps({ steps }: InvestigationStepsProps) {
  const completed = steps.filter((step) => step.status === "completed").length;
  const progress = Math.round((completed / Math.max(steps.length, 1)) * 100);

  return (
    <section className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Multi-Agent Workflow</p>
          <h2 className="mt-1 font-display text-lg text-ink">AI Investigation Engine</h2>
        </div>
        <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">{progress}% complete</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-sky to-aqua transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step) => {
          const icon =
            step.status === "completed" ? (
              <CheckCircle2 size={18} className="text-aqua" />
            ) : step.status === "running" ? (
              <LoaderCircle size={18} className="animate-spin text-sky" />
            ) : step.status === "error" ? (
              <AlertTriangle size={18} className="text-red-600" />
            ) : (
              <CircleDashed size={18} className="text-slate-400" />
            );

          return (
            <li
              key={step.id}
              className={[
                "animate-rise rounded-xl border px-4 py-3 transition duration-500",
                step.status === "running"
                  ? "border-sky/40 bg-sky/5"
                  : step.status === "completed"
                    ? "border-aqua/30 bg-aqua/5"
                    : step.status === "error"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-slate-50/80"
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{step.label}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>{formatTimestamp(step.completedAt ?? step.startedAt)}</span>
                      <span>·</span>
                      <span>{formatDuration(step.executionTimeMs)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{step.reasoningSummary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {step.status.replace("_", " ")}
                    </span>
                    {step.confidence !== null ? (
                      <span className="rounded-full bg-aqua/15 px-2.5 py-1 text-xs font-semibold text-teal-800">
                        Confidence {Math.round(step.confidence * 100)}%
                      </span>
                    ) : null}
                  </div>
                  {step.artifacts.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {step.artifacts.map((artifact) => (
                        <span key={`${step.id}-${artifact.label}`} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700">
                          <span className="font-semibold">{artifact.label}:</span> {artifact.value}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}