"""
/chat endpoint — the primary user-facing API.

Flow:
    1. Planner analyses the query
    2. Ingestion extracts entities from the message
    3. Retrieval fetches relevant memories
    4. Explainability documents all decisions
    5. Response is assembled and returned
"""

import time
from fastapi import APIRouter, Depends
from schemas.models import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Full CMP pipeline: plan → ingest → retrieve → explain → respond."""
    from main import get_services

    services = get_services()
    t0 = time.perf_counter()

    # ── 1. Cognitive Planner ──
    planner_output = await services["planner"].plan(
        query=req.message,
        latency_budget_ms=req.latency_budget_ms,
    )

    # ── 2. Ingest the user message into memory ──
    memory = services["ingestion"].ingest(req.message, req.user_id)

    # Store entities in graph
    for entity in memory.entities:
        await services["graph"].create_entity(entity)
    for rel in memory.relationships:
        await services["graph"].create_relationship(rel)

    # Index in vector store
    query_embedding = services["embedder"].encode(req.message)
    await services["retrieval"].index_memory(
        memory_id=memory.id,
        embedding=query_embedding,
        payload={
            "content": memory.content,
            "importance": memory.importance,
            "emotion": memory.emotion,
            "entity_types": [e.type.value for e in memory.entities],
        },
    )

    # ── 3. Retrieve relevant memories ──
    retrieval_result = await services["retrieval"].retrieve(
        query_embedding=query_embedding,
        memory_plan=planner_output.memory_plan,
    )

    # ── 4. Explainability ──
    models_invoked = [m.name for m in planner_output.selected_models]
    explanation = services["explainability"].explain(
        planner_output=planner_output,
        retrieved_memories=retrieval_result["memories"],
        models_invoked=models_invoked,
    )

    # ── 5. Build response ──
    # Phase 1: echo back the planner's analysis + retrieved context
    # Phase 4+: this calls the reasoning model via vLLM
    memory_context = "\n".join(
        f"- {m['content']}" for m in retrieval_result["memories"][:5]
    )
    response_text = (
        f"[CMP Analysis]\n"
        f"Intent: {planner_output.intent.value} "
        f"(confidence: {planner_output.intent_confidence})\n"
        f"Domains: {', '.join(planner_output.memory_plan.domains)}\n"
        f"Models planned: {', '.join(models_invoked)}\n"
    )
    if memory.entities:
        response_text += f"Entities extracted: {', '.join(e.name for e in memory.entities)}\n"
    if memory.emotion and memory.emotion != "neutral":
        response_text += f"Emotion detected: {memory.emotion}\n"
    if memory_context:
        response_text += f"\nRelevant memories:\n{memory_context}\n"

    elapsed_ms = (time.perf_counter() - t0) * 1000

    return ChatResponse(
        response=response_text,
        planner_output=planner_output,
        memories_used=retrieval_result["memories"][:10],
        models_invoked=models_invoked,
        total_latency_ms=round(elapsed_ms, 1),
        explanation=explanation,
    )
