Starting with the **Product Requirements Document (PRD)** is the correct approach. If the product definition is weak, the architecture becomes confused.

One thing I would change before writing the PRD:

**Do not call it "MemoryGraph".**

That's implementation-centric.

Call it:

# Cognitive Memory Protocol (CMP)

Because the graph is an implementation detail.

The product is about cognition, memory, retrieval and orchestration.

---

# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Project Name

Cognitive Memory Protocol (CMP)

---

# Vision

Build a cognitive memory layer that enables multiple AI models to maintain a persistent, evolving understanding of a user while dynamically selecting relevant memories and specialist models under a strict latency budget.

The system should feel less like a chatbot and more like a persistent intelligence that remembers relationships, goals, beliefs, events and personal evolution.

---

# Problem Statement

Current AI assistants suffer from five major limitations:

## No Persistent Identity

The assistant does not maintain a consistent understanding of the user over long periods.

Example:

```text
January:
User wants startup internship

March:
User asks about startup internship

Assistant has forgotten context
```

---

## Memory Explosion

As conversations grow:

```text
100 chats
1000 chats
10000 chats
```

retrieving useful information becomes increasingly difficult.

---

## Context Explosion

Only a small fraction of stored memories are relevant to a specific query.

Most memory systems retrieve too much irrelevant information.

---

## Model Explosion

Modern AI systems use many specialist models.

Examples:

* intent detection
* emotion analysis
* retrieval planning
* summarization
* reasoning

Running all models on every request is expensive and slow.

---

## Lack of Explainability

Users and developers cannot understand:

* why memories were retrieved
* why models were invoked
* why specific conclusions were reached

---

# Product Goals

The system should:

### Goal 1

Maintain persistent user memory across sessions.

---

### Goal 2

Store relationships between entities rather than isolated text chunks.

---

### Goal 3

Dynamically determine relevant memories for a query.

---

### Goal 4

Dynamically determine which models should execute.

---

### Goal 5

Operate within configurable latency budgets.

Default:

```text
Target:
< 2000ms
```

---

### Goal 6

Provide full memory explainability.

---

### Goal 7

Provide visual memory exploration.

---

### Goal 8

Support multiple open-source models through a common protocol.

---

# Target Users

---

## Primary User

AI engineers

Use case:

Building persistent AI agents.

---

## Secondary User

Researchers

Use case:

Studying memory systems.

---

## Tertiary User

End users

Use case:

Personal AI companion.

---

# Core Concepts

---

## Entity

A thing.

Examples:

```text
Person
Project
Goal
Company
Skill
Place
Event
```

Examples:

```text
Rahul
Next.js
Google Internship
MemoryGraph
```

---

## Relationship

Connection between entities.

Examples:

```text
friend_of
works_on
depends_on
caused_by
supports
conflicts_with
```

---

## Memory

A stored observation.

Example:

```text
User worked on project X.
```

---

## Belief

A recurring inferred viewpoint.

Example:

```text
Building projects is better than tutorials.
```

---

## Goal

Something user wants.

Example:

```text
Get AI internship.
```

---

## Emotion

Associated emotional signal.

Example:

```text
Excitement
Frustration
Fear
Curiosity
```

---

## Identity

Aggregate representation of user evolution.

Example:

```text
Confidence
Risk tolerance
Motivation
Curiosity
```

---

# User Journey

---

## First Conversation

User sends message:

```text
I want an AI internship.
```

System:

Creates:

```text
Goal:
AI Internship
```

Stores relationship:

```text
User -> wants -> AI Internship
```

---

## Future Conversation

User:

```text
I got rejected from Google.
```

System:

Creates:

```text
Event:
Google Rejection
```

Links:

```text
Google Rejection
    linked_to
AI Internship
```

Adds emotional state.

---

## Reflection Query

User:

```text
How has my internship journey evolved?
```

System:

Retrieves:

* internship goals
* applications
* interviews
* rejections
* successes

Generates summary.

---

# Major Product Features

---

# Feature 1

Persistent Memory Storage

---

Description:

Store memories across sessions.

---

User Value:

Assistant remembers context.

---

Acceptance Criteria:

Memory remains available after restart.

---

# Feature 2

Relationship Graph

---

Description:

Store relationships between entities.

---

User Value:

Better contextual reasoning.

---

Acceptance Criteria:

Entities and relationships visible in graph explorer.

---

# Feature 3

Memory Explorer

---

Description:

Visual graph interface.

---

Capabilities:

Search nodes.

Filter node types.

Explore relationships.

Expand neighbors.

Collapse branches.

---

Acceptance Criteria:

Graph updates in real time.

---

# Feature 4

Cognitive Query Planner

---

Description:

Analyze query before retrieval.

Determine:

* relevant memory domains
* retrieval strategy
* model execution plan

---

User Value:

Faster and more accurate responses.

---

Acceptance Criteria:

Planner explanation visible.

---

# Feature 5

Dynamic Model Routing

---

Description:

Choose specialist models based on query requirements.

---

Examples:

Simple factual query:

```text
Memory retrieval only
```

Reflection query:

```text
Identity analyzer
+
summarizer
```

---

Acceptance Criteria:

Model invocation list displayed.

---

# Feature 6

Explainability Layer

---

Description:

Show why decisions occurred.

---

Examples:

```text
Memory selected because:
mentioned 23 times
```

```text
Model executed because:
negative sentiment detected
```

---

Acceptance Criteria:

Every response includes explanation metadata.

---

# Feature 7

Latency Dashboard

---

Description:

Real-time system metrics.

---

Metrics:

Response latency

Planner latency

Retrieval latency

Model latency

Token throughput

Cache hit rate

---

Acceptance Criteria:

Metrics update live.

---

# Feature 8

Belief Evolution

---

Description:

Track changing user beliefs.

---

Example:

```text
Startups are risky

0.91 -> 0.45
```

---

Acceptance Criteria:

Historical evolution view available.

---

# Feature 9

Contradiction Detection

---

Description:

Identify conflicting memories.

---

Example:

```text
I love remote work.

I feel lonely working remotely.
```

---

Acceptance Criteria:

Conflict visible in dashboard.

---

# Feature 10

Identity Engine

---

Description:

Infer long-term trends.

---

Metrics:

Confidence

Motivation

Risk tolerance

Curiosity

Consistency

---

Acceptance Criteria:

Identity timeline visible.

---

# Dashboard Views

---

## Conversation View

Chat interface.

---

## Graph View

Interactive memory graph.

---

## Planner View

Memory retrieval decisions.

Model routing decisions.

---

## Performance View

Latency metrics.

---

## Identity View

Personal evolution metrics.

---

# Success Metrics

---

## Retrieval Quality

Relevant memories retrieved.

Target:

> 90%

---

## Planner Accuracy

Correct model selection.

Target:

> 85%

---

## Latency

Average response latency.

Target:

< 2 seconds

---

## Graph Retrieval Latency

Target:

< 150 ms

---

## Memory Explanation Coverage

Target:

100%

---

# MVP Scope

Must Have:

✓ Memory graph

✓ Memory ingestion

✓ Planner

✓ Model routing

✓ Graph visualization

✓ Explainability

✓ Latency dashboard

✓ Chat interface

---

Nice To Have:

* Identity engine
* Contradiction engine
* Memory decay
* Belief evolution
* Temporal replay

---

# Future Vision

CMP becomes a universal memory protocol for AI systems.

Any model can:

* retrieve memories
* create memories
* update beliefs
* traverse relationships
* understand user history

through a common cognitive memory layer.

---

This PRD should be frozen first. Only after agreeing on this should the **Technical Design Document (TDD)** be created, because the TDD will specify:

* service architecture
* database schemas
* graph structure
* APIs
* model orchestration
* retrieval algorithms
* latency budgets
* Docker architecture
* deployment topology
* implementation roadmap

and should be written directly from the approved PRD rather than invented independently.
