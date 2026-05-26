"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { api, GraphData } from "@/lib/api";

// Dynamically import react-force-graph-2d to avoid SSR issues
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
  }, [graph]); // Re-calculate when graph loads

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
      case "Goal": return "#fbbf24"; // warning
      case "Project": return "#7c5cfc"; // accent
      case "Skill": return "#22d3ee"; // cyan
      case "Emotion": return "#f87171"; // danger
      case "Person": return "#34d399"; // success
      default: return "#8888a4"; // muted
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--cmp-border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Memory Graph</h2>
          <p className="text-xs text-[var(--cmp-text-muted)]">
            Interactive entity-relationship explorer (Phase 2 Force-Directed Graph)
          </p>
        </div>
        <button
          onClick={loadGraph}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--cmp-border)] text-[var(--cmp-text-muted)] hover:text-[var(--cmp-text)] hover:border-[var(--cmp-accent)] transition-colors"
        >
          Refresh
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Graph canvas area */}
        <div className="flex-1 relative" ref={containerRef}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-[var(--cmp-text-muted)] text-sm">Loading graph...</div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center max-w-sm">
                <div className="text-4xl mb-3">🔗</div>
                <p className="text-sm text-[var(--cmp-text-muted)]">{error}</p>
              </div>
            </div>
          )}

          {graph && !loading && graph.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">🕸️</div>
                <h3 className="text-lg font-semibold mb-2">Empty Graph</h3>
                <p className="text-sm text-[var(--cmp-text-muted)]">
                  Start chatting to populate the memory graph with entities and relationships.
                </p>
              </div>
            </div>
          )}

          {graph && !loading && graph.nodes.length > 0 && dimensions.width > 0 && (
            <>
              {/* Force Graph */}
              <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={{ nodes: graph.nodes, links: graph.edges }}
                nodeLabel="name"
                nodeColor={(node: any) => getNodeColor(node.type)}
                nodeRelSize={6}
                linkColor={() => "rgba(255,255,255,0.2)"}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkWidth={1.5}
                onNodeClick={handleNodeClick}
                backgroundColor="#0a0a0f"
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const label = node.name as string;
                  const fontSize = 12/globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                  if (node.x && node.y) {
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                    
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = getNodeColor(node.type);
                    ctx.fillText(label, node.x, node.y);
                    
                    node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
                  }
                }}
                nodePointerAreaPaint={(node: any, color, ctx) => {
                  ctx.fillStyle = color;
                  const bckgDimensions = node.__bckgDimensions;
                  if (node.x && node.y && bckgDimensions) {
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                  }
                }}
              />
              
              {/* Stats overlay */}
              <div className="absolute top-4 left-4 flex gap-4 pointer-events-none z-10">
                <div className="glass rounded-xl px-4 py-3 text-center pointer-events-auto">
                  <div className="text-2xl font-bold gradient-text">{graph.stats.total_nodes ?? graph.nodes.length}</div>
                  <div className="text-[10px] text-[var(--cmp-text-muted)] mt-1">Entities</div>
                </div>
                <div className="glass rounded-xl px-4 py-3 text-center pointer-events-auto">
                  <div className="text-2xl font-bold gradient-text">{graph.stats.total_edges ?? graph.edges.length}</div>
                  <div className="text-[10px] text-[var(--cmp-text-muted)] mt-1">Relationships</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Node inspector */}
        {selectedNode && (
          <div className="w-[320px] border-l border-[var(--cmp-border)] p-4 overflow-y-auto bg-[var(--cmp-surface)]">
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
              {Object.entries(selectedNode).filter(([key]) => !["x", "y", "vx", "vy", "index"].includes(key)).map(([key, value]) => (
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
