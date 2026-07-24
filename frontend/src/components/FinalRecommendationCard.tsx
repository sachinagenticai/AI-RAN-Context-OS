import { Bot, ShieldCheck } from "lucide-react";
import type { FinalRecommendation, PolicySummary } from "../types/domain";

interface FinalRecommendationCardProps {
  recommendation: FinalRecommendation | null;
  policy: PolicySummary | null;
  runningLabel: string;
}

export default function FinalRecommendationCard({ recommendation, policy, runningLabel }: FinalRecommendationCardProps) {
  if (!recommendation) {
    return (
      <section className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-sky" />
          <h2 className="font-display text-lg text-ink">Analyst Verdict Pending</h2>
        </div>
        <p className="mt-4 text-sm text-slate-700">
          The AI analyst is currently executing: {runningLabel}.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/65 bg-ink p-5 text-white shadow-panel">
      <div className="flex items-center gap-2 text-aqua">
        <Bot size={18} />
        <p className="text-xs font-semibold uppercase tracking-[0.08em]">Final Recommendation</p>
      </div>
      <h2 className="mt-3 font-display text-2xl leading-tight">{recommendation.headline}</h2>
      <p className="mt-3 text-sm text-slate-200">{recommendation.analystSummary}</p>
      <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">{recommendation.rationale}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Action</p>
          <p className="mt-2 text-sm font-semibold text-white">{recommendation.action}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Operating Mode</p>
          <p className="mt-2 text-sm font-semibold text-white">{recommendation.operatingMode}</p>
        </div>
      </div>

      {policy ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white">
          <ShieldCheck size={14} />
          {policy.status} · {policy.approvalLevel}
        </div>
      ) : null}
    </section>
  );
}