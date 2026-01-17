# ClinicalDocumentationAgent - Generates SOAP notes and patient documentation
# With persona support and improved medical reasoning

import re
# --- PERSONA SUPPORT ---
# Copy this into every agent
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
from datetime import datetime

class ClinicalDocumentationAgentWrapper:
    def __init__(self, name="ClinicalDocumentationAgent"):
        self.name = name
        self.medical_knowledge = self._load_medical_knowledge()
        self.symptom_patterns = self._load_symptom_patterns()
        self.persona = None
        
    def _load_medical_knowledge(self):
        """Load medical knowledge base"""
        return {
            "cardiovascular": {
                "symptoms": ["chest pain", "palpitations", "dyspnea", "edema", "syncope"],
                "assessments": ["Cardiac exam", "ECG", "Cardiac enzymes", "Echocardiogram"],
                "plans": ["Cardiac monitoring", "Medication adjustment", "Cardiology referral"]
            },
            "respiratory": {
                "symptoms": ["cough", "dyspnea", "wheezing", "chest tightness", "sputum"],
                "assessments": ["Lung exam", "Chest X-ray", "PFTs", "O2 saturation"],
                "plans": ["Bronchodilators", "Antibiotics if indicated", "Pulmonary rehab"]
            },
            "gastrointestinal": {
                "symptoms": ["abdominal pain", "nausea", "vomiting", "diarrhea", "constipation"],
                "assessments": ["Abdominal exam", "Labs", "Imaging", "Endoscopy if needed"],
                "plans": ["Diet modification", "Medications", "GI follow-up"]
            },
            "neurological": {
                "symptoms": ["headache", "dizziness", "weakness", "numbness", "seizures"],
                "assessments": ["Neuro exam", "Imaging", "EEG", "Lumbar puncture"],
                "plans": ["Neurology consult", "Medications", "Rehab therapy"]
            },
            "psychiatric": {
                "symptoms": ["anxiety", "depression", "insomnia", "mood changes", "suicidal thoughts"],
                "assessments": ["Mental status exam", "PHQ-9", "GAD-7", "Risk assessment"],
                "plans": ["Therapy referral", "Medications", "Safety planning"]
            }
        }
    
    def _load_symptom_patterns(self):
        """Load pattern recognition for symptoms"""
        return {
            "acute": re.compile(r'\b(acute|sudden|severe|intense|sharp)\b', re.IGNORECASE),
            "chronic": re.compile(r'\b(chronic|persistent|long-standing|ongoing|recurrent)\b', re.IGNORECASE),
            "worsening": re.compile(r'\b(worsening|increasing|progressive|getting worse)\b', re.IGNORECASE),
            "improving": re.compile(r'\b(improving|better|decreasing|resolving)\b', re.IGNORECASE)
        }
    
    def set_persona(self, persona):
        """Set the medical persona for this agent"""
        self.persona = persona
    
    def _extract_symptoms(self, text):
        """Extract and categorize symptoms from text"""
        text_lower = text.lower()
        symptoms = []
        
        # Extract by system
        for system, data in self.medical_knowledge.items():
            for symptom in data["symptoms"]:
                if symptom in text_lower:
                    symptoms.append({
                        "symptom": symptom,
                        "system": system,
                        "description": f"{symptom} mentioned"
                    })
        
        # Extract severity and timing
        for symptom in symptoms:
            symptom_text = text_lower
            # Look for patterns
            for pattern_name, pattern in self.symptom_patterns.items():
                if pattern.search(symptom_text):
                    symptom["pattern"] = pattern_name
        
        return symptoms
    
    def _generate_system_specific_assessment(self, system, symptoms):
        """Generate assessment based on specific system"""
        if system not in self.medical_knowledge:
            return ""
        
        knowledge = self.medical_knowledge[system]
        assessment = []
        assessment.append(f"{system.capitalize()} considerations:")
        assessment.append(f"  - Symptoms: {', '.join([s['symptom'] for s in symptoms if s['system'] == system])}")
        
        if self.persona and hasattr(self.persona, 'persona_key'):
            # Add persona-specific considerations
            persona_focus = self.persona.specialty_terms.get('diagnostic_focus', [])
            if persona_focus:
                assessment.append(f"  - {self.persona.persona_data['name']} focus: {', '.join(persona_focus[:2])}")
        
        assessment.append(f"  - Recommended assessments: {', '.join(knowledge['assessments'][:3])}")
        
        return '\n'.join(assessment)
    
    def run(self, payload):
        """
        Generate SOAP note and patient explanation.
        payload can be transcript text or dict with transcript and persona
        """
        # Parse payload
        if isinstance(payload, dict):
            transcript_text = payload.get("transcript", "")
            persona_data = payload.get("persona", {})
        else:
            transcript_text = payload
            persona_data = {}
        
        if not transcript_text or len(transcript_text.strip()) < 20:
            return {
                "soap_note": {
                    "subjective": "Transcript too short for meaningful documentation.",
                    "objective": "Insufficient clinical data.",
                    "assessment": "Cannot generate assessment without adequate clinical information.",
                    "plan": "Please provide complete consultation transcript."
                },
                "patient_explanation": {
                    "summary": "Recording was too brief for documentation.",
                    "instructions": "Complete consultation needed.",
                    "follow_up": "N/A"
                },
                "systems_involved": [],
                "confidence": "low"
            }
        
        # Extract symptoms and systems
        symptoms = self._extract_symptoms(transcript_text)
        systems_involved = list(set([s["system"] for s in symptoms]))
        
        # Generate Subjective
        subjective = self._generate_subjective(transcript_text, symptoms)
        
        # Generate Objective
        objective = self._generate_objective(symptoms, systems_involved)
        
        # Generate Assessment
        assessment = self._generate_assessment(symptoms, systems_involved, transcript_text)
        
        # Generate Plan
        plan = self._generate_plan(symptoms, systems_involved, transcript_text)
        
        # Generate patient explanation
        patient_explanation = self._generate_patient_explanation(symptoms, transcript_text)
        
        return {
            "soap_note": {
                "subjective": subjective,
                "objective": objective,
                "assessment": assessment,
                "plan": plan
            },
            "patient_explanation": patient_explanation,
            "systems_involved": systems_involved,
            "symptoms_detected": [s["symptom"] for s in symptoms],
            "confidence": "medium" if symptoms else "low",
            "clinical_reasoning": self._generate_clinical_reasoning(symptoms, transcript_text),
            "formatted_content": self._format_soap_as_text({
                "subjective": subjective,
                "objective": objective,
                "assessment": assessment,
                "plan": plan
            })
        }
    
    def _generate_subjective(self, transcript, symptoms):
        """Generate subjective section"""
        parts = []
        
        parts.append("PATIENT REPORT:")
        parts.append(f"  Consultation transcript (excerpt):")
        parts.append(f"  '{transcript[:300]}{'...' if len(transcript) > 300 else ''}'")
        
        if symptoms:
            parts.append("\n  IDENTIFIED SYMPTOMS:")
            for symptom in symptoms:
                desc = f"    - {symptom['symptom']} ({symptom['system']})"
                if 'pattern' in symptom:
                    desc += f" [{symptom['pattern']}]"
                parts.append(desc)
        
        if self.persona and hasattr(self.persona, 'persona_data'):
            parts.append(f"\n  Perspective: {self.persona.persona_data['name']}")
            parts.append(f"  Approach: {self.persona.persona_data['approach']}")
        
        return '\n'.join(parts)
    
    def _generate_objective(self, symptoms, systems):
        """Generate objective section"""
        parts = []
        
        parts.append("CLINICAL FINDINGS TO DOCUMENT:")
        
        for system in systems:
            if system in self.medical_knowledge:
                knowledge = self.medical_knowledge[system]
                parts.append(f"\n  {system.upper()} EXAM:")
                for exam in knowledge["assessments"][:2]:
                    parts.append(f"    - {exam}")
        
        # Add persona-specific exams if available
        if self.persona and hasattr(self.persona, 'specialty_terms'):
            focus = self.persona.specialty_terms.get('diagnostic_focus', [])
            if focus:
                parts.append(f"\n  {self.persona.persona_data['name'].upper()} FOCUS:")
                for item in focus[:2]:
                    parts.append(f"    - {item}")
        
        parts.append("\n  VITAL SIGNS: [To be documented]")
        parts.append("  PHYSICAL EXAM: [To be completed]")
        
        return '\n'.join(parts)
    
    def _generate_assessment(self, symptoms, systems, transcript):
        """Generate assessment section"""
        parts = []
        
        parts.append("CLINICAL ASSESSMENT:")
        
        # System-specific assessments
        for system in systems:
            system_symptoms = [s for s in symptoms if s["system"] == system]
            if system_symptoms:
                parts.append(f"\n  {system.upper()}:")
                parts.append(self._generate_system_specific_assessment(system, system_symptoms))
        
        # Overall impression
        if symptoms:
            parts.append("\n  OVERALL IMPRESSION:")
            parts.append(f"    Patient presents with {len(symptoms)} symptom(s) across {len(systems)} system(s).")
            parts.append("    Further clinical correlation needed.")
        
        # Persona-specific assessment
        if self.persona:
            parts.append(self.persona.adapt_assessment(transcript, ""))
        
        return '\n'.join(parts)
    
    def _generate_plan(self, symptoms, systems, transcript):
        """Generate plan section"""
        parts = []
        
        parts.append("TREATMENT PLAN:")
        
        # System-specific plans
        for system in systems:
            if system in self.medical_knowledge:
                knowledge = self.medical_knowledge[system]
                parts.append(f"\n  {system.upper()} MANAGEMENT:")
                for plan_item in knowledge["plans"][:2]:
                    parts.append(f"    - {plan_item}")
        
        # General follow-up
        parts.append("\n  FOLLOW-UP:")
        parts.append("    - Schedule follow-up as clinically indicated")
        parts.append("    - Patient education provided")
        parts.append("    - Document in medical record")
        
        # Persona-specific plan
        if self.persona:
            parts.append("\n" + self.persona.adapt_plan(transcript, ""))
        
        return '\n'.join(parts)
    
    def _generate_patient_explanation(self, symptoms, transcript):
        """Generate patient-friendly explanation"""
        explanation = {}
        
        # Summary
        if symptoms:
            symptom_list = ', '.join(set([s['symptom'] for s in symptoms]))
            explanation['summary'] = f"During your consultation, we discussed: {symptom_list}."
        else:
            explanation['summary'] = "Thank you for your consultation. We've documented your visit."
        
        # Instructions
        instructions = [
            "Follow your doctor's recommendations carefully.",
            "Take medications as prescribed.",
            "Return if symptoms worsen or new symptoms develop.",
            "Keep follow-up appointments."
        ]
        
        if symptoms:
            # Add symptom-specific instructions
            for symptom in symptoms[:2]:  # Limit to first 2 symptoms
                if symptom['system'] == 'cardiovascular':
                    instructions.insert(0, "Monitor for chest pain or shortness of breath.")
                elif symptom['system'] == 'respiratory':
                    instructions.insert(0, "Use prescribed inhalers as directed.")
        
        explanation['instructions'] = '\n'.join(instructions)
        
        # Follow-up
        explanation['follow_up'] = "Follow-up as recommended by your doctor. Contact clinic if urgent concerns arise."
        
        return explanation
    
    def _generate_clinical_reasoning(self, symptoms, transcript):
        """Generate clinical reasoning narrative"""
        reasoning = []
        
        reasoning.append("CLINICAL REASONING:")
        reasoning.append("Based on the consultation transcript, here's the clinical reasoning:")
        
        if symptoms:
            reasoning.append(f"1. Identified {len(symptoms)} symptom(s) requiring evaluation.")
            reasoning.append("2. Symptoms suggest involvement of multiple physiological systems.")
            reasoning.append("3. Differential diagnosis should consider common conditions first.")
        
        if self.persona:
            reasoning.append(f"4. From {self.persona.persona_data['name']} perspective: Focus on {self.persona.persona_data['approach']}")
        
        return '\n'.join(reasoning)
    
    def _format_soap_as_text(self, soap_note):
        """Format SOAP note as readable text"""
        return f"""=== CLINICAL DOCUMENTATION ===

SUBJECTIVE:
{soap_note['subjective']}

OBJECTIVE:
{soap_note['objective']}

ASSESSMENT:
{soap_note['assessment']}

PLAN:
{soap_note['plan']}

=== END OF NOTE ==="""


# Create the root agent instance
root_agent = ClinicalDocumentationAgentWrapper()
