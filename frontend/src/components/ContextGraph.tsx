import type { GraphEdge, GraphNode } from "../types/domain";

interface ContextGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const colorMap: Record<GraphNode["group"], string> = {
  radio: "#00A3FF",
  transport: "#FF6A3D",
  core: "#00D0B4",
  policy: "#10253A"
};

export default function ContextGraph({ nodes, edges }: ContextGraphProps) {
  const findNode = (id: string): GraphNode | undefined => nodes.find((node) => node.id === id);

  return (
    <section className="rounded-2xl border border-white/65 bg-white/85 p-5 shadow-panel">
      <h2 className="font-display text-lg text-ink">Context Graph</h2>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox="0 0 460 240" className="h-[240px] min-w-[460px] w-full rounded-xl bg-panel">
          {edges.map((edge) => {
            const from = findNode(edge.from);
            const to = findNode(edge.to);

            if (!from || !to) {
              return null;
            }

            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#5A6C82"
                strokeOpacity={0.35 + edge.weight / 2}
                strokeWidth={1.5 + edge.weight * 2}
              />
            );
          })}

          {nodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={18} fill={colorMap[node.group]} fillOpacity={0.9} />
              <text
                x={node.x}
                y={node.y + 32}
                textAnchor="middle"
                fill="#23384F"
                fontSize="11"
                fontWeight="600"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
