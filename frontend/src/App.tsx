import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { PageLoadingSkeleton } from "./components/PageStates";
import PlatformSectionPage from "./pages/PlatformSection";

const HomePage = lazy(() => import("./pages/Home"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const InvestigationPage = lazy(() => import("./pages/Investigation"));
const ControlTowerPage = lazy(() => import("./pages/ControlTower"));
const ExplainabilityCenterPage = lazy(() => import("./pages/ExplainabilityCenter"));
const ExecutiveReportCenterPage = lazy(() => import("./pages/ExecutiveReportCenter"));
const KnowledgeGraphCenterPage = lazy(() => import("./pages/KnowledgeGraphCenter"));
const EnterpriseMemoryCenterPage = lazy(() => import("./pages/EnterpriseMemoryCenter"));
const ConnectorHubPage = lazy(() => import("./pages/ConnectorHub"));
const LoginPage = lazy(() => import("./pages/Login"));
const ReportsPage = lazy(() => import("./pages/Reports"));

function ProtectedRoute() {
  const token = localStorage.getItem("airan_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const fallback = <PageLoadingSkeleton label="Loading page..." compact blocks={2} />;

  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/investigation" element={<InvestigationPage />} />
            <Route path="/explainability" element={<ExplainabilityCenterPage />} />
            <Route path="/executive-report" element={<ExecutiveReportCenterPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/control-tower" element={<ControlTowerPage />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraphCenterPage />} />
            <Route path="/memory" element={<EnterpriseMemoryCenterPage />} />
            <Route path="/connectors" element={<ConnectorHubPage />} />
            <Route
              path="/policy"
              element={
                <PlatformSectionPage
                  title="Policy Center"
                  eyebrow="AI Native RAN OS"
                  summary="Apply enterprise guardrails, approvals, and operational risk policies before autonomous execution."
                  status="Governed"
                  accent="from-amber-300 via-ember to-red-400"
                  stats={[
                    { label: "Approval Flow", value: "Guarded", detail: "Transparent remediation approval path" },
                    { label: "Risk Posture", value: "Managed", detail: "Operational controls stay in place" },
                    { label: "Policy Visibility", value: "Clear", detail: "Built for audit and traceability" },
                    { label: "Change Mode", value: "Controlled", detail: "Enterprise default posture" }
                  ]}
                  highlights={[
                    "Captures the governance layer of the AI Native RAN OS.",
                    "Designed to align with enterprise approval and escalation rules.",
                    "Keeps policy distinct from the operational dashboards."
                  ]}
                  primaryAction={{ label: "Open Reports", to: "/reports" }}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <PlatformSectionPage
                  title="Settings"
                  eyebrow="AI Native RAN OS"
                  summary="Adjust platform preferences, operating defaults, and enterprise presentation settings."
                  status="Configurable"
                  accent="from-slate-300 via-sky to-aqua"
                  stats={[
                    { label: "Operating Mode", value: "Enterprise", detail: "Default platform presentation" },
                    { label: "Theme", value: "Dark", detail: "Minimal control surface styling" },
                    { label: "Navigation", value: "Structured", detail: "Preserves existing routes" },
                    { label: "Frontend Scope", value: "Local", detail: "No backend changes required" }
                  ]}
                  highlights={[
                    "Configures the user-facing platform shell and operational defaults.",
                    "Preserves the existing app architecture and route behavior.",
                    "Keeps enterprise styling consistent across the experience."
                  ]}
                  primaryAction={{ label: "Open Dashboard", to: "/dashboard" }}
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
