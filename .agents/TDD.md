# Technical Design Document (TDD)

## Cognitive Memory Protocol (CMP)

**Version:** 1.0
**Objective:** Build a production-grade AI memory orchestration system that dynamically selects memory subgraphs and specialist models under a strict latency budget while maintaining explainability and observability.

---

# 1. System Architecture

## High-Level Architecture

```text
┌──────────────────────────────┐
│         Next.js UI           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         API Gateway          │
│     FastAPI / Optional Go    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Cognitive Planner        │
└───────┬───────────┬──────────┘
        │           │
        ▼           ▼

 Memory Plan     Model Plan

        │           │
        ▼           ▼

 Retrieval      Router

        │           │

 ┌──────┴─────┐ ┌───┴────────┐
 ▼            ▼ ▼            ▼

Neo4j      Qdrant      Specialists

                         │
                         ▼

                       vLLM

                         │
                         ▼

                 Response Builder
```

---

# 2. Core Design Principles

## Principle 1

Memory must be structured.

Avoid:

```json
{
  "memory": "User likes AI."
}
```

Prefer:

```json
{
  "entity":"AI",
  "relationship":"interested_in",
  "confidence":0.94
}
```

---

## Principle 2

Graph is source of truth.

Vector DB is retrieval accelerator.

Not vice versa.

---

## Principle 3

Models should be selected.

Never execute every model.

---

## Principle 4

Every system decision must be explainable.

---

## Principle 5

Latency budget is a first-class constraint.

---

# 3. Service Breakdown

---

# Service 1

## API Gateway

### Responsibility

Entry point.

### Functions

* Authentication (optional MVP)
* Rate limiting
* Request validation
* Session handling
* WebSocket streaming

### Endpoints

```http
POST /chat
GET /graph
GET /metrics
GET /identity
POST /memory
```

---

# Service 2

## Cognitive Planner

Most important service.

### Responsibility

Convert user query into:

```text
Memory Plan
Model Plan
Latency Budget
```

---

Input:

```json
{
  "query":"Why am I losing motivation?"
}
```

Output:

```json
{
  "memory_domains":[
    "goals",
    "projects",
    "emotion_history"
  ],
  "models":[
    "emotion_analyzer",
    "identity_engine",
    "reasoning_model"
  ]
}
```

---

Planner stages:

### Intent Classification

Determine query type.

Possible classes:

```text
FACTUAL
REFLECTION
EMOTIONAL
RELATIONSHIP
GOAL
SUMMARY
```

---

### Domain Selection

Identify memory categories.

---

### Model Selection

Choose required specialists.

---

### Budget Allocation

Allocate latency budget.

---

# Service 3

## Memory Ingestion Pipeline

Responsible for converting conversations into memory.

---

Stages:

```text
Message

 ↓

Entity Extraction

 ↓

Relationship Detection

 ↓

Emotion Analysis

 ↓

Memory Scoring

 ↓

Graph Update
```

---

# Service 4

## Retrieval Engine

Retrieves memory context.

---

Input:

```json
{
 "query":"How has my startup journey evolved?"
}
```

---

Output:

Relevant subgraph.

---

Pipeline:

```text
Query

 ↓

Embedding

 ↓

Vector Search

 ↓

Graph Expansion

 ↓

Re-ranking

 ↓

Subgraph Assembly
```

---

# Service 5

## Model Router

Executes specialist models.

---

Responsibilities:

* Parallel execution
* Failure recovery
* Timeout handling
* Result aggregation

---

Example:

```python
asyncio.gather(
 emotion_model(),
 entity_model(),
 memory_scorer()
)
```

---

# Service 6

## Response Builder

Combines:

* retrieved memory
* model outputs
* user query

Produces final context.

Calls reasoning model.

---

# 4. Database Design

---

# Neo4j

Primary memory storage.

---

Node Types

## User

```cypher
(:User)
```

---

## Person

```cypher
(:Person)
```

---

## Goal

```cypher
(:Goal)
```

---

## Skill

```cypher
(:Skill)
```

---

## Event

```cypher
(:Event)
```

---

## Belief

```cypher
(:Belief)
```

---

## Emotion

```cypher
(:Emotion)
```

---

## Project

```cypher
(:Project)
```

---

Relationship Types

```cypher
KNOWS
WANTS
WORKS_ON
LEARNED
BELIEVES
FRIEND_OF
RELATED_TO
INFLUENCED_BY
SUPPORTS
CONFLICTS_WITH
```

---

Example

```cypher
(User)-[:WANTS]->(Goal)

(User)-[:WORKS_ON]->(Project)

(Project)-[:RELATED_TO]->(Skill)
```

---

# Node Schema

Example:

```json
{
  "id":"uuid",
  "name":"AI Internship",
  "type":"goal",
  "importance":0.92,
  "confidence":0.88,
  "created_at":"timestamp",
  "updated_at":"timestamp"
}
```

---

# 5. Vector Database Design

## Qdrant

Store:

* embeddings
* semantic memories
* retrieval metadata

---

Collection:

```json
{
 "memory_id":"uuid",
 "embedding":[...],
 "entity_type":"goal",
 "importance":0.82
}
```

---

Hybrid retrieval:

```text
Vector Search
+
Graph Expansion
```

---

# 6. Memory Retrieval Algorithm

---

Step 1

Generate query embedding.

---

Step 2

Retrieve top K candidates.

```python
top_k = 50
```

---

Step 3

Expand graph neighbors.

Depth:

```python
depth = 2
```

---

Step 4

Score memories.

Score formula:

```text
Final Score =

Semantic Similarity × 0.4

+

Importance × 0.2

+

Recency × 0.2

+

Relationship Strength × 0.2
```

---

Step 5

Return subgraph.

Target:

```python
20-100 nodes
```

---

# 7. Cognitive Query Planner

Core innovation.

---

Input

```text
User Query
```

---

Output

```json
{
 "intent":"REFLECTION",
 "memory_domains":[...],
 "models":[...],
 "latency_budget":2000
}
```

---

Planner pipeline:

```text
Query

 ↓

Intent Detection

 ↓

Domain Mapping

 ↓

Memory Strategy

 ↓

Model Strategy

 ↓

Budget Allocation
```

---

# Intent Mapping

Example:

```text
"Who is Rahul?"

FACTUAL
```

---

```text
"Why am I stuck?"

REFLECTION
```

---

```text
"How do I feel lately?"

EMOTIONAL
```

---

# Model Selection Rules

FACTUAL:

```text
retrieval
+
small model
```

---

EMOTIONAL:

```text
retrieval
emotion analyzer
reasoning model
```

---

REFLECTION:

```text
identity engine
summarizer
reasoning model
```

---

# 8. Specialist Models

---

Emotion Analyzer

Purpose:

Extract emotion signals.

---

Entity Extractor

Purpose:

Identify entities.

---

Relationship Detector

Purpose:

Infer graph edges.

---

Memory Importance Scorer

Purpose:

Score memory significance.

---

Contradiction Detector

Purpose:

Find conflicting beliefs.

---

Identity Analyzer

Purpose:

Track evolution.

---

Summarizer

Purpose:

Compress context.

---

Reasoning Model

Purpose:

Generate final answer.

---

# 9. Latency Budget System

Global target:

```text
<2000ms
```

---

Suggested allocation:

```text
Intent Detection     50ms

Retrieval           150ms

Graph Expansion      80ms

Model Specialists   300ms

Reasoning Model    1000ms

Response Build      100ms
```

---

Monitor:

P50

P95

P99

---

# 10. Explainability Engine

Every response must contain:

```json
{
 "memories_used":[...],
 "models_invoked":[...],
 "retrieval_reason":[...]
}
```

---

Example

```json
{
 "node":"Startup Goal",
 "reason":"Mentioned recently"
}
```

---

# 11. Identity Engine

Produces longitudinal metrics.

Example:

```json
{
 "confidence":0.73,
 "motivation":0.66,
 "curiosity":0.91,
 "risk_tolerance":0.62
}
```

---

Updates after every conversation.

---

Stores snapshots.

---

# 12. Frontend Architecture

---

Pages

### Chat

```text
/chat
```

---

### Memory Graph

```text
/graph
```

---

### Planner Inspector

```text
/planner
```

---

### Metrics Dashboard

```text
/metrics
```

---

### Identity Timeline

```text
/identity
```

---

# React Components

ChatWindow

GraphCanvas

PlannerPanel

MetricsPanel

IdentityChart

MemoryInspector

NodeExplorer

---

# 13. Metrics Collection

Prometheus metrics:

```text
planner_latency

retrieval_latency

model_latency

graph_query_latency

cache_hits

tokens_generated

requests_per_second
```

---

# Grafana Dashboards

System Health

Planner Performance

Model Usage

Memory Growth

Latency Breakdown

---

# 14. Infrastructure

Docker Services:

```yaml
frontend

backend

neo4j

qdrant

redis

prometheus

grafana

vllm
```

---

# 15. Development Roadmap

## Phase 1

Memory Graph

* Neo4j
* ingestion
* visualization

---

## Phase 2

Retrieval

* embeddings
* Qdrant
* hybrid search

---

## Phase 3

Planner

* intent detection
* domain selection
* routing

---

## Phase 4

Multi-model orchestration

* async execution
* aggregation

---

## Phase 5

Explainability

* memory provenance
* routing reasons

---

## Phase 6

Identity engine

* trend tracking
* evolution metrics

---

## Phase 7

Performance optimization

* caching
* batching
* latency dashboard

---

# What Makes This Project Valuable

This project demonstrates:

* Full-stack engineering
* AI infrastructure
* Graph databases
* Retrieval systems
* Multi-model orchestration
* Query planning
* Observability
* Performance engineering
* Human memory modeling

Most applicants build a chatbot with RAG.

CMP demonstrates how an AI system decides:

1. **What memories matter**
2. **What relationships matter**
3. **Which models should run**
4. **How to stay within latency constraints**
5. **Why every decision was made**

That is the central technical thesis of the project.
