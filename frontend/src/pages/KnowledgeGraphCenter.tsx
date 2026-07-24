import { useQuery } from "@tanstack/react-query";
import {
  BrainCircuit,
  Filter,
  LocateFixed,
  Minus,
  Move,
  Plus,
  Search,
  Sparkles,
  Target
} from "lucide-react";
import type { MouseEvent as ReactMouseEvent, ReactElement, WheelEvent } from "react";
import { useMemo, useState } from "react";
import { PageEmptyState, PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import { getKnowledgeGraphSnapshot } from "../lib/api";
import type { KnowledgeGraphEdge, KnowledgeGraphNode, KnowledgeGraphSnapshot, KnowledgeNodeType } from "../types/domain";

type GraphKind = "network" | "relationship";

const nodeTypeColor: Record<KnowledgeNodeType, string> = {
  Global: "#7dd3fc",
  Market: "#38bdf8",
  Region: "#22d3ee",
  Site: "#14b8a6",
  Cell: "#4ade80",
  Sector: "#86efac",
  Device: "#facc15",
  Alarm: "#f97316",
  Incident: "#ef4444",
  Recommendation: "#a78bfa",
  KPI: "#60a5fa",
  Event: "#06b6d4",
  Context: "#0ea5e9",
  "Root Cause": "#f87171",
  Policy: "#34d399",
  Memory: "#fbbf24"
};

const allNodeTypes = Object.keys(nodeTypeColor) as KnowledgeNodeType[];

function buildAutoLayout(nodes: KnowledgeGraphNode[]): Map<string, { x: number; y: number }> {
  const centerX = 620;
  const centerY = 320;
  const rings: KnowledgeNodeType[] = [
    "Global",
    "Market",
    "Region",
    "Site",
    "Cell",
    "Sector",
    "Device",
    "Alarm",
    "Incident",
    "Recommendation",
    "KPI",
    "Event",
    "Context",
    "Root Cause",
    "Policy",
    "Memory"
  ];

  const grouped = new Map<KnowledgeNodeType, KnowledgeGraphNode[]>();
  for (const ring of rings) {
    grouped.set(ring, []);
  }

  for (const node of nodes) {
    grouped.get(node.type)?.push(node);
  }

  const coordinates = new Map<string, { x: number; y: number }>();
  rings.forEach((type, ringIndex) => {
    const typeNodes = grouped.get(type) ?? [];
    if (!typeNodes.length) {
      return;
    }

    const radius = 78 + ringIndex * 28;
    typeNodes.forEach((node, index) => {
      const baseAngle = (Math.PI * 2 * ringIndex) / rings.length;
      const spread = (Math.PI * 2) / Math.max(typeNodes.length, 1);
      const angle = baseAngle + spread * index;
      coordinates.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    });
  });

  return coordinates;
}

function GraphCanvas({
  title,
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  searchTerm,
  onSearchFocus,
  visibleTypes
}: {
  title: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  searchTerm: string;
  onSearchFocus: (nodeId: string) => void;
  visibleTypes: KnowledgeNodeType[];
}): ReactElement {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const layout = useMemo(() => buildAutoLayout(nodes), [nodes]);

  const neighborSet = useMemo(() => {
    if (!selectedNodeId) {
      return new Set<string>();
    }

    const set = new Set<string>([selectedNodeId]);
    edges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        set.add(edge.target);
      }
      if (edge.target === selectedNodeId) {
        set.add(edge.source);
      }
    });
    return set;
  }, [edges, selectedNodeId]);

  const filteredNodeIds = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const allowedTypes = new Set(visibleTypes);

    return new Set<string>(
      nodes
        .filter((node) => allowedTypes.has(node.type))
        .filter((node) => {
          if (!term) {
            return true;
          }

          return node.label.toLowerCase().includes(term) || node.type.toLowerCase().includes(term);
        })
        .map((node) => node.id)
    );
  }, [nodes, searchTerm, visibleTypes]);

  const visibleEdges = useMemo(
    () => edges.filter((edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)),
    [edges, filteredNodeIds]
  );

  const onWheel = (event: WheelEvent<SVGSVGElement>): void => {
    event.preventDefault();
    setZoom((current) => {
      const next = event.deltaY < 0 ? current * 1.08 : current / 1.08;
      return Math.min(2.8, Math.max(0.45, next));
    });
  };

  const onMouseDown = (event: ReactMouseEvent<SVGSVGElement>): void => {
    setDragStart({ x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y });
  };

  const onMouseMove = (event: ReactMouseEvent<SVGSVGElement>): void => {
    if (!dragStart) {
      return;
    }

    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    setPan({ x: dragStart.panX + dx, y: dragStart.panY + dy });
  };

  const stopDrag = (): void => {
    setDragStart(null);
  };

  const firstSearchNode = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return null;
    }

    const allowedTypes = new Set(visibleTypes);
    return nodes.find((node) => allowedTypes.has(node.type) && node.label.toLowerCase().includes(term)) ?? null;
  }, [nodes, searchTerm, visibleTypes]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-xl text-white">{title}</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-400">Auto layout · Zoom · Pan · Neighbor highlighting</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(0.45, current / 1.1))}
            className="rounded-lg border border-white/20 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
            aria-label="Zoom out"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(2.8, current * 1.1))}
            className="rounded-lg border border-white/20 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
            aria-label="Zoom in"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-200 transition hover:bg-white/10"
          >
            <LocateFixed size={13} />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#08121f] p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1"><Move size={12} /> Drag to pan</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1"><Target size={12} /> Click node for details</span>
          {firstSearchNode ? (
            <button
              type="button"
              onClick={() => onSearchFocus(firstSearchNode.id)}
              className="inline-flex items-center gap-1 rounded-full border border-sky/30 bg-sky/15 px-2 py-1 text-sky-200"
            >
              <Search size={12} /> Focus search match
            </button>
          ) : null}
        </div>

        <div className="h-[520px] w-full overflow-hidden rounded-xl border border-white/10">
          <svg
            viewBox="0 0 1240 640"
            className="h-full w-full cursor-grab active:cursor-grabbing"
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              {visibleEdges.map((edge) => {
                const source = layout.get(edge.source);
                const target = layout.get(edge.target);
                if (!source || !target) {
                  return null;
                }

                const edgeHighlighted = !selectedNodeId || neighborSet.has(edge.source) || neighborSet.has(edge.target);

                return (
                  <g key={edge.id}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={edgeHighlighted ? "rgba(56,189,248,0.85)" : "rgba(100,116,139,0.35)"}
                      strokeWidth={1 + edge.strength * 2}
                      strokeDasharray="7 8"
                      opacity={edgeHighlighted ? 1 : 0.45}
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="15" dur="1.3s" repeatCount="indefinite" />
                    </line>
                  </g>
                );
              })}

              {nodes
                .filter((node) => filteredNodeIds.has(node.id))
                .map((node) => {
                  const point = layout.get(node.id);
                  if (!point) {
                    return null;
                  }

                  const isSelected = selectedNodeId === node.id;
                  const isNeighbor = selectedNodeId ? neighborSet.has(node.id) : true;
                  const opacity = isNeighbor ? 1 : 0.35;

                  return (
                    <g key={node.id} onClick={() => onSelectNode(node.id)} style={{ cursor: "pointer", opacity }}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isSelected ? 13 : 10}
                        fill={nodeTypeColor[node.type]}
                        stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.35)"}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                      />
                      <text
                        x={point.x + 14}
                        y={point.y + 4}
                        fill={isSelected ? "#ffffff" : "#cbd5e1"}
                        fontSize="11"
                        fontWeight={isSelected ? "700" : "500"}
                      >
                        {node.label.slice(0, 28)}
                      </text>
                    </g>
                  );
                })}
            </g>
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(nodeTypeColor).map(([key, color]) => (
            <span key={key} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {key}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">Visible nodes: {filteredNodeIds.size} · Visible links: {visibleEdges.length}</div>
    </section>
  );
}

export default function KnowledgeGraphCenterPage(): ReactElement {
  const [selectedGraph, setSelectedGraph] = useState<GraphKind>("network");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleTypes, setVisibleTypes] = useState<KnowledgeNodeType[]>(allNodeTypes);

  const query = useQuery<KnowledgeGraphSnapshot>({
    queryKey: ["knowledge-graph-center"],
    queryFn: getKnowledgeGraphSnapshot,
    refetchInterval: 15000
  });

  if (query.isLoading) {
    return <PageLoadingSkeleton label="Building knowledge graph topology..." />;
  }

  if (query.isError || !query.data) {
    return <PageErrorState message="Unable to load Knowledge Graph Center." />;
  }

  const snapshot = query.data;
  const network = snapshot.networkGraph;
  const relationship = snapshot.relationshipGraph;

  const activeGraph = selectedGraph === "network" ? network : relationship;
  if (activeGraph.nodes.length === 0) {
    return <PageEmptyState title="No graph nodes available" detail="The selected graph has no nodes to visualize." />;
  }

  const nodeById = new Map(activeGraph.nodes.map((node) => [node.id, node]));

  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) ?? null : null;

  const connectedNodes = selectedNode
    ? activeGraph.edges
        .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
        .map((edge) => (edge.source === selectedNode.id ? edge.target : edge.source))
        .map((id) => nodeById.get(id)?.label ?? id)
    : [];

  const onSearchFocus = (nodeId: string): void => {
    setSelectedNodeId(nodeId);
  };

  const toggleNodeType = (type: KnowledgeNodeType): void => {
    setVisibleTypes((current) => {
      if (current.includes(type)) {
        const next = current.filter((item) => item !== type);
        return next.length ? next : current;
      }

      return [...current, type];
    });
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#081525] via-[#102239] to-[#0d2f46] p-6 shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgba(0,163,255,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(0,208,180,0.18),transparent_38%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
              <Sparkles size={13} />
              Knowledge Graph Center
            </span>
            <h1 className="mt-4 font-display text-3xl text-white md:text-5xl">Interactive AI-RAN Relationship Explorer</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Explore topology and AI reasoning relationships across market, region, site, cell, alarms, incidents, recommendations, policies, and enterprise memory.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Auto Refresh</p>
            <p className="mt-1 font-display text-2xl text-white">15s</p>
            <p className="text-xs text-slate-400">Layout auto-generated on each refresh</p>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Network Nodes</p>
            <p className="mt-2 font-display text-3xl text-white">{network.nodes.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Network Links</p>
            <p className="mt-2 font-display text-3xl text-white">{network.edges.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">AI Relationship Nodes</p>
            <p className="mt-2 font-display text-3xl text-white">{relationship.nodes.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">AI Relationship Links</p>
            <p className="mt-2 font-display text-3xl text-white">{relationship.edges.length}</p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-4 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedGraph("network");
                setSelectedNodeId(null);
              }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                selectedGraph === "network" ? "bg-sky text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Section 1 · Network Topology
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedGraph("relationship");
                setSelectedNodeId(null);
              }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                selectedGraph === "relationship" ? "bg-sky text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Section 2 · AI Relationship Graph
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <Search size={14} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search nodes"
                className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </label>
            <button
              type="button"
              onClick={() => setVisibleTypes(allNodeTypes)}
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-200 transition hover:bg-white/10"
            >
              <Filter size={13} />
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {allNodeTypes.map((type) => {
            const enabled = visibleTypes.includes(type);

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleNodeType(type)}
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition ${
                  enabled ? "border-sky/40 bg-sky/15 text-sky-100" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: nodeTypeColor[type] }} />
                {type}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.6fr]">
        <GraphCanvas
          title={selectedGraph === "network" ? "Network Graph" : "AI Relationship Graph"}
          nodes={activeGraph.nodes}
          edges={activeGraph.edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          searchTerm={searchTerm}
          onSearchFocus={onSearchFocus}
          visibleTypes={visibleTypes}
        />

        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <BrainCircuit size={17} className="text-sky-200" />
            <h2 className="font-display text-xl text-white">Section 3 · Node Inspector</h2>
          </div>

          {!selectedNode ? (
            <p className="mt-4 text-sm text-slate-300">Select a node to inspect health, metadata, KPIs, alarms, connected nodes, historical incidents, AI recommendations, and business impact.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Node</p>
                <p className="mt-1 text-sm font-semibold text-white">{selectedNode.label}</p>
                <p className="mt-1 text-xs text-slate-400">{selectedNode.type}</p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Metadata</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {Object.entries(selectedNode.metadata).map(([key, value]) => (
                    <li key={key} className="rounded-lg bg-white/5 px-2.5 py-1.5">{key}: {value}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">KPIs</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {(selectedNode.kpis.length ? selectedNode.kpis : ["No KPI context for this node"]).map((item) => (
                    <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Active Alarms</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {(selectedNode.activeAlarms.length ? selectedNode.activeAlarms : ["No active alarms"]).map((item) => (
                    <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Health</p>
                <p className="mt-1 text-sm font-semibold text-white">{selectedNode.health}</p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Connected Nodes</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {(connectedNodes.length ? connectedNodes : ["No connected nodes"]).map((item) => (
                    <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Historical Incidents</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {(selectedNode.relatedIncidents.length ? selectedNode.relatedIncidents : ["No related incidents"]).map((item) => (
                    <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">AI Recommendations</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {(selectedNode.aiRecommendations.length ? selectedNode.aiRecommendations : ["No recommendation available"]).map((item) => (
                    <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Business Impact</p>
                <p className="mt-1 text-sm text-slate-100">{selectedNode.businessImpact}</p>
              </article>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <Sparkles size={17} className="text-aqua" />
          <h2 className="font-display text-xl text-white">Section 4 · AI Insights</h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Critical Paths</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {snapshot.insights.criticalPaths.map((path) => (
                <li key={path} className="rounded-lg bg-white/5 px-2.5 py-1.5">{path}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Root Cause Chain</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {(snapshot.insights.rootCauseChain.length ? snapshot.insights.rootCauseChain : ["No root cause chain available"]).map((path) => (
                <li key={path} className="rounded-lg bg-white/5 px-2.5 py-1.5">{path}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Failure Propagation</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {(snapshot.insights.failurePropagation.length ? snapshot.insights.failurePropagation : ["No failure propagation path available"]).map((path) => (
                <li key={path} className="rounded-lg bg-white/5 px-2.5 py-1.5">{path}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Recommended Path</p>
            <p className="mt-2 text-sm text-slate-200">{snapshot.insights.recommendedPath}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Business Impact</p>
            <p className="mt-2 text-sm text-slate-200">{snapshot.insights.businessImpact}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
