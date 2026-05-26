"""
Layer 1 — Fast Intent Classification

Uses embedding cosine-similarity against prototype queries.
No LLM. Runs in ~1-5ms once prototypes are pre-computed.
"""

import numpy as np
from typing import Tuple, Dict, List
from schemas.models import IntentType

# ─── Prototype queries per intent (centroids computed at init) ───

INTENT_PROTOTYPES: Dict[IntentType, List[str]] = {
    IntentType.FACTUAL: [
        "Who is this person?",
        "What project am I working on?",
        "When did I start this?",
        "Tell me about this skill.",
        "What do I know about this topic?",
        "List my connections.",
        "What is this thing?",
        "Give me details about this.",
    ],
    IntentType.REFLECTION: [
        "Why am I stuck?",
        "How has my journey evolved?",
        "What patterns do I see in my life?",
        "Am I making progress?",
        "What have I learned from my failures?",
        "How have my goals changed over time?",
        "What does my trajectory look like?",
        "Am I growing as a person?",
    ],
    IntentType.EMOTIONAL: [
        "How do I feel lately?",
        "Why am I anxious?",
        "I'm feeling overwhelmed.",
        "What makes me happy?",
        "Why am I losing motivation?",
        "I feel frustrated with my progress.",
        "I'm excited about this.",
        "I feel burned out.",
    ],
    IntentType.RELATIONSHIP: [
        "How do I know this person?",
        "Who are my closest connections?",
        "What's my relationship with this team?",
        "Who influences me the most?",
        "Who have I worked with?",
        "Tell me about my friends.",
        "Who mentors me?",
    ],
    IntentType.GOAL: [
        "What are my goals?",
        "Am I on track for my targets?",
        "What should I focus on next?",
        "How do I achieve this objective?",
        "What's blocking my goals?",
        "What do I want to accomplish?",
        "What's my priority right now?",
    ],
    IntentType.SUMMARY: [
        "Summarize my week.",
        "Give me an overview of my projects.",
        "What's happened recently?",
        "Recap my progress.",
        "What are the highlights?",
        "Give me a status update.",
        "Brief me on everything.",
    ],
}


class IntentClassifier:
    """Classifies user query intent via cosine similarity to prototype embeddings."""

    def __init__(self):
        self._prototype_embeddings: Dict[IntentType, np.ndarray] = {}
        self._initialized = False

    async def initialize(self, embedder) -> None:
        """Pre-compute centroid embeddings for each intent type."""
        for intent_type, queries in INTENT_PROTOTYPES.items():
            embeddings = embedder.encode(queries)
            self._prototype_embeddings[intent_type] = np.mean(embeddings, axis=0)
        self._initialized = True

    def classify(self, query_embedding: np.ndarray) -> Tuple[IntentType, float]:
        """
        Return (intent, confidence).
        Confidence is the normalized gap between best and second-best match,
        making low-confidence cases (ambiguity) detectable for LLM escalation.
        """
        if not self._initialized:
            return IntentType.FACTUAL, 0.5

        scores = {}
        for intent_type, centroid in self._prototype_embeddings.items():
            scores[intent_type] = float(self._cosine_sim(query_embedding, centroid))

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        best_intent, best_score = ranked[0]
        second_score = ranked[1][1] if len(ranked) > 1 else 0.0

        # Confidence = how much the winner beats the runner-up
        gap = best_score - second_score
        confidence = min(1.0, max(0.0, gap * 5.0 + 0.5))  # Scale gap to 0-1

        return best_intent, round(confidence, 3)

    @staticmethod
    def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
        na, nb = np.linalg.norm(a), np.linalg.norm(b)
        if na == 0 or nb == 0:
            return 0.0
        return float(np.dot(a, b) / (na * nb))
