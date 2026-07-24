import type { Incident, Severity } from "../types/domain";

interface IncidentTableProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
}

const severityStyle: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-emerald-100 text-emerald-700"
};

export default function IncidentTable({ incidents, onSelectIncident }: IncidentTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/65 bg-white/85 shadow-panel">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-lg text-ink">Active Incident Stream</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Incident</th>
              <th className="px-5 py-3">Site</th>
              <th className="px-5 py-3">Cell</th>
              <th className="px-5 py-3">Alarm</th>
              <th className="px-5 py-3">Severity</th>
              <th className="px-5 py-3">Technology</th>
              <th className="px-5 py-3">Region</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                className="cursor-pointer border-b border-slate-100 transition hover:bg-sky/5"
                onClick={() => onSelectIncident(incident.id)}
              >
                <td className="px-5 py-4 font-semibold text-ink">{incident.id}</td>
                <td className="px-5 py-4 text-slate-700">{incident.site}</td>
                <td className="px-5 py-4 text-slate-700">{incident.cell}</td>
                <td className="px-5 py-4 text-slate-700">{incident.alarm}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityStyle[incident.severity]}`}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-700">{incident.technology}</td>
                <td className="px-5 py-4 text-slate-700">{incident.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
