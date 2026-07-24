export type Severity = "critical" | "high" | "medium" | "low";

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export interface Incident {
  id: string;
  site: string;
  cell: string;
  alarm: string;
  region: string;
  market: string;
  technology: string;
  severity: Severity;
  summary: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  actor: string;
}

export interface Recommendation {
  id: string;
  title: string;
  impact: string;
  confidence: number;
  action: string;
  priority: string;
}

export type OrchestratorStepStatus = "pending" | "running" | "completed" | "error";

export interface InvestigationArtifact {
  label: string;
  value: string;
}

export interface InvestigationAgent {
  id: string;
  label: string;
  status: OrchestratorStepStatus;
  startedAt: string | null;
  completedAt: string | null;
  executionTimeMs: number | null;
  reasoningSummary: string;
  confidence: number | null;
  artifacts: InvestigationArtifact[];
}

export interface InvestigationAgentUpdate {
  id: string;
  status: OrchestratorStepStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  executionTimeMs?: number | null;
  reasoningSummary?: string;
  confidence?: number | null;
  artifacts?: InvestigationArtifact[];
}

export interface GraphNode {
  id: string;
  label: string;
  group: "radio" | "transport" | "core" | "policy";
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface InvestigationBundle {
  context: SharedInvestigationContext;
  incident: Incident;
  evidence: EvidenceSummary;
  timeline: TimelineEvent[];
  recommendations: Recommendation[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootCauses: RootCause[];
  prediction: PredictionSummary;
  decision: DecisionSummary;
  businessImpact: BusinessImpactSummary;
  quality: QualitySummary;
  policy: PolicySummary;
  memory: EnterpriseMemorySummary;
  finalRecommendation: FinalRecommendation;
}

export interface SharedInvestigationContext {
  incidentId: string;
  entityType: string;
  contextSummary: string;
  kpiAssessment: string;
  topologyAssessment: string;
  rootCauseAssessment: string;
  policyAssessment: string;
  memoryAssessment: string;
  recommendationAssessment: string;
  artifacts: Record<string, InvestigationArtifact[]>;
}

export interface EvidenceSummary {
  why: string;
  how: string;
  evidence: string[];
  confidence: number;
  affectedObjects: string[];
}

export interface RootCause {
  cause: string;
  confidence: number;
  evidence: string[];
}

export interface PredictionSummary {
  degradationRisk: string;
  kpiTrend: string;
  slaViolationRisk: string;
  confidence: number;
}

export interface DecisionSummary {
  recommendedAction: string;
  confidence: number;
  businessPriority: string;
  estimatedBenefit: number;
  estimatedRisk: number;
  rollbackPlan: string;
}

export interface BusinessImpactSummary {
  subscribersAffected: number;
  revenueImpact: number;
  slaImpact: string;
  coverageImpact: string;
  risk: string;
  priority: string;
}

export interface QualitySummary {
  completeness: number;
  freshness: number;
  confidence: number;
  consistency: number;
  explainability: number;
}

export interface PolicyViolationSummary {
  ruleName: string;
  severity: string;
  message: string;
}

export interface PolicySummary {
  status: string;
  reason: string;
  matchedRules: string[];
  violations: PolicyViolationSummary[];
  riskScore: number;
  approvalLevel: string;
  timestamp: string;
}

export interface EnterpriseMemorySummary {
  summary: string;
  entryCount: number;
  categories: string[];
}

export interface FinalRecommendation {
  headline: string;
  action: string;
  analystSummary: string;
  rationale: string;
  operatingMode: string;
  approvalLevel: string;
}

export interface DashboardSnapshot {
  metrics: KpiMetric[];
  incidents: Incident[];
  updatedAt: string;
  networkHealth: NetworkHealthSummary;
  regionalStatus: RegionalNetworkStatus[];
  criticalIncidentFeed: CriticalIncidentItem[];
  aiRecommendationFeed: RecommendationFeedItem[];
  currentInvestigations: InvestigationQueueItem[];
  predictionCards: PredictionCard[];
  networkAvailability: AvailabilitySummary;
  capacityForecast: CapacityForecast;
}

export interface NetworkHealthSummary {
  serviceStatus: string;
  kernelStatus: string;
  connectorAvailability: number;
  moduleCount: number;
  healthScore: number;
}

export interface RegionalNetworkStatus {
  region: string;
  siteCount: number;
  criticalCount: number;
  health: string;
  trend: string;
}

export interface CriticalIncidentItem extends Incident {
  investigationStatus: string;
  confidence: number;
  updatedAt: string;
}

export interface RecommendationFeedItem {
  id: string;
  title: string;
  detail: string;
  action: string;
  confidence: number;
  priority: string;
}

export interface InvestigationQueueItem {
  id: string;
  title: string;
  status: string;
  confidence: number;
  summary: string;
  updatedAt: string;
}

export interface PredictionCard {
  id: string;
  title: string;
  value: string;
  detail: string;
  confidence: number;
  trend: "up" | "down" | "flat";
}

export interface AvailabilitySummary {
  value: string;
  detail: string;
  confidence: number;
}

export interface CapacityForecast {
  horizon: string;
  projectedUsage: string;
  projectedCapacity: string;
  headroom: string;
  risk: string;
}

export interface ReportCard {
  id: string;
  title: string;
  detail: string;
  badge: string;
  score: string;
}

export interface ReportsSnapshot {
  riskProfile: string;
  mitigationAdoption: string;
  compliance: string;
  cards: ReportCard[];
}

export interface ControlTowerKpi {
  id: string;
  label: string;
  value: string;
  detail: string;
  status: "healthy" | "warning" | "critical";
}

export type AgentRuntimeStatus = "running" | "idle" | "failed";

export interface ControlTowerAgent {
  id: string;
  name: string;
  status: AgentRuntimeStatus;
  currentTask: string;
  duration: string;
}

export interface LiveInvestigation {
  id: string;
  incident: string;
  severity: Severity;
  progress: number;
  assignedAgent: string;
  confidence: number;
}

export interface ControlTowerModel {
  id: string;
  model: string;
  status: "online" | "degraded" | "offline";
  latencyMs: number;
  tokens: number;
  lastResponse: string;
}

export interface ConnectorHubItem {
  id: string;
  name: "OSS" | "BSS" | "Kafka" | "SNMP" | "REST" | "Database";
  status: "healthy" | "degraded" | "offline";
  availability: number;
  latencyMs: number;
}

export interface EventBusSnapshot {
  eventsPerSecond: number;
  queueSize: number;
  failedEvents: number;
}

export interface EnterpriseMemoryPanel {
  cachedKnowledge: number;
  previousIncidents: number;
  learnedFixes: number;
}

export interface ControlTowerSnapshot {
  updatedAt: string;
  topKpis: ControlTowerKpi[];
  agents: ControlTowerAgent[];
  investigations: LiveInvestigation[];
  models: ControlTowerModel[];
  connectors: ConnectorHubItem[];
  eventBus: EventBusSnapshot;
  memory: EnterpriseMemoryPanel;
}

export interface ExplainabilityExecutiveSummary {
  recommendation: string;
  confidence: number;
  risk: string;
  eta: string;
}

export interface ExplainabilityEvidence {
  kpis: string[];
  alarms: string[];
  events: string[];
  contextRetrieved: string[];
  supportingFacts: string[];
}

export interface RootCauseChainItem {
  id: string;
  cause: string;
  confidence: number;
  evidenceCount: number;
}

export interface DecisionFlowItem {
  id: string;
  stage: string;
  detail: string;
}

export interface EnterpriseMemoryDetail {
  similarIncidents: string[];
  previousSuccessfulActions: string[];
  learnedPatterns: string[];
}

export interface PolicyValidationDetail {
  policiesApplied: string[];
  complianceStatus: string;
  violations: Array<{ rule: string; severity: string; message: string }>;
}

export interface ExplainabilityBusinessImpact {
  customersAffected: number;
  sites: string[];
  revenueRisk: number;
  slaImpact: string;
}

export interface AlternativeAction {
  id: "A" | "B" | "C";
  title: string;
  rationale: string;
  confidence: number;
}

export interface ExplainabilityConfidenceAnalysis {
  confidenceGauge: number;
  riskMeter: number;
}

export interface ExplainabilitySnapshot {
  incidentId: string;
  updatedAt: string;
  executiveSummary: ExplainabilityExecutiveSummary;
  evidence: ExplainabilityEvidence;
  investigationTimeline: TimelineEvent[];
  rootCauseChain: RootCauseChainItem[];
  decisionFlow: DecisionFlowItem[];
  enterpriseMemory: EnterpriseMemoryDetail;
  policyValidation: PolicyValidationDetail;
  businessImpact: ExplainabilityBusinessImpact;
  alternativeActions: AlternativeAction[];
  confidenceAnalysis: ExplainabilityConfidenceAnalysis;
}

export interface ExecutiveSummarySection {
  incident: string;
  severity: Severity;
  status: string;
  aiRecommendation: string;
  confidence: number;
}

export interface ExecutiveBusinessImpactSection {
  customersImpacted: number;
  sites: string[];
  cells: string[];
  revenueRisk: number;
  slaImpact: string;
}

export interface ExecutiveTechnicalSummarySection {
  rootCause: string;
  timeline: TimelineEvent[];
  aiInvestigation: string;
  evidence: string[];
}

export interface ExecutiveRecommendationSection {
  recommendedFix: string;
  alternativeFixes: string[];
  estimatedResolution: string;
}

export interface ExecutiveExplainabilitySection {
  reasoning: string;
  policies: string[];
  enterpriseMemory: string;
  confidence: number;
}

export interface KpiComparisonMetric {
  id: string;
  label: "Availability" | "Latency" | "Throughput" | "Packet Loss" | "Energy";
  unit: "%" | "ms" | "Mbps";
  before: number;
  after: number;
}

export interface ExecutiveReportAttachments {
  timeline: TimelineEvent[];
  investigation: string[];
  evidence: string[];
}

export interface ExecutiveReportSnapshot {
  updatedAt: string;
  executiveSummary: ExecutiveSummarySection;
  businessImpact: ExecutiveBusinessImpactSection;
  technicalSummary: ExecutiveTechnicalSummarySection;
  aiRecommendation: ExecutiveRecommendationSection;
  aiExplainability: ExecutiveExplainabilitySection;
  kpiComparison: KpiComparisonMetric[];
  attachments: ExecutiveReportAttachments;
}

export interface EnterpriseMemoryDashboardStats {
  totalMemories: number;
  successfulResolutions: number;
  reusedKnowledge: number;
  learningScore: number;
}

export interface EnterpriseMemorySimilarIncident {
  incident: string;
  similarity: number;
  resolution: string;
  successRate: number;
}

export interface EnterpriseMemoryLearnedPatterns {
  recurringFailures: string[];
  commonRootCauses: string[];
  frequentRecommendations: string[];
}

export interface EnterpriseMemoryTimelineItem {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  kind: "Investigation History" | "Learning Event" | "Memory Update";
}

export interface EnterpriseMemorySearchRecord {
  id: string;
  incident: string;
  category: string;
  summary: string;
  timestamp: string;
  confidence: number;
}

export interface EnterpriseMemoryLearningMetrics {
  reuseRate: number;
  memoryGrowth: number;
  confidenceTrend: number;
}

export interface EnterpriseMemoryCenterSnapshot {
  updatedAt: string;
  dashboard: EnterpriseMemoryDashboardStats;
  similarIncidents: EnterpriseMemorySimilarIncident[];
  learnedPatterns: EnterpriseMemoryLearnedPatterns;
  timeline: EnterpriseMemoryTimelineItem[];
  semanticIndex: EnterpriseMemorySearchRecord[];
  learningMetrics: EnterpriseMemoryLearningMetrics;
}

export type ConnectorOperationalHealth = "healthy" | "degraded" | "offline";

export interface ConnectorHubKpis {
  healthyConnectors: number;
  failedConnectors: number;
  avgLatencyMs: number;
  requestsPerSec: number;
  syncSuccess: number;
  queueDepth: number;
}

export interface ConnectorMetricHistoryPoint {
  timestamp: string;
  latencyMs: number;
  requests: number;
  errors: number;
  retries: number;
  syncSuccess: number;
  queueDepth: number;
}

export interface ConnectorHubRecord {
  id: string;
  displayName: string;
  backendConnectorId: string | null;
  connectorType: string;
  health: ConnectorOperationalHealth;
  latencyMs: number;
  requests: number;
  errors: number;
  retries: number;
  lastSync: string;
  trafficMbps: number;
  version: string;
  authentication: string;
  capabilities: string[];
  connectedServices: string[];
  supportedApis: string[];
  configuration: Record<string, unknown>;
  recentLogs: string[];
  metricsHistory: ConnectorMetricHistoryPoint[];
  syncSuccess: number;
}

export interface ConnectorHubSnapshot {
  updatedAt: string;
  topKpis: ConnectorHubKpis;
  connectors: ConnectorHubRecord[];
}

export interface ConnectorConnectionTestResult {
  connectorId: string;
  status: string;
  latencyMs: number;
  availability: number;
  timestamp: string;
}

export type KnowledgeNodeType =
  | "Global"
  | "Market"
  | "Region"
  | "Site"
  | "Cell"
  | "Sector"
  | "Device"
  | "Alarm"
  | "Incident"
  | "Recommendation"
  | "KPI"
  | "Event"
  | "Context"
  | "Root Cause"
  | "Policy"
  | "Memory";

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: KnowledgeNodeType;
  metadata: Record<string, string>;
  kpis: string[];
  activeAlarms: string[];
  health: string;
  relatedIncidents: string[];
  aiRecommendations: string[];
  businessImpact: string;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  strength: number;
}

export interface KnowledgeGraphInsights {
  criticalPaths: string[];
  rootCauseChain: string[];
  failurePropagation: string[];
  recommendedPath: string;
  businessImpact: string;
}

export interface KnowledgeGraphSnapshot {
  updatedAt: string;
  networkGraph: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
  };
  relationshipGraph: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
  };
  insights: KnowledgeGraphInsights;
}
