import { Sparkles } from "lucide-react";
import type { Recommendation } from "../types/domain";

interface RecommendationPanelProps {
  recommendations: Recommendation[];
}

export default function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  return (
    <section className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
      <h2 className="font-display text-lg text-ink">AI Recommendations</h2>
      <div className="mt-4 space-y-3">
        {recommendations.map((recommendation) => (
          <article key={recommendation.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">{recommendation.title}</h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {recommendation.priority}
                </span>
                <span className="rounded-full bg-aqua/20 px-2.5 py-1 text-xs font-semibold text-teal-800">
                  {Math.round(recommendation.confidence * 100)}%
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700">{recommendation.impact}</p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-steel"
            >
              <Sparkles size={14} />
              {recommendation.action}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
