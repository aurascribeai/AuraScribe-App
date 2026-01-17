# ComplianceMonitorAgent - Checks documentation for compliance
# WITH PERSONA SUPPORT
# --- PERSONA SUPPORT ---
PERSONAS = {
    "generalist": {
        "name": "General Doctor",
        "focus": "Everything - general care"
    },
    "cardiologist": {
        "name": "Heart Specialist",
        "focus": "Heart and blood pressure"
    },
    "pulmonologist": {
        "name": "Lung Specialist", 
        "focus": "Lungs and breathing"
    },
    "neurologist": {
        "name": "Brain Specialist",
        "focus": "Brain and nerves"
    }
}

def apply_persona(persona_key="generalist"):
    """Apply persona to the agent's responses"""
    persona = PERSONAS.get(persona_key, PERSONAS["generalist"])
    return f"\n[Perspective: {persona['name']} - {persona['focus']}]\n"

class ComplianceMonitorAgentWrapper:
    def __init__(self, name="ComplianceMonitorAgent"):
        self.name = name
        
        # Persona-specific compliance requirements
        self.persona_requirements = {
            "generalist": {
                "must_have": ["Patient consent", "History", "Exam findings", "Assessment", "Plan"],
                "special_notes": ["Preventive care documentation", "Referral documentation if needed"]
            },
            "cardiologist": {
                "must_have": ["Cardiac history", "Cardiac exam", "ECG results", "Cardiac assessment", "Cardiac plan"],
                "special_notes": ["Procedure consent forms", "Risk discussion documentation", "Device documentation"]
            },
            "pulmonologist": {
                "must_have": ["Respiratory history", "Lung exam", "Oxygen levels", "Imaging results", "Respiratory plan"],
                "special_notes": ["Smoking history", "Oxygen prescription", "Pulmonary rehab referral"]
            }
        }
        
        # Red flags for each specialty
        self.red_flags = {
            "cardiologist": ["Chest pain without ECG", "Heart failure without weight", "No medication review"],
            "pulmonologist": ["Shortness of breath without O2 sat", "Cough >3 weeks no imaging", "Smoker without counseling"],
            "generalist": ["No vital signs", "No problem list", "No follow-up plan"]
        }

    def run(self, payload):
        """
        Check documentation compliance.
        Payload can be transcript text or dict with 'transcript' and 'persona'
        """
        # Check if we got a dict or just text
        if isinstance(payload, dict):
            transcript_text = payload.get("transcript", "")
            persona_key = payload.get("persona", "generalist")
        else:
            transcript_text = payload
            persona_key = "generalist"
        
        if not transcript_text or len(transcript_text.strip()) < 10:
            return {
                "compliant": False,
                "issues": ["Transcript too short for compliance check"],
                "persona_used": persona_key
            }

        transcript_lower = transcript_text.lower()
        issues = []
        warnings = []
        passed_checks = []
        
        # Get requirements for this persona
        requirements = self.persona_requirements.get(persona_key, self.persona_requirements["generalist"])
        specialty_red_flags = self.red_flags.get(persona_key, [])
        
        # Check basic requirements
        basic_checks = [
            ("consent", "No consent documented"),
            ("agree", "No agreement documented"),
            ("patient", "Patient identification incomplete"),
            ("history", "History documentation incomplete"),
            ("exam", "Exam findings not detailed"),
            ("plan", "Treatment plan unclear")
        ]
        
        for keyword, warning in basic_checks:
            if keyword not in transcript_lower:
                warnings.append(warning)
            else:
                passed_checks.append(f"Has {keyword}")
        
        # Check persona-specific requirements
        for requirement in requirements["must_have"]:
            if requirement.lower() not in transcript_lower:
                issues.append(f"Missing: {requirement}")
        
        # Check for red flags
        for red_flag in specialty_red_flags:
            flag_keywords = red_flag.lower().split()
            if all(keyword in transcript_lower for keyword in flag_keywords[:2]):
                issues.append(f"Red flag: {red_flag}")
        
        # Check for positive findings
        good_practices = ["follow-up", "education", "discussed", "explained", "informed"]
        positives = [word for word in good_practices if word in transcript_lower]
        
        # Add specialty-specific notes
        specialty_notes = []
        if persona_key in self.persona_requirements:
            specialty_notes = self.persona_requirements[persona_key].get("special_notes", [])

        return {
            "compliant": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "passed_checks": passed_checks[:5],  # First 5 only
            "positives_found": positives[:3],  # First 3 only
            "persona_used": persona_key,
            "specialty": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
            "specialty_notes": specialty_notes,
            "recommendations": [
                f"Document all required elements for {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']}",
                "Ensure patient consent is explicit",
                "Include clear follow-up instructions"
            ],
            "note": f"Compliance check from {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']} perspective"
        }


root_agent = ComplianceMonitorAgentWrapper()