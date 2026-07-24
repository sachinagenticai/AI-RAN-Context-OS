import type { CriticalIncidentItem, DashboardSnapshot, Incident, KpiMetric } from "../types/domain";

export type DemoStatus = "idle" | "running" | "paused";

export interface DemoModeState {
  status: DemoStatus;
  cycle: number;
  activeIncidentId: string | null;
  lastRecommendation: string | null;
  updatedAt: string;
}

export const DEMO_MODE_STORAGE_KEY = "airan_demo_mode_state";

const DEFAULT_STATE: DemoModeState = {
  status: "idle",
  cycle: 0,
  activeIncidentId: null,
  lastRecommendation: null,
  updatedAt: new Date(0).toISOString()
};

const ALARM_VARIANTS = [
  "Massive MIMO Beam Collapse",
  "Interference Spike Across Sector",
  "RAN Transport Jitter Breach",
  "Scheduler Latency Saturation",
  "Mobility Handover Failure Burst",
  "PDCCH Congestion Escalation",
  "Uplink Noise Floor Instability"
] as const;

const IMPACT_VARIANTS = [
  "Autonomous triage in progress",
  "Policy gate under evaluation",
  "Service degradation risk elevated",
  "Subscriber impact containment active",
  "Cross-domain KPI drift detected"
] as const;

const bounded = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const serialize = (state: DemoModeState): string => JSON.stringify(state);

const parse = (raw: string | null): DemoModeState => {
  if (!raw) {
    return DEFAULT_STATE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoModeState>;
    return {
      status: parsed.status === "running" || parsed.status === "paused" ? parsed.status : "idle",
      cycle: typeof parsed.cycle === "number" ? Math.max(0, Math.floor(parsed.cycle)) : 0,
      activeIncidentId: typeof parsed.activeIncidentId === "string" ? parsed.activeIncidentId : null,
      lastRecommendation: typeof parsed.lastRecommendation === "string" ? parsed.lastRecommendation : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return DEFAULT_STATE;
  }
};

export const readDemoModeState = (): DemoModeState => {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  return parse(window.localStorage.getItem(DEMO_MODE_STORAGE_KEY));
};

export const writeDemoModeState = (next: DemoModeState): DemoModeState => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, serialize(next));
  }

  return next;
};

export const createDemoIncident = (baseIncident: Incident | null, cycle: number): Incident => {
  const incidentSeed = Math.max(1, cycle + 1);
  const stamp = new Date();
  const serial = String(incidentSeed).padStart(3, "0");
  const incidentId = `DEMO-${stamp.getUTCFullYear()}${String(stamp.getUTCMonth() + 1).padStart(2, "0")}${String(stamp.getUTCDate()).padStart(2, "0")}-${serial}`;
  const alarm = ALARM_VARIANTS[incidentSeed % ALARM_VARIANTS.length];
  const severity = incidentSeed % 3 === 0 ? "critical" : incidentSeed % 2 === 0 ? "high" : "medium";

  return {
    id: incidentId,
    site: baseIncident?.site ?? `Site-${110 + incidentSeed}`,
    cell: baseIncident?.cell ?? `CELL-${4100 + incidentSeed}`,
    alarm,
    region: baseIncident?.region ?? "North Metro",
    market: baseIncident?.market ?? "Enterprise 5G",
    technology: baseIncident?.technology ?? "5G SA",
    severity,
    summary: `${IMPACT_VARIANTS[incidentSeed % IMPACT_VARIANTS.length]} · cycle ${incidentSeed}`
  };
};

const applyKpiPulse = (metrics: KpiMetric[], cycle: number): KpiMetric[] => {
  if (metrics.length === 0) {
    return metrics;
  }

  return metrics.map((metric, index) => {
    const pulse = (cycle + index) % 3;
    const numeric = Number.parseInt(metric.value, 10);

    if (Number.isNaN(numeric)) {
      return {
        ...metric,
        change: pulse === 0 ? "Live recalibration" : metric.change,
        trend: pulse === 0 ? "up" : metric.trend
      };
    }

    const nextValue = numeric + (pulse === 0 ? 1 : pulse === 1 ? 0 : -1);

    return {
      ...metric,
      value: String(Math.max(0, nextValue)),
      change: pulse === 2 ? "Stabilizing" : "Demo stream",
      trend: pulse === 2 ? "down" : "up"
    };
  });
};

export const applyDemoSnapshot = (snapshot: DashboardSnapshot, demoState: DemoModeState): DashboardSnapshot => {
  if (demoState.status === "idle") {
    return snapshot;
  }

  const cycle = Math.max(0, demoState.cycle);
  const base = snapshot.criticalIncidentFeed[0] ?? snapshot.incidents[0] ?? null;
  const synthetic = createDemoIncident(base, cycle);
  const liveIncident: CriticalIncidentItem = {
    ...synthetic,
    investigationStatus: demoState.status === "paused" ? "Paused" : "Investigating",
    confidence: bounded(0.76 + ((cycle % 5) * 0.04), 0.76, 0.96),
    updatedAt: new Date().toISOString()
  };

  const existing = snapshot.criticalIncidentFeed.filter((item) => item.id !== liveIncident.id);

  return {
    ...snapshot,
    updatedAt: new Date().toISOString(),
    metrics: applyKpiPulse(snapshot.metrics, cycle),
    incidents: [synthetic, ...snapshot.incidents.filter((incident) => incident.id !== synthetic.id)].slice(0, 12),
    criticalIncidentFeed: [liveIncident, ...existing].slice(0, 5),
    currentInvestigations: [
      {
        id: synthetic.id,
        title: `${synthetic.site} · ${synthetic.alarm}`,
        status: demoState.status === "paused" ? "Paused" : "Live reasoning",
        confidence: liveIncident.confidence,
        summary: synthetic.summary,
        updatedAt: new Date().toISOString()
      },
      ...snapshot.currentInvestigations.filter((entry) => entry.id !== synthetic.id)
    ].slice(0, 4),
    aiRecommendationFeed: demoState.lastRecommendation
      ? [
          {
            id: `demo-rec-${cycle}`,
            title: "Autonomous Recommendation",
            detail: demoState.lastRecommendation,
            action: "Apply guardrailed optimization",
            confidence: liveIncident.confidence,
            priority: "High"
          },
          ...snapshot.aiRecommendationFeed
        ].slice(0, 5)
      : snapshot.aiRecommendationFeed
  };
};
