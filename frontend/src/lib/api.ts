import axios from "axios";
import type {
  AgentRuntimeStatus,
  AlternativeAction,
  CapacityForecast,
  ConnectorConnectionTestResult,
  ConnectorHubItem,
  ConnectorHubSnapshot,
  ControlTowerAgent,
  ControlTowerKpi,
  ControlTowerModel,
  ControlTowerSnapshot,
  CriticalIncidentItem,
  DashboardSnapshot,
  DecisionSummary,
  EnterpriseMemorySummary,
  EnterpriseMemoryCenterSnapshot,
  EnterpriseMemoryPanel,
  ExecutiveReportSnapshot,
  ExplainabilitySnapshot,
  EventBusSnapshot,
  EvidenceSummary,
  FinalRecommendation,
  GraphEdge,
  GraphNode,
  Incident,
  InvestigationAgentUpdate,
  InvestigationArtifact,
  InvestigationBundle,
  InvestigationQueueItem,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  KnowledgeGraphSnapshot,
  KnowledgeNodeType,
  LiveInvestigation,
  PredictionCard,
  PredictionSummary,
  PolicySummary,
  Recommendation,
  RecommendationFeedItem,
  RegionalNetworkStatus,
  ReportsSnapshot,
  RootCause,
  SharedInvestigationContext,
  Severity
} from "../types/domain";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 8000
});

const DEFAULT_ENTITY_ID = "ctx-001";
const DEFAULT_ENTITY_TYPE = "site";

interface ContextSearchItem {
  id: string;
  site: string | null;
  cell: string | null;
  alarm: string | null;
  region: string | null;
  market: string | null;
  technology: string | null;
  severity: string | null;
  context: {
    insights?: string[];
    inventory?: Record<string, unknown>;
  };
}

interface ContextSearchResponse {
  items: ContextSearchItem[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

interface ContextIntelligenceResponse {
  context: {
    entity_id: string;
    entity_type: string;
    inventory_summary?: Record<string, unknown>;
    kpi_summary?: Record<string, unknown>;
    alarm_summary?: Record<string, unknown>;
    weather_summary?: Record<string, unknown>;
    insights?: string[];
  };
  correlation: {
    score: number;
    explanation: string;
    evidence: string[];
  };
  evidence: {
    why: string;
    how: string;
    evidence: string[];
    confidence: number;
    affected_objects: string[];
    timeline: string[];
  };
  business_impact: {
    subscribers_affected: number;
    revenue_impact: number;
    sla_impact: string;
    coverage_impact: string;
    risk: string;
    priority: string;
  };
  timeline: {
    historical: Array<{ timestamp: string; state: string }>;
    current: { timestamp: string; state: string };
    predicted_future: { timestamp: string; state: string };
    entity_id: string;
    entity_type: string;
  };
  quality: {
    completeness: number;
    freshness: number;
    confidence: number;
    consistency: number;
    explainability: number;
  };
}

interface ReasoningResponse {
  entity_id: string;
  entity_type: string;
  root_causes: Array<{
    cause: string;
    confidence: number;
    evidence: string[];
  }>;
  recommendations: Array<{
    action: string;
    priority: string;
    expected_improvement: number;
    rationale: string;
  }>;
  prediction: {
    degradation_risk: string;
    kpi_trend: string;
    sla_violation_risk: string;
    confidence: number;
  };
  decision: {
    recommended_action: string;
    confidence: number;
    business_priority: string;
    estimated_benefit: number;
    estimated_risk: number;
    rollback_plan: string;
  };
  confidence: number;
}

interface HealthStatus {
  status: string;
  service: string;
}

interface KernelModuleInfo {
  name: string;
  version: string;
  capabilities: string[];
  dependencies: string[];
  healthy: boolean;
}

interface KernelHealth {
  status: string;
  lifecycle_state: string;
  started_at: string | null;
  loaded_plugins: string[];
  modules: Array<{ name: string; status: string }>;
  metrics: Record<string, unknown>;
}

interface ConnectorRecord {
  metadata: {
    connector_id: string;
    connector_type: string;
    name: string;
    version?: string;
    capabilities?: string[];
    dependencies?: string[];
    tags?: string[];
  };
  configuration?: {
    connector_type?: string;
    name?: string;
    version?: string;
    auth_type?: string;
    endpoint?: string | null;
    capabilities?: string[];
    dependencies?: string[];
    settings?: Record<string, unknown>;
    tags?: string[];
  };
  status: {
    connector_id?: string;
    state?: string;
    restart_count?: number;
    last_started_at?: string | null;
    last_stopped_at?: string | null;
    last_heartbeat_at?: string | null;
    last_error?: string | null;
    running: boolean;
  };
}

interface ConnectorHealth {
  connector_id: string;
  status: string;
  availability: number;
  latency_ms: number;
  error_count: number;
  last_sync?: string | null;
  last_heartbeat?: string | null;
  details?: Record<string, unknown>;
}

interface ConnectorRuntimeStatus {
  connector_id: string;
  state: string;
  initialized: boolean;
  running: boolean;
  restart_count: number;
  last_started_at: string | null;
  last_stopped_at: string | null;
  last_heartbeat_at: string | null;
  last_error: string | null;
}

interface ConnectorMetrics {
  connector_id: string;
  connections: number;
  messages: number;
  records: number;
  latency_ms: number;
  failures: number;
  retries: number;
  availability: number;
}

interface ConnectorDetailResponse {
  metadata: ConnectorRecord["metadata"];
  configuration: NonNullable<ConnectorRecord["configuration"]>;
  status: ConnectorRuntimeStatus;
  health: ConnectorHealth;
  metrics: ConnectorMetrics;
}

interface ConnectorDiscoveryResponse {
  registered_connectors: string[];
  available_connectors: Array<{
    connector_type: string;
    capabilities: string[];
    description: string;
    transport: string;
    mode: string;
  }>;
  transformation_profiles: string[];
}

interface ConnectorCapabilityCatalog {
  connectors: Record<string, string[]>;
  available_types: Record<string, string[]>;
}

interface PolicyVersionResponse {
  version: string;
  policies: Array<{ id: string; name: string; enabled: boolean }>;
}

interface PolicyEvaluationResponse {
  status: string;
  reason: string;
  matched_rules: string[];
  violations: Array<{
    rule_name: string;
    severity: string;
    message: string;
  }>;
  risk_score: number;
  approval_level: string;
  request_id: string;
  policy_version: string;
  timestamp: string;
  evaluation_time: number;
}

interface MemorySummaryResponse {
  entity_id: string;
  entity_type: string;
  summary: string;
  entry_count: number;
  categories: string[];
}

interface MemoryHistoryEntry {
  id?: string;
  entity_id?: string;
  entity_type?: string;
  incident_id?: string | null;
  policy_id?: string | null;
  category?: string | null;
  payload?: Record<string, unknown>;
  timestamp?: string | null;
  content?: string | null;
  summary?: string | null;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("airan_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const normalizeSeverity = (value: string | null | undefined): Severity => {
  switch ((value ?? "").toLowerCase()) {
    case "critical":
      return "critical";
    case "major":
    case "high":
      return "high";
    case "minor":
    case "low":
      return "low";
    default:
      return "medium";
  }
};

const formatPercentage = (value: number): string => `${Math.round(value * 100)}%`;

const nowIso = (): string => new Date().toISOString();

const asRecord = (value: unknown): Record<string, unknown> => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

const readNumberByPath = (source: Record<string, unknown>, path: string): number | null => {
  const segments = path.split(".");
  let current: unknown = source;

  for (const segment of segments) {
    if (!current || typeof current !== "object") {
      return null;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  if (typeof current === "number" && Number.isFinite(current)) {
    return current;
  }

  if (typeof current === "string") {
    const parsed = Number(current);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const readNumberFromCandidates = (source: Record<string, unknown>, candidates: string[], fallback = 0): number => {
  for (const path of candidates) {
    const value = readNumberByPath(source, path);
    if (value !== null) {
      return value;
    }
  }

  return fallback;
};

const formatDurationFrom = (startedAt: string | null | undefined): string => {
  if (!startedAt) {
    return "--";
  }

  const startedMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startedMs)) {
    return "--";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedMs) / 1000));
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

const buildGraph = (): { nodes: GraphNode[]; edges: GraphEdge[] } => ({
  nodes: [
    { id: "n1", label: "gNodeB", group: "radio", x: 80, y: 75 },
    { id: "n2", label: "Transport", group: "transport", x: 230, y: 55 },
    { id: "n3", label: "UPF", group: "core", x: 370, y: 90 },
    { id: "n4", label: "Policy", group: "policy", x: 250, y: 170 },
    { id: "n5", label: "Slice KPI", group: "radio", x: 120, y: 190 }
  ],
  edges: [
    { id: "e1", from: "n1", to: "n2", weight: 0.8 },
    { id: "e2", from: "n2", to: "n3", weight: 0.71 },
    { id: "e3", from: "n3", to: "n4", weight: 0.76 },
    { id: "e4", from: "n4", to: "n1", weight: 0.63 },
    { id: "e5", from: "n5", to: "n1", weight: 0.9 }
  ]
});

const mapIncident = (item: ContextSearchItem): Incident => ({
  id: item.id,
  site: item.site ?? "Unknown site",
  cell: item.cell ?? "Unknown cell",
  alarm: item.alarm ?? "No active alarm",
  region: item.region ?? "Unassigned",
  market: item.market ?? "Unassigned",
  technology: item.technology ?? "Unknown",
  severity: normalizeSeverity(item.severity),
  summary: item.context.insights?.[0] ?? "Context record available"
});

const mapTimeline = (payload: ContextIntelligenceResponse["timeline"]) => [
  {
    id: "historical",
    timestamp: new Date(payload.historical[0]?.timestamp ?? payload.current.timestamp).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    title: "Historical Context",
    detail: `State: ${payload.historical[0]?.state ?? "unknown"}`,
    actor: "Context Intelligence"
  },
  {
    id: "current",
    timestamp: new Date(payload.current.timestamp).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    title: "Current State",
    detail: `State: ${payload.current.state}`,
    actor: "Context Intelligence"
  },
  {
    id: "future",
    timestamp: new Date(payload.predicted_future.timestamp).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    title: "Predicted Outlook",
    detail: `State: ${payload.predicted_future.state}`,
    actor: "Context Intelligence"
  }
];

const getContextSearch = async (): Promise<ContextSearchResponse> => {
  const response = await api.get<ContextSearchResponse>("/api/v1/context/search", {
    params: { page: 1, page_size: 20 }
  });

  return response.data;
};

const getContextIntelligence = async (entityId: string, entityType: string): Promise<ContextIntelligenceResponse> => {
  const response = await api.get<ContextIntelligenceResponse>("/api/v1/context/intelligence", {
    params: { entity_id: entityId, entity_type: entityType }
  });

  return response.data;
};

const getContextSection = async (
  endpoint: "/api/v1/context/evidence" | "/api/v1/context/timeline" | "/api/v1/context/business-impact" | "/api/v1/context/quality",
  entityId: string,
  entityType: string
): Promise<ContextIntelligenceResponse> => {
  const response = await api.get<ContextIntelligenceResponse>(endpoint, {
    params: { entity_id: entityId, entity_type: entityType }
  });

  return response.data;
};

const runInvestigationStep = async <T>(
  id: string,
  pendingDetail: string,
  action: () => Promise<T>,
  buildCompleted: (result: T, elapsedMs: number) => Omit<InvestigationAgentUpdate, "id" | "status" | "startedAt" | "completedAt">,
  onStepUpdate?: (step: InvestigationAgentUpdate) => void
): Promise<T> => {
  const startedAt = nowIso();
  const startedPerf = performance.now();
  onStepUpdate?.({
    id,
    status: "running",
    startedAt,
    completedAt: null,
    executionTimeMs: null,
    reasoningSummary: pendingDetail,
    confidence: null,
    artifacts: []
  });

  try {
    const result = await action();
    const elapsedMs = Math.round(performance.now() - startedPerf);
    onStepUpdate?.({
      id,
      status: "completed",
      startedAt,
      completedAt: nowIso(),
      executionTimeMs: elapsedMs,
      ...buildCompleted(result, elapsedMs)
    });
    return result;
  } catch (error) {
    const elapsedMs = Math.round(performance.now() - startedPerf);
    onStepUpdate?.({
      id,
      status: "error",
      startedAt,
      completedAt: nowIso(),
      executionTimeMs: elapsedMs,
      reasoningSummary: error instanceof Error ? error.message : "Investigation step failed",
      confidence: null,
      artifacts: []
    });
    throw error;
  }
};

const formatArtifacts = (...entries: Array<InvestigationArtifact | null>): InvestigationArtifact[] =>
  entries.filter((entry): entry is InvestigationArtifact => entry !== null);

const policyRiskFromLabels = (risk: string, estimatedRisk: number, correlationScore: number): number => {
  const labelScore = risk.toLowerCase() === "high" ? 0.9 : risk.toLowerCase() === "medium" ? 0.6 : 0.3;
  return Math.max(labelScore, estimatedRisk, correlationScore);
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const memoryEntryText = (entry: MemoryHistoryEntry): string => {
  const payload = asRecord(entry.payload);
  const payloadText = Object.values(payload)
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map((value) => String(value));

  return [entry.summary ?? "", entry.content ?? "", ...payloadText]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const CONNECTOR_HUB_TARGETS: Array<{ name: string; aliases: string[]; defaultServices: string[]; defaultApis: string[] }> = [
  { name: "OSS", aliases: ["oss"], defaultServices: ["Fault Management", "Provisioning"], defaultApis: ["TMF641", "REST"] },
  { name: "BSS", aliases: ["bss", "billing", "crm"], defaultServices: ["Billing", "Subscriber CRM"], defaultApis: ["TMF622", "REST"] },
  { name: "EMS", aliases: ["ems", "element"], defaultServices: ["Element Control", "Alarm Relay"], defaultApis: ["NETCONF", "SNMP"] },
  { name: "NMS", aliases: ["nms", "network management"], defaultServices: ["Network Monitoring", "Topology"], defaultApis: ["REST", "SNMP"] },
  { name: "Kafka", aliases: ["kafka", "stream"], defaultServices: ["Event Streaming", "Topic Routing"], defaultApis: ["Kafka", "Avro"] },
  { name: "REST APIs", aliases: ["rest", "http", "api"], defaultServices: ["Northbound API", "Southbound API"], defaultApis: ["REST", "OpenAPI"] },
  { name: "SNMP", aliases: ["snmp"], defaultServices: ["Trap Ingestion", "Polling"], defaultApis: ["SNMP v2c", "SNMP v3"] },
  { name: "gNMI", aliases: ["gnmi", "g-nmi"], defaultServices: ["Streaming Telemetry", "Model Sync"], defaultApis: ["gNMI", "gRPC"] },
  { name: "NETCONF", aliases: ["netconf"], defaultServices: ["Config Push", "State Retrieval"], defaultApis: ["NETCONF", "YANG"] },
  { name: "Database", aliases: ["database", "db", "sql", "postgres", "mysql"], defaultServices: ["State Store", "Audit Persistence"], defaultApis: ["SQL", "JDBC"] },
  { name: "Vector DB", aliases: ["vector", "embedding", "vectordb"], defaultServices: ["Embedding Index", "Similarity Search"], defaultApis: ["Vector Search", "REST"] },
  { name: "Enterprise Memory", aliases: ["memory", "knowledge"], defaultServices: ["Memory Summary", "Memory History"], defaultApis: ["/api/v1/memory/summary", "/api/v1/memory/history"] },
  { name: "LLM Gateway", aliases: ["llm", "model", "gateway", "inference"], defaultServices: ["Prompt Routing", "Model Invocation"], defaultApis: ["REST", "gRPC"] }
];

const deterministicHash = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

const buildConnectorHistory = (
  connectorId: string,
  latencyMs: number,
  requests: number,
  errors: number,
  retries: number,
  syncSuccess: number,
  queueDepth: number
): Array<{ timestamp: string; latencyMs: number; requests: number; errors: number; retries: number; syncSuccess: number; queueDepth: number }> => {
  const baseline = deterministicHash(connectorId);

  return Array.from({ length: 12 }).map((_, index) => {
    const offset = 11 - index;
    const timestamp = new Date(Date.now() - offset * 5 * 60 * 1000).toISOString();
    const wave = ((baseline + index * 17) % 9) - 4;
    const requestWave = ((baseline + index * 29) % 23) - 11;

    return {
      timestamp,
      latencyMs: Math.max(1, Math.round(latencyMs + wave * 1.7)),
      requests: Math.max(0, Math.round(requests + requestWave * 0.8)),
      errors: Math.max(0, Math.round(errors + (wave > 2 ? 1 : 0))),
      retries: Math.max(0, Math.round(retries + (wave > 1 ? 1 : 0))),
      syncSuccess: clamp01(syncSuccess - Math.max(0, wave) * 0.006),
      queueDepth: Math.max(0, Math.round(queueDepth + requestWave * 0.35))
    };
  });
};

const buildFinalRecommendation = (
  incident: Incident,
  evidence: EvidenceSummary,
  decision: DecisionSummary,
  policy: PolicySummary,
  memory: EnterpriseMemorySummary,
  prediction: PredictionSummary
): FinalRecommendation => {
  const requiresHumanReview = policy.status !== "Approved";
  const operatingMode = requiresHumanReview ? "Guardrailed escalation" : "Autonomous execution";
  const headline = requiresHumanReview
    ? `Escalate ${decision.businessPriority} action for human approval`
    : `Execute ${decision.recommendedAction}`;
  const analystSummary = `${incident.site} / ${incident.cell} shows ${prediction.degradationRisk.toLowerCase()} degradation risk with ${Math.round(
    decision.confidence * 100
  )}% decision confidence.`;
  const rationale = `${evidence.why}. ${memory.summary} ${
    requiresHumanReview ? `Policy requires ${policy.approvalLevel} approval before change execution.` : "Policy guardrails allow direct execution."
  }`;

  return {
    headline,
    action: decision.recommendedAction,
    analystSummary,
    rationale,
    operatingMode,
    approvalLevel: policy.approvalLevel
  };
};

export const login = async (username: string, password: string): Promise<string> => {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  return `demo-${username}-token`;
};

export const getDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  const [search, health, connectors, modules, policy, modelTypes] = await Promise.all([
    getContextSearch(),
    api.get<HealthStatus>("/api/v1/health"),
    api.get<ConnectorHealth[]>("/api/v1/connectors/health"),
    api.get<KernelModuleInfo[]>("/api/v1/kernel/modules"),
    api.get<PolicyVersionResponse>("/api/v1/policy"),
    api.get<string[]>("/api/v1/models/types"),
    api.get<MemorySummaryResponse>("/api/v1/memory/summary", {
      params: { entity_id: DEFAULT_ENTITY_ID, entity_type: DEFAULT_ENTITY_TYPE }
    })
  ]);

  const incidentItems = search.items.map(mapIncident);
  const criticalCount = incidentItems.filter((item) => item.severity === "critical").length;
  const healthyConnectors = connectors.data.filter((item) => item.status.toLowerCase() === "healthy" || item.availability >= 0.99).length;
  const averageAvailability = connectors.data.length
    ? connectors.data.reduce((total, item) => total + item.availability, 0) / connectors.data.length
    : 0;

  const leadIncident = incidentItems[0] ?? {
    id: DEFAULT_ENTITY_ID,
    site: "Unknown site",
    cell: "Unknown cell",
    alarm: "No active alarm",
    region: "Unassigned",
    market: "Unassigned",
    technology: "Unknown",
    severity: "medium" as Severity,
    summary: "No context available"
  };

  const intelligence = await getContextIntelligence(leadIncident.id, DEFAULT_ENTITY_TYPE);
  const reasoning = await api.post<ReasoningResponse>("/api/v1/reasoning/analyze", {
    entity_id: leadIncident.id,
    entity_type: DEFAULT_ENTITY_TYPE,
    context: intelligence.context,
    correlation: intelligence.correlation,
    evidence: intelligence.evidence,
    business_impact: intelligence.business_impact,
    timeline: intelligence.timeline,
    quality: intelligence.quality
  });

  const regionStats = incidentItems.reduce<Record<string, { siteCount: number; criticalCount: number; total: number }>>((accumulator, item) => {
    const regionKey = item.region || "Unassigned";
    const current = accumulator[regionKey] ?? { siteCount: 0, criticalCount: 0, total: 0 };
    current.siteCount += 1;
    current.total += item.severity === "critical" ? 2 : item.severity === "high" ? 1 : 0;
    if (item.severity === "critical") {
      current.criticalCount += 1;
    }
    accumulator[regionKey] = current;
    return accumulator;
  }, {});

  const regionalStatus: RegionalNetworkStatus[] = Object.entries(regionStats).map(([region, stat]) => ({
    region,
    siteCount: stat.siteCount,
    criticalCount: stat.criticalCount,
    health: stat.criticalCount > 0 ? "At Risk" : "Stable",
    trend: stat.total > 2 ? "up" : stat.total === 0 ? "flat" : "down"
  }));

  const criticalIncidentFeed: CriticalIncidentItem[] = incidentItems
    .filter((item) => item.severity === "critical" || item.severity === "high")
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      investigationStatus: index === 0 ? "Investigating" : "Queued",
      confidence: item.severity === "critical" ? 0.95 : 0.84,
      updatedAt: new Date(Date.now() - index * 120000).toISOString()
    }));

  const aiRecommendationFeed: RecommendationFeedItem[] = reasoning.data.recommendations.map((entry, index) => ({
    id: `rec-${index + 1}`,
    title: entry.action,
    detail: entry.rationale,
    action: entry.action,
    confidence: entry.expected_improvement,
    priority: entry.priority
  }));

  const currentInvestigations: InvestigationQueueItem[] = incidentItems.slice(0, 4).map((incident, index) => ({
    id: incident.id,
    title: `${incident.site} · ${incident.alarm}`,
    status: index === 0 ? "Live reasoning" : index === 1 ? "Topology validation" : "Queued",
    confidence: index === 0 ? intelligence.quality.confidence : 0.72 - index * 0.08,
    summary: incident.summary,
    updatedAt: new Date(Date.now() - index * 90000).toISOString()
  }));

  const predictionCards: PredictionCard[] = [
    {
      id: "degradation",
      title: "Degradation Risk",
      value: reasoning.data.prediction.degradation_risk,
      detail: reasoning.data.prediction.kpi_trend,
      confidence: reasoning.data.prediction.confidence,
      trend: reasoning.data.prediction.degradation_risk === "High" ? "up" : reasoning.data.prediction.degradation_risk === "Low" ? "down" : "flat"
    },
    {
      id: "sla",
      title: "SLA Violation Risk",
      value: reasoning.data.prediction.sla_violation_risk,
      detail: `Policy version ${policy.data.version}`,
      confidence: intelligence.quality.confidence,
      trend: reasoning.data.prediction.sla_violation_risk === "High" ? "up" : reasoning.data.prediction.sla_violation_risk === "Low" ? "down" : "flat"
    },
    {
      id: "capacity",
      title: "Capacity Pressure",
      value: `${Math.round(intelligence.correlation.score * 100)}%`,
      detail: `${modelTypes.data.length} model types in catalog`,
      confidence: intelligence.correlation.score,
      trend: intelligence.correlation.score > 0.6 ? "up" : intelligence.correlation.score < 0.3 ? "down" : "flat"
    }
  ];

  const capacityUsage = Math.min(98, Math.round(intelligence.correlation.score * 55 + criticalCount * 6 + 18));
  const capacityForecast: CapacityForecast = {
    horizon: "Next 6 hours",
    projectedUsage: `${capacityUsage}%`,
    projectedCapacity: "100%",
    headroom: `${100 - capacityUsage}%`,
    risk: capacityUsage > 80 ? "Constrained" : capacityUsage > 60 ? "Watch" : "Healthy"
  };

  const metrics = [
    {
      id: "contexts",
      label: "Context Records",
      value: String(search.pagination.total_items),
      change: `${search.pagination.total_pages} pages`,
      trend: "up" as const
    },
    {
      id: "critical",
      label: "Critical Contexts",
      value: String(criticalCount),
      change: `${incidentItems.length - criticalCount} non-critical`,
      trend: criticalCount > 0 ? ("up" as const) : ("down" as const)
    },
    {
      id: "connectors",
      label: "Healthy Connectors",
      value: String(healthyConnectors),
      change: `${connectors.data.length} monitored`,
      trend: healthyConnectors === connectors.data.length ? ("up" as const) : ("down" as const)
    },
    {
      id: "kernel",
      label: "Kernel Modules",
      value: String(modules.data.length),
      change: health.data.status.toUpperCase(),
      trend: health.data.status.toLowerCase() === "ok" ? ("up" as const) : ("down" as const)
    }
  ];

  const healthScore = Math.min(1, (averageAvailability + (health.data.status.toLowerCase() === "ok" ? 1 : 0.5)) / 2);

  return {
    metrics,
    incidents: incidentItems,
    updatedAt: new Date().toISOString(),
    networkHealth: {
      serviceStatus: health.data.status,
      kernelStatus: health.data.status,
      connectorAvailability: averageAvailability,
      moduleCount: modules.data.length,
      healthScore
    },
    regionalStatus,
    criticalIncidentFeed,
    aiRecommendationFeed,
    currentInvestigations,
    predictionCards,
    networkAvailability: {
      value: formatPercentage(averageAvailability),
      detail: `${healthyConnectors} of ${connectors.data.length} connectors healthy`,
      confidence: averageAvailability
    },
    capacityForecast
  };
};

export const runInvestigationOrchestrator = async (
  incidentId: string,
  onStepUpdate?: (step: InvestigationAgentUpdate) => void,
  options?: {
    incidentOverride?: Partial<Incident>;
    stepDelayMs?: number;
  }
): Promise<InvestigationBundle> => {
  const stepDelayMs = Math.max(0, options?.stepDelayMs ?? 0);
  const paceSteps = async (): Promise<void> => {
    if (stepDelayMs <= 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), stepDelayMs);
    });
  };

  const sharedContext: SharedInvestigationContext = {
    incidentId,
    entityType: DEFAULT_ENTITY_TYPE,
    contextSummary: "Awaiting context acquisition",
    kpiAssessment: "Awaiting KPI analysis",
    topologyAssessment: "Awaiting topology assessment",
    rootCauseAssessment: "Awaiting root cause reasoning",
    policyAssessment: "Awaiting policy evaluation",
    memoryAssessment: "Awaiting enterprise memory retrieval",
    recommendationAssessment: "Awaiting recommendation synthesis",
    artifacts: {}
  };

  const contextAgentPayload = await runInvestigationStep(
    "context-agent",
    "Context Agent is loading context search and context intelligence into shared memory",
    async () => {
      const search = await getContextSearch();
      const selectedItem = search.items.find((entry) => entry.id === incidentId) ?? search.items[0] ?? {
        id: DEFAULT_ENTITY_ID,
        site: "Unknown site",
        cell: "Unknown cell",
        alarm: "No active alarm",
        region: "Unassigned",
        market: "Unassigned",
        technology: "Unknown",
        severity: "Minor",
        context: { insights: ["No matching context record found"] }
      };
      const intelligence = await getContextIntelligence(selectedItem.id, DEFAULT_ENTITY_TYPE);
      return { search, item: selectedItem, intelligence };
    },
    (result) => {
      sharedContext.contextSummary = `Context Agent scanned ${result.search.items.length} records and hydrated the shared investigation context for ${result.item.id}.`;
      sharedContext.artifacts["context-agent"] = formatArtifacts(
        { label: "Incident", value: result.item.id },
        { label: "Records scanned", value: String(result.search.items.length) },
        { label: "Correlation score", value: `${Math.round(result.intelligence.correlation.score * 100)}%` }
      );
      return {
        reasoningSummary: sharedContext.contextSummary,
        confidence: result.intelligence.quality.confidence,
        artifacts: sharedContext.artifacts["context-agent"]
      };
    },
    onStepUpdate
  );
  await paceSteps();

  const { item, intelligence } = contextAgentPayload;

  const kpiAgentPayload = await runInvestigationStep(
    "kpi-analysis-agent",
    "KPI Analysis Agent is evaluating business impact and quality across live KPI signals",
    async () => {
      const businessImpact = await getContextSection("/api/v1/context/business-impact", item.id, DEFAULT_ENTITY_TYPE);
      const quality = await getContextSection("/api/v1/context/quality", item.id, DEFAULT_ENTITY_TYPE);
      return { businessImpact, quality };
    },
    (result) => {
      const kpiCount = Object.keys(intelligence.context.kpi_summary ?? {}).length;
      sharedContext.kpiAssessment = `KPI Analysis Agent assessed ${kpiCount} KPI fields, ${result.businessImpact.business_impact.subscribers_affected} impacted subscribers, and ${Math.round(result.quality.quality.explainability * 100)}% explainability.`;
      sharedContext.artifacts["kpi-analysis-agent"] = formatArtifacts(
        { label: "KPI fields", value: String(kpiCount) },
        { label: "Subscribers affected", value: String(result.businessImpact.business_impact.subscribers_affected) },
        { label: "Explainability", value: `${Math.round(result.quality.quality.explainability * 100)}%` }
      );
      return {
        reasoningSummary: sharedContext.kpiAssessment,
        confidence: result.quality.quality.confidence,
        artifacts: sharedContext.artifacts["kpi-analysis-agent"]
      };
    },
    onStepUpdate
  );
  await paceSteps();

  const topologyPayload = await runInvestigationStep(
    "topology-agent",
    "Topology Agent is reconstructing timeline and cross-domain topology state",
    () => getContextSection("/api/v1/context/timeline", item.id, DEFAULT_ENTITY_TYPE),
    (result) => {
      sharedContext.topologyAssessment = `Topology Agent mapped ${result.timeline.current.state} current state and ${result.timeline.predicted_future.state} future state for the incident domain.`;
      sharedContext.artifacts["topology-agent"] = formatArtifacts(
        { label: "Current state", value: result.timeline.current.state },
        { label: "Predicted state", value: result.timeline.predicted_future.state }
      );
      return {
        reasoningSummary: sharedContext.topologyAssessment,
        confidence: 0.81,
        artifacts: sharedContext.artifacts["topology-agent"]
      };
    },
    onStepUpdate
  );
  await paceSteps();

  const rootCausePayload = await runInvestigationStep(
    "root-cause-agent",
    "Root Cause Agent is loading evidence and executing causal reasoning",
    async () => {
      const evidence = await getContextSection("/api/v1/context/evidence", item.id, DEFAULT_ENTITY_TYPE);
      const reasoning = await api.post<ReasoningResponse>("/api/v1/reasoning/analyze", {
        entity_id: item.id,
        entity_type: DEFAULT_ENTITY_TYPE,
        context: intelligence.context,
        correlation: intelligence.correlation,
        evidence: evidence.evidence,
        business_impact: kpiAgentPayload.businessImpact.business_impact,
        timeline: topologyPayload.timeline,
        quality: kpiAgentPayload.quality.quality
      });
      return { evidence, reasoning };
    },
    (result) => {
      const topCause = result.reasoning.data.root_causes[0]?.cause ?? "No dominant cause";
      sharedContext.rootCauseAssessment = `Root Cause Agent fused ${result.evidence.evidence.evidence.length} evidence points and ranked ${result.reasoning.data.root_causes.length} causes, selecting ${topCause}.`;
      sharedContext.artifacts["root-cause-agent"] = formatArtifacts(
        { label: "Evidence points", value: String(result.evidence.evidence.evidence.length) },
        { label: "Top cause", value: topCause },
        { label: "Confidence", value: `${Math.round(result.reasoning.data.confidence * 100)}%` }
      );
      return {
        reasoningSummary: sharedContext.rootCauseAssessment,
        confidence: result.reasoning.data.confidence,
        artifacts: sharedContext.artifacts["root-cause-agent"]
      };
    },
    onStepUpdate
  );
  await paceSteps();

  const policy = await runInvestigationStep(
    "policy-agent",
    "Policy Agent is evaluating guardrails for the proposed remediation",
    () =>
      api.post<PolicyEvaluationResponse>("/api/v1/policy/evaluate", {
        recommended_action: rootCausePayload.reasoning.data.decision.recommended_action,
        risk_score: policyRiskFromLabels(
          kpiAgentPayload.businessImpact.business_impact.risk,
          rootCausePayload.reasoning.data.decision.estimated_risk,
          intelligence.correlation.score
        ),
        prediction: {
          sla_violation_risk: rootCausePayload.reasoning.data.prediction.sla_violation_risk
        }
      }),
    (result) => {
      sharedContext.policyAssessment = `Policy Agent returned ${result.data.status} with ${result.data.approval_level} approval level.`;
      sharedContext.artifacts["policy-agent"] = formatArtifacts(
        { label: "Policy status", value: result.data.status },
        { label: "Approval level", value: result.data.approval_level }
      );
      return {
        reasoningSummary: sharedContext.policyAssessment,
        confidence: 1 - Math.min(result.data.risk_score, 0.95),
        artifacts: sharedContext.artifacts["policy-agent"]
      };
    },
    onStepUpdate
  );
  await paceSteps();

  const memory = await runInvestigationStep(
    "enterprise-memory-agent",
    "Enterprise Memory Agent is loading operational memory and historical precedent",
    () =>
      api.get<MemorySummaryResponse>("/api/v1/memory/summary", {
        params: { entity_id: item.id, entity_type: DEFAULT_ENTITY_TYPE }
      }),
    (result) => {
      sharedContext.memoryAssessment = `Enterprise Memory Agent summarized ${result.data.entry_count} historical entries for contextual precedent.`;
      sharedContext.artifacts["enterprise-memory-agent"] = formatArtifacts(
        { label: "Memory entries", value: String(result.data.entry_count) },
        { label: "Categories", value: result.data.categories.join(", ") || "none" }
      );
      return {
        reasoningSummary: sharedContext.memoryAssessment,
        confidence: result.data.entry_count > 0 ? 0.78 : 0.58,
        artifacts: sharedContext.artifacts["enterprise-memory-agent"]
      };
    },
    onStepUpdate
  );
  await paceSteps();

  const mappedRecommendations: Recommendation[] = rootCausePayload.reasoning.data.recommendations.map((entry, index) => ({
    id: `rec-${index + 1}`,
    title: entry.action,
    impact: entry.rationale,
    confidence: entry.expected_improvement,
    action: entry.action,
    priority: entry.priority
  }));

  const rootCauses: RootCause[] = rootCausePayload.reasoning.data.root_causes.map((entry) => ({
    cause: entry.cause,
    confidence: entry.confidence,
    evidence: entry.evidence
  }));

  const evidence: EvidenceSummary = {
    why: rootCausePayload.evidence.evidence.why,
    how: rootCausePayload.evidence.evidence.how,
    evidence: rootCausePayload.evidence.evidence.evidence,
    confidence: rootCausePayload.evidence.evidence.confidence,
    affectedObjects: rootCausePayload.evidence.evidence.affected_objects
  };

  const policySummary: PolicySummary = {
    status: policy.data.status,
    reason: policy.data.reason,
    matchedRules: policy.data.matched_rules,
    violations: policy.data.violations.map((entry) => ({
      ruleName: entry.rule_name,
      severity: entry.severity,
      message: entry.message
    })),
    riskScore: policy.data.risk_score,
    approvalLevel: policy.data.approval_level,
    timestamp: policy.data.timestamp
  };

  const memorySummary: EnterpriseMemorySummary = {
    summary: memory.data.summary,
    entryCount: memory.data.entry_count,
    categories: memory.data.categories
  };

  const decision: DecisionSummary = {
    recommendedAction: rootCausePayload.reasoning.data.decision.recommended_action,
    confidence: rootCausePayload.reasoning.data.decision.confidence,
    businessPriority: rootCausePayload.reasoning.data.decision.business_priority,
    estimatedBenefit: rootCausePayload.reasoning.data.decision.estimated_benefit,
    estimatedRisk: rootCausePayload.reasoning.data.decision.estimated_risk,
    rollbackPlan: rootCausePayload.reasoning.data.decision.rollback_plan
  };

  const prediction: PredictionSummary = {
    degradationRisk: rootCausePayload.reasoning.data.prediction.degradation_risk,
    kpiTrend: rootCausePayload.reasoning.data.prediction.kpi_trend,
    slaViolationRisk: rootCausePayload.reasoning.data.prediction.sla_violation_risk,
    confidence: rootCausePayload.reasoning.data.prediction.confidence
  };

  const finalRecommendation = await runInvestigationStep(
    "recommendation-agent",
    "Recommendation Agent is synthesizing the final cross-agent verdict",
    async () => Promise.resolve(buildFinalRecommendation(mapIncident(item), evidence, decision, policySummary, memorySummary, prediction)),
    (result) => {
      sharedContext.recommendationAssessment = `Recommendation Agent finalized ${result.operatingMode.toLowerCase()} with action ${result.action}.`;
      sharedContext.artifacts["recommendation-agent"] = formatArtifacts(
        { label: "Action", value: result.action },
        { label: "Operating mode", value: result.operatingMode },
        { label: "Approval level", value: result.approvalLevel }
      );
      return {
        reasoningSummary: sharedContext.recommendationAssessment,
        confidence: decision.confidence,
        artifacts: sharedContext.artifacts["recommendation-agent"]
      };
    },
    onStepUpdate
  );

  const graph = buildGraph();
  const mappedIncident = mapIncident(item);

  return {
    context: sharedContext,
    incident: {
      ...mappedIncident,
      ...(options?.incidentOverride ?? {})
    },
    evidence,
    timeline: mapTimeline(topologyPayload.timeline),
    recommendations: mappedRecommendations,
    nodes: graph.nodes,
    edges: graph.edges,
    rootCauses,
    prediction,
    decision,
    businessImpact: {
      subscribersAffected: kpiAgentPayload.businessImpact.business_impact.subscribers_affected,
      revenueImpact: kpiAgentPayload.businessImpact.business_impact.revenue_impact,
      slaImpact: kpiAgentPayload.businessImpact.business_impact.sla_impact,
      coverageImpact: kpiAgentPayload.businessImpact.business_impact.coverage_impact,
      risk: kpiAgentPayload.businessImpact.business_impact.risk,
      priority: kpiAgentPayload.businessImpact.business_impact.priority
    },
    quality: {
      completeness: kpiAgentPayload.quality.quality.completeness,
      freshness: kpiAgentPayload.quality.quality.freshness,
      confidence: kpiAgentPayload.quality.quality.confidence,
      consistency: kpiAgentPayload.quality.quality.consistency,
      explainability: kpiAgentPayload.quality.quality.explainability
    },
    policy: policySummary,
    memory: memorySummary,
    finalRecommendation
  };
};

export const getReportsSnapshot = async (): Promise<ReportsSnapshot> => {
  const search = await getContextSearch();
  const entityId = search.items[0]?.id ?? DEFAULT_ENTITY_ID;

  const [health, kernelHealth, modules, policy, modelTypes, connectors, connectorHealth, memory] = await Promise.all([
    api.get<HealthStatus>("/api/v1/health"),
    api.get<KernelHealth>("/api/v1/kernel/health"),
    api.get<KernelModuleInfo[]>("/api/v1/kernel/modules"),
    api.get<PolicyVersionResponse>("/api/v1/policy"),
    api.get<string[]>("/api/v1/models/types"),
    api.get<ConnectorRecord[]>("/api/v1/connectors"),
    api.get<ConnectorHealth[]>("/api/v1/connectors/health"),
    api.get<MemorySummaryResponse>("/api/v1/memory/summary", {
      params: { entity_id: entityId, entity_type: DEFAULT_ENTITY_TYPE }
    })
  ]);

  const averageAvailability = connectorHealth.data.length
    ? connectorHealth.data.reduce((total, item) => total + item.availability, 0) / connectorHealth.data.length
    : 0;
  const healthyModuleCount = modules.data.filter((item) => item.healthy).length;
  const enabledPolicies = policy.data.policies.filter((item) => item.enabled).length;

  return {
    riskProfile: kernelHealth.data.status,
    mitigationAdoption: formatPercentage(healthyModuleCount / Math.max(modules.data.length, 1)),
    compliance: formatPercentage(enabledPolicies / Math.max(policy.data.policies.length, 1)),
    cards: [
      {
        id: "api-health",
        title: "API Service Health",
        detail: `${health.data.service} is reporting ${health.data.status}.`,
        badge: "Health",
        score: health.data.status.toUpperCase()
      },
      {
        id: "kernel-runtime",
        title: "Kernel Runtime",
        detail: `${kernelHealth.data.lifecycle_state} with ${kernelHealth.data.modules.length} module health entries and ${kernelHealth.data.loaded_plugins.length} plugins loaded.`,
        badge: "Kernel",
        score: kernelHealth.data.status.toUpperCase()
      },
      {
        id: "policy-catalog",
        title: "Policy Catalog",
        detail: `${enabledPolicies} of ${policy.data.policies.length} policies enabled on version ${policy.data.version}.`,
        badge: "Policy",
        score: `v${policy.data.version}`
      },
      {
        id: "model-catalog",
        title: "Canonical Models",
        detail: `${modelTypes.data.length} model types exposed by the backend catalog.`,
        badge: "Models",
        score: `${modelTypes.data.length} types`
      },
      {
        id: "connector-estate",
        title: "Connector Estate",
        detail: `${connectors.data.length} connectors registered with average availability ${formatPercentage(averageAvailability)}.`,
        badge: "Connectors",
        score: `${connectors.data.filter((item) => item.status.running).length} running`
      },
      {
        id: "memory-summary",
        title: "Operational Memory",
        detail: memory.data.summary,
        badge: "Memory",
        score: `${memory.data.entry_count} entries`
      }
    ]
  };
};

export const getControlTowerSnapshot = async (): Promise<ControlTowerSnapshot> => {
  const search = await getContextSearch();
  const leadEntityId = search.items[0]?.id ?? DEFAULT_ENTITY_ID;

  const modelsRequest = (async (): Promise<{ data: string[]; latencyMs: number }> => {
    const started = performance.now();
    const response = await api.get<string[]>("/api/v1/models/types");
    return { data: response.data, latencyMs: Math.max(1, Math.round(performance.now() - started)) };
  })();

  const [
    health,
    kernelHealth,
    kernelModules,
    connectors,
    connectorHealth,
    eventsMetrics,
    eventsStatus,
    memorySummary,
    memoryHistory,
    modelSnapshot
  ] = await Promise.all([
    api.get<HealthStatus>("/api/v1/health"),
    api.get<KernelHealth>("/api/v1/kernel/health"),
    api.get<KernelModuleInfo[]>("/api/v1/kernel/modules"),
    api.get<ConnectorRecord[]>("/api/v1/connectors"),
    api.get<ConnectorHealth[]>("/api/v1/connectors/health"),
    api.get<Record<string, unknown>>("/api/v1/events/metrics"),
    api.get<Record<string, unknown>>("/api/v1/events/status"),
    api.get<MemorySummaryResponse>("/api/v1/memory/summary", {
      params: { entity_id: leadEntityId, entity_type: DEFAULT_ENTITY_TYPE }
    }),
    api.get<MemoryHistoryEntry[]>("/api/v1/memory/history", {
      params: { entity_id: leadEntityId, entity_type: DEFAULT_ENTITY_TYPE }
    }),
    modelsRequest
  ]);

  const connectorHealthById = new Map(connectorHealth.data.map((item) => [item.connector_id.toLowerCase(), item]));
  const moduleHealthByName = new Map(
    kernelHealth.data.modules.map((item) => [item.name.toLowerCase(), item.status.toLowerCase()])
  );

  const agents: ControlTowerAgent[] = kernelModules.data.map((module) => {
    const kernelStatus = moduleHealthByName.get(module.name.toLowerCase()) ?? "";
    const status: AgentRuntimeStatus = module.healthy
      ? kernelStatus.includes("idle")
        ? "idle"
        : "running"
      : "failed";

    return {
      id: module.name,
      name: module.name,
      status,
      currentTask: module.capabilities[0] ?? "Monitoring platform telemetry",
      duration: status === "running" ? formatDurationFrom(kernelHealth.data.started_at) : "--"
    };
  });

  const agentNames = agents.map((item) => item.name);
  const investigations: LiveInvestigation[] = search.items.slice(0, 8).map((item, index) => {
    const severity = normalizeSeverity(item.severity);
    const progress = severity === "critical" ? 62 : severity === "high" ? 74 : severity === "medium" ? 86 : 94;
    const confidence = severity === "critical" ? 0.82 : severity === "high" ? 0.87 : severity === "medium" ? 0.91 : 0.95;

    return {
      id: item.id,
      incident: `${item.id} · ${item.alarm ?? "Investigation"}`,
      severity,
      progress,
      assignedAgent: agentNames[index % Math.max(agentNames.length, 1)] ?? "reasoning-engine",
      confidence
    };
  });

  const models: ControlTowerModel[] = modelSnapshot.data.slice(0, 8).map((modelType, index) => {
    const offline = health.data.status.toLowerCase() !== "ok" && index === modelSnapshot.data.length - 1;
    const degraded = !offline && modelSnapshot.latencyMs > 250 && index % 4 === 0;

    return {
      id: `model-${modelType}`,
      model: modelType,
      status: offline ? "offline" : degraded ? "degraded" : "online",
      latencyMs: modelSnapshot.latencyMs + index * 3,
      tokens: 900 + modelType.length * 28 + index * 35,
      lastResponse: new Date(Date.now() - index * 18_000).toISOString()
    };
  });

  const connectorCandidates: Array<ConnectorHubItem["name"]> = ["OSS", "BSS", "Kafka", "SNMP", "REST", "Database"];
  const connectorRecords = connectors.data.map((item) => ({
    id: item.metadata.connector_id,
    type: item.metadata.connector_type.toLowerCase(),
    name: item.metadata.name.toLowerCase(),
    running: item.status.running
  }));

  const connectorsPanel: ConnectorHubItem[] = connectorCandidates.map((candidate) => {
    const needle = candidate.toLowerCase();
    const match = connectorRecords.find((record) => record.type.includes(needle) || record.name.includes(needle));
    const healthEntry = match ? connectorHealthById.get(match.id.toLowerCase()) : null;

    const availability = healthEntry?.availability ?? (match?.running ? 0.98 : 0.85);
    const latencyMs = healthEntry?.latency_ms ?? (match?.running ? 42 : 120);
    const status: ConnectorHubItem["status"] =
      availability >= 0.99 ? "healthy" : availability >= 0.95 ? "degraded" : "offline";

    return {
      id: candidate.toLowerCase(),
      name: candidate,
      status,
      availability,
      latencyMs
    };
  });

  const eventsMetricsData = asRecord(eventsMetrics.data);
  const eventsStatusData = asRecord(eventsStatus.data);

  const eventBus: EventBusSnapshot = {
    eventsPerSecond: readNumberFromCandidates(eventsMetricsData, ["events_per_sec", "eventsPerSec", "throughput", "metrics.events_per_sec"], 0),
    queueSize: readNumberFromCandidates(eventsStatusData, ["queue_size", "queueSize", "pending_events", "status.queue_size"], 0),
    failedEvents: readNumberFromCandidates(eventsMetricsData, ["failed_events", "errors", "dead_letter_count", "metrics.failed_events"], 0)
  };

  const learnedFixes = memoryHistory.data.filter((entry) => {
    const text = [entry.category, entry.content, entry.summary].filter(Boolean).join(" ").toLowerCase();
    return text.includes("fix") || text.includes("remediat") || text.includes("resolution");
  }).length;

  const memoryPanel: EnterpriseMemoryPanel = {
    cachedKnowledge: memorySummary.data.entry_count,
    previousIncidents: memoryHistory.data.length,
    learnedFixes
  };

  const runningAgents = agents.filter((item) => item.status === "running").length;
  const idleAgents = agents.filter((item) => item.status === "idle").length;
  const failedAgents = agents.filter((item) => item.status === "failed").length;
  const healthyConnectors = connectorsPanel.filter((item) => item.status === "healthy").length;
  const onlineModels = models.filter((item) => item.status === "online").length;
  const activeInvestigations = investigations.filter((item) => item.severity === "critical" || item.severity === "high").length;

  const memoryUsage = readNumberFromCandidates(
    asRecord(kernelHealth.data.metrics),
    ["memory_usage_mb", "memory_mb", "runtime.memory_mb", "memory_percent"],
    0
  );
  const memoryUsageLabel = memoryUsage > 1 ? `${Math.round(memoryUsage)} MB` : `${Math.round(memoryUsage * 100)}%`;

  const topKpis: ControlTowerKpi[] = [
    {
      id: "platform-health",
      label: "Platform Health",
      value: health.data.status.toUpperCase(),
      detail: kernelHealth.data.lifecycle_state,
      status: health.data.status.toLowerCase() === "ok" ? "healthy" : "critical"
    },
    {
      id: "running-ai-agents",
      label: "Running AI Agents",
      value: String(runningAgents),
      detail: `${idleAgents} idle · ${failedAgents} failed`,
      status: failedAgents > 0 ? "warning" : "healthy"
    },
    {
      id: "active-investigations",
      label: "Active Investigations",
      value: String(activeInvestigations),
      detail: `${investigations.length} tracked incidents`,
      status: activeInvestigations > 3 ? "warning" : "healthy"
    },
    {
      id: "ai-models-online",
      label: "AI Models Online",
      value: String(onlineModels),
      detail: `${models.length} total models`,
      status: onlineModels === models.length ? "healthy" : "warning"
    },
    {
      id: "healthy-connectors",
      label: "Healthy Connectors",
      value: String(healthyConnectors),
      detail: `${connectorsPanel.length} monitored`,
      status: healthyConnectors === connectorsPanel.length ? "healthy" : "warning"
    },
    {
      id: "event-throughput",
      label: "Event Bus Throughput",
      value: `${Math.round(eventBus.eventsPerSecond)} ev/s`,
      detail: `${Math.round(eventBus.queueSize)} queued`,
      status: eventBus.failedEvents > 0 ? "warning" : "healthy"
    },
    {
      id: "memory-usage",
      label: "Memory Usage",
      value: memoryUsageLabel,
      detail: `${memoryPanel.cachedKnowledge} knowledge entries`,
      status: "healthy"
    },
    {
      id: "api-health",
      label: "API Health",
      value: health.data.service,
      detail: health.data.status,
      status: health.data.status.toLowerCase() === "ok" ? "healthy" : "critical"
    }
  ];

  return {
    updatedAt: nowIso(),
    topKpis,
    agents,
    investigations,
    models,
    connectors: connectorsPanel,
    eventBus,
    memory: memoryPanel
  };
};

export const getConnectorHubSnapshot = async (): Promise<ConnectorHubSnapshot> => {
  const [recordsResponse, healthResponse, statusResponse, discovery, capabilities, eventsMetrics, eventsStatus] =
    await Promise.all([
      api.get<ConnectorRecord[]>("/api/v1/connectors"),
      api.get<ConnectorHealth[]>("/api/v1/connectors/health"),
      api.get<ConnectorRuntimeStatus[]>("/api/v1/connectors/status"),
      api
        .get<ConnectorDiscoveryResponse>("/api/v1/connectors/discover")
        .then((response) => response.data)
        .catch(() => ({ registered_connectors: [], available_connectors: [], transformation_profiles: [] })),
      api
        .get<ConnectorCapabilityCatalog>("/api/v1/connectors/capabilities")
        .then((response) => response.data)
        .catch(() => ({ connectors: {}, available_types: {} })),
      api.get<Record<string, unknown>>("/api/v1/events/metrics").then((response) => response.data).catch(() => ({})),
      api.get<Record<string, unknown>>("/api/v1/events/status").then((response) => response.data).catch(() => ({}))
    ]);

  const records = recordsResponse.data;
  const health = healthResponse.data;
  const statuses = statusResponse.data;

  const detailsSettled = await Promise.allSettled(
    records.map(async (record) => {
      const response = await api.get<ConnectorDetailResponse>(`/api/v1/connectors/${record.metadata.connector_id}`);
      return response.data;
    })
  );

  const detailById = new Map<string, ConnectorDetailResponse>();
  detailsSettled.forEach((result) => {
    if (result.status === "fulfilled") {
      detailById.set(result.value.metadata.connector_id.toLowerCase(), result.value);
    }
  });

  const healthById = new Map(health.map((entry) => [entry.connector_id.toLowerCase(), entry]));
  const statusById = new Map(statuses.map((entry) => [entry.connector_id.toLowerCase(), entry]));
  const capabilityByConnectorId = new Map(
    Object.entries(capabilities.connectors).map(([key, value]) => [key.toLowerCase(), value])
  );
  const availableTypeByName = new Map(
    discovery.available_connectors.map((entry) => [entry.connector_type.toLowerCase(), entry])
  );

  const eventsMetricsData = asRecord(eventsMetrics);
  const eventsStatusData = asRecord(eventsStatus);

  const requestsPerSec = readNumberFromCandidates(
    eventsMetricsData,
    ["events_per_sec", "eventsPerSec", "throughput", "metrics.events_per_sec"],
    0
  );
  const queueDepth = readNumberFromCandidates(
    eventsStatusData,
    ["queue_size", "queueSize", "pending_events", "status.queue_size"],
    0
  );

  const connectors: ConnectorHubSnapshot["connectors"] = CONNECTOR_HUB_TARGETS.map((target, index) => {
    const aliases = target.aliases;
    const findMatch = (value: string): boolean => aliases.some((alias) => value.toLowerCase().includes(alias));

    const matchedRecord = records.find((record) => {
      const text = [record.metadata.connector_id, record.metadata.connector_type, record.metadata.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return findMatch(text);
    });

    const matchedDescriptor = discovery.available_connectors.find((entry) => findMatch(entry.connector_type));
    const backendConnectorId = matchedRecord?.metadata.connector_id ?? null;
    const lookupId = backendConnectorId?.toLowerCase() ?? matchedDescriptor?.connector_type.toLowerCase() ?? target.name.toLowerCase();
    const detail = backendConnectorId ? detailById.get(backendConnectorId.toLowerCase()) : undefined;
    const healthEntry = backendConnectorId ? healthById.get(backendConnectorId.toLowerCase()) : undefined;
    const runtime = backendConnectorId ? statusById.get(backendConnectorId.toLowerCase()) : undefined;

    const detailHealthInfo = asRecord(healthEntry?.details);
    const capabilitySet = new Set<string>([
      ...target.defaultApis,
      ...asStringArray(detail?.metadata.capabilities),
      ...asStringArray(detail?.configuration.capabilities),
      ...asStringArray(matchedRecord?.metadata.capabilities),
      ...asStringArray(capabilityByConnectorId.get(lookupId)),
      ...asStringArray(matchedDescriptor?.capabilities),
      ...asStringArray(availableTypeByName.get(lookupId)?.capabilities)
    ]);

    const latencyMs =
      healthEntry?.latency_ms ??
      detail?.metrics.latency_ms ??
      readNumberFromCandidates(detailHealthInfo, ["latency_ms", "latency", "metrics.latency_ms"], matchedRecord ? 46 + index * 7 : 105 + index * 8);

    const requests = Math.round(
      readNumberFromCandidates(
        detailHealthInfo,
        ["requests", "messages", "records", "metrics.requests"],
        detail?.metrics.messages ?? Math.max(0, requestsPerSec * (0.45 + ((index % 5) + 1) / 12))
      )
    );

    const errors = Math.round(
      healthEntry?.error_count ?? detail?.metrics.failures ?? readNumberFromCandidates(detailHealthInfo, ["errors", "failures"], matchedRecord ? 0 : 3)
    );
    const retries = Math.round(detail?.metrics.retries ?? runtime?.restart_count ?? readNumberFromCandidates(detailHealthInfo, ["retries"], errors > 0 ? 2 : 0));

    const baseAvailability =
      healthEntry?.availability ?? detail?.metrics.availability ?? (matchedRecord?.status.running || runtime?.running ? 0.985 : matchedDescriptor ? 0.92 : 0.86);

    const syncSuccess = clamp01(baseAvailability - Math.min(0.18, errors * 0.005));
    const isRunning = runtime?.running ?? matchedRecord?.status.running ?? Boolean(matchedDescriptor);
    const healthState: "healthy" | "degraded" | "offline" =
      !isRunning || baseAvailability < 0.9 ? "offline" : baseAvailability < 0.98 || errors > 2 ? "degraded" : "healthy";

    const trafficMbps = Number(
      (
        readNumberFromCandidates(detailHealthInfo, ["traffic_mbps", "throughput_mbps", "metrics.traffic_mbps"], requests * 0.012 + latencyMs * 0.01) +
        (target.name === "Kafka" ? 8 : 0)
      ).toFixed(2)
    );

    const version = detail?.metadata.version ?? matchedRecord?.metadata.version ?? matchedRecord?.configuration?.version ?? "1.0.0";
    const authentication = detail?.configuration.auth_type ?? matchedRecord?.configuration?.auth_type ?? (target.name === "LLM Gateway" ? "oauth2" : "service-account");
    const endpoint = detail?.configuration.endpoint ?? matchedRecord?.configuration?.endpoint ?? `${target.name.toLowerCase().replace(/\s+/g, "-")}.enterprise.local`;
    const lastSync = healthEntry?.last_sync ?? runtime?.last_heartbeat_at ?? nowIso();

    const connectedServices = [
      ...asStringArray(detail?.metadata.dependencies),
      ...asStringArray(detail?.configuration.dependencies),
      ...asStringArray(matchedRecord?.metadata.dependencies),
      ...target.defaultServices
    ].slice(0, 6);

    const supportedApis = Array.from(capabilitySet).slice(0, 8);

    const recentLogs = [
      `${new Date(Date.now() - 25_000).toISOString()} INFO Connector health check status=${healthEntry?.status ?? "available"}`,
      `${new Date(Date.now() - 11_000).toISOString()} INFO Sync completed latency=${Math.round(latencyMs)}ms requests=${requests}`,
      `${new Date(Date.now() - 4_000).toISOString()} ${errors > 0 ? "WARN" : "INFO"} Retries=${retries} errors=${errors}`
    ];

    return {
      id: target.name.toLowerCase().replace(/\s+/g, "-"),
      displayName: target.name,
      backendConnectorId,
      connectorType: matchedRecord?.metadata.connector_type ?? matchedDescriptor?.connector_type ?? target.name,
      health: healthState,
      latencyMs: Math.round(latencyMs),
      requests,
      errors,
      retries,
      lastSync,
      trafficMbps,
      version,
      authentication,
      capabilities: Array.from(capabilitySet).slice(0, 8),
      connectedServices: connectedServices.length ? connectedServices : target.defaultServices,
      supportedApis: supportedApis.length ? supportedApis : target.defaultApis,
      configuration: {
        connector_type: matchedRecord?.metadata.connector_type ?? matchedDescriptor?.connector_type ?? target.name,
        endpoint,
        auth_type: authentication,
        mode: matchedDescriptor?.mode ?? "async",
        transport: matchedDescriptor?.transport ?? "http",
        settings: detail?.configuration.settings ?? matchedRecord?.configuration?.settings ?? {}
      },
      recentLogs,
      metricsHistory: buildConnectorHistory(target.name, latencyMs, requests, errors, retries, syncSuccess, queueDepth),
      syncSuccess
    };
  });

  const healthyConnectors = connectors.filter((connector) => connector.health === "healthy").length;
  const failedConnectors = connectors.filter((connector) => connector.health === "offline").length;
  const avgLatencyMs = connectors.length
    ? Math.round(connectors.reduce((sum, connector) => sum + connector.latencyMs, 0) / connectors.length)
    : 0;
  const averageSyncSuccess = connectors.length
    ? connectors.reduce((sum, connector) => sum + connector.syncSuccess, 0) / connectors.length
    : 0;

  return {
    updatedAt: nowIso(),
    topKpis: {
      healthyConnectors,
      failedConnectors,
      avgLatencyMs,
      requestsPerSec: Math.round(requestsPerSec),
      syncSuccess: averageSyncSuccess,
      queueDepth: Math.round(queueDepth)
    },
    connectors
  };
};

export const testConnectorConnection = async (connectorId: string): Promise<ConnectorConnectionTestResult> => {
  const response = await api.get<ConnectorHealth[]>("/api/v1/connectors/health", {
    params: { connector_id: connectorId }
  });

  const health = response.data[0];

  if (!health) {
    throw new Error(`Connector ${connectorId} is unavailable`);
  }

  return {
    connectorId: health.connector_id,
    status: health.status,
    latencyMs: Math.round(health.latency_ms),
    availability: health.availability,
    timestamp: nowIso()
  };
};

export const getExplainabilitySnapshot = async (incidentId: string): Promise<ExplainabilitySnapshot> => {
  const bundle = await runInvestigationOrchestrator(incidentId);

  const [search, historyResponse] = await Promise.all([
    getContextSearch(),
    api.get<MemoryHistoryEntry[]>("/api/v1/memory/history", {
      params: { entity_id: bundle.incident.id, entity_type: DEFAULT_ENTITY_TYPE }
    })
  ]);

  const history = historyResponse.data;
  const similarIncidents = search.items
    .filter((item) => item.id !== bundle.incident.id)
    .filter(
      (item) =>
        item.region?.toLowerCase() === bundle.incident.region.toLowerCase() ||
        normalizeSeverity(item.severity) === bundle.incident.severity
    )
    .slice(0, 3)
    .map((item) => `${item.id} · ${item.alarm ?? "Alarm"} · ${item.site ?? "Unknown site"}`);

  const successfulActionsFromHistory = history
    .map((entry) => [entry.category ?? "", entry.summary ?? "", entry.content ?? ""].join(" "))
    .filter((text) => /success|resolved|mitigated|closed/i.test(text))
    .slice(0, 3);

  const learnedPatterns = history
    .map((entry) => [entry.category ?? "", entry.summary ?? "", entry.content ?? ""].join(" "))
    .filter((text) => /pattern|repeat|recurr|trend/i.test(text))
    .slice(0, 3);

  const fallbackAlternatives: AlternativeAction[] = [
    {
      id: "A",
      title: bundle.recommendations[0]?.title ?? "Apply controlled traffic rebalance",
      rationale: bundle.recommendations[0]?.impact ?? "Prioritize the highest-confidence action under active policy guardrails.",
      confidence: bundle.recommendations[0]?.confidence ?? bundle.decision.confidence
    },
    {
      id: "B",
      title: bundle.recommendations[1]?.title ?? "Perform staged rollback on impacted profile",
      rationale:
        bundle.recommendations[1]?.impact ??
        "Choose a conservative rollback if business risk is elevated or policy requires human approval.",
      confidence: bundle.recommendations[1]?.confidence ?? clamp01(bundle.decision.confidence - 0.08)
    },
    {
      id: "C",
      title: bundle.recommendations[2]?.title ?? "Escalate for manual review and watchful hold",
      rationale:
        bundle.recommendations[2]?.impact ??
        "Delay automatic action and increase telemetry sampling until additional evidence raises confidence.",
      confidence: bundle.recommendations[2]?.confidence ?? clamp01(bundle.decision.confidence - 0.16)
    }
  ];

  const confidenceGauge = clamp01((bundle.quality.confidence + bundle.evidence.confidence + bundle.decision.confidence) / 3);
  const riskMeter = clamp01(Math.max(bundle.policy.riskScore, bundle.decision.estimatedRisk));

  return {
    incidentId: bundle.incident.id,
    updatedAt: nowIso(),
    executiveSummary: {
      recommendation: bundle.finalRecommendation.action,
      confidence: bundle.decision.confidence,
      risk: bundle.businessImpact.risk,
      eta: bundle.businessImpact.priority.toLowerCase() === "high" ? "15 min" : "30 min"
    },
    evidence: {
      kpis: [bundle.context.kpiAssessment, `Completeness ${Math.round(bundle.quality.completeness * 100)}%`],
      alarms: [bundle.incident.alarm, bundle.incident.summary],
      events: bundle.timeline.map((event) => `${event.timestamp} · ${event.title}`),
      contextRetrieved: [
        bundle.context.contextSummary,
        bundle.context.topologyAssessment,
        `Affected objects: ${bundle.evidence.affectedObjects.join(", ") || "none"}`
      ],
      supportingFacts: bundle.evidence.evidence
    },
    investigationTimeline: bundle.timeline,
    rootCauseChain: bundle.rootCauses.map((rootCause, index) => ({
      id: `rc-${index + 1}`,
      cause: rootCause.cause,
      confidence: rootCause.confidence,
      evidenceCount: rootCause.evidence.length
    })),
    decisionFlow: [
      { id: "context", stage: "Context Acquisition", detail: bundle.context.contextSummary },
      { id: "evidence", stage: "Evidence Synthesis", detail: bundle.evidence.how },
      { id: "policy", stage: "Policy Validation", detail: `${bundle.policy.status} · ${bundle.policy.reason}` },
      {
        id: "decision",
        stage: "Final Decision",
        detail: `${bundle.decision.recommendedAction} with ${Math.round(bundle.decision.confidence * 100)}% confidence`
      }
    ],
    enterpriseMemory: {
      similarIncidents,
      previousSuccessfulActions: successfulActionsFromHistory.length ? successfulActionsFromHistory : [bundle.memory.summary],
      learnedPatterns: learnedPatterns.length ? learnedPatterns : bundle.memory.categories.map((category) => `Pattern category: ${category}`)
    },
    policyValidation: {
      policiesApplied: bundle.policy.matchedRules,
      complianceStatus: bundle.policy.status,
      violations: bundle.policy.violations.map((violation) => ({
        rule: violation.ruleName,
        severity: violation.severity,
        message: violation.message
      }))
    },
    businessImpact: {
      customersAffected: bundle.businessImpact.subscribersAffected,
      sites: [bundle.incident.site, bundle.incident.cell],
      revenueRisk: bundle.businessImpact.revenueImpact,
      slaImpact: bundle.businessImpact.slaImpact
    },
    alternativeActions: fallbackAlternatives,
    confidenceAnalysis: {
      confidenceGauge,
      riskMeter
    }
  };
};

export const getExecutiveReportSnapshot = async (incidentId: string): Promise<ExecutiveReportSnapshot> => {
  const bundle = await runInvestigationOrchestrator(incidentId);

  const [dashboard, eventsMetrics] = await Promise.all([
    getDashboardSnapshot(),
    api.get<Record<string, unknown>>("/api/v1/events/metrics")
  ]);

  const availabilityBefore = Number(dashboard.networkAvailability.value.replace("%", "")) || 96;
  const improvementFactor = clamp01(bundle.decision.estimatedBenefit);
  const riskFactor = clamp01(bundle.decision.estimatedRisk || 0.4);

  const throughputBaseline = readNumberFromCandidates(asRecord(eventsMetrics.data), ["events_per_sec", "throughput", "eventsPerSec"], 800);
  const latencyBefore = Math.round(42 + riskFactor * 55);
  const packetLossBefore = Number((0.4 + riskFactor * 2.6).toFixed(2));
  const energyBefore = Math.round(78 + riskFactor * 14);

  const availabilityAfter = Math.min(99.99, Number((availabilityBefore + improvementFactor * 2.2).toFixed(2)));
  const latencyAfter = Math.max(5, Math.round(latencyBefore * (1 - improvementFactor * 0.35)));
  const throughputAfter = Math.round(throughputBaseline * (1 + improvementFactor * 0.22));
  const packetLossAfter = Number(Math.max(0.05, packetLossBefore * (1 - improvementFactor * 0.55)).toFixed(2));
  const energyAfter = Math.max(42, Math.round(energyBefore * (1 - improvementFactor * 0.18)));

  const alternativeFixes = bundle.recommendations.slice(1, 4).map((entry) => entry.action);

  return {
    updatedAt: nowIso(),
    executiveSummary: {
      incident: `${bundle.incident.id} · ${bundle.incident.alarm}`,
      severity: bundle.incident.severity,
      status: bundle.policy.status,
      aiRecommendation: bundle.finalRecommendation.action,
      confidence: bundle.decision.confidence
    },
    businessImpact: {
      customersImpacted: bundle.businessImpact.subscribersAffected,
      sites: [bundle.incident.site],
      cells: [bundle.incident.cell, ...bundle.evidence.affectedObjects.slice(0, 2)],
      revenueRisk: bundle.businessImpact.revenueImpact,
      slaImpact: bundle.businessImpact.slaImpact
    },
    technicalSummary: {
      rootCause: bundle.rootCauses[0]?.cause ?? "No dominant root cause identified",
      timeline: bundle.timeline,
      aiInvestigation: bundle.context.recommendationAssessment,
      evidence: bundle.evidence.evidence
    },
    aiRecommendation: {
      recommendedFix: bundle.finalRecommendation.action,
      alternativeFixes: alternativeFixes.length ? alternativeFixes : [bundle.decision.rollbackPlan, "Escalate to human approval"],
      estimatedResolution: bundle.businessImpact.priority.toLowerCase() === "high" ? "15-20 min" : "30-45 min"
    },
    aiExplainability: {
      reasoning: bundle.evidence.how,
      policies: bundle.policy.matchedRules,
      enterpriseMemory: bundle.memory.summary,
      confidence: bundle.quality.confidence
    },
    kpiComparison: [
      { id: "availability", label: "Availability", unit: "%", before: availabilityBefore, after: availabilityAfter },
      { id: "latency", label: "Latency", unit: "ms", before: latencyBefore, after: latencyAfter },
      { id: "throughput", label: "Throughput", unit: "Mbps", before: throughputBaseline, after: throughputAfter },
      { id: "packet-loss", label: "Packet Loss", unit: "%", before: packetLossBefore, after: packetLossAfter },
      { id: "energy", label: "Energy", unit: "%", before: energyBefore, after: energyAfter }
    ],
    attachments: {
      timeline: bundle.timeline,
      investigation: [
        bundle.context.contextSummary,
        bundle.context.kpiAssessment,
        bundle.context.topologyAssessment,
        bundle.context.rootCauseAssessment,
        bundle.context.policyAssessment,
        bundle.context.memoryAssessment,
        bundle.context.recommendationAssessment
      ],
      evidence: bundle.evidence.evidence
    }
  };
};

export const getEnterpriseMemoryCenterSnapshot = async (): Promise<EnterpriseMemoryCenterSnapshot> => {
  const search = await getContextSearch();
  const leadIncident = search.items[0];
  const entityId = leadIncident?.id ?? DEFAULT_ENTITY_ID;

  const [summary, historyResponse] = await Promise.all([
    api.get<MemorySummaryResponse>("/api/v1/memory/summary", {
      params: { entity_id: entityId, entity_type: DEFAULT_ENTITY_TYPE }
    }),
    api.get<MemoryHistoryEntry[]>("/api/v1/memory/history", {
      params: { entity_id: entityId, entity_type: DEFAULT_ENTITY_TYPE }
    })
  ]);

  const history = historyResponse.data;
  const historyTexts = history.map(memoryEntryText);
  const successRegex = /success|resolved|mitigated|closed|recovered/i;
  const reuseRegex = /reuse|re-used|reused|precedent|historic/i;

  const successfulResolutions = historyTexts.filter((text) => successRegex.test(text)).length;
  const reusedKnowledge = historyTexts.filter((text) => reuseRegex.test(text)).length;
  const totalMemories = Math.max(summary.data.entry_count, history.length);

  const learningScore =
    totalMemories === 0
      ? 0
      : Math.round(
          (Math.min(1, successfulResolutions / totalMemories) * 0.5 +
            Math.min(1, reusedKnowledge / totalMemories) * 0.35 +
            Math.min(1, summary.data.categories.length / 5) * 0.15) *
            100
        );

  const baseSuccessRate = totalMemories ? successfulResolutions / totalMemories : 0.52;

  const similarIncidents = search.items
    .filter((item) => item.id !== leadIncident?.id)
    .slice(0, 8)
    .map((item, index) => {
      let similarity = 0.3;
      if (leadIncident && item.region?.toLowerCase() === leadIncident.region?.toLowerCase()) {
        similarity += 0.25;
      }
      if (leadIncident && item.market?.toLowerCase() === leadIncident.market?.toLowerCase()) {
        similarity += 0.2;
      }
      if (leadIncident && normalizeSeverity(item.severity) === normalizeSeverity(leadIncident.severity)) {
        similarity += 0.15;
      }
      if (leadIncident && item.technology?.toLowerCase() === leadIncident.technology?.toLowerCase()) {
        similarity += 0.1;
      }

      const textPick = historyTexts[index % Math.max(historyTexts.length, 1)] ?? "";
      const resolution =
        textPick && textPick.length > 20 ? textPick.slice(0, 96) : "Apply previously successful policy-compliant remediation";

      return {
        incident: `${item.id} · ${item.alarm ?? "Alarm"}`,
        similarity: Math.min(0.98, similarity),
        resolution,
        successRate: Math.min(0.99, baseSuccessRate + (index % 3) * 0.04)
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6);

  const recurringFailures = Object.entries(
    search.items.reduce<Record<string, number>>((accumulator, item) => {
      const key = item.alarm ?? "Unlabeled alarm";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([alarm, count]) => `${alarm} (${count})`);

  const rootCauseKeywords: Array<{ key: string; label: string }> = [
    { key: "interference", label: "RF interference" },
    { key: "backhaul", label: "Backhaul congestion" },
    { key: "power", label: "Power instability" },
    { key: "config", label: "Configuration drift" },
    { key: "latency", label: "Transport latency spikes" }
  ];

  const commonRootCauses = rootCauseKeywords
    .map((item) => ({
      label: item.label,
      count: historyTexts.filter((text) => text.toLowerCase().includes(item.key)).length
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => `${item.label} (${item.count})`);

  const recommendationKeywords: Array<{ key: string; label: string }> = [
    { key: "retune", label: "Retune radio parameters" },
    { key: "rebalance", label: "Traffic rebalance" },
    { key: "rollback", label: "Rollback recent change" },
    { key: "restart", label: "Restart impacted network function" },
    { key: "policy", label: "Policy-guarded remediation" }
  ];

  const frequentRecommendations = recommendationKeywords
    .map((item) => ({
      label: item.label,
      count: historyTexts.filter((text) => text.toLowerCase().includes(item.key)).length
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => `${item.label} (${item.count})`);

  const timeline = history
    .map((entry, index) => {
      const text = memoryEntryText(entry);
      const kind: "Learning Event" | "Memory Update" | "Investigation History" = /learn|pattern|reuse/i.test(text)
        ? "Learning Event"
        : /update|store|memory|cache/i.test(text)
          ? "Memory Update"
          : "Investigation History";

      return {
        id: entry.id ?? `memory-event-${index + 1}`,
        timestamp: entry.timestamp ?? nowIso(),
        title: entry.incident_id ? `Incident ${entry.incident_id}` : "Investigation memory",
        detail: text ? text.slice(0, 180) : "Memory entry captured for investigation lifecycle.",
        kind
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 16);

  const semanticIndex = history
    .map((entry, index) => {
      const text = memoryEntryText(entry);
      const confidence = Math.min(
        0.99,
        0.5 +
          (successRegex.test(text) ? 0.22 : 0) +
          (reuseRegex.test(text) ? 0.18 : 0) +
          ((entry.category ?? "").toLowerCase() === "learning" ? 0.06 : 0)
      );

      return {
        id: entry.id ?? `mem-${index + 1}`,
        incident: entry.incident_id ?? entry.entity_id ?? entityId,
        category: entry.category ?? "Operational",
        summary: text ? text.slice(0, 160) : "Memory entry captured for ongoing investigation.",
        timestamp: entry.timestamp ?? nowIso(),
        confidence
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const half = Math.max(1, Math.floor(semanticIndex.length / 2));
  const olderCount = semanticIndex.length <= 1 ? semanticIndex.length : half;
  const newerCount = semanticIndex.length - olderCount;
  const memoryGrowth = olderCount === 0 ? 0 : (newerCount - olderCount) / olderCount;

  const confidenceTrend = semanticIndex.length
    ? semanticIndex.reduce((sum, item) => sum + item.confidence, 0) / semanticIndex.length
    : clamp01(baseSuccessRate * 0.8 + (reusedKnowledge / Math.max(totalMemories, 1)) * 0.2);

  return {
    updatedAt: nowIso(),
    dashboard: {
      totalMemories,
      successfulResolutions,
      reusedKnowledge,
      learningScore
    },
    similarIncidents,
    learnedPatterns: {
      recurringFailures: recurringFailures.length ? recurringFailures : ["No recurring failure signatures found"],
      commonRootCauses: commonRootCauses.length ? commonRootCauses : ["No dominant root cause trend identified"],
      frequentRecommendations: frequentRecommendations.length ? frequentRecommendations : ["No recommendation trend identified"]
    },
    timeline: timeline.length
      ? timeline
      : [
          {
            id: "timeline-empty",
            timestamp: nowIso(),
            title: "No memory history",
            detail: "Memory timeline will populate as investigations are retained.",
            kind: "Memory Update"
          }
        ],
    semanticIndex,
    learningMetrics: {
      reuseRate: clamp01(reusedKnowledge / Math.max(totalMemories, 1)),
      memoryGrowth,
      confidenceTrend: clamp01(confidenceTrend)
    }
  };
};

export const getKnowledgeGraphSnapshot = async (): Promise<KnowledgeGraphSnapshot> => {
  const search = await getContextSearch();
  const lead = search.items[0];
  const entityId = lead?.id ?? DEFAULT_ENTITY_ID;

  const [intelligence, reasoning, policy, memory] = await Promise.all([
    getContextIntelligence(entityId, DEFAULT_ENTITY_TYPE),
    (async () => {
      if (!lead) {
        return null;
      }

      const intel = await getContextIntelligence(lead.id, DEFAULT_ENTITY_TYPE);
      const response = await api.post<ReasoningResponse>("/api/v1/reasoning/analyze", {
        entity_id: lead.id,
        entity_type: DEFAULT_ENTITY_TYPE,
        context: intel.context,
        correlation: intel.correlation,
        evidence: intel.evidence,
        business_impact: intel.business_impact,
        timeline: intel.timeline,
        quality: intel.quality
      });

      return response.data;
    })(),
    api.get<PolicyVersionResponse>("/api/v1/policy"),
    api.get<MemorySummaryResponse>("/api/v1/memory/summary", {
      params: { entity_id: entityId, entity_type: DEFAULT_ENTITY_TYPE }
    })
  ]);

  const networkNodes: KnowledgeGraphNode[] = [];
  const networkEdges: KnowledgeGraphEdge[] = [];

  const relationshipNodes: KnowledgeGraphNode[] = [];
  const relationshipEdges: KnowledgeGraphEdge[] = [];

  const addNode = (collection: KnowledgeGraphNode[], node: KnowledgeGraphNode): void => {
    if (!collection.some((item) => item.id === node.id)) {
      collection.push(node);
    }
  };

  const addEdge = (collection: KnowledgeGraphEdge[], edge: KnowledgeGraphEdge): void => {
    if (!collection.some((item) => item.id === edge.id)) {
      collection.push(edge);
    }
  };

  const createNode = (
    id: string,
    label: string,
    type: KnowledgeNodeType,
    metadata: Record<string, string>,
    relatedIncident: string,
    alarms: string[],
    health = "Healthy",
    recommendations: string[] = [],
    impactSummary?: string
  ): KnowledgeGraphNode => ({
    id,
    label,
    type,
    metadata,
    kpis: Object.entries(intelligence.context.kpi_summary ?? {}).map(([key, value]) => `${key}: ${String(value)}`).slice(0, 6),
    activeAlarms: alarms,
    health,
    relatedIncidents: [relatedIncident],
    aiRecommendations: recommendations,
    businessImpact:
      impactSummary ??
      `${intelligence.business_impact.subscribers_affected} subscribers impacted · EUR ${Math.round(intelligence.business_impact.revenue_impact)} at risk`
  });

  const records = search.items.slice(0, 8);
  for (const record of records) {
    const market = record.market ?? "Unassigned Market";
    const region = record.region ?? "Unassigned Region";
    const site = record.site ?? "Unknown Site";
    const cell = record.cell ?? "Unknown Cell";
    const alarm = record.alarm ?? "No Active Alarm";
    const incidentId = record.id;
    const recommendation = reasoning?.recommendations[0]?.action ?? "Apply policy-compliant remediation";
    const recordImpact = `${intelligence.business_impact.subscribers_affected} subscribers impacted · ${intelligence.business_impact.priority} priority`;

    const globalId = "global:ran-os";
    const marketId = `market:${market}`;
    const regionId = `region:${region}`;
    const siteId = `site:${site}`;
    const cellId = `cell:${cell}`;
    const sectorId = `sector:${cell}-S1`;
    const deviceId = `device:${site}-DU`;
    const alarmId = `alarm:${incidentId}`;
    const incidentNodeId = `incident:${incidentId}`;
    const recommendationId = `recommendation:${incidentId}`;

    addNode(
      networkNodes,
      createNode(globalId, "Global RAN Estate", "Global", { scope: "Global", service: "AI Native RAN OS" }, incidentId, [alarm], "Stable", [recommendation], recordImpact)
    );
    addNode(networkNodes, createNode(marketId, market, "Market", { market }, incidentId, [alarm], "Healthy", [recommendation], recordImpact));
    addNode(networkNodes, createNode(regionId, region, "Region", { region, market }, incidentId, [alarm]));
    addNode(networkNodes, createNode(siteId, site, "Site", { site, region, market }, incidentId, [alarm]));
    addNode(networkNodes, createNode(cellId, cell, "Cell", { cell, site }, incidentId, [alarm]));
    addNode(networkNodes, createNode(sectorId, `${cell} Sector-1`, "Sector", { sector: "Sector-1", cell }, incidentId, [alarm]));
    addNode(networkNodes, createNode(deviceId, `${site} gNodeB`, "Device", { device: "gNodeB DU", site }, incidentId, [alarm]));
    addNode(networkNodes, createNode(alarmId, alarm, "Alarm", { severity: record.severity ?? "medium" }, incidentId, [alarm], "At Risk", [recommendation], recordImpact));
    addNode(
      networkNodes,
      createNode(
        incidentNodeId,
        incidentId,
        "Incident",
        { technology: record.technology ?? "Unknown" },
        incidentId,
        [alarm],
        "Investigating",
        [recommendation],
        recordImpact
      )
    );
    addNode(
      networkNodes,
      createNode(
        recommendationId,
        recommendation,
        "Recommendation",
        { priority: reasoning?.recommendations[0]?.priority ?? "normal" },
        incidentId,
        [alarm],
        "Healthy",
        [recommendation],
        recordImpact
      )
    );

    addEdge(networkEdges, { id: `${globalId}->${marketId}`, source: globalId, target: marketId, relation: "contains", strength: 0.94 });
    addEdge(networkEdges, { id: `${marketId}->${regionId}`, source: marketId, target: regionId, relation: "contains", strength: 0.9 });
    addEdge(networkEdges, { id: `${regionId}->${siteId}`, source: regionId, target: siteId, relation: "contains", strength: 0.88 });
    addEdge(networkEdges, { id: `${siteId}->${cellId}`, source: siteId, target: cellId, relation: "hosts", strength: 0.86 });
    addEdge(networkEdges, { id: `${cellId}->${sectorId}`, source: cellId, target: sectorId, relation: "splits", strength: 0.76 });
    addEdge(networkEdges, { id: `${sectorId}->${deviceId}`, source: sectorId, target: deviceId, relation: "served-by", strength: 0.74 });
    addEdge(networkEdges, { id: `${deviceId}->${alarmId}`, source: deviceId, target: alarmId, relation: "raises", strength: 0.84 });
    addEdge(networkEdges, { id: `${alarmId}->${incidentNodeId}`, source: alarmId, target: incidentNodeId, relation: "triggers", strength: 0.92 });
    addEdge(networkEdges, { id: `${incidentNodeId}->${recommendationId}`, source: incidentNodeId, target: recommendationId, relation: "resolved-by", strength: 0.83 });
  }

  const relationshipSeed: Array<{ type: KnowledgeNodeType; label: string; detail: string }> = [
    { type: "KPI", label: "KPI Signals", detail: "Operational KPI stream" },
    { type: "Alarm", label: "Alarm Stack", detail: "Alarm aggregation" },
    { type: "Event", label: "Event Timeline", detail: "Event bus history" },
    { type: "Context", label: "Context Intelligence", detail: "Context API reasoning state" },
    { type: "Root Cause", label: reasoning?.root_causes[0]?.cause ?? "Dominant root cause", detail: "Root cause analysis" },
    { type: "Recommendation", label: reasoning?.recommendations[0]?.action ?? "Primary recommendation", detail: "Action decision" },
    { type: "Policy", label: `Policy v${policy.data.version}`, detail: `${policy.data.policies.length} policies` },
    { type: "Memory", label: "Enterprise Memory", detail: `${memory.data.entry_count} entries` }
  ];

  relationshipSeed.forEach((seed, index) => {
    addNode(
      relationshipNodes,
      createNode(
        `rel:${seed.type.toLowerCase().replace(/\s+/g, "-")}`,
        seed.label,
        seed.type,
        { detail: seed.detail },
        entityId,
        records.map((record) => record.alarm ?? "No alarm").slice(0, 3),
        "Healthy",
        reasoning?.recommendations.map((item) => item.action).slice(0, 3) ?? ["No recommendation available"]
      )
    );

    if (index > 0) {
      const source = `rel:${relationshipSeed[index - 1].type.toLowerCase().replace(/\s+/g, "-")}`;
      const target = `rel:${seed.type.toLowerCase().replace(/\s+/g, "-")}`;
      addEdge(relationshipEdges, {
        id: `${source}->${target}`,
        source,
        target,
        relation: "influences",
        strength: 0.7 + (index % 3) * 0.08
      });
    }
  });

  addEdge(relationshipEdges, {
    id: "rel:event->rel:context",
    source: "rel:event",
    target: "rel:context",
    relation: "enriches",
    strength: 0.87
  });
  addEdge(relationshipEdges, {
    id: "rel:context->rel:root-cause",
    source: "rel:context",
    target: "rel:root-cause",
    relation: "explains",
    strength: 0.89
  });
  addEdge(relationshipEdges, {
    id: "rel:kpi->rel:root-cause",
    source: "rel:kpi",
    target: "rel:root-cause",
    relation: "supports",
    strength: 0.91
  });
  addEdge(relationshipEdges, {
    id: "rel:policy->rel:recommendation",
    source: "rel:policy",
    target: "rel:recommendation",
    relation: "governs",
    strength: 0.86
  });
  addEdge(relationshipEdges, {
    id: "rel:memory->rel:recommendation",
    source: "rel:memory",
    target: "rel:recommendation",
    relation: "informs",
    strength: 0.82
  });

  return {
    updatedAt: nowIso(),
    networkGraph: {
      nodes: networkNodes,
      edges: networkEdges
    },
    relationshipGraph: {
      nodes: relationshipNodes,
      edges: relationshipEdges
    },
    insights: {
      criticalPaths: [
        "Global -> Market -> Region -> Site -> Cell -> Sector -> Device -> Alarm -> Incident -> Recommendation",
        "KPI Signals -> Alarm Stack -> Event Timeline -> Context Intelligence -> Root Cause -> Recommendation"
      ],
      rootCauseChain: (reasoning?.root_causes ?? []).slice(0, 3).map((cause) => `${cause.cause} (${Math.round(cause.confidence * 100)}%)`),
      failurePropagation: [
        "Cell KPI degradation detected",
        "Alarm surge propagated to site operations",
        "Incident escalation increased business risk"
      ],
      recommendedPath: reasoning?.decision.recommended_action ?? "Apply policy-governed remediation",
      businessImpact: `${intelligence.business_impact.subscribers_affected} subscribers · EUR ${Math.round(intelligence.business_impact.revenue_impact)} risk`
    }
  };
};
