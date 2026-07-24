import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Download, FileBarChart2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getReportsSnapshot } from "../lib/api";

export default function ReportsPage() {
  const query = useQuery({
    queryKey: ["reports"],
    queryFn: getReportsSnapshot
  });

  if (query.isLoading) {
    return <p className="text-sm font-medium text-slate-600">Preparing operational report index...</p>;
  }

  if (query.isError) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertTriangle size={16} />
        Unable to load reports.
      </div>
    );
  }

  if (!query.data) {
    return <p className="text-sm font-medium text-slate-600">No reports available.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Risk Profile</p>
          <p className="mt-2 font-display text-3xl text-ink">{query.data.riskProfile}</p>
          <p className="mt-1 text-sm text-slate-600">Derived from live kernel health and operational module state.</p>
        </article>
        <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Mitigation Adoption</p>
          <p className="mt-2 font-display text-3xl text-ink">{query.data.mitigationAdoption}</p>
          <p className="mt-1 text-sm text-slate-600">Computed from healthy kernel modules exposed by the backend.</p>
        </article>
        <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Compliance</p>
          <p className="mt-2 font-display text-3xl text-ink">{query.data.compliance}</p>
          <p className="mt-1 text-sm text-slate-600">Based on enabled policy coverage in the live policy catalog.</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/65 bg-white/85 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-lg text-ink">Live Operational Report Index</h2>
          <div className="flex items-center gap-2">
            <Link
              to="/executive-report"
              className="inline-flex items-center gap-2 rounded-lg border border-sky/30 bg-sky px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#008fdf]"
            >
              <FileBarChart2 size={14} />
              Open Executive Report
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-steel"
            >
              <Download size={14} />
              Export Portfolio
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {query.data.cards.map((report) => (
            <article key={report.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold text-ink">{report.title}</p>
                <p className="text-sm text-slate-600">{report.detail}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky/10 px-2.5 py-1 text-xs font-semibold text-sky-800">
                  <FileBarChart2 size={13} />
                  {report.badge}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={13} />
                  {report.score}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
