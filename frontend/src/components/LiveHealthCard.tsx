import type { ReactElement } from "react";

interface LiveHealthCardProps {
  title: string;
  value: string;
  detail: string;
}

export default function LiveHealthCard({ title, value, detail }: LiveHealthCardProps): ReactElement {
  return (
    <article className="rounded-2xl border border-white/65 bg-white/80 p-5 shadow-panel">
      <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{title}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </article>
  );
}