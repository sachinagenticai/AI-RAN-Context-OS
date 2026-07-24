import { Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "AI Native RAN OS",
    subtitle: "Enterprise landing surface for telecom operations"
  },
  "/dashboard": {
    title: "Network Intelligence Dashboard",
    subtitle: "Live AI-RAN observability across radio, transport, and core domains"
  },
  "/investigation": {
    title: "Incident Investigation",
    subtitle: "Causal analysis, timeline reconstruction, and remediation recommendations"
  },
  "/explainability": {
    title: "Explainability Center",
    subtitle: "Transparent and auditable AI recommendation trace for enterprise governance"
  },
  "/executive-report": {
    title: "Executive Report Center",
    subtitle: "CTO-ready incident package with business, technical, and AI governance views"
  },
  "/control-tower": {
    title: "Control Tower",
    subtitle: "Centralized platform orchestration and operational steering"
  },
  "/knowledge-graph": {
    title: "Knowledge Graph Center",
    subtitle: "Interactive AI-RAN topology and relationship explorer"
  },
  "/memory": {
    title: "Enterprise Memory",
    subtitle: "Operational precedent and retained context"
  },
  "/policy": {
    title: "Policy Center",
    subtitle: "Governance, approvals, and guardrails"
  },
  "/connectors": {
    title: "Connector Hub",
    subtitle: "Enterprise integration operations center"
  },
  "/reports": {
    title: "Operational Reports",
    subtitle: "Executive summaries and performance trends for telecom leadership"
  },
  "/settings": {
    title: "Settings",
    subtitle: "Platform configuration and operational preferences"
  }
};

export default function MainLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const content = useMemo(() => {
    return routeTitles[location.pathname] ?? routeTitles["/dashboard"];
  }, [location.pathname]);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px,1fr]">
      <div className="fixed inset-0 z-40 bg-ink/45 md:hidden" hidden={!menuOpen} onClick={() => setMenuOpen(false)} />

      <div
        className={[
          "fixed left-0 top-0 z-50 h-full w-[280px] transition-transform md:static md:h-auto md:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
      >
        <Sidebar />
      </div>

      <main className="relative px-4 pb-8 pt-4 md:px-8 md:pt-6">
        <button
          type="button"
          className="mb-3 inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <Menu size={16} />
          Menu
        </button>

        <Header title={content.title} subtitle={content.subtitle} />
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
