import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  Gauge,
  Layers3,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import { getExplainabilitySnapshot } from "../lib/api";
import type { ExplainabilitySnapshot } from "../types/domain";

const formatPercent = (value: number): string => `${Math.round(value * 100)}%`;

const formatMoney = (value: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));

function CollapsibleCard({
  title,
  subtitle,
  icon,
  defaultOpen = true,
  children
}: {
  title: string;
  subtitle: string;
  icon: ReactElement;
  defaultOpen?: boolean;
  children: ReactNode;
}): ReactElement {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 border-b border-white/10 pb-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-white/10 p-2 text-sky-200">{icon}</span>
          <div>
            <h2 className="font-display text-xl text-white">{title}</h2>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <span className="text-slate-300">{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function Meter({ label, value, tone }: { label: string; value: number; tone: "sky" | "amber" }): ReactElement {
  const barColor = tone === "sky" ? "from-sky via-aqua to-emerald-300" : "from-amber-300 via-ember to-red-400";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className="mt-2 font-display text-3xl text-white">{formatPercent(value)}</p>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full bg-gradient-to-r ${barColor}`} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </article>
  );
}

export default function ExplainabilityCenterPage(): ReactElement {
  const [params] = useSearchParams();
  const incidentId = params.get("incident") ?? "INC-24071";

  const query = useQuery<ExplainabilitySnapshot>({
    queryKey: ["explainability", incidentId],
    queryFn: () => getExplainabilitySnapshot(incidentId),
    refetchInterval: 15000
  });

  const rootCauseGraph = useMemo(() => {
    const nodes = query.data?.rootCauseChain ?? [];
    return nodes.map((item, index) => ({
      ...item,
      y: index * 112 + 40
    }));
  }, [query.data?.rootCauseChain]);

  if (query.isLoading) {
    return <PageLoadingSkeleton label="Building explainability narrative..." />;
  }

  if (query.isError || !query.data) {
    return <PageErrorState message="Unable to load Explainability Center." />;
  }

  const snapshot = query.data;

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#081427] via-[#0f1d31] to-[#123150] p-6 shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(0,163,255,0.25),transparent_34%),radial-gradient(circle_at_84%_26%,rgba(0,208,180,0.17),transparent_40%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
              <Sparkles size={13} />
              Explainability Center
            </span>
            <h1 className="mt-4 font-display text-3xl leading-tight text-white md:text-5xl">Transparent AI Recommendation Audit</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Every recommendation is mapped to explicit evidence, policy checks, memory precedent, business impact, and confidence boundaries for enterprise auditability.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Incident</p>
            <p className="mt-1 font-display text-2xl text-white">{snapshot.incidentId}</p>
            <p className="mt-1 text-xs text-slate-300">Updated {formatTime(snapshot.updatedAt)}</p>
            <Link
              to={`/investigation?incident=${encodeURIComponent(snapshot.incidentId)}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-sky-200"
            >
              Return to Investigation
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      <CollapsibleCard
        title="Executive Summary"
        subtitle="Recommendation · Confidence · Risk · ETA"
        icon={<BarChart3 size={17} />}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Recommendation</p>
            <p className="mt-2 text-sm font-semibold text-white">{snapshot.executiveSummary.recommendation}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Confidence</p>
            <p className="mt-2 font-display text-3xl text-white">{formatPercent(snapshot.executiveSummary.confidence)}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Risk</p>
            <p className="mt-2 font-display text-3xl text-white">{snapshot.executiveSummary.risk}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">ETA</p>
            <p className="mt-2 font-display text-3xl text-white">{snapshot.executiveSummary.eta}</p>
          </article>
        </div>
      </CollapsibleCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <CollapsibleCard title="Evidence" subtitle="KPIs · Alarms · Events · Context Retrieved · Supporting Facts" icon={<Layers3 size={17} />}>
          <div className="grid gap-3 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">KPIs</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {snapshot.evidence.kpis.length === 0 ? <li className="rounded-lg bg-white/5 px-3 py-2 text-slate-300">No KPI evidence available.</li> : null}
                {snapshot.evidence.kpis.map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Alarms</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {snapshot.evidence.alarms.length === 0 ? <li className="rounded-lg bg-white/5 px-3 py-2 text-slate-300">No alarm evidence available.</li> : null}
                {snapshot.evidence.alarms.map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Events</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {snapshot.evidence.events.length === 0 ? <li className="rounded-lg bg-white/5 px-3 py-2 text-slate-300">No event evidence available.</li> : null}
                {snapshot.evidence.events.map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Context Retrieved</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {snapshot.evidence.contextRetrieved.length === 0 ? <li className="rounded-lg bg-white/5 px-3 py-2 text-slate-300">No context extraction records available.</li> : null}
                {snapshot.evidence.contextRetrieved.map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <article className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Supporting Facts</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {snapshot.evidence.supportingFacts.length === 0 ? <li className="rounded-lg bg-white/5 px-3 py-2 text-slate-300">No supporting facts available.</li> : null}
              {snapshot.evidence.supportingFacts.map((item) => (
                <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
              ))}
            </ul>
          </article>
        </CollapsibleCard>

        <CollapsibleCard title="Confidence Analysis" subtitle="Confidence Gauge · Risk Meter" icon={<Gauge size={17} />}>
          <div className="space-y-3">
            <Meter label="Confidence Gauge" value={snapshot.confidenceAnalysis.confidenceGauge} tone="sky" />
            <Meter label="Risk Meter" value={snapshot.confidenceAnalysis.riskMeter} tone="amber" />
          </div>
        </CollapsibleCard>
      </div>

      <CollapsibleCard title="AI Reasoning" subtitle="Investigation Timeline · Root Cause Chain · Decision Flow" icon={<BrainCircuit size={17} />}>
        <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Investigation Timeline</p>
            <ol className="mt-3 space-y-3">
              {snapshot.investigationTimeline.map((event) => (
                <li key={event.id} className="relative pl-6">
                  <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-sky" />
                  <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{event.title}</p>
                      <span className="text-xs text-slate-400">{event.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{event.detail}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-500">{event.actor}</p>
                  </article>
                </li>
              ))}
            </ol>
          </article>

          <article className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Root Cause Chain</p>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#091223] p-4">
              <svg viewBox="0 0 440 370" className="h-[370px] w-full" role="img" aria-label="Root cause chain visualization">
                <line x1="62" y1="40" x2="62" y2={Math.max(40, rootCauseGraph.length * 112 - 58)} stroke="rgba(148,163,184,0.45)" strokeWidth="2" />
                {rootCauseGraph.map((node) => (
                  <g key={node.id}>
                    <circle cx="62" cy={node.y} r="7" fill="#00A3FF" />
                    <rect x="96" y={node.y - 26} rx="10" ry="10" width="320" height="54" fill="rgba(255,255,255,0.05)" stroke="rgba(148,163,184,0.24)" />
                    <text x="112" y={node.y - 5} fill="#E2E8F0" fontSize="13" fontWeight="600">
                      {node.cause.slice(0, 42)}
                    </text>
                    <text x="112" y={node.y + 14} fill="#94A3B8" fontSize="11">
                      {`Confidence ${Math.round(node.confidence * 100)}% · ${node.evidenceCount} evidence points`}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Decision Flow</p>
            <div className="space-y-2">
              {snapshot.decisionFlow.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{item.stage}</p>
                  <p className="mt-1 text-sm text-slate-200">{item.detail}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </CollapsibleCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <CollapsibleCard title="Enterprise Memory" subtitle="Similar Incidents · Previous Successful Actions · Learned Patterns" icon={<Building2 size={17} />}>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Similar Incidents</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {(snapshot.enterpriseMemory.similarIncidents.length
                  ? snapshot.enterpriseMemory.similarIncidents
                  : ["No closely matching incidents found"]).map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Previous Successful Actions</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {snapshot.enterpriseMemory.previousSuccessfulActions.map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Learned Patterns</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {(snapshot.enterpriseMemory.learnedPatterns.length ? snapshot.enterpriseMemory.learnedPatterns : ["No learned patterns available"]).map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="Policy Validation" subtitle="Policies Applied · Compliance Status · Violations" icon={<ClipboardCheck size={17} />}>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Compliance Status</p>
            <p className="mt-2 font-display text-3xl text-white">{snapshot.policyValidation.complianceStatus}</p>
          </article>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Policies Applied</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {(snapshot.policyValidation.policiesApplied.length ? snapshot.policyValidation.policiesApplied : ["No policy matches captured"]).map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Violations</p>
              {snapshot.policyValidation.violations.length ? (
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {snapshot.policyValidation.violations.map((violation) => (
                    <li key={`${violation.rule}-${violation.message}`} className="rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2">
                      <p className="font-semibold">{violation.rule}</p>
                      <p className="text-xs uppercase tracking-[0.08em] text-red-200">{violation.severity}</p>
                      <p>{violation.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">No policy violations detected.</p>
              )}
            </article>
          </div>
        </CollapsibleCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <CollapsibleCard title="Business Impact" subtitle="Customers Affected · Sites · Revenue Risk · SLA Impact" icon={<ShieldAlert size={17} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Customers Affected</p>
              <p className="mt-2 font-display text-3xl text-white">{snapshot.businessImpact.customersAffected.toLocaleString("en-GB")}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Sites</p>
              <p className="mt-2 text-sm text-slate-200">{snapshot.businessImpact.sites.join(" · ")}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Revenue Risk</p>
              <p className="mt-2 font-display text-3xl text-white">{formatMoney(snapshot.businessImpact.revenueRisk)}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">SLA Impact</p>
              <p className="mt-2 font-display text-3xl text-white">{snapshot.businessImpact.slaImpact}</p>
            </article>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="Alternative Actions" subtitle="Option A · Option B · Option C" icon={<FlaskConical size={17} />}>
          <div className="space-y-3">
            {snapshot.alternativeActions.map((option) => (
              <article key={option.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-2xl text-white">Option {option.id}</p>
                  <span className="rounded-full border border-aqua/30 bg-aqua/15 px-2.5 py-1 text-xs font-semibold text-aqua">
                    {formatPercent(option.confidence)} confidence
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-100">{option.title}</p>
                <p className="mt-2 text-sm text-slate-300">{option.rationale}</p>
              </article>
            ))}
          </div>
        </CollapsibleCard>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-400">
            <Clock3 size={13} />
            Audit Trace
          </p>
          <p className="mt-2 text-sm text-slate-300">All recommendation sections are preserved with timestamped reasoning context.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-400">
            <ClipboardCheck size={13} />
            Policy First
          </p>
          <p className="mt-2 text-sm text-slate-300">Compliance and violations are visible before execution decisions are approved.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-400">
            <Gauge size={13} />
            Confidence Boundaries
          </p>
          <p className="mt-2 text-sm text-slate-300">Confidence and risk meters present uncertainty for governance-ready sign-off.</p>
        </article>
      </section>
    </div>
  );
}
