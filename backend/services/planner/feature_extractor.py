"""
Layer 2 — Query Feature Extraction

Regex + keyword matching. No LLM needed. Sub-millisecond.
"""

import re
from schemas.models import QueryFeatures

# ─── Keyword dictionaries ───

EMOTION_WORDS = {
    "happy", "sad", "angry", "frustrated", "anxious", "excited", "worried",
    "overwhelmed", "motivated", "demotivated", "stuck", "lost", "confident",
    "afraid", "scared", "hopeful", "depressed", "lonely", "stressed",
    "passionate", "bored", "curious", "grateful", "jealous", "proud",
    "feel", "feeling", "emotion", "mood", "burned", "burnout",
}

TIME_WORDS = {
    "yesterday", "today", "tomorrow", "recently", "ago", "since", "when",
    "before", "after", "during", "always", "never", "lately", "currently",
    "now", "then", "previously", "earlier",
}

GOAL_WORDS = {
    "goal", "target", "objective", "aim", "want", "wish", "plan",
    "achieve", "accomplish", "reach", "aspire", "dream", "ambition",
    "milestone", "deadline", "focus", "priority",
}

PROJECT_WORDS = {
    "project", "app", "application", "website", "tool", "platform",
    "startup", "company", "product", "build", "building", "develop",
    "developing", "create", "creating",
}

SKILL_WORDS = {
    "skill", "learn", "learned", "learning", "study", "studying",
    "practice", "training", "course", "tutorial", "technology",
    "framework", "language", "programming",
}

EVENT_PATTERNS = [
    r"interview", r"meeting", r"conference", r"hackathon",
    r"rejected", r"accepted", r"hired", r"fired", r"quit",
    r"graduated", r"started", r"finished", r"launched",
    r"happened", r"occurred", r"event",
]

COMPARISON_WORDS = {
    "compare", "versus", "vs", "better", "worse", "difference",
    "similar", "unlike", "changed", "evolved", "progress",
}

CAPITALIZED_STOP = {
    "I", "The", "A", "My", "How", "What", "Why", "When", "Where",
    "Who", "Which", "Is", "Are", "Do", "Does", "Did", "Can", "Could",
    "Should", "Would", "Give", "Tell", "Show", "List", "Am", "Have",
    "Has", "Will", "But", "And", "Or", "Not", "So", "If", "For",
}

QUESTION_HEADS = re.compile(
    r"^(who|what|when|where|why|how|which|can|could|should|would|is|are|do|does|did)\b",
    re.IGNORECASE,
)


class FeatureExtractor:
    """Extract structured boolean features from a query — no ML required."""

    def extract(self, query: str) -> QueryFeatures:
        lower = query.lower().strip()
        words = set(lower.split())

        return QueryFeatures(
            mentions_person=self._has_person(query),
            mentions_goal=bool(words & GOAL_WORDS),
            mentions_project=bool(words & PROJECT_WORDS),
            mentions_skill=bool(words & SKILL_WORDS),
            mentions_event=any(re.search(p, lower) for p in EVENT_PATTERNS),
            time_reference=bool(words & TIME_WORDS) or self._has_time_pattern(lower),
            emotion_words=bool(words & EMOTION_WORDS),
            is_question=bool(query.rstrip().endswith("?") or QUESTION_HEADS.search(query)),
            is_comparison=bool(words & COMPARISON_WORDS),
        )

    # ── helpers ──

    @staticmethod
    def _has_person(query: str) -> bool:
        caps = re.findall(r"\b[A-Z][a-z]{1,}", query)
        return any(w not in CAPITALIZED_STOP for w in caps)

    @staticmethod
    def _has_time_pattern(text: str) -> bool:
        patterns = [
            r"\d+\s*(days?|weeks?|months?|years?)\s*ago",
            r"in\s+\d{4}",
            r"(january|february|march|april|may|june|july|august|september|october|november|december)",
            r"last\s+(week|month|year|night|time)",
        ]
        return any(re.search(p, text) for p in patterns)
