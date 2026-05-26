"""
Explainability Engine

Every response must explain:
- Which memories were used and why
- Which models were invoked and why
- How the planner reached its decisions
"""

from typing import Dict, Any, List
from schemas.models import PlannerOutput


class ExplainabilityEngine:
    """Generates human-readable + structured explanations for CMP decisions."""

    def explain(
        self,
        planner_output: PlannerOutput,
        retrieved_memories: List[Dict[str, Any]],
        models_invoked: List[str],
    ) -> Dict[str, Any]:
        return {
            "planner_decision": {
                "intent": planner_output.intent.value,
                "intent_confidence": planner_output.intent_confidence,
                "escalated_to_llm": planner_output.escalated_to_llm,
                "domains_searched": planner_output.memory_plan.domains,
                "graph_depth": planner_output.memory_plan.depth,
            },
            "memory_retrieval": {
                "total_retrieved": len(retrieved_memories),
                "memories": [
                    {
                        "content_preview": m.get("content", "")[:80],
                        "final_score": m.get("final_score", 0),
                        "reason": self._memory_reason(m),
                    }
                    for m in retrieved_memories[:5]  # Top 5 for readability
                ],
            },
            "model_routing": {
                "models_invoked": models_invoked,
                "reasons": [
                    {
                        "model": ms.name,
                        "reason": ms.reason,
                        "estimated_latency_ms": ms.estimated_latency_ms,
                    }
                    for ms in planner_output.selected_models
                ],
                "total_estimated_ms": planner_output.total_estimated_latency_ms,
                "budget_ms": planner_output.latency_budget_ms,
            },
        }

    @staticmethod
    def _memory_reason(memory: Dict[str, Any]) -> str:
        parts = []
        if memory.get("semantic_score", 0) > 0.7:
            parts.append("high semantic relevance")
        if memory.get("importance", 0) > 0.7:
            parts.append("high importance")
        if memory.get("recency", 0) > 0.7:
            parts.append("recent memory")
        if memory.get("emotion") and memory["emotion"] != "neutral":
            parts.append(f"emotional context ({memory['emotion']})")
        return ", ".join(parts) if parts else "general relevance"
