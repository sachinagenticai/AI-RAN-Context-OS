import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import type { ReactElement } from "react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import { getExecutiveReportSnapshot } from "../lib/api";
import type { ExecutiveReportSnapshot, KpiComparisonMetric } from "../types/domain";

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const formatMetric = (metric: KpiComparisonMetric, value: number): string => {
  if (metric.label === "Availability" || metric.label === "Packet Loss" || metric.label === "Energy") {
    return `${value.toFixed(2)}${metric.unit}`;
  }
  return `${Math.round(value)} ${metric.unit}`;
};

const formatMoney = (value: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(new Date(value));

const severityStyle = (severity: string): string => {
  if (severity === "critical") {
    return "border-red-300/30 bg-red-500/15 text-red-200";
  }
  if (severity === "high") {
    return "border-amber-300/30 bg-amber-500/15 text-amber-200";
  }
  if (severity === "medium") {
    return "border-sky-300/30 bg-sky-500/15 text-sky-200";
  }
  return "border-emerald-300/30 bg-emerald-500/15 text-emerald-200";
};

function KpiComparisonChart({ metrics }: { metrics: KpiComparisonMetric[] }): ReactElement {
  return (
    <div className="space-y-3">
      {metrics.map((metric) => {
        const maxValue = Math.max(metric.before, metric.after, 1);
        const beforeWidth = (metric.before / maxValue) * 100;
        const afterWidth = (metric.after / maxValue) * 100;
        const improved = metric.label === "Latency" || metric.label === "Packet Loss" || metric.label === "Energy"
          ? metric.after < metric.before
          : metric.after > metric.before;

        return (
          <article key={metric.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{metric.label}</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${improved ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}>
                {improved ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {improved ? "Improved" : "Needs review"}
              </span>
            </div>

            <div className="mt-3 grid gap-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span>Before</span>
                  <span>{formatMetric(metric, metric.before)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-slate-300" style={{ width: `${beforeWidth}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span>After</span>
                  <span>{formatMetric(metric, metric.after)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-sky via-aqua to-emerald-300" style={{ width: `${afterWidth}%` }} />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function downloadJson(fileName: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExecutiveReportCenterPage(): ReactElement {
  const [params] = useSearchParams();
  const incidentId = params.get("incident") ?? "INC-24071";

  const query = useQuery<ExecutiveReportSnapshot>({
    queryKey: ["executive-report", incidentId],
    queryFn: () => getExecutiveReportSnapshot(incidentId),
    refetchInterval: 15000
  });

  const reportTitle = useMemo(() => `AI_RAN_Executive_Report_${incidentId}.json`, [incidentId]);

  if (query.isLoading) {
    return <PageLoadingSkeleton label="Compiling executive report package..." />;
  }

  if (query.isError || !query.data) {
    return <PageErrorState message="Unable to generate Executive Report." />;
  }

  const report = query.data;

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#081426] via-[#112038] to-[#1a3557] p-6 shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(0,163,255,0.24),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(0,208,180,0.18),transparent_38%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
              <Sparkles size={13} />
              Executive Report Center
            </span>
            <h1 className="mt-4 font-display text-3xl leading-tight text-white md:text-5xl">Nokia CTO Incident Report</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Board-ready incident package with AI recommendation trace, business impact, explainability, and KPI before-vs-after outcomes.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.08em] text-slate-300">Generated {formatTimestamp(report.updatedAt)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/15"
            >
              <Printer size={14} />
              Print Report
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-sky/30 bg-sky px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#008fdf]"
            >
              <FileText size={14} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => downloadJson(reportTitle, report)}
              className="inline-flex items-center gap-2 rounded-xl border border-aqua/30 bg-aqua/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-aqua transition hover:bg-aqua/25"
            >
              <Download size={14} />
              Download JSON
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-white/10 bg-[#0b1523]/95 p-4 shadow-panel xl:col-span-2">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Incident</p>
          <p className="mt-2 font-display text-2xl text-white">{report.executiveSummary.incident}</p>
          <p className="mt-2 text-sm text-slate-300">AI Recommendation: {report.executiveSummary.aiRecommendation}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#0b1523]/95 p-4 shadow-panel">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Severity</p>
          <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${severityStyle(report.executiveSummary.severity)}`}>
            {report.executiveSummary.severity}
          </span>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#0b1523]/95 p-4 shadow-panel">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Status</p>
          <p className="mt-2 font-display text-3xl text-white">{report.executiveSummary.status}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#0b1523]/95 p-4 shadow-panel">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Confidence</p>
          <p className="mt-2 font-display text-3xl text-white">{formatPercent(report.executiveSummary.confidence)}</p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <h2 className="font-display text-xl text-white">Business Impact</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Customers Impacted</p>
              <p className="mt-2 font-display text-3xl text-white">{report.businessImpact.customersImpacted.toLocaleString("en-GB")}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Revenue Risk</p>
              <p className="mt-2 font-display text-3xl text-white">{formatMoney(report.businessImpact.revenueRisk)}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Sites</p>
              <p className="mt-2 text-sm text-slate-200">{report.businessImpact.sites.join(" · ")}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Cells</p>
              <p className="mt-2 text-sm text-slate-200">{report.businessImpact.cells.join(" · ")}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">SLA Impact</p>
              <p className="mt-2 font-display text-2xl text-white">{report.businessImpact.slaImpact}</p>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <h2 className="font-display text-xl text-white">Technical Summary</h2>
          <article className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Root Cause</p>
            <p className="mt-2 text-sm font-semibold text-white">{report.technicalSummary.rootCause}</p>
          </article>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">AI Investigation</p>
            <p className="mt-2 text-sm text-slate-200">{report.technicalSummary.aiInvestigation}</p>
          </article>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Evidence</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {report.technicalSummary.evidence.length === 0 ? <li className="rounded-lg bg-white/5 px-3 py-2 text-slate-300">No evidence records in report.</li> : null}
              {report.technicalSummary.evidence.map((item) => (
                <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
              ))}
            </ul>
          </article>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <h2 className="font-display text-xl text-white">Timeline</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {report.technicalSummary.timeline.length === 0 ? <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">No timeline events in this report.</li> : null}
          {report.technicalSummary.timeline.map((event) => (
            <li key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{event.timestamp}</p>
              <p className="mt-1 text-sm font-semibold text-white">{event.title}</p>
              <p className="mt-1 text-sm text-slate-200">{event.detail}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.08em] text-slate-500">{event.actor}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <h2 className="font-display text-xl text-white">AI Recommendation</h2>
          <article className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-emerald-200">Recommended Fix</p>
            <p className="mt-2 text-sm font-semibold text-white">{report.aiRecommendation.recommendedFix}</p>
          </article>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Alternative Fixes</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {report.aiRecommendation.alternativeFixes.length === 0 ? <li className="rounded-lg bg-white/5 px-3 py-2 text-slate-300">No alternative fixes available.</li> : null}
              {report.aiRecommendation.alternativeFixes.map((item) => (
                <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
              ))}
            </ul>
          </article>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Estimated Resolution</p>
            <p className="mt-2 font-display text-3xl text-white">{report.aiRecommendation.estimatedResolution}</p>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <h2 className="font-display text-xl text-white">AI Explainability</h2>
          <article className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Reasoning</p>
            <p className="mt-2 text-sm text-slate-200">{report.aiExplainability.reasoning}</p>
          </article>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Policies</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {(report.aiExplainability.policies.length ? report.aiExplainability.policies : ["No explicit policy matches"]).map((policy) => (
                <li key={policy} className="rounded-lg bg-white/5 px-3 py-2">{policy}</li>
              ))}
            </ul>
          </article>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Enterprise Memory</p>
            <p className="mt-2 text-sm text-slate-200">{report.aiExplainability.enterpriseMemory}</p>
          </article>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Confidence</p>
            <p className="mt-2 font-display text-3xl text-white">{formatPercent(report.aiExplainability.confidence)}</p>
          </article>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-white">KPI Comparison Before vs After</h2>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/15 px-2.5 py-1 text-xs font-semibold text-sky-200">
            <BarChart3 size={13} />
            AI-projected improvement
          </span>
        </div>
        <KpiComparisonChart metrics={report.kpiComparison} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <h2 className="font-display text-xl text-white">Attachments</h2>
        <p className="mt-1 text-sm text-slate-300">Timeline, investigation notes, and evidence exports for governance archives.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => downloadJson(`${incidentId}_timeline.json`, report.attachments.timeline)}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
          >
            <p className="text-sm font-semibold text-white">Timeline</p>
            <p className="mt-1 text-sm text-slate-300">Download structured timeline events.</p>
          </button>
          <button
            type="button"
            onClick={() => downloadJson(`${incidentId}_investigation.json`, report.attachments.investigation)}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
          >
            <p className="text-sm font-semibold text-white">Investigation</p>
            <p className="mt-1 text-sm text-slate-300">Download AI investigation narrative.</p>
          </button>
          <button
            type="button"
            onClick={() => downloadJson(`${incidentId}_evidence.json`, report.attachments.evidence)}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
          >
            <p className="text-sm font-semibold text-white">Evidence</p>
            <p className="mt-1 text-sm text-slate-300">Download supporting evidence points.</p>
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0b1523]/95 p-4 text-sm text-slate-300">
        <p className="inline-flex items-center gap-2 font-semibold text-white">
          <ShieldCheck size={15} />
          CTO Assurance Note
        </p>
        <p className="mt-2">
          This report is generated from live AI Investigation orchestration, policy evaluation, enterprise memory retrieval, and context intelligence APIs. No manual override or backend mutation is applied during report synthesis.
        </p>
      </section>
    </div>
  );
}
