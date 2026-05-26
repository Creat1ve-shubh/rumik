"""
Cognitive Planner — orchestrates the 4-layer planning pipeline.

    Query → L1 Intent → L2 Features → L3 Retrieval Plan → L4 Model Selection → PlannerOutput

No mandatory LLM call. Escalates to a tiny LLM only on low-confidence intents.
"""

import time
import numpy as np
from typing import Optional

from schemas.models import PlannerOutput, IntentType
from config import settings

from .intent_classifier import IntentClassifier
from .feature_extractor import FeatureExtractor
from .retrieval_planner import RetrievalPlanner
from .cost_planner import CostPlanner


class CognitivePlanner:
    """The brain of CMP. Converts a raw query into a full execution plan."""

    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.feature_extractor = FeatureExtractor()
        self.retrieval_planner = RetrievalPlanner()
        self.cost_planner = CostPlanner()
        self._embedder = None

    async def initialize(self, embedder) -> None:
        """Called once at startup — pre-computes prototype embeddings."""
        self._embedder = embedder
        await self.intent_classifier.initialize(embedder)

    async def plan(
        self,
        query: str,
        latency_budget_ms: Optional[int] = None,
    ) -> PlannerOutput:
        """
        Full 4-layer planning pipeline.
        Returns a PlannerOutput with intent, features, memory plan, and selected models.
        """
        budget = latency_budget_ms or settings.DEFAULT_LATENCY_BUDGET_MS
        t0 = time.perf_counter()

        # ── L1: Intent Classification (1-5ms) ──
        query_embedding = self._embedder.encode(query)
        intent, confidence = self.intent_classifier.classify(query_embedding)

        escalated = False
        if confidence < settings.PLANNER_CONFIDENCE_THRESHOLD:
            # In production: escalate to SmolLM2/Qwen3-0.6B for disambiguation.
            # For now, use the best-guess intent but flag it.
            escalated = True

        # ── L2: Feature Extraction (<1ms) ──
        features = self.feature_extractor.extract(query)

        # ── L3: Retrieval Planning (<1ms) ──
        memory_plan = self.retrieval_planner.plan(intent, features)

        # ── L4: Cost-Based Model Selection (<1ms) ──
        selected_models = self.cost_planner.select_models(intent, features, budget)

        total_estimated = sum(m.estimated_latency_ms for m in selected_models)
        elapsed_ms = (time.perf_counter() - t0) * 1000

        # ── Build explanation ──
        explanation_parts = [
            f"Intent: {intent.value} (confidence: {confidence})",
            f"Domains: {', '.join(memory_plan.domains)}",
            f"Models: {', '.join(m.name for m in selected_models)}",
            f"Est. latency: {total_estimated}ms / {budget}ms budget",
            f"Planner time: {elapsed_ms:.1f}ms",
        ]
        if escalated:
            explanation_parts.append("⚠ Low confidence — flagged for LLM escalation")

        return PlannerOutput(
            intent=intent,
            intent_confidence=confidence,
            features=features,
            memory_plan=memory_plan,
            selected_models=selected_models,
            total_estimated_latency_ms=total_estimated,
            latency_budget_ms=budget,
            escalated_to_llm=escalated,
            explanation=" | ".join(explanation_parts),
        )
