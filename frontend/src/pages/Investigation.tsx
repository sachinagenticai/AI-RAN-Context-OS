import { BrainCircuit, ShieldCheck, Workflow } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ContextGraph from "../components/ContextGraph";
import DemoModeControlBar from "../components/DemoModeControlBar";
import { EmptyListNotice, PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import FinalRecommendationCard from "../components/FinalRecommendationCard";
import InvestigationSteps from "../components/InvestigationSteps";
import RecommendationPanel from "../components/RecommendationPanel";
import Timeline from "../components/Timeline";
import { getDashboardSnapshot, runInvestigationOrchestrator } from "../lib/api";
import { createDemoIncident, readDemoModeState, writeDemoModeState } from "../lib/demoMode";
import type { DemoModeState } from "../lib/demoMode";
import type { Incident, InvestigationAgent, InvestigationBundle } from "../types/domain";

const createInitialSteps = (): InvestigationAgent[] => [
  { id: "context-agent", label: "Context Agent", status: "pending", startedAt: null, completedAt: null, executionTimeMs: null, reasoningSummary: "Queued for context acquisition", confidence: null, artifacts: [] },
  { id: "kpi-analysis-agent", label: "KPI Analysis Agent", status: "pending", startedAt: null, completedAt: null, executionTimeMs: null, reasoningSummary: "Queued for KPI analysis", confidence: null, artifacts: [] },
  { id: "topology-agent", label: "Topology Agent", status: "pending", startedAt: null, completedAt: null, executionTimeMs: null, reasoningSummary: "Queued for topology analysis", confidence: null, artifacts: [] },
  { id: "root-cause-agent", label: "Root Cause Agent", status: "pending", startedAt: null, completedAt: null, executionTimeMs: null, reasoningSummary: "Queued for causal reasoning", confidence: null, artifacts: [] },
  { id: "policy-agent", label: "Policy Agent", status: "pending", startedAt: null, completedAt: null, executionTimeMs: null, reasoningSummary: "Queued for policy validation", confidence: null, artifacts: [] },
  { id: "enterprise-memory-agent", label: "Enterprise Memory Agent", status: "pending", startedAt: null, completedAt: null, executionTimeMs: null, reasoningSummary: "Queued for enterprise memory retrieval", confidence: null, artifacts: [] },
  { id: "recommendation-agent", label: "Recommendation Agent", status: "pending", startedAt: null, completedAt: null, executionTimeMs: null, reasoningSummary: "Queued for final recommendation synthesis", confidence: null, artifacts: [] }
];

export default function InvestigationPage() {
  const [params] = useSearchParams();
  const [steps, setSteps] = useState<InvestigationAgent[]>(() => createInitialSteps());
  const [investigation, setInvestigation] = useState<InvestigationBundle | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationError, setInvestigationError] = useState<string | null>(null);
  const [demoState, setDemoState] = useState<DemoModeState>(() => readDemoModeState());
  const [demoProgressLabel, setDemoProgressLabel] = useState("Demo mode idle. Start to begin autonomous incident simulation.");

  const incidentIdFromUrl = useMemo(() => {
    return params.get("incident") ?? "INC-24071";
  }, [params]);
  const demoRequested = params.get("demo") === "1";
  const [activeIncidentId, setActiveIncidentId] = useState(incidentIdFromUrl);

  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const cycleRef = useRef(demoState.cycle);

  const clearCycleTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const persistDemoState = useCallback((nextState: DemoModeState): void => {
    setDemoState(writeDemoModeState(nextState));
    cycleRef.current = nextState.cycle;
  }, []);

  const executeInvestigation = useCallback(
    async (currentIncidentId: string, incidentOverride?: Partial<Incident>): Promise<InvestigationBundle> => {
      setIsInvestigating(true);
      setInvestigationError(null);
      setSteps(createInitialSteps());

      try {
        const result = await runInvestigationOrchestrator(
          currentIncidentId,
          (update) => {
            setSteps((currentSteps) =>
              currentSteps.map((step) =>
                step.id === update.id
                  ? {
                      ...step,
                      status: update.status,
                      startedAt: update.startedAt ?? step.startedAt,
                      completedAt: update.completedAt ?? step.completedAt,
                      executionTimeMs: update.executionTimeMs ?? step.executionTimeMs,
                      reasoningSummary: update.reasoningSummary ?? step.reasoningSummary,
                      confidence: update.confidence ?? step.confidence,
                      artifacts: update.artifacts ?? step.artifacts
                    }
                  : step
              )
            );
          },
          {
            incidentOverride,
            stepDelayMs: demoRequested ? 350 : 0
          }
        );
        setInvestigation(result);
        return result;
      } catch (error) {
        setInvestigationError(error instanceof Error ? error.message : "Unable to complete the AI investigation.");
        throw error;
      } finally {
        setIsInvestigating(false);
      }
    },
    [demoRequested]
  );

  const runDemoCycle = useCallback(async (): Promise<void> => {
    if (!runningRef.current || pausedRef.current) {
      return;
    }

    try {
      const cycle = cycleRef.current + 1;
      setDemoProgressLabel(`Generating synthetic telecom incident for cycle ${cycle}.`);

      const snapshot = await getDashboardSnapshot();
      const baseIncident = snapshot.criticalIncidentFeed[0] ?? snapshot.incidents[0] ?? null;
      const syntheticIncident = createDemoIncident(baseIncident, cycle);

      setActiveIncidentId(syntheticIncident.id);
      persistDemoState({
        ...readDemoModeState(),
        status: "running",
        cycle,
        activeIncidentId: syntheticIncident.id,
        updatedAt: new Date().toISOString()
      });

      const cycleStartedAt = Date.now();
      setDemoProgressLabel(`Incident ${syntheticIncident.id} opened. Triggering autonomous AI investigation.`);

      const result = await executeInvestigation(syntheticIncident.id, syntheticIncident);

      if (!runningRef.current) {
        return;
      }

      const recommendation = result.finalRecommendation.headline;
      persistDemoState({
        ...readDemoModeState(),
        status: pausedRef.current ? "paused" : "running",
        cycle,
        activeIncidentId: syntheticIncident.id,
        lastRecommendation: recommendation,
        updatedAt: new Date().toISOString()
      });

      setDemoProgressLabel(`Recommendation published for ${syntheticIncident.id}. Closing incident and preparing next cycle.`);

      const elapsedMs = Date.now() - cycleStartedAt;
      const nextDelayMs = Math.max(1200, 10000 - elapsedMs);

      if (pausedRef.current) {
        setDemoProgressLabel(`Demo paused after ${syntheticIncident.id}. Resume to generate the next incident.`);
        return;
      }

      clearCycleTimer();
      timerRef.current = window.setTimeout(() => {
        void runDemoCycle();
      }, nextDelayMs);
    } catch {
      runningRef.current = false;
      pausedRef.current = false;
      persistDemoState({
        ...readDemoModeState(),
        status: "idle",
        updatedAt: new Date().toISOString()
      });
      setDemoProgressLabel("Demo halted due to an investigation error. Review the error banner and restart when ready.");
    }
  }, [clearCycleTimer, executeInvestigation, persistDemoState]);

  const startDemo = useCallback((): void => {
    clearCycleTimer();
    runningRef.current = true;
    pausedRef.current = false;
    setInvestigationError(null);

    const nextState: DemoModeState = {
      status: "running",
      cycle: 0,
      activeIncidentId: null,
      lastRecommendation: null,
      updatedAt: new Date().toISOString()
    };

    persistDemoState(nextState);
    setDemoProgressLabel("Demo started. Building first synthetic incident.");
    void runDemoCycle();
  }, [clearCycleTimer, persistDemoState, runDemoCycle]);

  const pauseDemo = useCallback((): void => {
    if (!runningRef.current) {
      return;
    }

    pausedRef.current = true;
    clearCycleTimer();
    persistDemoState({
      ...readDemoModeState(),
      status: "paused",
      updatedAt: new Date().toISOString()
    });
    setDemoProgressLabel(isInvestigating ? "Pause requested. Current incident will finish, then demo stops." : "Demo paused.");
  }, [clearCycleTimer, isInvestigating, persistDemoState]);

  const resumeDemo = useCallback((): void => {
    if (!runningRef.current && demoState.status === "idle") {
      return;
    }

    runningRef.current = true;
    pausedRef.current = false;
    persistDemoState({
      ...readDemoModeState(),
      status: "running",
      updatedAt: new Date().toISOString()
    });
    setDemoProgressLabel("Demo resumed. Continuing autonomous incident simulation.");

    if (!isInvestigating) {
      void runDemoCycle();
    }
  }, [demoState.status, isInvestigating, persistDemoState, runDemoCycle]);

  const resetDemo = useCallback((): void => {
    clearCycleTimer();
    runningRef.current = false;
    pausedRef.current = false;
    setSteps(createInitialSteps());
    setInvestigation(null);
    setInvestigationError(null);
    setActiveIncidentId(incidentIdFromUrl);

    persistDemoState({
      status: "idle",
      cycle: 0,
      activeIncidentId: null,
      lastRecommendation: null,
      updatedAt: new Date().toISOString()
    });
    setDemoProgressLabel("Demo reset. Start to launch a fresh incident sequence.");
  }, [clearCycleTimer, incidentIdFromUrl, persistDemoState]);

  useEffect(() => {
    setActiveIncidentId(incidentIdFromUrl);
  }, [incidentIdFromUrl]);

  useEffect(() => {
    if (!demoRequested) {
      runningRef.current = false;
      pausedRef.current = false;
      clearCycleTimer();
      return;
    }

    const current = readDemoModeState();
    setDemoState(current);
    cycleRef.current = current.cycle;

    if (current.status === "running") {
      runningRef.current = true;
      pausedRef.current = false;

      if (timerRef.current === null) {
        void runDemoCycle();
      }
    } else if (current.status === "paused") {
      runningRef.current = true;
      pausedRef.current = true;
      setDemoProgressLabel("Demo currently paused. Resume to continue with the next incident.");
    }
  }, [clearCycleTimer, demoRequested, runDemoCycle]);

  useEffect(() => {
    if (demoRequested) {
      return;
    }

    void executeInvestigation(activeIncidentId);
  }, [activeIncidentId, demoRequested, executeInvestigation]);

  useEffect(() => {
    return () => {
      clearCycleTimer();
      runningRef.current = false;
      pausedRef.current = false;
    };
  }, [clearCycleTimer]);

  const activeStep = steps.find((step) => step.status === "running");
  const completedSteps = steps.filter((step) => step.status === "completed").length;
  const incident = investigation?.incident;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Autonomous AI Analyst</p>
            <h2 className="mt-1 font-display text-xl text-ink">
              {incident ? `${incident.id} · ${incident.alarm}` : `Preparing investigation · ${activeIncidentId}`}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {incident
                ? `${incident.site} · ${incident.cell} · ${incident.technology}`
                : "Opening incident context and coordinating enterprise reasoning services."}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-slate-700">
              The orchestrator is evaluating context, evidence, quality, policy guardrails, and enterprise memory in sequence to produce an analyst-grade recommendation.
              Each agent writes its outputs into a shared investigation context before the final verdict is synthesized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky/15 px-3 py-1.5 text-xs font-semibold uppercase text-sky-800">
              <BrainCircuit size={14} />
              {isInvestigating && activeStep ? `Running ${activeStep.label}` : `${completedSteps}/${steps.length} agents complete`}
            </span>
            <Link
              to={`/explainability?incident=${encodeURIComponent(incident?.id ?? activeIncidentId)}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold uppercase text-white transition hover:bg-steel"
            >
              Explainability Center
            </Link>
            {investigation ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-aqua/15 px-3 py-1.5 text-xs font-semibold uppercase text-teal-800">
                <Workflow size={14} />
                Confidence {Math.round(investigation.quality.confidence * 100)}%
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <DemoModeControlBar
        status={demoState.status}
        cycle={demoState.cycle}
        activeIncidentId={demoState.activeIncidentId}
        progressLabel={demoProgressLabel}
        onStart={startDemo}
        onPause={pauseDemo}
        onResume={resumeDemo}
        onReset={resetDemo}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <InvestigationSteps steps={steps} />
        <FinalRecommendationCard
          recommendation={investigation?.finalRecommendation ?? null}
          policy={investigation?.policy ?? null}
          runningLabel={activeStep?.label ?? "Awaiting orchestration"}
        />
      </div>

      {investigationError ? (
        <PageErrorState message={investigationError} />
      ) : null}

      {!investigation && isInvestigating ? (
        <PageLoadingSkeleton
          label={activeStep ? `Running ${activeStep.label}...` : "Running investigation orchestrator..."}
          compact
          blocks={2}
        />
      ) : null}

      {!investigation ? null : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Root Cause</p>
              <p className="mt-2 text-sm font-semibold text-ink">{investigation.rootCauses[0]?.cause ?? "Unavailable"}</p>
              <p className="mt-2 text-sm text-slate-600">{investigation.evidence.why}</p>
            </article>
            <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Policy Status</p>
              <p className="mt-2 font-display text-3xl text-ink">{investigation.policy.status}</p>
              <p className="mt-1 text-sm text-slate-600">Approval level: {investigation.policy.approvalLevel}</p>
            </article>
            <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Enterprise Memory</p>
              <p className="mt-2 font-display text-3xl text-ink">{investigation.memory.entryCount}</p>
              <p className="mt-1 text-sm text-slate-600">Recorded entries across {investigation.memory.categories.join(", ") || "no categories"}</p>
            </article>
            <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Predicted Risk</p>
              <p className="mt-2 font-display text-3xl text-ink">{investigation.prediction.degradationRisk}</p>
              <p className="mt-1 text-sm text-slate-600">SLA: {investigation.prediction.slaViolationRisk}</p>
            </article>
          </section>

          <section className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
            <h2 className="font-display text-lg text-ink">Shared Investigation Context</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Context</p>
                <p className="mt-2 text-sm text-slate-700">{investigation.context.contextSummary}</p>
              </article>
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">KPI Assessment</p>
                <p className="mt-2 text-sm text-slate-700">{investigation.context.kpiAssessment}</p>
              </article>
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Topology</p>
                <p className="mt-2 text-sm text-slate-700">{investigation.context.topologyAssessment}</p>
              </article>
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Root Cause</p>
                <p className="mt-2 text-sm text-slate-700">{investigation.context.rootCauseAssessment}</p>
              </article>
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Policy</p>
                <p className="mt-2 text-sm text-slate-700">{investigation.context.policyAssessment}</p>
              </article>
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Memory</p>
                <p className="mt-2 text-sm text-slate-700">{investigation.context.memoryAssessment}</p>
              </article>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
            <Timeline events={investigation.timeline} />
            <RecommendationPanel recommendations={investigation.recommendations} />
          </div>

          <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
            <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
              <h2 className="font-display text-lg text-ink">Evidence Narrative</h2>
              <p className="mt-3 text-sm font-semibold text-ink">{investigation.evidence.why}</p>
              <p className="mt-2 text-sm text-slate-700">{investigation.evidence.how}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {investigation.evidence.evidence.length === 0 ? <EmptyListNotice>No evidence items available.</EmptyListNotice> : null}
                {investigation.evidence.evidence.map((entry) => (
                  <li key={entry} className="rounded-lg bg-slate-50 px-3 py-2">{entry}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-aqua" />
                <h2 className="font-display text-lg text-ink">Decision Envelope</h2>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-ink">Recommended action</p>
                  <p className="mt-1 text-sm text-slate-700">{investigation.decision.recommendedAction}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Rollback plan</p>
                  <p className="mt-1 text-sm text-slate-700">{investigation.decision.rollbackPlan}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Business impact</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {investigation.businessImpact.subscribersAffected} subscribers · €{investigation.businessImpact.revenueImpact.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Operational memory</p>
                  <p className="mt-1 text-sm text-slate-700">{investigation.memory.summary}</p>
                </div>
              </div>
            </article>
          </section>

          <ContextGraph nodes={investigation.nodes} edges={investigation.edges} />
        </>
      )}
    </div>
  );
}