import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bot,
  BrainCircuit,
  Cable,
  Clock3,
  Database,
  HardDrive,
  HeartPulse,
  RefreshCw,
  Server,
  ShieldCheck,
  Workflow
} from "lucide-react";
import type { ReactElement } from "react";
import { EmptyListNotice, PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import { getControlTowerSnapshot } from "../lib/api";
import type { AgentRuntimeStatus, ControlTowerKpi, ControlTowerSnapshot, Severity } from "../types/domain";

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));

const formatPercent = (value: number): string => `${Math.round(value * 100)}%`;

const statusBadgeClass = (status: "healthy" | "warning" | "critical" | "online" | "degraded" | "offline"): string => {
  if (status === "healthy" || status === "online") {
    return "border-emerald-300/30 bg-emerald-500/15 text-emerald-300";
  }

  if (status === "warning" || status === "degraded") {
    return "border-amber-300/30 bg-amber-500/15 text-amber-200";
  }

  return "border-red-300/30 bg-red-500/15 text-red-200";
};

const severityClass = (severity: Severity): string => {
  if (severity === "critical") {
    return "border-red-300/30 bg-red-500/15 text-red-200";
  }

  if (severity === "high") {
    return "border-amber-300/30 bg-amber-500/15 text-amber-200";
  }

  if (severity === "medium") {
    return "border-sky-300/30 bg-sky-500/15 text-sky-200";
  }

  return "border-emerald-300/30 bg-emerald-500/15 text-emerald-300";
};

const agentStatusClass = (status: AgentRuntimeStatus): string => {
  if (status === "running") {
    return "border-emerald-300/30 bg-emerald-500/15 text-emerald-300";
  }

  if (status === "idle") {
    return "border-slate-300/30 bg-slate-500/20 text-slate-200";
  }

  return "border-red-300/30 bg-red-500/15 text-red-200";
};

function KpiCard({ kpi }: { kpi: ControlTowerKpi }): ReactElement {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-panel backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusBadgeClass(kpi.status)}`}>
          {kpi.status}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl text-white">{kpi.value}</p>
      <p className="mt-2 text-xs text-slate-300">{kpi.detail}</p>
    </article>
  );
}

function PanelFrame({ title, icon, subtitle, children }: { title: string; icon: ReactElement; subtitle: string; children: ReactElement }): ReactElement {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-white/10 p-2 text-sky-200">{icon}</span>
          <div>
            <h2 className="font-display text-xl text-white">{title}</h2>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{subtitle}</p>
          </div>
        </div>
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ControlTowerPage(): ReactElement {
  const query = useQuery<ControlTowerSnapshot>({
    queryKey: ["control-tower"],
    queryFn: getControlTowerSnapshot,
    refetchInterval: 5000
  });

  if (query.isLoading) {
    return <PageLoadingSkeleton label="Loading control tower telemetry..." />;
  }

  if (query.isError || !query.data) {
    return <PageErrorState message="Unable to load Control Tower data." />;
  }

  const snapshot = query.data;

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#091527] via-[#0d1d33] to-[#0f2944] p-6 shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(0,163,255,0.24),transparent_36%),radial-gradient(circle_at_86%_22%,rgba(0,208,180,0.16),transparent_40%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
              <Workflow size={13} />
              AI Native RAN OS Operational Command Center
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight text-white md:text-5xl">Control Tower</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Unified enterprise command plane for AI agents, investigations, model runtime, connector operations, event bus continuity, and memory intelligence.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-slate-300">
              <RefreshCw size={12} className="text-sky-200" />
              Auto Refresh: 5s
            </p>
            <p className="mt-2 text-sm font-semibold text-white">Last update {formatTimestamp(snapshot.updatedAt)}</p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.topKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelFrame title="AI Agents" icon={<Bot size={17} />} subtitle="Running · Idle · Failed · Current Task · Duration">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.08em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Current Task</th>
                  <th className="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.agents.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td colSpan={4} className="px-4 py-4">
                      <EmptyListNotice>No agent runtime entries available.</EmptyListNotice>
                    </td>
                  </tr>
                ) : null}
                {snapshot.agents.map((agent) => (
                  <tr key={agent.id} className="border-t border-white/10 text-slate-100">
                    <td className="px-4 py-3 font-semibold">{agent.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${agentStatusClass(agent.status)}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{agent.currentTask}</td>
                    <td className="px-4 py-3 text-slate-300">{agent.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelFrame>

        <PanelFrame title="Live Investigations" icon={<ShieldCheck size={17} />} subtitle="Incident · Severity · Progress · Assigned AI Agent · Confidence">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.08em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Incident</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Assigned AI Agent</th>
                  <th className="px-4 py-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.investigations.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td colSpan={5} className="px-4 py-4">
                      <EmptyListNotice>No live investigations in progress.</EmptyListNotice>
                    </td>
                  </tr>
                ) : null}
                {snapshot.investigations.map((investigation) => (
                  <tr key={investigation.id} className="border-t border-white/10 text-slate-100">
                    <td className="px-4 py-3 font-semibold">{investigation.incident}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${severityClass(investigation.severity)}`}>
                        {investigation.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-36">
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-sky via-aqua to-emerald-300"
                            style={{ width: `${investigation.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-300">{investigation.progress}%</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{investigation.assignedAgent}</td>
                    <td className="px-4 py-3 text-slate-300">{Math.round(investigation.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelFrame>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelFrame title="AI Models" icon={<BrainCircuit size={17} />} subtitle="Model · Status · Latency · Tokens · Last Response">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.08em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Tokens</th>
                  <th className="px-4 py-3">Last Response</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.models.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td colSpan={5} className="px-4 py-4">
                      <EmptyListNotice>No model runtime records available.</EmptyListNotice>
                    </td>
                  </tr>
                ) : null}
                {snapshot.models.map((model) => (
                  <tr key={model.id} className="border-t border-white/10 text-slate-100">
                    <td className="px-4 py-3 font-semibold">{model.model}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${statusBadgeClass(model.status)}`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{model.latencyMs} ms</td>
                    <td className="px-4 py-3 text-slate-300">{model.tokens.toLocaleString("en-GB")}</td>
                    <td className="px-4 py-3 text-slate-300">{formatTimestamp(model.lastResponse)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelFrame>

        <PanelFrame title="Connector Hub" icon={<Cable size={17} />} subtitle="OSS · BSS · Kafka · SNMP · REST · Database">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.connectors.length === 0 ? <EmptyListNotice>No connector cards available.</EmptyListNotice> : null}
            {snapshot.connectors.map((connector) => (
              <article key={connector.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-xl text-white">{connector.name}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusBadgeClass(connector.status)}`}>
                    {connector.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">Availability {formatPercent(connector.availability)}</p>
                <p className="mt-1 text-sm text-slate-300">Latency {connector.latencyMs} ms</p>
              </article>
            ))}
          </div>
        </PanelFrame>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <PanelFrame title="Event Bus" icon={<Activity size={17} />} subtitle="Events/sec · Queue Size · Failed Events">
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Events / sec</p>
              <p className="mt-2 font-display text-3xl text-white">{Math.round(snapshot.eventBus.eventsPerSecond)}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Queue Size</p>
              <p className="mt-2 font-display text-3xl text-white">{Math.round(snapshot.eventBus.queueSize)}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Failed Events</p>
              <p className="mt-2 font-display text-3xl text-white">{Math.round(snapshot.eventBus.failedEvents)}</p>
            </article>
          </div>
        </PanelFrame>

        <PanelFrame title="Enterprise Memory" icon={<Database size={17} />} subtitle="Cached Knowledge · Previous Incidents · Learned Fixes">
          <div className="space-y-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Cached Knowledge</p>
              <p className="mt-2 font-display text-3xl text-white">{snapshot.memory.cachedKnowledge}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Previous Incidents</p>
              <p className="mt-2 font-display text-3xl text-white">{snapshot.memory.previousIncidents}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Learned Fixes</p>
              <p className="mt-2 font-display text-3xl text-white">{snapshot.memory.learnedFixes}</p>
            </article>
          </div>
        </PanelFrame>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-400">
            <HeartPulse size={13} />
            Platform Health
          </p>
          <p className="mt-2 text-sm text-slate-300">State synchronized across API, kernel, models, and connectors.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-400">
            <Server size={13} />
            Runtime Stack
          </p>
          <p className="mt-2 text-sm text-slate-300">Agent runtime and model estate are monitored continuously.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-400">
            <HardDrive size={13} />
            Memory Loop
          </p>
          <p className="mt-2 text-sm text-slate-300">Enterprise memory keeps recurring incidents and fixes available.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-400">
            <Clock3 size={13} />
            Refresh Cadence
          </p>
          <p className="mt-2 text-sm text-slate-300">All panels are refreshed every 5 seconds for live command visibility.</p>
        </article>
      </section>
    </div>
  );
}
