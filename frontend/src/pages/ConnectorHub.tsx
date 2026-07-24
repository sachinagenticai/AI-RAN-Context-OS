import { useMutation, useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Cable, Database, Download, Gauge, ListTree, Network, RefreshCw, SearchCheck, Server, ShieldCheck, Timer, Waves } from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { EmptyListNotice, PageEmptyState, PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import { getConnectorHubSnapshot, testConnectorConnection } from "../lib/api";
import type { ConnectorHubRecord, ConnectorHubSnapshot } from "../types/domain";

const percent = (value: number): string => `${Math.round(value * 100)}%`;

const dateTime = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(new Date(value));

const healthBadge = (value: ConnectorHubRecord["health"]): string => {
  if (value === "healthy") {
    return "bg-emerald-400/15 text-emerald-200 border-emerald-300/35";
  }

  if (value === "degraded") {
    return "bg-amber-400/15 text-amber-100 border-amber-300/35";
  }

  return "bg-rose-400/15 text-rose-100 border-rose-300/35";
};

const metricLinePath = (series: number[]): string => {
  if (!series.length) {
    return "";
  }

  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const span = Math.max(1, max - min);

  return series
    .map((value, index) => {
      const x = (index / Math.max(1, series.length - 1)) * 100;
      const y = 42 - ((value - min) / span) * 32;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

function KpiCard({
  title,
  value,
  detail,
  icon
}: {
  title: string;
  value: string;
  detail: string;
  icon: ReactElement;
}): ReactElement {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{title}</p>
        <span className="rounded-lg bg-white/10 p-2 text-aqua">{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

export default function ConnectorHubPage(): ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(true);
  const [testMessage, setTestMessage] = useState<string>("");

  const query = useQuery<ConnectorHubSnapshot>({
    queryKey: ["connector-hub"],
    queryFn: getConnectorHubSnapshot,
    refetchInterval: 5000
  });

  const snapshot = query.data;

  const selectedConnector = useMemo(() => {
    if (!snapshot || snapshot.connectors.length === 0) {
      return null;
    }

    if (!selectedId) {
      return snapshot.connectors[0];
    }

    return snapshot.connectors.find((connector) => connector.id === selectedId) ?? snapshot.connectors[0];
  }, [snapshot, selectedId]);

  const connectionTest = useMutation({
    mutationFn: async (connector: ConnectorHubRecord) => {
      if (!connector.backendConnectorId) {
        return {
          connectorId: connector.id,
          status: "virtual",
          latencyMs: connector.latencyMs,
          availability: connector.syncSuccess,
          timestamp: new Date().toISOString()
        };
      }

      return testConnectorConnection(connector.backendConnectorId);
    },
    onSuccess: (result) => {
      setTestMessage(
        `Connection test: ${result.connectorId} status=${result.status} latency=${result.latencyMs}ms availability=${percent(result.availability)}.`
      );
    },
    onError: (error) => {
      setTestMessage(error instanceof Error ? error.message : "Connection test failed.");
    }
  });

  const exportSelected = (): void => {
    if (!selectedConnector) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      connector: selectedConnector
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `connector-status-${selectedConnector.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (query.isLoading) {
    return <PageLoadingSkeleton label="Loading Connector Hub..." />;
  }

  if (query.isError || !snapshot) {
    return <PageErrorState message="Unable to load connector operations data." />;
  }

  if (snapshot.connectors.length === 0) {
    return <PageEmptyState title="No connectors available" detail="No connector records are available for monitoring right now." />;
  }

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#081525] via-[#0f2035] to-[#133149] p-6 shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,178,255,0.22),transparent_34%),radial-gradient(circle_at_84%_14%,rgba(0,208,180,0.18),transparent_36%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
              <Cable size={13} />
              Enterprise Integration Operations Center
            </span>
            <h1 className="mt-4 font-display text-3xl text-white md:text-5xl">Connector Hub</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Monitor connector health, synchronization quality, protocol performance, and enterprise integration posture from a single operational control surface.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Last Refresh</p>
            <p className="mt-1 font-display text-2xl text-white">{dateTime(snapshot.updatedAt)}</p>
            <p className="text-xs text-slate-400">Auto refresh every 5s</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <Gauge size={17} className="text-aqua" />
          <h2 className="font-display text-xl text-white">Top KPIs</h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard title="Healthy Connectors" value={String(snapshot.topKpis.healthyConnectors)} detail="Stable and policy-compliant connectors" icon={<ShieldCheck size={16} />} />
          <KpiCard title="Failed Connectors" value={String(snapshot.topKpis.failedConnectors)} detail="Offline or unavailable connector links" icon={<AlertTriangle size={16} />} />
          <KpiCard title="Avg Latency" value={`${snapshot.topKpis.avgLatencyMs}ms`} detail="Average connector round-trip latency" icon={<Timer size={16} />} />
          <KpiCard title="Requests/sec" value={String(snapshot.topKpis.requestsPerSec)} detail="Live integration throughput" icon={<Activity size={16} />} />
          <KpiCard title="Sync Success" value={percent(snapshot.topKpis.syncSuccess)} detail="Mean synchronization success across connectors" icon={<SearchCheck size={16} />} />
          <KpiCard title="Queue Depth" value={String(snapshot.topKpis.queueDepth)} detail="Current pending event backlog" icon={<ListTree size={16} />} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <Network size={17} className="text-sky-200" />
          <h2 className="font-display text-xl text-white">Connector Cards</h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.connectors.map((connector) => {
            const selected = selectedConnector?.id === connector.id;
            return (
              <button
                key={connector.id}
                type="button"
                onClick={() => setSelectedId(connector.id)}
                className={[
                  "animate-rise rounded-2xl border p-4 text-left transition",
                  selected
                    ? "border-sky/60 bg-sky/10 shadow-[0_0_0_1px_rgba(56,189,248,0.2)]"
                    : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-lg text-white">{connector.displayName}</p>
                  <span className={["rounded-full border px-2.5 py-1 text-xs uppercase tracking-[0.08em]", healthBadge(connector.health)].join(" ")}>
                    {connector.health}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-300">
                  <div>
                    <dt className="text-slate-400">Latency</dt>
                    <dd className="font-semibold text-white">{connector.latencyMs}ms</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Requests</dt>
                    <dd className="font-semibold text-white">{connector.requests}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Errors</dt>
                    <dd className="font-semibold text-white">{connector.errors}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Retries</dt>
                    <dd className="font-semibold text-white">{connector.retries}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Traffic</dt>
                    <dd className="font-semibold text-white">{connector.trafficMbps.toFixed(2)} Mbps</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Version</dt>
                    <dd className="font-semibold text-white">{connector.version}</dd>
                  </div>
                </dl>

                <p className="mt-2 text-xs text-slate-400">Last Sync: {dateTime(connector.lastSync)}</p>
                <p className="mt-1 text-xs text-slate-400">Authentication: {connector.authentication}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {connector.capabilities.length === 0 ? <EmptyListNotice>No capabilities reported.</EmptyListNotice> : null}
                  {connector.capabilities.slice(0, 4).map((capability) => (
                    <span key={capability} className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-slate-200">
                      {capability}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedConnector ? (
        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Server size={17} className="text-aqua" />
              <h2 className="font-display text-xl text-white">Connector Details · {selectedConnector.displayName}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => connectionTest.mutate(selectedConnector)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 transition hover:border-white/35 hover:bg-white/15"
              >
                <SearchCheck size={14} />
                Test Connection
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestMessage("");
                  query.refetch();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 transition hover:border-white/35 hover:bg-white/15"
              >
                <RefreshCw size={14} className={query.isFetching ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setShowLogs((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 transition hover:border-white/35 hover:bg-white/15"
              >
                <ListTree size={14} />
                View Logs
              </button>
              <button
                type="button"
                onClick={exportSelected}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 transition hover:border-white/35 hover:bg-white/15"
              >
                <Download size={14} />
                Export Status
              </button>
            </div>
          </div>

          {testMessage ? (
            <p className="mt-3 rounded-xl border border-aqua/30 bg-aqua/10 px-3 py-2 text-xs text-aqua">{testMessage}</p>
          ) : null}

          <div className="mt-4 grid gap-5 xl:grid-cols-[1fr,1fr]">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-sky-200" />
                <h3 className="font-semibold text-white">Configuration</h3>
              </div>
              <div className="mt-3 max-h-64 overflow-auto rounded-xl bg-[#081321]/80 p-3 text-xs text-slate-200">
                <pre>{JSON.stringify(selectedConnector.configuration, null, 2)}</pre>
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <Cable size={15} className="text-aqua" />
                <h3 className="font-semibold text-white">Connected Services</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedConnector.connectedServices.length === 0 ? <EmptyListNotice>No connected services reported.</EmptyListNotice> : null}
                {selectedConnector.connectedServices.map((service) => (
                  <span key={service} className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-slate-100">
                    {service}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Waves size={15} className="text-sky-200" />
                <h3 className="font-semibold text-white">Supported APIs</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedConnector.supportedApis.length === 0 ? <EmptyListNotice>No supported APIs reported.</EmptyListNotice> : null}
                {selectedConnector.supportedApis.map((apiName) => (
                  <span key={apiName} className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-slate-100">
                    {apiName}
                  </span>
                ))}
              </div>
            </article>
          </div>

          {showLogs ? (
            <article className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <ListTree size={15} className="text-aqua" />
                <h3 className="font-semibold text-white">Recent Logs</h3>
              </div>
              <div className="mt-3 space-y-2 font-mono text-xs text-slate-300">
                {selectedConnector.recentLogs.length === 0 ? <EmptyListNotice>No recent logs available.</EmptyListNotice> : null}
                {selectedConnector.recentLogs.map((log) => (
                  <p key={log} className="rounded-lg border border-white/10 bg-[#081321]/75 px-3 py-2">
                    {log}
                  </p>
                ))}
              </div>
            </article>
          ) : null}

          <article className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-sky-200" />
              <h3 className="font-semibold text-white">Metrics History</h3>
            </div>

            <div className="mt-4 overflow-x-auto">
              <svg viewBox="0 0 100 46" className="h-20 min-w-full rounded-xl border border-white/10 bg-[#081321]/70 p-2">
                <path d={metricLinePath(selectedConnector.metricsHistory.map((point) => point.latencyMs))} fill="none" stroke="#4cc6ff" strokeWidth="1.2" />
                <path d={metricLinePath(selectedConnector.metricsHistory.map((point) => point.requests))} fill="none" stroke="#00d0b4" strokeWidth="1" opacity="0.75" />
              </svg>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-xs text-slate-200">
                <thead>
                  <tr className="text-left uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">Latency</th>
                    <th className="px-2 py-2">Requests</th>
                    <th className="px-2 py-2">Errors</th>
                    <th className="px-2 py-2">Retries</th>
                    <th className="px-2 py-2">Sync</th>
                    <th className="px-2 py-2">Queue</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedConnector.metricsHistory.length === 0 ? (
                    <tr className="border-t border-white/10">
                      <td className="px-2 py-2 text-slate-300" colSpan={7}>No metrics history available.</td>
                    </tr>
                  ) : null}
                  {selectedConnector.metricsHistory.slice(-8).map((point) => (
                    <tr key={point.timestamp} className="border-t border-white/10">
                      <td className="px-2 py-2">{dateTime(point.timestamp)}</td>
                      <td className="px-2 py-2">{point.latencyMs}ms</td>
                      <td className="px-2 py-2">{point.requests}</td>
                      <td className="px-2 py-2">{point.errors}</td>
                      <td className="px-2 py-2">{point.retries}</td>
                      <td className="px-2 py-2">{percent(point.syncSuccess)}</td>
                      <td className="px-2 py-2">{point.queueDepth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
