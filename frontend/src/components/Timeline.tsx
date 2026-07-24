import type { TimelineEvent } from "../types/domain";

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <section className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
      <h2 className="font-display text-lg text-ink">Causal Timeline</h2>
      <ol className="mt-4 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="relative pl-6">
            <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-sky" />
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{event.title}</p>
                <span className="text-xs font-semibold text-slate-500">{event.timestamp}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{event.detail}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.08em] text-slate-500">{event.actor}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
