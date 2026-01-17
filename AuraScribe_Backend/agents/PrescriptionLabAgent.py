# PrescriptionLabAgent - Manages medication prescriptions and lab orders
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

class PrescriptionLabAgentWrapper:
    def __init__(self, name="PrescriptionLabAgent"):
        self.name = name
        
        # Persona-specific medication preferences
        self.persona_medications = {
            "cardiologist": ["Beta-blockers", "ACE inhibitors", "Statins", "Blood thinners"],
            "pulmonologist": ["Inhalers", "Steroids", "Antibiotics", "Oxygen therapy"],
            "neurologist": ["Pain medications", "Anticonvulsants", "Antidepressants", "Sleep aids"],
            "generalist": ["Common antibiotics", "Pain relievers", "Basic medications", "Referrals if needed"]
        }
        
        # Persona-specific lab tests
        self.persona_labs = {
            "cardiologist": ["ECG", "Echocardiogram", "Stress test", "Cardiac enzymes"],
            "pulmonologist": ["Chest X-ray", "Pulmonary function", "ABG", "CT chest"],
            "neurologist": ["MRI brain", "EEG", "EMG", "Lumbar puncture"],
            "generalist": ["Basic blood work", "Urine test", "Basic imaging", "Screening tests"]
        }

    def run(self, payload):
        """
        Generate prescription and lab order suggestions.
        Payload can be: 
        - Just transcript text
        - Or dict with 'transcript' and 'persona'
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
                "prescription": None,
                "lab_order": None,
                "persona_used": persona_key
            }

        transcript_lower = transcript_text.lower()
        
        # Apply persona
        persona_meds = self.persona_medications.get(persona_key, self.persona_medications["generalist"])
        persona_labs = self.persona_labs.get(persona_key, self.persona_labs["generalist"])
        
        # Check for medication needs
        prescription = None
        medication_keywords = ['medication', 'medicament', 'prescription', 'drug', 'pill', 'tablet', 'injection', 'dose']
        
        if any(word in transcript_lower for word in medication_keywords):
            prescription = {
                "status": "Suggested by " + PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
                "persona_specific_suggestions": persona_meds[:3],  # Top 3 for this specialty
                "note": f"Based on consultation, consider: {', '.join(persona_meds[:2])}",
                "consultation_excerpt": transcript_text[:100] + "...",
                "specialty_focus": PERSONAS.get(persona_key, PERSONAS["generalist"])["focus"]
            }

        # Check for lab needs
        lab_order = None
        lab_keywords = ['lab', 'test', 'blood', 'analyse', 'examination', 'scan', 'x-ray', 'imaging']
        
        if any(word in transcript_lower for word in lab_keywords):
            lab_order = {
                "status": "Suggested by " + PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
                "persona_specific_tests": persona_labs[:3],  # Top 3 for this specialty
                "note": f"Based on consultation, consider ordering: {', '.join(persona_labs[:2])}",
                "consultation_excerpt": transcript_text[:100] + "...",
                "specialty_focus": PERSONAS.get(persona_key, PERSONAS["generalist"])["focus"]
            }

        return {
            "prescription": prescription,
            "lab_order": lab_order,
            "persona_used": persona_key,
            "specialty": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
            "message": f"Recommendations from {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']} perspective"
        }


# --- PERSONA SUPPORT ---
# Copy this into every agent


# Create the root agent instance
root_agent = PrescriptionLabAgentWrapper()