"""
Layer 4 — Cost-Based Model Selection

Picks specialist models that fit inside the remaining latency budget.
Database-planner-style cost estimation.
"""

from typing import List, Dict
from schemas.models import IntentType, QueryFeatures, ModelSpec

# ─── Model registry with estimated latencies (ms) ───

MODEL_CATALOG: Dict[str, Dict] = {
    "emotion_analyzer": {
        "latency_ms": 20,
        "description": "DistilRoBERTa-based emotion classification",
    },
    "entity_extractor": {
        "latency_ms": 30,
        "description": "GLiNER entity extraction",
    },
    "relationship_detector": {
        "latency_ms": 40,
        "description": "Rule + embedding relationship inference",
    },
    "memory_scorer": {
        "latency_ms": 15,
        "description": "Importance scoring heuristic",
    },
    "contradiction_detector": {
        "latency_ms": 70,
        "description": "Cross-memory conflict detection",
    },
    "identity_analyzer": {
        "latency_ms": 100,
        "description": "Longitudinal trend tracker",
    },
    "summarizer": {
        "latency_ms": 120,
        "description": "Qwen3-4B context compression",
    },
    "reasoning_model": {
        "latency_ms": 900,
        "description": "Qwen3-14B final answer generation",
    },
}

# ─── Which models to invoke per intent (ordered by priority) ───

INTENT_MODEL_MAP: Dict[IntentType, List[str]] = {
    IntentType.FACTUAL: [
        "entity_extractor",
        "memory_scorer",
        "reasoning_model",
    ],
    IntentType.REFLECTION: [
        "identity_analyzer",
        "summarizer",
        "reasoning_model",
    ],
    IntentType.EMOTIONAL: [
        "emotion_analyzer",
        "identity_analyzer",
        "reasoning_model",
    ],
    IntentType.RELATIONSHIP: [
        "entity_extractor",
        "relationship_detector",
        "reasoning_model",
    ],
    IntentType.GOAL: [
        "entity_extractor",
        "memory_scorer",
        "reasoning_model",
    ],
    IntentType.SUMMARY: [
        "summarizer",
        "reasoning_model",
    ],
}

# ─── Extra models triggered by features ───

FEATURE_MODEL_MAP: Dict[str, str] = {
    "emotion_words":    "emotion_analyzer",
    "is_comparison":    "contradiction_detector",
    "mentions_event":   "memory_scorer",
}


class CostPlanner:
    """Select models that fit within the remaining latency budget."""

    # Fixed overheads (ms)
    RETRIEVAL_OVERHEAD = 150
    GRAPH_EXPANSION_OVERHEAD = 80
    RESPONSE_BUILD_OVERHEAD = 100

    def select_models(
        self,
        intent: IntentType,
        features: QueryFeatures,
        latency_budget_ms: int,
    ) -> List[ModelSpec]:
        # Subtract fixed costs
        remaining = latency_budget_ms - (
            self.RETRIEVAL_OVERHEAD
            + self.GRAPH_EXPANSION_OVERHEAD
            + self.RESPONSE_BUILD_OVERHEAD
        )

        # Gather candidate models
        candidates = list(INTENT_MODEL_MAP.get(intent, ["reasoning_model"]))

        # Add feature-triggered models
        feature_dict = features.model_dump()
        for feat_name, model_name in FEATURE_MODEL_MAP.items():
            if feature_dict.get(feat_name, False) and model_name not in candidates:
                candidates.insert(-1, model_name)  # Before reasoning model

        # Greedily select models that fit the budget
        selected: List[ModelSpec] = []
        used_budget = 0

        for model_name in candidates:
            info = MODEL_CATALOG.get(model_name)
            if not info:
                continue

            cost = info["latency_ms"]
            if used_budget + cost <= remaining:
                selected.append(
                    ModelSpec(
                        name=model_name,
                        estimated_latency_ms=cost,
                        priority=len(selected) + 1,
                        reason=info["description"],
                    )
                )
                used_budget += cost

        # Reasoning model is non-negotiable — if dropped, warn
        if not any(m.name == "reasoning_model" for m in selected):
            rm = MODEL_CATALOG["reasoning_model"]
            selected.append(
                ModelSpec(
                    name="reasoning_model",
                    estimated_latency_ms=rm["latency_ms"],
                    priority=len(selected) + 1,
                    reason="Required — final answer generation (budget exceeded)",
                )
            )

        return selected
