"""
CMP Domain Models — every data shape that flows through the system.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
import uuid


# ────────────────────────────── Enums ──────────────────────────────


class IntentType(str, Enum):
    FACTUAL = "FACTUAL"
    REFLECTION = "REFLECTION"
    EMOTIONAL = "EMOTIONAL"
    RELATIONSHIP = "RELATIONSHIP"
    GOAL = "GOAL"
    SUMMARY = "SUMMARY"


class EntityType(str, Enum):
    USER = "User"
    PERSON = "Person"
    GOAL = "Goal"
    SKILL = "Skill"
    EVENT = "Event"
    BELIEF = "Belief"
    EMOTION = "Emotion"
    PROJECT = "Project"


class RelationshipType(str, Enum):
    KNOWS = "KNOWS"
    WANTS = "WANTS"
    WORKS_ON = "WORKS_ON"
    LEARNED = "LEARNED"
    BELIEVES = "BELIEVES"
    FRIEND_OF = "FRIEND_OF"
    RELATED_TO = "RELATED_TO"
    INFLUENCED_BY = "INFLUENCED_BY"
    SUPPORTS = "SUPPORTS"
    CONFLICTS_WITH = "CONFLICTS_WITH"


# ────────────────────────────── Core Domain ──────────────────────────────


class Entity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: EntityType
    importance: float = 0.5
    confidence: float = 0.5
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Relationship(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_id: str
    target_id: str
    type: RelationshipType
    strength: float = 0.5
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Memory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    entities: List[Entity] = []
    relationships: List[Relationship] = []
    importance: float = 0.5
    emotion: Optional[str] = None
    emotion_confidence: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ────────────────────────────── Planner Types ──────────────────────────────


class QueryFeatures(BaseModel):
    mentions_person: bool = False
    mentions_goal: bool = False
    mentions_project: bool = False
    mentions_skill: bool = False
    mentions_event: bool = False
    time_reference: bool = False
    emotion_words: bool = False
    is_question: bool = False
    is_comparison: bool = False


class MemoryPlan(BaseModel):
    domains: List[str]
    depth: int = 2
    max_nodes: int = 50
    strategy: str = "hybrid"


class ModelSpec(BaseModel):
    name: str
    estimated_latency_ms: int
    priority: int = 1
    reason: str = ""


class PlannerOutput(BaseModel):
    intent: IntentType
    intent_confidence: float
    features: QueryFeatures
    memory_plan: MemoryPlan
    selected_models: List[ModelSpec]
    total_estimated_latency_ms: int
    latency_budget_ms: int
    escalated_to_llm: bool = False
    explanation: str = ""


# ────────────────────────────── API Shapes ──────────────────────────────


class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"
    session_id: Optional[str] = None
    latency_budget_ms: int = 2000


class ChatResponse(BaseModel):
    response: str
    planner_output: PlannerOutput
    memories_used: List[Dict[str, Any]] = []
    models_invoked: List[str] = []
    total_latency_ms: float = 0
    explanation: Dict[str, Any] = {}


class GraphResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    stats: Dict[str, Any] = {}


class IdentitySnapshot(BaseModel):
    confidence: float = 0.5
    motivation: float = 0.5
    curiosity: float = 0.5
    risk_tolerance: float = 0.5
    consistency: float = 0.5
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MetricsResponse(BaseModel):
    total_memories: int = 0
    total_entities: int = 0
    total_relationships: int = 0
    avg_response_latency_ms: float = 0
    avg_retrieval_latency_ms: float = 0
    avg_planner_latency_ms: float = 0
    cache_hit_rate: float = 0
    requests_count: int = 0
