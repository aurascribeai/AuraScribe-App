# TaskManagerAgent - Manages follow-up tasks and reminders
# WITH PERSONA SUPPORT
# --- PERSONA SUPPORT ---
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
        # Duplicate removed

class TaskManagerAgentWrapper:
    def __init__(self, name="TaskManagerAgent"):
        self.name = name
        
        # Persona-specific tasks
        self.persona_tasks = {
            "generalist": [
                "Follow-up appointment",
                "Test results review",
                "Medication refill",
                "Preventive care reminder"
            ],
            "cardiologist": [
                "Cardiac test follow-up",
                "Medication adjustment appointment",
                "Device check (pacemaker, etc.)",
                "Cardiac rehab referral"
            ],
            "pulmonologist": [
                "Lung function retest",
                "Oxygen therapy assessment",
                "Smoking cessation follow-up",
                "Pulmonary rehab progress"
            ],
            "neurologist": [
                "Neurological exam follow-up",
                "Medication side effect check",
                "Imaging follow-up",
                "Therapy progress assessment"
            ]
        }
        
        # Urgency levels by specialty
        self.urgency_levels = {
            "cardiologist": {"chest pain": "URGENT", "palpitations": "SOON", "medication check": "ROUTINE"},
            "pulmonologist": {"shortness of breath": "URGENT", "cough": "SOON", "smoking follow": "ROUTINE"},
            "generalist": {"fever": "URGENT", "follow-up": "ROUTINE", "preventive": "SCHEDULED"}
        }

    def run(self, payload):
        """
        Extract and manage follow-up tasks.
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
                "tasks": [],
                "reminders": [],
                "message": "No transcript for task extraction",
                "persona_used": persona_key
            }

        transcript_lower = transcript_text.lower()
        tasks = []
        reminders = []
        
        # Get persona-specific task templates
        persona_task_templates = self.persona_tasks.get(persona_key, self.persona_tasks["generalist"])
        
        # Check for follow-up mentions
        follow_keywords = ['follow-up', 'revoir', 'return', 'suivi', 'appointment', 'rendez-vous']
        if any(word in transcript_lower for word in follow_keywords):
            tasks.append({
                "type": "follow_up",
                "description": persona_task_templates[0],  # First task for this specialty
                "priority": "normal",
                "reason": "Follow-up mentioned in consultation",
                "specialty_context": PERSONAS.get(persona_key, PERSONAS["generalist"])["focus"]
            })
        
        # Check for test results
        test_keywords = ['test', 'result', 'lab', 'analyse', 'scan', 'x-ray']
        if any(word in transcript_lower for word in test_keywords):
            reminders.append({
                "type": "results_review",
                "description": persona_task_templates[1],  # Second task for this specialty
                "priority": "normal",
                "reason": "Tests or results discussed",
                "specialty_context": PERSONAS.get(persona_key, PERSONAS["generalist"])["focus"]
            })
        
        # Check for medication management
        med_keywords = ['medication', 'medicament', 'pill', 'dose', 'prescription']
        if any(word in transcript_lower for word in med_keywords):
            tasks.append({
                "type": "medication_review",
                "description": persona_task_templates[2] if len(persona_task_templates) > 2 else "Medication management",
                "priority": "normal",
                "reason": "Medications discussed",
                "specialty_context": PERSONAS.get(persona_key, PERSONAS["generalist"])["focus"]
            })
        
        # Check for urgent issues
        urgency_rules = self.urgency_levels.get(persona_key, {})
        for symptom, urgency in urgency_rules.items():
            if symptom in transcript_lower:
                tasks.append({
                    "type": "urgent_follow",
                    "description": f"Follow up on {symptom} ({urgency})",
                    "priority": "high" if urgency == "URGENT" else "normal",
                    "reason": f"{symptom} mentioned - {urgency} priority for {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']}",
                    "specialty_context": PERSONAS.get(persona_key, PERSONAS["generalist"])["focus"]
                })
        
        # Add generic reminders if none found
        if not reminders:
            reminders.append({
                "type": "general_reminder",
                "description": "Documentation completion",
                "priority": "low",
                "reason": "Standard reminder for complete documentation",
                "specialty_context": PERSONAS.get(persona_key, PERSONAS["generalist"])["focus"]
            })

        return {
            "tasks": tasks,
            "reminders": reminders,
            "status": "tasks_extracted",
            "persona_used": persona_key,
            "specialty": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
            "total_tasks": len(tasks) + len(reminders),
            "note": f"Task management from {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']} perspective"
        }


# --- PERSONA SUPPORT ---
# Copy this into every agent

## Duplicate PERSONAS and apply_persona removed

# Create the root agent instance
root_agent = TaskManagerAgentWrapper()