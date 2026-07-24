import { Bell, CalendarClock, CircleUserRound } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  return (
    <header className="rounded-2xl border border-white/70 bg-white/70 px-5 py-4 shadow-panel backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 sm:flex">
            <CalendarClock size={15} />
            {date}
          </span>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-ink"
            aria-label="Open notifications"
          >
            <Bell size={18} />
          </button>
          <span className="flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-white">
            <CircleUserRound size={16} />
            Ops Lead
          </span>
        </div>
      </div>
    </header>
  );
}
