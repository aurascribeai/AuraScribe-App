# RAMQ_BillingAgent - Suggests billing codes for Quebec health insurance
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

class RAMQBillingAgentWrapper:
    def __init__(self, name="RAMQ_BillingAgent"):
        self.name = name
        
        # RAMQ billing codes - Quebec medical billing codes
        self.billing_codes = {
            "generalist": {
                "consultation": {"code": "09089", "fee": "$85", "description": "General consultation"},
                "extended_consult": {"code": "09090", "fee": "$120", "description": "Long consultation >30 min"},
                "emergency": {"code": "09091", "fee": "$150", "description": "Urgent care visit"}
            },
            "cardiologist": {
                "specialist_consult": {"code": "15100", "fee": "$180", "description": "Cardiology consultation"},
                "ecg_interpretation": {"code": "15110", "fee": "$45", "description": "Read ECG"},
                "stress_test": {"code": "15200", "fee": "$250", "description": "Cardiac stress test"}
            },
            "pulmonologist": {
                "specialist_consult": {"code": "16100", "fee": "$180", "description": "Pulmonology consultation"},
                "lung_function": {"code": "16150", "fee": "$120", "description": "Pulmonary function test"},
                "bronchoscopy": {"code": "16200", "fee": "$450", "description": "Lung scope procedure"}
            }
        }
        
        # Persona-specific billing advice
        self.persona_advice = {
            "generalist": "As family doctor, bill for time spent and complexity. Document well.",
            "cardiologist": "Cardiology procedures have specific codes. Use detailed documentation.",
            "pulmonologist": "Pulmonary tests have special codes. Note medical necessity."
        }

    def run(self, payload):
        """
        Suggest RAMQ billing codes.
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
                "suggested_codes": [],
                "message": "No transcript for billing analysis",
                "persona_used": persona_key
            }

        transcript_lower = transcript_text.lower()
        suggested_codes = []
        
        # Get codes for this persona
        persona_codes = self.billing_codes.get(persona_key, self.billing_codes["generalist"])
        
        # Always suggest basic consultation
        base_code = list(persona_codes.values())[0]  # First code for this specialty
        suggested_codes.append({
            **base_code,
            "confidence": "HIGH",
            "reason": "Standard consultation code for " + PERSONAS.get(persona_key, PERSONAS["generalist"])["name"]
        })
        
        # Check for extended time
        time_keywords = ['long', 'extended', 'complicated', 'multiple issues', 'detailed']
        if any(word in transcript_lower for word in time_keywords) and "extended_consult" in persona_codes:
            suggested_codes.append({
                **persona_codes["extended_consult"],
                "confidence": "MEDIUM",
                "reason": "Consultation appears complex or lengthy"
            })
        
        # Check for emergency
        emergency_keywords = ['emergency', 'urgent', 'acute', 'severe', 'critical']
        if any(word in transcript_lower for word in emergency_keywords) and "emergency" in persona_codes:
            suggested_codes.append({
                **persona_codes["emergency"],
                "confidence": "MEDIUM", 
                "reason": "Urgent or emergency context mentioned"
            })
        
        # Check for procedures
        if persona_key == "cardiologist":
            if 'ecg' in transcript_lower or 'electrocardiogram' in transcript_lower:
                suggested_codes.append({
                    **persona_codes["ecg_interpretation"],
                    "confidence": "HIGH",
                    "reason": "ECG mentioned in consultation"
                })
        
        elif persona_key == "pulmonologist":
            if 'lung' in transcript_lower and ('test' in transcript_lower or 'function' in transcript_lower):
                suggested_codes.append({
                    **persona_codes["lung_function"],
                    "confidence": "MEDIUM",
                    "reason": "Lung function testing discussed"
                })

        return {
            "suggested_codes": suggested_codes,
            "total_estimate": f"${sum(int(c['fee'].replace('$', '')) for c in suggested_codes)}",
            "persona_used": persona_key,
            "specialty": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
            "billing_advice": self.persona_advice.get(persona_key, "Document services provided clearly."),
            "disclaimer": "These are suggestions. Final billing must follow RAMQ rules and physician judgment.",
            "note": f"Billing perspective: {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']}"
        }


# --- PERSONA SUPPORT ---
# Copy this into every agent


# Create the root agent instance
root_agent = RAMQBillingAgentWrapper()