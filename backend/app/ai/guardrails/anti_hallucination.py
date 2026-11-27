"""
Anti-Hallucination & Anti-Fabrication Guardrail Definitions
Architecture Section 2.3 & 15.2
"""
from typing import List


class AntiFabricationGuardrail:
    """Validates that newly generated text does not fabricate metrics, entities, or unverified claims."""

    @staticmethod
    def verify_no_unconfirmed_skills(generated_text: str, confirmed_skills: List[str]) -> bool:
        """Stub for skill ground-truth verification."""
        return True
