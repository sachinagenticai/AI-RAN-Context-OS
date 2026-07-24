import { useQuery } from "@tanstack/react-query";
import {
  BookMarked,
  BrainCircuit,
  Clock3,
  Database,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp
} from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { EmptyListNotice, PageErrorState, PageLoadingSkeleton } from "../components/PageStates";
import { getEnterpriseMemoryCenterSnapshot } from "../lib/api";
import type { EnterpriseMemoryCenterSnapshot, EnterpriseMemorySearchRecord } from "../types/domain";

const percent = (value: number): string => `${Math.round(value * 100)}%`;

const signedPercent = (value: number): string => {
  const pct = Math.round(value * 100);
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
};

const dateTime = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(new Date(value));

export default function EnterpriseMemoryCenterPage(): ReactElement {
  const [queryText, setQueryText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "confidence">("newest");

  const query = useQuery<EnterpriseMemoryCenterSnapshot>({
    queryKey: ["enterprise-memory-center"],
    queryFn: getEnterpriseMemoryCenterSnapshot,
    refetchInterval: 15000
  });

  const snapshot = query.data;

  const categories = useMemo(() => {
    if (!snapshot) {
      return ["All"];
    }

    const unique = new Set(snapshot.semanticIndex.map((item) => item.category));
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [snapshot]);

  const semanticResults = useMemo(() => {
    if (!snapshot) {
      return [] as EnterpriseMemorySearchRecord[];
    }

    const text = queryText.trim().toLowerCase();

    const filtered = snapshot.semanticIndex.filter((item) => {
      if (categoryFilter !== "All" && item.category !== categoryFilter) {
        return false;
      }

      if (!text) {
        return true;
      }

      return (
        item.summary.toLowerCase().includes(text) ||
        item.incident.toLowerCase().includes(text) ||
        item.category.toLowerCase().includes(text)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "confidence") {
        return b.confidence - a.confidence;
      }

      const left = new Date(a.timestamp).getTime();
      const right = new Date(b.timestamp).getTime();
      return sortBy === "oldest" ? left - right : right - left;
    });

    return sorted;
  }, [snapshot, queryText, categoryFilter, sortBy]);

  if (query.isLoading) {
    return <PageLoadingSkeleton label="Loading Enterprise Memory Center..." />;
  }

  if (query.isError || !snapshot) {
    return <PageErrorState message="Unable to load Enterprise Memory Center." />;
  }

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#081525] via-[#102239] to-[#0d2f46] p-6 shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(10,170,255,0.22),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(0,208,180,0.16),transparent_35%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
              <Sparkles size={13} />
              Enterprise Memory Center
            </span>
            <h1 className="mt-4 font-display text-3xl text-white md:text-5xl">Learning Intelligence Across Investigations</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Track how the platform retains previous investigations, reuses successful actions, and improves decision quality through persistent enterprise memory.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Last Refresh</p>
            <p className="mt-1 font-display text-2xl text-white">{dateTime(snapshot.updatedAt)}</p>
            <p className="text-xs text-slate-400">Auto refresh every 15s</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <Database size={17} className="text-sky-200" />
          <h2 className="font-display text-xl text-white">1. Memory Dashboard</h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Total Memories</p>
            <p className="mt-2 font-display text-3xl text-white">{snapshot.dashboard.totalMemories}</p>
            <p className="mt-2 text-xs text-slate-400">Retained enterprise investigation records</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Successful Resolutions</p>
            <p className="mt-2 font-display text-3xl text-white">{snapshot.dashboard.successfulResolutions}</p>
            <p className="mt-2 text-xs text-slate-400">Investigations with successful closure signals</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Reused Knowledge</p>
            <p className="mt-2 font-display text-3xl text-white">{snapshot.dashboard.reusedKnowledge}</p>
            <p className="mt-2 text-xs text-slate-400">Cases reusing prior memory and precedent</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Learning Score</p>
            <p className="mt-2 font-display text-3xl text-white">{snapshot.dashboard.learningScore}</p>
            <p className="mt-2 text-xs text-slate-400">Composite retention and reuse score</p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <BookMarked size={17} className="text-aqua" />
          <h2 className="font-display text-xl text-white">2. Similar Incidents</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-400">
                <th className="px-3 py-2">Incident</th>
                <th className="px-3 py-2">Similarity</th>
                <th className="px-3 py-2">Resolution</th>
                <th className="px-3 py-2">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.similarIncidents.length === 0 ? (
                <tr className="border-t border-white/10 text-slate-300">
                  <td className="px-3 py-3" colSpan={4}>No similar incidents available.</td>
                </tr>
              ) : null}
              {snapshot.similarIncidents.map((row) => (
                <tr key={row.incident} className="border-t border-white/10 text-slate-200">
                  <td className="px-3 py-3 font-semibold text-white">{row.incident}</td>
                  <td className="px-3 py-3">{percent(row.similarity)}</td>
                  <td className="px-3 py-3 text-slate-300">{row.resolution}</td>
                  <td className="px-3 py-3">{percent(row.successRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <BrainCircuit size={17} className="text-sky-200" />
          <h2 className="font-display text-xl text-white">3. Learned Patterns</h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Recurring Failures</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {snapshot.learnedPatterns.recurringFailures.length === 0 ? <li className="rounded-lg bg-white/5 px-2.5 py-1.5 text-slate-300">No recurring failures identified.</li> : null}
              {snapshot.learnedPatterns.recurringFailures.map((item) => (
                <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Common Root Causes</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {snapshot.learnedPatterns.commonRootCauses.length === 0 ? <li className="rounded-lg bg-white/5 px-2.5 py-1.5 text-slate-300">No root cause trend available.</li> : null}
              {snapshot.learnedPatterns.commonRootCauses.map((item) => (
                <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Frequent Recommendations</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {snapshot.learnedPatterns.frequentRecommendations.length === 0 ? <li className="rounded-lg bg-white/5 px-2.5 py-1.5 text-slate-300">No recommendation trend identified.</li> : null}
              {snapshot.learnedPatterns.frequentRecommendations.map((item) => (
                <li key={item} className="rounded-lg bg-white/5 px-2.5 py-1.5">{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Clock3 size={17} className="text-aqua" />
            <h2 className="font-display text-xl text-white">4. Knowledge Timeline</h2>
          </div>

          <div className="mt-4 space-y-3">
            {snapshot.timeline.length === 0 ? <EmptyListNotice>No timeline entries available.</EmptyListNotice> : null}
            {snapshot.timeline.map((event) => (
              <article key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <span className="text-xs uppercase tracking-[0.08em] text-slate-400">{dateTime(event.timestamp)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{event.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.08em] text-aqua">{event.kind}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Search size={17} className="text-sky-200" />
            <h2 className="font-display text-xl text-white">5. Semantic Search</h2>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <Search size={14} />
              <input
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="Search memories"
                className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <Filter size={14} />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="bg-transparent text-sm text-white outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-[#0b1523] text-white">
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <RefreshCw size={14} />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "newest" | "oldest" | "confidence")}
                className="bg-transparent text-sm text-white outline-none"
              >
                <option value="newest" className="bg-[#0b1523] text-white">
                  Newest
                </option>
                <option value="oldest" className="bg-[#0b1523] text-white">
                  Oldest
                </option>
                <option value="confidence" className="bg-[#0b1523] text-white">
                  Confidence
                </option>
              </select>
            </label>
          </div>

          <div className="mt-4 max-h-[560px] space-y-2 overflow-auto pr-1">
            {semanticResults.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">No memory entries match the current semantic search criteria.</p>
            ) : (
              semanticResults.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{item.incident}</p>
                    <span className="text-xs text-slate-400">{dateTime(item.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.08em] text-aqua">{item.category}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                  <p className="mt-2 text-xs text-slate-400">Confidence: {percent(item.confidence)}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-[#0b1523]/95 p-5 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <TrendingUp size={17} className="text-aqua" />
          <h2 className="font-display text-xl text-white">6. AI Learning Metrics</h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Reuse Rate</p>
            <p className="mt-2 font-display text-3xl text-white">{percent(snapshot.learningMetrics.reuseRate)}</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sky to-aqua" style={{ width: percent(snapshot.learningMetrics.reuseRate) }} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Memory Growth</p>
            <p className="mt-2 font-display text-3xl text-white">{signedPercent(snapshot.learningMetrics.memoryGrowth)}</p>
            <p className="mt-2 text-xs text-slate-400">Growth between prior and recent memory windows</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Confidence Trend</p>
            <p className="mt-2 font-display text-3xl text-white">{percent(snapshot.learningMetrics.confidenceTrend)}</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-aqua to-sky" style={{ width: percent(snapshot.learningMetrics.confidenceTrend) }} />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
