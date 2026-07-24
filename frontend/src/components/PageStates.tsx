import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export function PageLoadingSkeleton({
  label,
  blocks = 4,
  compact = false
}: {
  label: string;
  blocks?: number;
  compact?: boolean;
}): ReactElement {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 text-white shadow-panel" aria-busy="true" aria-live="polite">
      <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
        <Loader2 size={15} className="animate-spin text-sky-200" />
        {label}
      </p>
      <div className={`mt-4 grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
        {Array.from({ length: blocks }).map((_, index) => (
          <article
            key={index}
            className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="h-2.5 w-24 rounded bg-slate-700/70" />
            <div className="mt-3 h-7 w-20 rounded bg-slate-600/70" />
            <div className="mt-3 h-2.5 w-full rounded bg-slate-800/60" />
            <div className="mt-2 h-2.5 w-2/3 rounded bg-slate-800/60" />
          </article>
        ))}
      </div>
    </section>
  );
}

export function PageErrorState({ message }: { message: string }): ReactElement {
  return (
    <section className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100" role="alert">
      <p className="flex items-center gap-2 font-semibold">
        <AlertTriangle size={16} />
        Unable to load page data
      </p>
      <p className="mt-2 text-red-100/90">{message}</p>
    </section>
  );
}

export function PageEmptyState({ title, detail }: { title: string; detail: string }): ReactElement {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-200">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
        <Inbox size={16} className="text-sky-200" />
        {title}
      </p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </section>
  );
}

export function EmptyListNotice({ children }: { children: ReactNode }): ReactElement {
  return <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">{children}</p>;
}
