"""
Multi-Model Orchestrator

Responsible for executing the models chosen by the Cognitive Planner.
Runs models in parallel using asyncio.gather to respect the latency budget.
"""

import asyncio
import logging
import time
from typing import Dict, Any, List

from schemas.models import PlannerOutput, Memory

logger = logging.getLogger("cmp.orchestrator")


class ModelOrchestrator:
    """Executes selected specialist models concurrently."""

    async def execute_plan(
        self,
        planner_output: PlannerOutput,
        user_query: str,
        retrieved_context: List[Dict[str, Any]],
        new_memory: Memory,
    ) -> Dict[str, Any]:
        """
        Run all models in parallel and aggregate their results.
        Currently simulates the actual ML inference latency to prove the orchestration architecture.
        """
        tasks = []
        model_names = [m.name for m in planner_output.selected_models]

        for model in planner_output.selected_models:
            # Map model name to its execution function
            func = getattr(self, f"_run_{model.name}", self._run_generic_model)
            # Create a task for this model
            tasks.append(
                asyncio.create_task(
                    func(model.name, model.estimated_latency_ms, user_query, retrieved_context)
                )
            )

        # Run all models concurrently
        t0 = time.perf_counter()
        results = await asyncio.gather(*tasks, return_exceptions=True)
        elapsed_ms = (time.perf_counter() - t0) * 1000

        logger.info(f"Orchestrator ran {len(tasks)} models in {elapsed_ms:.1f}ms")

        # Aggregate results
        aggregated = {}
        for name, result in zip(model_names, results):
            if isinstance(result, Exception):
                logger.error(f"Model {name} failed: {result}")
                aggregated[name] = {"error": str(result)}
            else:
                aggregated[name] = result

        return aggregated

    # ─── Model Execution Implementations (Simulated/Mocks for MVP) ───

    async def _run_generic_model(self, name: str, est_latency: int, query: str, context: List[Any]) -> Dict[str, Any]:
        """Generic fallback for unimplemented models."""
        await asyncio.sleep(est_latency / 1000.0)  # Simulate inference time
        return {"status": "success", "simulated": True, "latency_ms": est_latency}

    async def _run_emotion_analyzer(self, name: str, est_latency: int, query: str, context: List[Any]) -> Dict[str, Any]:
        """Phase 4: Will use DistilRoBERTa pipeline."""
        await asyncio.sleep(est_latency / 1000.0)
        return {"primary_emotion": "curiosity", "confidence": 0.85, "simulated": True}

    async def _run_entity_extractor(self, name: str, est_latency: int, query: str, context: List[Any]) -> Dict[str, Any]:
        """Phase 4: Will use GLiNER."""
        await asyncio.sleep(est_latency / 1000.0)
        return {"entities_found": len(query.split()) // 5, "simulated": True}

    async def _run_reasoning_model(self, name: str, est_latency: int, query: str, context: List[Any]) -> Dict[str, Any]:
        """Phase 4: Will call vLLM endpoint (e.g., Qwen3-14B)."""
        await asyncio.sleep(min(500, est_latency) / 1000.0) # Cap mock sleep to 500ms so testing is fast
        
        # Build prompt from context
        context_str = "\n".join(f"- {c['content']}" for c in context[:5])
        
        # In a real implementation, this would be an httpx POST to the vLLM server
        answer = f"Based on your memory:\n{context_str}\n\nI understand you are focusing on this."
        
        return {"answer": answer, "simulated": True}
