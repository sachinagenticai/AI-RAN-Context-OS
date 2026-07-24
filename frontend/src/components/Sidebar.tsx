import { Activity, BarChart3, Database, FileText, Home, LogOut, Radar, ScrollText, Sheet } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: Activity },
  { to: "/control-tower", label: "Control Tower", icon: Radar },
  { to: "/knowledge-graph", label: "Knowledge Graph", icon: Radar },
  { to: "/memory", label: "Enterprise Memory", icon: Database },
  { to: "/investigation", label: "Investigation", icon: Radar },
  { to: "/explainability", label: "Explainability", icon: ScrollText },
  { to: "/executive-report", label: "Executive Report", icon: Sheet },
  { to: "/reports", label: "Reports", icon: FileText }
];

const navClass = ({ isActive }: { isActive: boolean }): string =>
  [
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
    isActive
      ? "bg-sky text-white shadow-lg"
      : "text-slate-200 hover:bg-white/10 hover:text-white"
  ].join(" ");

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = (): void => {
    localStorage.removeItem("airan_token");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex h-full w-full flex-col rounded-none bg-ink px-4 py-6 text-white md:rounded-r-3xl md:px-5">
      <div className="mb-8 flex items-center gap-3 border-b border-white/15 pb-6">
        <div className="rounded-lg bg-gradient-to-br from-sky to-aqua p-2.5 text-ink">
          <BarChart3 size={20} />
        </div>
        <div>
          <p className="font-display text-base leading-none">AI-RAN Context OS</p>
          <p className="mt-1 text-xs text-slate-300">Nokia Demo Console</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navClass}>
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </aside>
  );
}
