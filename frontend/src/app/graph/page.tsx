"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { api, GraphData } from "@/lib/api";
import { motion } from "framer-motion";
import { RefreshCw, X, Network } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function GraphPage() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<Record<string, unknown> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    loadGraph();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [graph]);

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

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "Goal": return "#fbbf24";
      case "Project": return "#a78bfa";
      case "Skill": return "#22d3ee";
      case "Emotion": return "#f87171";
      case "Person": return "#34d399";
      default: return "#6b6b7e";
    }
  };

  return (
    <div className="h-full flex flex-col relative" style={{ background: "var(--bg-chat)" }}>
      <div className="absolute inset-x-0 top-0 h-[250px] warm-glow z-0" />

      {/* Header */}
      <header className="relative z-10 px-8 py-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-warm)]/15 flex items-center justify-center">
              <Network className="w-4 h-4 text-[var(--accent-warm)]" />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Memory Graph</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] ml-11">
            Interactive entity-relationship explorer
          </p>
        </div>
        <button
          onClick={loadGraph}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
          style={{ background: "rgba(18,18,26,0.5)", border: "1px solid var(--border-subtle)" }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Graph Canvas */}
        <div className="flex-1 relative" ref={containerRef}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex items-center gap-3 text-[var(--text-secondary)] text-sm">
                <div className="w-5 h-5 border-2 border-[var(--accent-warm)]/30 border-t-[var(--accent-warm)] rounded-full animate-spin" />
                Loading graph...
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center justify-center">
                  <Network className="w-7 h-7 text-[var(--danger)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{error}</p>
              </div>
            </div>
          )}

          {graph && !loading && graph.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-sm"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--accent-warm)]/10 border border-[var(--border-subtle)] flex items-center justify-center">
                  <Network className="w-7 h-7 text-[var(--accent-warm)]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Empty Graph</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Start chatting to populate the memory graph with entities and relationships.
                </p>
              </motion.div>
            </div>
          )}

          {graph && !loading && graph.nodes.length > 0 && dimensions.width > 0 && (
            <>
              <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={{ nodes: graph.nodes, links: graph.edges }}
                nodeLabel="name"
                nodeColor={(node: any) => getNodeColor(node.type)}
                nodeRelSize={6}
                linkColor={() => "rgba(255,255,255,0.12)"}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkWidth={1.5}
                onNodeClick={handleNodeClick}
                backgroundColor="#111117"
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const label = node.name as string;
                  const fontSize = 12 / globalScale;
                  ctx.font = `500 ${fontSize}px Inter, sans-serif`;
                  const textWidth = ctx.measureText(label).width;
                  const padding = fontSize * 0.4;

                  if (node.x && node.y) {
                    // Node circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y - fontSize * 0.6, 3, 0, 2 * Math.PI);
                    ctx.fillStyle = getNodeColor(node.type);
                    ctx.fill();

                    // Label
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillText(label, node.x, node.y + padding);
                  }
                }}
                nodePointerAreaPaint={(node: any, color, ctx) => {
                  ctx.fillStyle = color;
                  if (node.x && node.y) {
                    ctx.fillRect(node.x - 20, node.y - 10, 40, 20);
                  }
                }}
              />

              {/* Stats Overlay */}
              <div className="absolute top-4 left-4 flex gap-3 z-10">
                {[
                  { label: "Entities", value: graph.stats.total_nodes ?? graph.nodes.length },
                  { label: "Relations", value: graph.stats.total_edges ?? graph.edges.length },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-4 py-3 text-center backdrop-blur-xl"
                    style={{ background: "rgba(18,18,26,0.7)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="text-xl font-bold text-[var(--accent-warm)]">{s.value}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Node Inspector */}
        {selectedNode && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            className="w-[320px] border-l border-[var(--border-subtle)] p-6 overflow-y-auto"
            style={{ background: "rgba(14,14,20,0.9)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-sm text-white">Node Inspector</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(selectedNode)
                .filter(([key]) => !["x", "y", "vx", "vy", "index", "__bckgDimensions"].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">{key}</span>
                    <p className="text-[13px] font-mono text-[var(--text-primary)] mt-1 break-all">
                      {String(value)}
                    </p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
