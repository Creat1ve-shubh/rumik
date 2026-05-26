"""
Layer 3 — Retrieval Planning

Rule-based domain selection: intent + features → memory domains + depth.
No LLM. Sub-millisecond.
"""

from typing import List, Dict
from schemas.models import IntentType, QueryFeatures, MemoryPlan

# ─── Base domains per intent ───

INTENT_DOMAIN_MAP: Dict[IntentType, List[str]] = {
    IntentType.FACTUAL:      ["entities", "relationships"],
    IntentType.REFLECTION:   ["goals", "projects", "beliefs", "emotion_history", "events"],
    IntentType.EMOTIONAL:    ["emotions", "events", "relationships", "beliefs"],
    IntentType.RELATIONSHIP: ["relationships", "people", "projects"],
    IntentType.GOAL:         ["goals", "projects", "skills", "events"],
    IntentType.SUMMARY:      ["events", "projects", "goals", "emotions"],
}

# ─── Extra domains triggered by features ───

FEATURE_DOMAIN_MAP: Dict[str, List[str]] = {
    "mentions_person":  ["people", "relationships"],
    "mentions_goal":    ["goals"],
    "mentions_project": ["projects"],
    "mentions_skill":   ["skills"],
    "mentions_event":   ["events"],
    "time_reference":   ["events", "emotion_history"],
    "emotion_words":    ["emotions", "emotion_history"],
    "is_comparison":    ["beliefs", "identity_history"],
}

# ─── Graph traversal depth per intent ───

INTENT_DEPTH_MAP: Dict[IntentType, int] = {
    IntentType.FACTUAL:      1,
    IntentType.REFLECTION:   3,
    IntentType.EMOTIONAL:    2,
    IntentType.RELATIONSHIP: 2,
    IntentType.GOAL:         2,
    IntentType.SUMMARY:      2,
}

# ─── Max nodes per intent ───

INTENT_MAX_NODES: Dict[IntentType, int] = {
    IntentType.FACTUAL:      30,
    IntentType.REFLECTION:   80,
    IntentType.EMOTIONAL:    50,
    IntentType.RELATIONSHIP: 60,
    IntentType.GOAL:         50,
    IntentType.SUMMARY:      100,
}


class RetrievalPlanner:
    """Convert intent + features into a concrete MemoryPlan."""

    def plan(self, intent: IntentType, features: QueryFeatures) -> MemoryPlan:
        # Start with base domains for this intent
        domains = set(INTENT_DOMAIN_MAP.get(intent, ["entities"]))

        # Augment with feature-triggered domains
        feature_dict = features.model_dump()
        for feature_name, extra_domains in FEATURE_DOMAIN_MAP.items():
            if feature_dict.get(feature_name, False):
                domains.update(extra_domains)

        depth = INTENT_DEPTH_MAP.get(intent, 2)
        max_nodes = INTENT_MAX_NODES.get(intent, 50)

        # If query mentions a specific person, narrow the graph search
        if features.mentions_person and not features.is_comparison:
            depth = min(depth, 2)  # Don't explode when person is the anchor

        return MemoryPlan(
            domains=sorted(domains),
            depth=depth,
            max_nodes=max_nodes,
            strategy="hybrid",  # vector search + graph expansion
        )
