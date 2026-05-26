"""
Memory Ingestion Pipeline

    Message → Entity Extraction → Relationship Detection →
    Emotion Analysis → Memory Scoring → Graph + Vector Update

Converts raw conversation messages into structured graph memory.
"""

import re
import uuid
from typing import List, Tuple
from datetime import datetime

from schemas.models import (
    Entity, Relationship, Memory, EntityType, RelationshipType,
)


# ─── Lightweight keyword-based entity extraction (Phase 1) ───
# In Phase 2+ this gets replaced by GLiNER

ENTITY_PATTERNS = {
    EntityType.GOAL: [
        r"(?:want|goal|aim|dream|aspire|target|wish|plan)\s+(?:to\s+)?(.{3,40}?)(?:\.|,|$)",
        r"(?:my|a)\s+goal\s+(?:is|:)\s+(.{3,40}?)(?:\.|,|$)",
    ],
    EntityType.PROJECT: [
        r"(?:working on|building|developing|creating|my project)\s+(.{3,30}?)(?:\.|,|$)",
        r"(?:called|named)\s+(.{3,25}?)(?:\.|,|$)",
    ],
    EntityType.SKILL: [
        r"(?:learning|studying|practicing|know|learned)\s+(.{2,25}?)(?:\.|,|$)",
    ],
    EntityType.EVENT: [
        r"(?:got|was)\s+(rejected|accepted|hired|fired|promoted)\s*(?:from|at|by)?\s*(.{2,25}?)(?:\.|,|$)",
        r"(?:attended|went to|joined)\s+(.{3,30}?)(?:\.|,|$)",
    ],
    EntityType.PERSON: [
        r"(?:my friend|know|met|talked to|mentor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
    ],
}

EMOTION_KEYWORDS = {
    "happy": "joy", "excited": "excitement", "grateful": "gratitude",
    "sad": "sadness", "frustrated": "frustration", "angry": "anger",
    "anxious": "anxiety", "worried": "worry", "scared": "fear",
    "overwhelmed": "overwhelm", "stuck": "frustration",
    "motivated": "motivation", "confident": "confidence",
    "lonely": "loneliness", "bored": "boredom", "curious": "curiosity",
    "proud": "pride", "hopeful": "hope",
}

# Relationship hints
RELATIONSHIP_PATTERNS = [
    (r"(.+?)\s+(?:is related to|connects to|depends on)\s+(.+)", RelationshipType.RELATED_TO),
    (r"(.+?)\s+(?:works on|working on)\s+(.+)", RelationshipType.WORKS_ON),
    (r"(.+?)\s+(?:wants|want)\s+(.+)", RelationshipType.WANTS),
    (r"(.+?)\s+(?:learned|knows|know)\s+(.+)", RelationshipType.LEARNED),
    (r"(.+?)\s+(?:friend of|friends with)\s+(.+)", RelationshipType.FRIEND_OF),
]


class IngestionPipeline:
    """Converts raw text into entities, relationships, and a Memory object."""

    def ingest(self, message: str, user_id: str = "default") -> Memory:
        """Full ingestion pipeline for a single message."""

        # Step 1: Extract entities
        entities = self._extract_entities(message)

        # Step 2: Detect emotion
        emotion, emotion_conf = self._detect_emotion(message)

        # Step 3: Score importance
        importance = self._score_importance(message, entities, emotion)

        # Step 4: Infer relationships (between user and extracted entities)
        relationships = self._infer_relationships(user_id, entities, message)

        return Memory(
            id=str(uuid.uuid4()),
            content=message,
            entities=entities,
            relationships=relationships,
            importance=importance,
            emotion=emotion,
            emotion_confidence=emotion_conf,
            created_at=datetime.utcnow(),
        )

    # ─── Step 1: Entity Extraction ───

    def _extract_entities(self, text: str) -> List[Entity]:
        entities = []
        seen_names = set()

        for entity_type, patterns in ENTITY_PATTERNS.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    name = match.group(1).strip().rstrip(".,!?")
                    if name and name.lower() not in seen_names and len(name) > 1:
                        seen_names.add(name.lower())
                        entities.append(
                            Entity(
                                name=name,
                                type=entity_type,
                                importance=0.6,
                                confidence=0.7,
                            )
                        )
        return entities

    # ─── Step 2: Emotion Detection ───

    def _detect_emotion(self, text: str) -> Tuple[str, float]:
        """Keyword-based emotion detection (Phase 1). Replaced by DistilRoBERTa later."""
        text_lower = text.lower()
        for keyword, emotion in EMOTION_KEYWORDS.items():
            if keyword in text_lower:
                return emotion, 0.7  # Keyword match = moderate confidence
        return "neutral", 0.5

    # ─── Step 3: Importance Scoring ───

    def _score_importance(
        self, text: str, entities: List[Entity], emotion: str
    ) -> float:
        score = 0.3  # Base

        # More entities = more informative
        score += min(0.2, len(entities) * 0.05)

        # Emotional content is more important
        if emotion != "neutral":
            score += 0.15

        # Longer messages tend to carry more info
        word_count = len(text.split())
        if word_count > 20:
            score += 0.1
        if word_count > 50:
            score += 0.1

        # Questions are important (they reveal goals/needs)
        if "?" in text:
            score += 0.1

        return min(1.0, round(score, 2))

    # ─── Step 4: Relationship Inference ───

    def _infer_relationships(
        self, user_id: str, entities: List[Entity], text: str
    ) -> List[Relationship]:
        relationships = []

        # Default: user → entity relationships based on entity type
        type_to_rel = {
            EntityType.GOAL: RelationshipType.WANTS,
            EntityType.PROJECT: RelationshipType.WORKS_ON,
            EntityType.SKILL: RelationshipType.LEARNED,
            EntityType.PERSON: RelationshipType.KNOWS,
            EntityType.EVENT: RelationshipType.RELATED_TO,
        }

        for entity in entities:
            rel_type = type_to_rel.get(entity.type, RelationshipType.RELATED_TO)
            relationships.append(
                Relationship(
                    source_id=user_id,
                    target_id=entity.id,
                    type=rel_type,
                    strength=entity.importance,
                )
            )

        return relationships
