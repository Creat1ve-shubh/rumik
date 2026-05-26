"""
Identity Engine

Computes longitudinal metrics tracking a user's evolution.
These traits update based on the memory graph and recent events.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone

from schemas.models import IdentitySnapshot

class IdentityEngine:
    def compute_snapshot(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> IdentitySnapshot:
        """Computes identity metrics from the current memory graph."""
        if not nodes:
            return IdentitySnapshot()

        # Gather basic stats
        goals = [n for n in nodes if n.get("type") == "Goal"]
        skills = [n for n in nodes if n.get("type") == "Skill"]
        projects = [n for n in nodes if n.get("type") == "Project"]
        emotions = [n for n in nodes if n.get("type") == "Emotion"]
        
        # ─── Motivation ───
        # Motivation is high if they have many active goals and projects
        motivation = 0.5 + min(0.4, (len(goals) + len(projects)) * 0.05)
        
        # ─── Confidence ───
        # Confidence correlates with the average importance of their entities and positive emotions
        confidence_vals = [float(n.get("confidence", 0.5)) for n in nodes if "confidence" in n]
        avg_confidence = sum(confidence_vals) / len(confidence_vals) if confidence_vals else 0.5
        confidence = 0.5 + (avg_confidence - 0.5) * 0.8
        
        # ─── Curiosity ───
        # Curiosity driven by number of skills learned
        curiosity = 0.5 + min(0.4, len(skills) * 0.1)
        
        # ─── Risk Tolerance ───
        # Inferred from ambitious goals or certain events (startup, etc.)
        risk_words = {"startup", "founder", "new", "company", "solo"}
        risk_hits = sum(1 for n in nodes if any(w in str(n.get("name", "")).lower() for w in risk_words))
        risk_tolerance = 0.5 + min(0.4, risk_hits * 0.15)
        
        # ─── Consistency ───
        # Based on average node importance
        imp_vals = [float(n.get("importance", 0.5)) for n in nodes if "importance" in n]
        consistency = sum(imp_vals) / len(imp_vals) if imp_vals else 0.5

        return IdentitySnapshot(
            confidence=round(min(1.0, max(0.0, confidence)), 2),
            motivation=round(min(1.0, max(0.0, motivation)), 2),
            curiosity=round(min(1.0, max(0.0, curiosity)), 2),
            risk_tolerance=round(min(1.0, max(0.0, risk_tolerance)), 2),
            consistency=round(min(1.0, max(0.0, consistency)), 2),
            timestamp=datetime.now(timezone.utc)
        )
