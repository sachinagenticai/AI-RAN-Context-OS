import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Activity, PlayCircle, RadioTower, ShieldAlert, Sparkles, Radar, Clock3 } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import IncidentTable from "../components/IncidentTable";
import KpiCards from "../components/KpiCards";
import { EmptyListNotice, PageEmptyState, PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import { applyDemoSnapshot, readDemoModeState, writeDemoModeState } from "../lib/demoMode";
import type { DashboardSnapshot } from "../types/domain";
import { getDashboardSnapshot } from "../lib/api";

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));

function MetricPulse({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }): ReactElement {
  return (
    <article className={`rounded-2xl border border-white/65 bg-white/80 p-5 shadow-panel ${tone}`}>
      <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </article>
  );
}

function SectionShell({ title, icon, children }: { title: string; icon: ReactElement; children: ReactNode }): ReactElement {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel backdrop-blur">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <span className="rounded-lg bg-ink p-2 text-white">{icon}</span>
        <h2 className="font-display text-lg text-ink">{title}</h2>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function TrendPill({ trend }: { trend: string }): ReactElement {
  const style = trend === "up" ? "bg-emerald-100 text-emerald-700" : trend === "down" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{trend.toUpperCase()}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState(() => readDemoModeState());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDemoState(readDemoModeState());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const snapshotQuery = useQuery<DashboardSnapshot>({
    queryKey: ["dashboard"],
    queryFn: getDashboardSnapshot,
    refetchInterval: demoState.status === "idle" ? 30000 : 10000
  });

  const selectIncident = (id: string): void => {
    navigate(`/investigation?incident=${encodeURIComponent(id)}`);
  };

  const latestUpdatedAt = useMemo(() => snapshotQuery.data?.updatedAt ?? new Date().toISOString(), [snapshotQuery.data?.updatedAt]);

  const startDemo = (snapshot: DashboardSnapshot): void => {
    const leadIncident = snapshot.criticalIncidentFeed[0] ?? snapshot.incidents[0] ?? null;
    const nextState = {
      status: "running" as const,
      cycle: 0,
      activeIncidentId: leadIncident?.id ?? null,
      lastRecommendation: null,
      updatedAt: new Date().toISOString()
    };
    setDemoState(writeDemoModeState(nextState));
    navigate(`/investigation?incident=${encodeURIComponent(leadIncident?.id ?? "INC-24071")}&demo=1`);
  };

  if (snapshotQuery.isLoading) {
    return <PageLoadingSkeleton label="Loading network intelligence..." />;
  }

  if (snapshotQuery.isError) {
    return <PageErrorState message="Unable to load dashboard data." />;
  }

  if (!snapshotQuery.data) {
    return <PageEmptyState title="No dashboard data" detail="The dashboard snapshot did not return any content." />;
  }

  const snapshot = applyDemoSnapshot(snapshotQuery.data, demoState);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-ink via-steel to-[#17344f] p-6 text-white shadow-panel">
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-100">
                <Sparkles size={13} />
                Enterprise AI-RAN Command Center
              </div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-100">
                Demo {demoState.status}
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
              Live network intelligence for executive operations
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
              Monitor live network health, regional risk, critical incidents, AI recommendations, and predicted capacity pressure from a unified Nokia-grade control surface.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => startDemo(snapshot)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <PlayCircle size={16} />
                Start Demo
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Last refresh</p>
                <p className="mt-2 font-display text-xl">{formatTimestamp(latestUpdatedAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Network health</p>
                <p className="mt-2 font-display text-xl">{snapshot.networkHealth.healthScore.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Availability</p>
                <p className="mt-2 font-display text-xl">{snapshot.networkAvailability.value}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Capacity risk</p>
                <p className="mt-2 font-display text-xl">{snapshot.capacityForecast.risk}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <MetricPulse label="Live Network Health" value={snapshot.networkHealth.serviceStatus} detail={`${snapshot.networkHealth.moduleCount} kernel modules · connector availability ${Math.round(snapshot.networkHealth.connectorAvailability * 100)}%`} tone="" />
            <MetricPulse label="Network Availability" value={snapshot.networkAvailability.value} detail={snapshot.networkAvailability.detail} tone="" />
          </div>
        </div>
      </section>

      <KpiCards metrics={snapshot.metrics} />

      <section className="grid gap-4 xl:grid-cols-4">
        <MetricPulse label="Capacity Forecast" value={snapshot.capacityForecast.projectedUsage} detail={`${snapshot.capacityForecast.horizon} · headroom ${snapshot.capacityForecast.headroom}`} tone="ring-1 ring-sky/10" />
        <MetricPulse label="Projected Capacity" value={snapshot.capacityForecast.projectedCapacity} detail={snapshot.capacityForecast.risk} tone="ring-1 ring-aqua/10" />
        <MetricPulse label="Regional Stress" value={`${snapshot.regionalStatus.reduce((total, region) => total + region.criticalCount, 0)} critical`} detail={`${snapshot.regionalStatus.length} regions monitored`} tone="ring-1 ring-amber-200/60" />
        <MetricPulse label="Current Investigations" value={String(snapshot.currentInvestigations.length)} detail="Active autonomous investigations" tone="ring-1 ring-ink/10" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <SectionShell title="Critical Incident Feed" icon={<ShieldAlert size={16} />}>
          <div className="space-y-3">
            {snapshot.criticalIncidentFeed.length === 0 ? <EmptyListNotice>No critical incidents in the current feed.</EmptyListNotice> : null}
            {snapshot.criticalIncidentFeed.map((incident) => (
              <button
                key={incident.id}
                type="button"
                onClick={() => selectIncident(incident.id)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-sky/30 hover:bg-sky/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{incident.id} · {incident.alarm}</p>
                    <p className="mt-1 text-sm text-slate-600">{incident.site} · {incident.region} · {incident.investigationStatus}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendPill trend={incident.severity === "critical" ? "up" : "flat"} />
                    <span className="rounded-full bg-aqua/15 px-2.5 py-1 text-xs font-semibold text-teal-800">{Math.round(incident.confidence * 100)}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="AI Recommendation Feed" icon={<Sparkles size={16} />}>
          <div className="space-y-3">
            {snapshot.aiRecommendationFeed.length === 0 ? <EmptyListNotice>No AI recommendations available.</EmptyListNotice> : null}
            {snapshot.aiRecommendationFeed.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">{item.priority}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.action}</span>
                  <span>{Math.round(item.confidence * 100)}% confidence</span>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <SectionShell title="Regional Network Status" icon={<RadioTower size={16} />}>
          <div className="space-y-3">
            {snapshot.regionalStatus.length === 0 ? <EmptyListNotice>No regional status entries available.</EmptyListNotice> : null}
            {snapshot.regionalStatus.map((region) => (
              <div key={region.region} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{region.region}</p>
                    <p className="mt-1 text-sm text-slate-600">{region.siteCount} sites · {region.criticalCount} critical</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendPill trend={region.trend} />
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{region.health}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="Prediction Cards" icon={<Radar size={16} />}>
          <div className="grid gap-4 md:grid-cols-3">
            {snapshot.predictionCards.length === 0 ? <EmptyListNotice>No prediction cards available.</EmptyListNotice> : null}
            {snapshot.predictionCards.map((card) => (
              <article key={card.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{card.title}</p>
                  <TrendPill trend={card.trend} />
                </div>
                <p className="mt-3 font-display text-2xl text-ink">{card.value}</p>
                <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
                <div className="mt-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{Math.round(card.confidence * 100)}% confidence</div>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <SectionShell title="Current Investigations" icon={<Clock3 size={16} />}>
          <div className="space-y-3">
            {snapshot.currentInvestigations.length === 0 ? <EmptyListNotice>No active investigations.</EmptyListNotice> : null}
            {snapshot.currentInvestigations.map((investigation) => (
              <article key={investigation.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{investigation.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{investigation.summary}</p>
                  </div>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">{investigation.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{formatTimestamp(investigation.updatedAt)}</span>
                  <span>{Math.round(investigation.confidence * 100)}% confidence</span>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="Network Availability" icon={<Activity size={16} />}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50/80 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Availability</span>
                <span>{snapshot.networkAvailability.value}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-sky to-aqua transition-all duration-700" style={{ width: snapshot.networkAvailability.value }} />
              </div>
              <p className="mt-3 text-sm text-slate-600">{snapshot.networkAvailability.detail}</p>
            </div>

            <div className="rounded-2xl bg-slate-50/80 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Capacity forecast</span>
                <span>{snapshot.capacityForecast.risk}</span>
              </div>
              <p className="mt-3 font-display text-2xl text-ink">{snapshot.capacityForecast.projectedUsage}</p>
              <p className="mt-2 text-sm text-slate-600">Projected headroom: {snapshot.capacityForecast.headroom}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <ArrowUpRight size={16} className="text-emerald-600" />
                Forecast horizon: {snapshot.capacityForecast.horizon}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Live Network Health</p>
              <p className="mt-2 font-display text-2xl text-ink">{snapshot.networkHealth.serviceStatus}</p>
              <p className="mt-2 text-sm text-slate-600">Kernel: {snapshot.networkHealth.kernelStatus} · Modules: {snapshot.networkHealth.moduleCount}</p>
            </div>
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-panel">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-display text-lg text-ink">Active Incident Stream</h2>
          </div>
          <div className="p-5">
            <IncidentTable incidents={snapshot.incidents} onSelectIncident={selectIncident} />
          </div>
        </section>

        <SectionShell title="Executive KPIs" icon={<Sparkles size={16} />}>
          <div className="grid gap-4 md:grid-cols-2">
            {snapshot.metrics.map((metric, index) => (
              <article key={metric.id} className="animate-rise rounded-2xl border border-slate-100 bg-slate-50/80 p-4" style={{ animationDelay: `${index * 70}ms` }}>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
                <p className="mt-2 font-display text-3xl text-ink">{metric.value}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${metric.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                    {metric.change}
                  </span>
                  <span>vs baseline</span>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>
    </div>
  );
}