# CustomFormAgent - Generates custom medical forms
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

class CustomFormAgentWrapper:
    def __init__(self, name="CustomFormAgent"):
        self.name = name
        
        # Persona-specific forms
        self.persona_forms = {
            "generalist": [
                "Work/School absence note",
                "Medical certificate",
                "Insurance form",
                "Driver's license medical form"
            ],
            "cardiologist": [
                "Cardiac clearance for surgery",
                "Cardiac device form",
                "Cardiac rehab referral",
                "Cardiac disability assessment"
            ],
            "pulmonologist": [
                "Oxygen prescription form",
                "Pulmonary disability form",
                "CPAP/BiPAP order",
                "Pulmonary rehab referral"
            ],
            "neurologist": [
                "Neurological disability form",
                "Driving assessment form",
                "Work restrictions form",
                "Therapy referral form"
            ]
        }
        
        # Form triggers by keyword
        self.form_triggers = {
            "work": ["travail", "job", "employment", "work", "employeur"],
            "school": ["ecole", "school", "university", "college", "student"],
            "insurance": ["insurance", "assurance", "claim", "reclamation"],
            "disability": ["disability", "invalidite", "incapacity", "handicap"]
        }

    def run(self, payload):
        """
        Generate custom forms based on consultation.
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
                "forms_generated": [],
                "status": "no_forms_needed",
                "persona_used": persona_key
            }

        transcript_lower = transcript_text.lower()
        forms = []
        
        # Get persona-specific forms
        persona_form_templates = self.persona_forms.get(persona_key, self.persona_forms["generalist"])
        
        # Check for form triggers
        for form_type, keywords in self.form_triggers.items():
            if any(keyword in transcript_lower for keyword in keywords):
                # Find appropriate form for this persona
                form_description = ""
                if form_type == "work":
                    form_description = persona_form_templates[0] if len(persona_form_templates) > 0 else "Work-related form"
                elif form_type == "school":
                    form_description = persona_form_templates[1] if len(persona_form_templates) > 1 else "School-related form"
                elif form_type == "insurance":
                    form_description = persona_form_templates[2] if len(persona_form_templates) > 2 else "Insurance form"
                elif form_type == "disability":
                    form_description = persona_form_templates[3] if len(persona_form_templates) > 3 else "Disability form"
                
                forms.append({
                    "type": form_type + "_form",
                    "status": "template_available",
                    "description": form_description,
                    "trigger": f"'{form_type}' mentioned in consultation",
                    "specialty_context": f"{PERSONAS.get(persona_key, PERSONAS['generalist'])['name']} form",
                    "recommended_action": f"Complete {form_description} for patient"
                })
        
        # Check for referral needs (common across specialties)
        referral_keywords = ['referral', 'specialiste', 'specialist', 'reference', 'consultation']
        if any(word in transcript_lower for word in referral_keywords):
            forms.append({
                "type": "referral_form",
                "status": "template_ready",
                "description": f"Referral letter from {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']}",
                "trigger": "Referral discussion detected",
                "specialty_context": f"{PERSONAS.get(persona_key, PERSONAS['generalist'])['name']} to specialist referral",
                "recommended_action": "Complete referral form with clinical details"
            })
        
        # If no forms detected but consultation seems complex, suggest general form
        if not forms and len(transcript_text.split()) > 50:  # If transcript has more than 50 words
            forms.append({
                "type": "general_medical_form",
                "status": "suggested",
                "description": persona_form_templates[0] if persona_form_templates else "Medical documentation form",
                "trigger": "Complex consultation detected",
                "specialty_context": f"Standard {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']} form",
                "recommended_action": "Consider if any forms needed for this case"
            })

        return {
            "forms_generated": forms,
            "status": "ready" if forms else "no_forms_needed",
            "persona_used": persona_key,
            "specialty": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
            "forms_available": persona_form_templates,
            "note": f"Form detection from {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']} perspective"
        }



# Create the root agent instance
root_agent = CustomFormAgentWrapper()