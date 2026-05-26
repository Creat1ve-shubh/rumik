"use client";

import { useEffect, useState } from "react";
import { api, GraphData } from "@/lib/api";

export default function GraphPage() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getGraph();
      setGraph(data);
      setError("");
    } catch {
      setError("Backend not reachable. Start the FastAPI server and Neo4j.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--cmp-border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Memory Graph</h2>
          <p className="text-xs text-[var(--cmp-text-muted)]">
            Interactive entity-relationship explorer
          </p>
        </div>
        <button
          onClick={loadGraph}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--cmp-border)] text-[var(--cmp-text-muted)] hover:text-[var(--cmp-text)] hover:border-[var(--cmp-accent)] transition-colors"
        >
          Refresh
        </button>
      </header>

      <div className="flex-1 flex">
        {/* Graph canvas area */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[var(--cmp-text-muted)] text-sm">Loading graph...</div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="text-4xl mb-3">🔗</div>
                <p className="text-sm text-[var(--cmp-text-muted)]">{error}</p>
              </div>
            </div>
          )}

          {graph && !loading && (
            <div className="p-6 h-full overflow-y-auto">
              {graph.nodes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">🕸️</div>
                    <h3 className="text-lg font-semibold mb-2">Empty Graph</h3>
                    <p className="text-sm text-[var(--cmp-text-muted)]">
                      Start chatting to populate the memory graph with entities and relationships.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stats bar */}
                  <div className="flex gap-4">
                    <div className="glass rounded-xl px-4 py-3 flex-1 text-center">
                      <div className="text-2xl font-bold gradient-text">{graph.stats.total_nodes ?? graph.nodes.length}</div>
                      <div className="text-[10px] text-[var(--cmp-text-muted)] mt-1">Entities</div>
                    </div>
                    <div className="glass rounded-xl px-4 py-3 flex-1 text-center">
                      <div className="text-2xl font-bold gradient-text">{graph.stats.total_edges ?? graph.edges.length}</div>
                      <div className="text-[10px] text-[var(--cmp-text-muted)] mt-1">Relationships</div>
                    </div>
                  </div>

                  {/* Node list (Phase 1 — replaced by canvas visualization in Phase 2) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {graph.nodes.map((node, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedNode(node)}
                        className="glass rounded-xl p-4 text-left hover:border-[var(--cmp-accent)] transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-[var(--cmp-accent)] transition-colors">
                            {String(node.name || "Unknown")}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--cmp-surface-2)] text-[var(--cmp-text-muted)]">
                            {String(node.type || "entity")}
                          </span>
                        </div>
                        {node.importance && (
                          <div className="mt-2 h-1 rounded-full bg-[var(--cmp-surface-2)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--cmp-accent)]"
                              style={{ width: `${Number(node.importance) * 100}%` }}
                            />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Node inspector */}
        {selectedNode && (
          <div className="w-[320px] border-l border-[var(--cmp-border)] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Node Inspector</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[var(--cmp-text-muted)] hover:text-[var(--cmp-text)] text-lg"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {Object.entries(selectedNode).map(([key, value]) => (
                <div key={key}>
                  <span className="text-[var(--cmp-text-muted)]">{key}</span>
                  <p className="font-mono mt-0.5 break-all">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
