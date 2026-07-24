import { TrendingDown, TrendingUp } from "lucide-react";
import type { KpiMetric } from "../types/domain";

interface KpiCardsProps {
  metrics: KpiMetric[];
}

export default function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const positiveTrend = metric.trend === "up";
        const TrendIcon = positiveTrend ? TrendingUp : TrendingDown;

        return (
          <article
            key={metric.id}
            className="animate-rise rounded-2xl border border-white/65 bg-white/80 p-5 shadow-panel"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
            <p className="mt-3 font-display text-3xl font-semibold text-ink">{metric.value}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold",
                  positiveTrend ? "bg-aqua/15 text-teal-700" : "bg-amber-100 text-amber-800"
                ].join(" ")}
              >
                <TrendIcon size={14} />
                {metric.change}
              </span>
              <span className="text-slate-500">vs baseline</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
