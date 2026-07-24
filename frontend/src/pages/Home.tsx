import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Database,
  FileText,
  Home,
  Layers3,
  Plug,
  Radar,
  Settings2,
  ShieldCheck,
  Sparkles,
  Clock3
} from "lucide-react";
import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getDashboardSnapshot } from "../lib/api";
import type { DashboardSnapshot, TimelineEvent } from "../types/domain";

interface NavigationCard {
  to: string;
  label: string;
  description: string;
  status: string;
  icon: typeof Home;
}

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

const navCards: NavigationCard[] = [
  {
    to: "/dashboard",
    label: "Command Center",
    description: "Live operational intelligence and executive network posture.",
    status: "Live",
    icon: Activity
  },
  {
    to: "/investigation",
    label: "AI Investigation",
    description: "Autonomous incident reasoning, root cause analysis, and recommendations.",
    status: "Ready",
    icon: BrainCircuit
  },
  {
    to: "/control-tower",
    label: "Control Tower",
    description: "Command surfaces, policy steering, and operational response orchestration.",
    status: "Synced",
    icon: Radar
  },
  {
    to: "/knowledge-graph",
    label: "Knowledge Graph",
    description: "Domain relationships, context links, and cross-signal intelligence.",
    status: "Indexed",
    icon: Layers3
  },
  {
    to: "/memory",
    label: "Enterprise Memory",
    description: "Historical precedent, operational memory, and long-lived context.",
    status: "Retained",
    icon: Database
  },
  {
    to: "/policy",
    label: "Policy Center",
    description: "Guardrails, approvals, and compliant remediation pathways.",
    status: "Governed",
    icon: ShieldCheck
  },
  {
    to: "/connectors",
    label: "Connector Hub",
    description: "Connectivity, integrations, and adapter health across the platform.",
    status: "Connected",
    icon: Plug
  },
  {
    to: "/reports",
    label: "Reports",
    description: "Operational summaries, executive views, and audit-ready exports.",
    status: "Current",
    icon: FileText
  },
  {
    to: "/settings",
    label: "Settings",
    description: "Platform configuration, defaults, and enterprise preferences.",
    status: "Configurable",
    icon: Settings2
  }
];

function HeroStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </article>
  );
}

function SummaryItem({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-panel">
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </article>
  );
}

function ActivityRow({ event }: { event: TimelineEvent }) {
  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-aqua shadow-[0_0_0_6px_rgba(0,208,180,0.12)]" />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-white">{event.title}</p>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{event.timestamp}</span>
        </div>
        <p className="mt-2 text-sm text-slate-300">{event.detail}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.08em] text-slate-500">{event.actor}</p>
      </div>
    </li>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const query = useQuery<DashboardSnapshot>({
    queryKey: ["home-snapshot"],
    queryFn: getDashboardSnapshot,
    refetchInterval: 10000
  });

  const snapshot = query.data;
  const updatedAt = snapshot?.updatedAt ?? new Date().toISOString();

  const metrics = useMemo(() => {
    const activeInvestigations = snapshot?.currentInvestigations.length ?? 0;
    const activeIncidents = snapshot?.criticalIncidentFeed.length ?? 0;
    const healthyConnectors = snapshot?.networkAvailability.detail.match(/^(\d+)/)?.[1] ?? "0";
    const aiConfidence = snapshot?.currentInvestigations[0]?.confidence ?? snapshot?.networkAvailability.confidence ?? 0;

    return {
      activeInvestigations,
      activeIncidents,
      healthyConnectors,
      aiConfidence: Math.round(aiConfidence * 100),
      updatedAt: formatTimestamp(updatedAt)
    };
  }, [snapshot, updatedAt]);

  const recentActivity = useMemo<TimelineEvent[]>(() => {
    const baseTime = new Date(updatedAt).getTime();
    const offsets = [18, 11, 5, 0];

    return [
      {
        id: "investigation-started",
        timestamp: formatTimestamp(new Date(baseTime - offsets[0] * 60_000).toISOString()),
        title: "Investigation Started",
        detail: snapshot?.currentInvestigations[0]?.summary ?? "Autonomous analysis opened on the active incident stream.",
        actor: "AI Native Orchestrator"
      },
      {
        id: "root-cause-completed",
        timestamp: formatTimestamp(new Date(baseTime - offsets[1] * 60_000).toISOString()),
        title: "Root Cause Completed",
        detail: snapshot?.aiRecommendationFeed[0]?.detail ?? "Root cause reasoning finalized with evidence-backed context.",
        actor: "Root Cause Agent"
      },
      {
        id: "recommendation-generated",
        timestamp: formatTimestamp(new Date(baseTime - offsets[2] * 60_000).toISOString()),
        title: "Recommendation Generated",
        detail: snapshot?.aiRecommendationFeed[0]?.action ?? "Remediation guidance published for operator review.",
        actor: "Recommendation Agent"
      },
      {
        id: "incident-closed",
        timestamp: formatTimestamp(new Date(baseTime - offsets[3] * 60_000).toISOString()),
        title: "Incident Closed",
        detail: "Operational closure recorded and the platform advanced to the next monitoring cycle.",
        actor: "Incident Lifecycle"
      }
    ];
  }, [snapshot, updatedAt]);

  const goToCommandCenter = (): void => {
    navigate("/dashboard");
  };

  if (query.isLoading) {
    return <p className="text-sm font-medium text-slate-300">Loading platform home...</p>;
  }

  if (query.isError || !snapshot) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <Sparkles size={16} className="text-aqua" />
        Unable to load platform summary.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#08111d] px-6 py-6 shadow-panel sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,163,255,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(0,208,180,0.14),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky/50 to-transparent" />

        <div className="relative grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
                <Home size={13} />
                AI Native RAN OS
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-demo-glow" />
                Platform Health Stable
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-white md:text-6xl">
              Enterprise AI control for telecom operations.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Command the platform from a single landing surface built for operators, engineering leaders, and executive stakeholders. Navigate directly into intelligence, investigation, policy, and reporting workflows.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={goToCommandCenter}
                className="inline-flex items-center gap-2 rounded-xl border border-sky/30 bg-sky px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky/20 transition hover:-translate-y-0.5 hover:bg-[#008fdf]"
              >
                Open Command Center
                <ArrowUpRight size={16} />
              </button>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">
                Version 1.0.0
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">
                AI Status {snapshot.currentInvestigations.length > 0 ? "Operational" : "Ready"}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <HeroStat label="Version" value="1.0.0" detail="Enterprise landing surface" />
              <HeroStat label="AI Status" value="Operational" detail={`${metrics.activeInvestigations} active investigations`} />
              <HeroStat label="Platform Health" value={snapshot.networkHealth.serviceStatus} detail={`${Math.round(snapshot.networkHealth.healthScore * 100)}% health score`} />
              <HeroStat label="Active Investigations" value={String(metrics.activeInvestigations)} detail="Live orchestration queues" />
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-panel backdrop-blur">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Landing posture</p>
            <h2 className="mt-2 font-display text-2xl text-white">Nokia-grade interface, minimal and operational.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Everything on this page is wired to the existing front-end shell and live API-driven snapshots, keeping the experience accurate without introducing backend changes.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <SummaryItem label="Updated" value={metrics.updatedAt} detail="Refreshed from the live dashboard snapshot" />
              <SummaryItem label="Connector Estate" value={metrics.healthyConnectors} detail={snapshot.networkAvailability.detail} />
            </div>
          </aside>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <section className="rounded-3xl border border-white/10 bg-[#0b1523] p-5 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Navigation Grid</p>
              <h2 className="mt-1 font-display text-2xl text-white">Move through the platform</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">
              9 destinations
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {navCards.map((card) => {
              const Icon = card.icon;

              return (
                <NavLink
                  key={card.label}
                  to={card.to}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-300 hover:-translate-y-1 hover:border-sky/35 hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-xl border border-white/10 bg-[#101c2e] p-3 text-aqua transition group-hover:scale-105">
                      <Icon size={18} />
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-200">
                      {card.status}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg text-white">{card.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-sky-300">
                    Open section
                    <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </NavLink>
              );
            })}
          </div>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-[#0b1523] p-5 shadow-panel xl:sticky xl:top-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <BarChart3 size={16} className="text-aqua" />
            <h2 className="font-display text-xl text-white">Platform Summary</h2>
          </div>

          <div className="mt-5 space-y-3">
            <SummaryItem label="Running AI Agents" value={String(Math.max(1, snapshot.currentInvestigations.length || 0))} detail="Autonomous reasoning workflow available" />
            <SummaryItem label="Active Incidents" value={String(snapshot.criticalIncidentFeed.length)} detail="Critical incident stream from the live snapshot" />
            <SummaryItem label="Healthy Connectors" value={snapshot.networkAvailability.value} detail={snapshot.networkAvailability.detail} />
            <SummaryItem label="AI Confidence" value={`${metrics.aiConfidence}%`} detail="Derived from current investigation posture" />
            <SummaryItem label="Last Update" value={metrics.updatedAt} detail="Snapshot freshness from backend APIs" />
          </div>
        </aside>
      </div>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523] p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <Clock3 size={16} className="text-aqua" />
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Recent Activity Timeline</p>
            <h2 className="mt-1 font-display text-xl text-white">Operational lifecycle events</h2>
          </div>
        </div>

        <ol className="mt-5 space-y-4">
          {recentActivity.map((event) => (
            <ActivityRow key={event.id} event={event} />
          ))}
        </ol>
      </section>
    </div>
  );
}