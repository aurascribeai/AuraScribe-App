# medical_persona_system.py
# Central persona system for medical specialties

class MedicalPersona:
    """Defines the persona (medical specialty) for agents"""
    
    PERSONAS = {
        "generalist": {
            "name": "General Practitioner",
            "description": "Primary care physician with broad medical knowledge",
            "specialties": ["General Medicine", "Family Medicine"],
            "approach": "Holistic, comprehensive care",
            "typical_conditions": ["Hypertension", "Diabetes", "URI", "UTI", "Anxiety", "Depression"],
            "diagnostic_focus": ["Broad differential", "Primary care management"],
            "treatment_style": ["Evidence-based guidelines", "Conservative approach"],
            "language_style": "Clear, patient-friendly explanations"
        },
        "cardiologist": {
            "name": "Cardiologist",
            "description": "Specialist in heart and cardiovascular system",
            "specialties": ["Cardiology", "Cardiovascular Diseases"],
            "approach": "Detailed cardiac assessment",
            "typical_conditions": ["CHF", "Arrhythmias", "CAD", "Hypertension", "Valvular diseases"],
            "diagnostic_focus": ["ECG interpretation", "Echocardiography", "Cardiac biomarkers"],
            "treatment_style": ["Anticoagulants", "Beta-blockers", "Interventional procedures"],
            "language_style": "Technical, precise cardiac terminology"
        },
        "pulmonologist": {
            "name": "Pulmonologist",
            "description": "Specialist in respiratory system",
            "specialties": ["Pulmonology", "Respiratory Medicine"],
            "approach": "Comprehensive respiratory evaluation",
            "typical_conditions": ["Asthma", "COPD", "Pneumonia", "Lung cancer", "Sleep apnea"],
            "diagnostic_focus": ["PFTs", "Chest imaging", "Bronchoscopy"],
            "treatment_style": ["Inhalers", "Oxygen therapy", "Pulmonary rehab"],
            "language_style": "Focus on respiratory function and oxygenation"
        },
        "neurologist": {
            "name": "Neurologist",
            "description": "Specialist in nervous system",
            "specialties": ["Neurology", "Neuroscience"],
            "approach": "Detailed neurological exam",
            "typical_conditions": ["Migraine", "Stroke", "Epilepsy", "Parkinson's", "Multiple sclerosis"],
            "diagnostic_focus": ["Neuroimaging", "EMG/NCV", "EEG"],
            "treatment_style": ["Anticonvulsants", "Neuroprotective agents", "Rehab therapy"],
            "language_style": "Detailed neurological descriptions"
        },
        "gastroenterologist": {
            "name": "Gastroenterologist",
            "description": "Specialist in digestive system",
            "specialties": ["Gastroenterology", "Digestive Diseases"],
            "approach": "Systematic GI evaluation",
            "typical_conditions": ["GERD", "IBD", "Hepatitis", "Pancreatitis", "Colorectal cancer"],
            "diagnostic_focus": ["Endoscopy", "Colonoscopy", "Liver function tests"],
            "treatment_style": ["PPIs", "Immunomodulators", "Dietary management"],
            "language_style": "Focus on digestive symptoms and patterns"
        },
        "pediatrician": {
            "name": "Pediatrician",
            "description": "Specialist in child health",
            "specialties": ["Pediatrics", "Child Development"],
            "approach": "Age-appropriate assessment",
            "typical_conditions": ["Viral infections", "Asthma", "ADHD", "Developmental delays"],
            "diagnostic_focus": ["Growth charts", "Developmental milestones", "Pediatric labs"],
            "treatment_style": ["Weight-based dosing", "Parent education", "Preventive care"],
            "language_style": "Parent-friendly, developmental focus"
        },
        "psychiatrist": {
            "name": "Psychiatrist",
            "description": "Specialist in mental health",
            "specialties": ["Psychiatry", "Mental Health"],
            "approach": "Bio-psycho-social model",
            "typical_conditions": ["Depression", "Anxiety", "Bipolar", "Schizophrenia", "PTSD"],
            "diagnostic_focus": ["DSM-5 criteria", "Mental status exam", "Functional assessment"],
            "treatment_style": ["Psychotropics", "Psychotherapy", "Crisis management"],
            "language_style": "Therapeutic, non-judgmental"
        }
    }
    
    def __init__(self, persona_key="generalist"):
        self.persona_key = persona_key
        self.persona_data = self.PERSONAS.get(persona_key, self.PERSONAS["generalist"])
        self.specialty_terms = self._build_specialty_terms()
        
    def _build_specialty_terms(self):
        """Build a dictionary of specialty-specific medical terms"""
        specialty_terms = {
            "generalist": {
                "assessment_keywords": ["primary care", "general practice", "comprehensive", "preventive"],
                "treatment_keywords": ["lifestyle", "conservative", "monitoring", "follow-up"],
                "diagnostic_focus": ["baseline tests", "screening", "risk factors"]
            },
            "cardiologist": {
                "assessment_keywords": ["ejection fraction", "cardiac output", "arrhythmia", "ischemia"],
                "treatment_keywords": ["beta-blocker", "ACE inhibitor", "statin", "anticoagulation"],
                "diagnostic_focus": ["ECG", "echocardiogram", "troponin", "BNP"]
            },
            "pulmonologist": {
                "assessment_keywords": ["FEV1", "FVC", "oxygenation", "ventilation"],
                "treatment_keywords": ["bronchodilator", "corticosteroid", "oxygen", "CPAP"],
                "diagnostic_focus": ["chest X-ray", "PFTs", "ABG", "spirometry"]
            },
            "neurologist": {
                "assessment_keywords": ["cranial nerves", "motor strength", "sensation", "coordination"],
                "treatment_keywords": ["anticonvulsant", "triptan", "neuroprotective", "rehabilitation"],
                "diagnostic_focus": ["MRI brain", "EEG", "EMG", "lumbar puncture"]
            }
        }
        return specialty_terms.get(self.persona_key, specialty_terms["generalist"])
    
    def adapt_assessment(self, text, base_assessment):
        """Adapt assessment based on persona"""
        persona = self.persona_data
        
        adapted = f"Assessment from {persona['name']} perspective:\n"
        adapted += f"Specialty focus: {', '.join(persona['specialties'])}\n\n"
        adapted += base_assessment + "\n\n"
        adapted += f"Considerations from {persona['name']}:\n"
        adapted += f"- Focus on {persona['approach']}\n"
        adapted += f"- Typical conditions in this specialty: {', '.join(persona['typical_conditions'][:5])}\n"
        adapted += f"- Diagnostic approach: {', '.join(persona['diagnostic_focus'][:3])}\n"
        
        return adapted
    
    def adapt_plan(self, text, base_plan):
        """Adapt treatment plan based on persona"""
        persona = self.persona_data
        
        adapted = f"Treatment Plan ({persona['name']}):\n"
        adapted += base_plan + "\n\n"
        adapted += "Specialty-specific considerations:\n"
        for treatment in persona['treatment_style'][:3]:
            adapted += f"- {treatment}\n"
        
        return adapted
    
    def get_persona_summary(self):
        """Get summary of current persona"""
        return {
            "persona_key": self.persona_key,
            "persona_name": self.persona_data["name"],
            "description": self.persona_data["description"],
            "specialties": self.persona_data["specialties"],
            "language_style": self.persona_data["language_style"]
        }