import { ArrowLeft, ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PlatformSectionPageProps {
  title: string;
  eyebrow: string;
  summary: string;
  status: string;
  accent: string;
  stats: Array<{ label: string; value: string; detail: string }>;
  highlights: string[];
  primaryAction: { label: string; to: string };
  children?: ReactNode;
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </article>
  );
}

export default function PlatformSectionPage({
  title,
  eyebrow,
  summary,
  status,
  accent,
  stats,
  highlights,
  primaryAction,
  children
}: PlatformSectionPageProps) {
  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#08111d] p-6 shadow-panel">
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(0,208,180,0.12),transparent_34%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
              <Sparkles size={13} />
              {eyebrow}
            </div>
            <h1 className="mt-4 font-display text-4xl text-white md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{summary}</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-300">
            <BadgeCheck size={14} />
            {status}
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-3xl border border-white/10 bg-[#0b1523] p-5 shadow-panel">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Section View</p>
              <h2 className="mt-1 font-display text-2xl text-white">Operational overview</h2>
            </div>
            <Link
              to={primaryAction.to}
              className="inline-flex items-center gap-2 rounded-xl border border-sky/30 bg-sky px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#008fdf]"
            >
              {primaryAction.label}
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">What this section does</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This area is part of the AI Native RAN OS surface and stays aligned with the platform shell, navigation conventions, and existing API-driven data flow.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Navigation</p>
              <Link to="/" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-sky-200">
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </article>
          </div>

          {children ? <div className="mt-5">{children}</div> : null}
        </section>

        <aside className="rounded-3xl border border-white/10 bg-[#0b1523] p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Highlights</p>
          <h2 className="mt-2 font-display text-2xl text-white">Built for enterprise operators</h2>
          <ul className="mt-5 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}