# MADO_ReportingAgent.py - Official Santé Québec MADO Reporting Agent
# WITH PERSONA SUPPORT and REAL AS-770 FORM GENERATION

import os
import re
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import uuid

# Load MADO configuration from environment
MADO_CONFIG = {
    "form_url": os.getenv("MADO_FORM_URL", "https://www.msss.gouv.qc.ca/professionnels/maladies-a-declaration-obligatoire/mado/declarer-une-mado/"),
    "urgent_phone": os.getenv("MADO_URGENT_PHONE", "1-800-XXX-XXXX"),
    "form_number": os.getenv("MADO_AS770_FORM", "AS-770_DT9070")
}

# --- PERSONA SUPPORT ---
PERSONAS = {
    "generalist": {
        "name": "Médecin Généraliste",
        "focus": "Soins primaires et déclaration initiale",
        "responsibility": "Détection initiale et déclaration de toutes les MADO"
    },
    "cardiologist": {
        "name": "Cardiologue",
        "focus": "Maladies cardiovasculaires",
        "responsibility": "Déclaration des MADO cardiovasculaires et chimiques"
    },
    "pulmonologist": {
        "name": "Pneumologue",
        "focus": "Maladies respiratoires",
        "responsibility": "Déclaration des MADO respiratoires (TB, légionellose, etc.)"
    },
    "infectious_disease": {
        "name": "Médecin en Maladies Infectieuses",
        "focus": "Maladies infectieuses",
        "responsibility": "Déclaration des MADO infectieuses complexes"
    },
    "pediatrician": {
        "name": "Pédiatre",
        "focus": "Santé des enfants",
        "responsibility": "Déclaration des MADO pédiatriques (rougeole, coqueluche, etc.)"
    },
    "occupational_health": {
        "name": "Médecin du Travail",
        "focus": "Santé au travail",
        "responsibility": "Déclaration des MADO professionnelles (amiantose, silicose, etc.)"
    }
}

class MADOReportingAgentWrapper:
    def __init__(self, name="MADO_ReportingAgent"):
        self.name = name
        
        # OFFICIAL MADO DISEASE LIST from Santé Québec PDF
        # URGENT - Must call immediately
        self.urgent_diseases = {
            "botulisme": {"fr": "Botulisme", "en": "Botulism", "urgency": "URGENT", "timeframe": "Appeler immédiatement"},
            "choléra": {"fr": "Choléra", "en": "Cholera", "urgency": "URGENT", "timeframe": "Appeler immédiatement"},
            "fièvre jaune": {"fr": "Fièvre jaune", "en": "Yellow fever", "urgency": "URGENT", "timeframe": "Appeler immédiatement"},
            "fièvre ébola": {"fr": "Fièvre hémorragique Ébola", "en": "Ebola hemorrhagic fever", "urgency": "URGENT", "timeframe": "Appeler immédiatement"},
            "fièvre de marburg": {"fr": "Fièvre de Marburg", "en": "Marburg fever", "urgency": "URGENT", "timeframe": "Appeler immédiatement"},
            "maladie du charbon": {"fr": "Maladie du charbon (Anthrax)", "en": "Anthrax", "urgency": "URGENT", "timeframe": "Appeler immédiatement"},
            "peste": {"fr": "Peste", "en": "Plague", "urgency": "URGENT", "timeframe": "Appeler immédiatement"},
            "variole": {"fr": "Variole", "en": "Smallpox", "urgency": "URGENT", "timeframe": "Appeler immédiatement"}
        }
        
        # WITHIN 48 HOURS - Complete AS-770 form
        self.diseases_48h = {
            # Infectious Diseases
            "tuberculose": {"fr": "Tuberculose", "en": "Tuberculosis", "category": "Infectieuse", "specialties": ["pulmonologist", "generalist", "infectious_disease"]},
            "covid": {"fr": "COVID-19", "en": "COVID-19", "category": "Infectieuse", "specialties": ["all"]},
            "rougeole": {"fr": "Rougeole", "en": "Measles", "category": "Infectieuse", "specialties": ["pediatrician", "generalist"]},
            "coqueluche": {"fr": "Coqueluche", "en": "Pertussis", "category": "Infectieuse", "specialties": ["pediatrician", "generalist"]},
            "légionellose": {"fr": "Légionellose", "en": "Legionellosis", "category": "Infectieuse", "specialties": ["pulmonologist", "generalist"]},
            "hépatite a": {"fr": "Hépatite A (VHA)", "en": "Hepatitis A", "category": "Infectieuse", "specialties": ["generalist", "infectious_disease"]},
            "hépatite b": {"fr": "Hépatite B (VHB)", "en": "Hepatitis B", "category": "Infectieuse", "specialties": ["generalist", "infectious_disease"]},
            "hépatite c": {"fr": "Hépatite C (VHC)", "en": "Hepatitis C", "category": "Infectieuse", "specialties": ["generalist", "infectious_disease"]},
            "syphilis": {"fr": "Syphilis", "en": "Syphilis", "category": "Infectieuse", "specialties": ["generalist", "infectious_disease"]},
            "infection à méningocoques": {"fr": "Infection invasive à méningocoques", "en": "Meningococcal infection", "category": "Infectieuse", "specialties": ["generalist", "pediatrician", "infectious_disease"]},
            
            # Occupational Diseases
            "amiantose": {"fr": "Amiantose", "en": "Asbestosis", "category": "Professionnelle", "specialties": ["pulmonologist", "occupational_health"]},
            "silicose": {"fr": "Silicose", "en": "Silicosis", "category": "Professionnelle", "specialties": ["pulmonologist", "occupational_health"]},
            "asthme professionnel": {"fr": "Asthme d'origine professionnelle", "en": "Occupational asthma", "category": "Professionnelle", "specialties": ["pulmonologist", "occupational_health"]},
            
            # Chemical Exposures
            "intoxication au monoxyde de carbone": {"fr": "Intoxication au monoxyde de carbone", "en": "Carbon monoxide poisoning", "category": "Chimique", "specialties": ["generalist", "occupational_health", "cardiologist"]},
            "exposition au plomb": {"fr": "Exposition au plomb", "en": "Lead exposure", "category": "Chimique", "specialties": ["generalist", "occupational_health", "pediatrician"]},
            
            # Vector-borne
            "maladie de lyme": {"fr": "Maladie de Lyme", "en": "Lyme disease", "category": "Vectorielle", "specialties": ["generalist", "infectious_disease"]},
            "virus du nil occidental": {"fr": "Infection par le virus du Nil occidental", "en": "West Nile virus infection", "category": "Vectorielle", "specialties": ["generalist", "infectious_disease"]},
            
            # Food/Water borne
            "salmonellose": {"fr": "Salmonellose", "en": "Salmonellosis", "category": "Alimentaire", "specialties": ["generalist", "infectious_disease"]},
            "toxi-infection alimentaire": {"fr": "Toxi-infection alimentaire", "en": "Food poisoning", "category": "Alimentaire", "specialties": ["generalist", "infectious_disease"]}
        }
        
        # Additional keywords that might indicate MADO
        self.related_keywords = {
            "fièvre + voyage": ["paludisme", "dengue", "chikungunya"],
            "éruption cutanée + fièvre": ["rougeole", "rubéole", "varicelle"],
            "toux persistante": ["tuberculose", "coqueluche"],
            "diarrhée sanglante": ["shigellose", "E. coli", "campylobactériose"],
            "méningite": ["méningocoque", "haemophilus", "pneumocoque"]
        }
        
        # Regional DSP contacts (you can expand this from your mado.env)
        self.regional_contacts = {
            "montreal": {"phone": "514-528-2400", "region": "Montréal"},
            "quebec": {"phone": "418-644-4545", "region": "Capitale-Nationale"},
            "outaouais": {"phone": "819-771-2777", "region": "Outaouais"},
            "laval": {"phone": "450-978-8000", "region": "Laval"},
            "monteregie": {"phone": "450-928-6777", "region": "Montérégie"}
        }
    
    def _detect_postal_code_region(self, postal_code: str) -> str:
        """Determine region from postal code"""
        if not postal_code:
            return "montreal"  # Default
        
        first_char = postal_code[0].upper()
        if first_char == 'H':  # Montreal
            return "montreal"
        elif first_char == 'G':  # Quebec City area
            return "quebec"
        elif first_char == 'J':  # Montérégie, Laurentides, Lanaudière
            return "monteregie"
        elif first_char in ['K', 'L']:  # Outaouais, Laurentides
            return "outaouais"
        else:
            return "montreal"  # Default
    
    def _extract_patient_info(self, transcript: str) -> Dict:
        """Extract patient information from transcript"""
        info = {
            "full_name": "",
            "ramq": "",
            "dob": "",
            "postal_code": "",
            "phone": "",
            "profession": ""
        }
        
        # Look for RAMQ format: 4 letters, 8 numbers
        ramq_pattern = r'[A-Z]{4}\s?\d{8}'
        ramq_match = re.search(ramq_pattern, transcript.upper())
        if ramq_match:
            info["ramq"] = ramq_match.group(0)
        
        # Look for postal code: A1A 1A1 format
        postal_pattern = r'[A-Z]\d[A-Z]\s?\d[A-Z]\d'
        postal_match = re.search(postal_pattern, transcript.upper())
        if postal_match:
            info["postal_code"] = postal_match.group(0)
        
        # Look for phone numbers
        phone_pattern = r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
        phone_match = re.search(phone_pattern, transcript)
        if phone_match:
            info["phone"] = phone_match.group(0)
        
        # Look for date of birth
        dob_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b'
        dob_match = re.search(dob_pattern, transcript)
        if dob_match:
            info["dob"] = dob_match.group(1)
        
        return info
    
    def _detect_disease_mentions(self, transcript_lower: str) -> List[Dict]:
        """Detect all MADO disease mentions in transcript"""
        detected = []
        
        # Check urgent diseases
        for keyword, disease_info in self.urgent_diseases.items():
            if keyword in transcript_lower:
                detected.append({
                    "name_fr": disease_info["fr"],
                    "name_en": disease_info["en"],
                    "category": "URGENT",
                    "timeframe": disease_info["timeframe"],
                    "action": "APPELER IMMÉDIATEMENT DSP + DSP National",
                    "confidence": "high"
                })
        
        # Check 48-hour diseases
        for keyword, disease_info in self.diseases_48h.items():
            if keyword in transcript_lower:
                detected.append({
                    "name_fr": disease_info["fr"],
                    "name_en": disease_info["en"],
                    "category": disease_info["category"],
                    "timeframe": "48 heures",
                    "action": "Compléter formulaire AS-770",
                    "confidence": "high",
                    "relevant_specialties": disease_info["specialties"]
                })
        
        # Check related keyword combinations
        for pattern, diseases in self.related_keywords.items():
            keywords = pattern.split(' + ')
            if all(keyword in transcript_lower for keyword in keywords):
                for disease in diseases:
                    if disease in self.diseases_48h:
                        disease_info = self.diseases_48h[disease]
                        detected.append({
                            "name_fr": disease_info["fr"],
                            "name_en": disease_info["en"],
                            "category": disease_info["category"],
                            "timeframe": "48 heures",
                            "action": "Compléter formulaire AS-770",
                            "confidence": "medium",
                            "reason": f"Combinaison de symptômes: {pattern}",
                            "relevant_specialties": disease_info["specialties"]
                        })
        
        return detected
    
    def _generate_as770_form_data(self, disease: Dict, patient_info: Dict, persona_key: str) -> Dict:
        """Generate data for AS-770 form"""
        
        # Determine region from postal code
        region = self._detect_postal_code_region(patient_info.get("postal_code", ""))
        regional_contact = self.regional_contacts.get(region, self.regional_contacts["montreal"])
        
        # Current date
        today = datetime.now()
        
        # Generate form data structure matching AS-770 form
        form_data = {
            "formulaire": {
                "numero": MADO_CONFIG["form_number"],
                "version": "2024-06",
                "url": MADO_CONFIG["form_url"]
            },
            "section_patient": {
                "nom_prenom": patient_info.get("full_name", "À compléter"),
                "num_assurance_maladie": patient_info.get("ramq", ""),
                "date_naissance": patient_info.get("dob", ""),
                "adresse": patient_info.get("address", "À compléter"),
                "ville": patient_info.get("city", "À compléter"),
                "code_postal": patient_info.get("postal_code", ""),
                "telephone": patient_info.get("phone", ""),
                "sexe": patient_info.get("sexe", "À préciser"),
                "profession": patient_info.get("profession", "")
            },
            "section_mado": {
                "nom_mado": disease["name_fr"],
                "date_debut": today.strftime("%Y-%m-%d"),  # Default to today
                "prelevement_laboratoire": {
                    "soumis": "À déterminer",
                    "date_prelevement": "",
                    "nom_laboratoire": ""
                }
            },
            "section_transmission_sanguine": {
                "applicable": self._is_blood_transmissible(disease["name_fr"]),
                "questions": {
                    "don_sang": "À déterminer",
                    "recu_sang": "À déterminer",
                    "don_organes": "À déterminer",
                    "recu_organes": "À déterminer"
                }
            },
            "section_syphilis": {
                "applicable": disease["name_fr"].lower() == "syphilis",
                "stade": "À déterminer"
            },
            "section_declarant": {
                "nom": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
                "num_permis": "PERMIS-AURA-2024",
                "telephone": "(514) 555-AURA",
                "adresse": "Clinique Aura, Montréal",
                "ville": "Montréal",
                "code_postal": "H3A 1A1",
                "signature": "Signature électronique AuraScribe",
                "date_declaration": today.strftime("%Y-%m-%d")
            },
            "coordonnees_dsp": {
                "region": regional_contact["region"],
                "telephone": regional_contact["phone"],
                "urgence": MADO_CONFIG["urgent_phone"]
            },
            "instructions": {
                "urgence": disease["category"] == "URGENT",
                "action_requise": disease["action"],
                "delai": disease["timeframe"],
                "formulaire_complet": "Formulaire AS-770 disponible à: " + MADO_CONFIG["form_url"]
            }
        }
        
        return form_data
    
    def _is_blood_transmissible(self, disease_name_fr: str) -> bool:
        """Check if disease requires blood/organ donation questions"""
        blood_transmissible = [
            "VIH", "SIDA", "hépatite", "syphilis", "malaria", "babésiose",
            "brucellose", "fièvre q", "maladie de chagas", "rage",
            "creutzfeldt-jakob", "arboviroses"
        ]
        
        disease_lower = disease_name_fr.lower()
        return any(term in disease_lower for term in blood_transmissible)
    
    def _generate_persona_specific_advice(self, disease: Dict, persona_key: str) -> List[str]:
        """Generate specialty-specific advice for reporting"""
        persona = PERSONAS.get(persona_key, PERSONAS["generalist"])
        advice = []
        
        advice.append(f"En tant que {persona['name']}, vous êtes responsable de: {persona['responsibility']}")
        
        if persona_key == "generalist":
            advice.append("1. Confirmer le diagnostic clinique")
            advice.append("2. Effectuer la déclaration initiale")
            advice.append("3. Référer au spécialiste si nécessaire")
            advice.append("4. Assurer le suivi avec le patient")
        
        elif persona_key == "pulmonologist" and disease["category"] in ["Infectieuse", "Professionnelle"]:
            advice.append("1. Confirmer le diagnostic par tests appropriés (radiographie, culture, etc.)")
            advice.append("2. Documenter l'exposition professionnelle si applicable")
            advice.append("3. Initier le traitement spécifique")
            advice.append("4. Coordonner avec la santé publique pour l'isolement respiratoire si nécessaire")
        
        elif persona_key == "infectious_disease":
            advice.append("1. Confirmer le diagnostic par tests de laboratoire")
            advice.append("2. Évaluer la nécessité d'isolement")
            advice.append("3. Initier le traitement antimicrobien approprié")
            advice.append("4. Identifier les contacts à risque")
        
        elif persona_key == "occupational_health" and disease["category"] == "Professionnelle":
            advice.append("1. Documenter l'exposition professionnelle en détail")
            advice.append("2. Notifier la CNESST si applicable")
            advice.append("3. Évaluer le milieu de travail")
            advice.append("4. Recommander des mesures préventives")
        
        return advice
    
    def run(self, payload):
        """
        Official MADO detection and reporting agent.
        Generates complete AS-770 form data for Santé Québec.
        """
        # Parse payload
        if isinstance(payload, dict):
            transcript_text = payload.get("transcript", "")
            persona_key = payload.get("persona", "generalist")
            patient_context = payload.get("patient_context", {})
        else:
            transcript_text = payload
            persona_key = "generalist"
            patient_context = {}
        
        if not transcript_text or len(transcript_text.strip()) < 20:
            return {
                "mado_detected": False,
                "report_required": False,
                "message": "Transcription trop courte pour l'analyse MADO",
                "persona_used": persona_key
            }
        
        transcript_lower = transcript_text.lower()
        
        # Extract patient info from transcript and context
        extracted_info = self._extract_patient_info(transcript_text)
        # Merge with provided context
        patient_info = {**extracted_info, **patient_context}
        
        # Detect diseases
        detected_diseases = self._detect_disease_mentions(transcript_lower)
        
        if not detected_diseases:
            return {
                "mado_detected": False,
                "report_required": False,
                "persona_used": persona_key,
                "specialiste": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"],
                "note": f"Aucune MADO détectée. Analyse effectuée par {PERSONAS.get(persona_key, PERSONAS['generalist'])['name']}",
                "verification_recommandee": [
                    "Vérifier les symptômes évocateurs de MADO",
                    "Consulter la liste officielle des MADO si doute",
                    "En cas de suspicion, contacter la DSP régionale"
                ]
            }
        
        # Process detected diseases
        reports = []
        for disease in detected_diseases:
            # Check if this persona should report this disease
            should_report = False
            if "relevant_specialties" in disease:
                if "all" in disease["relevant_specialties"] or persona_key in disease["relevant_specialties"]:
                    should_report = True
            else:
                should_report = True  # Default to true if no specialty specified
            
            if should_report:
                # Generate AS-770 form data
                form_data = self._generate_as770_form_data(disease, patient_info, persona_key)
                
                # Generate persona-specific advice
                advice = self._generate_persona_specific_advice(disease, persona_key)
                
                report = {
                    "disease": disease,
                    "form_data": form_data,
                    "persona_advice": advice,
                    "report_id": f"MADO-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}",
                    "generated_at": datetime.now().isoformat()
                }
                reports.append(report)
        
        if reports:
            # Determine overall urgency
            has_urgent = any(r["disease"]["category"] == "URGENT" for r in reports)
            
            return {
                "mado_detected": True,
                "report_required": True,
                "reports": reports,
                "summary": {
                    "total_diseases": len(reports),
                    "has_urgent_cases": has_urgent,
                    "action_required": "APPEL IMMÉDIAT" if has_urgent else "FORMULAIRE AS-770 DANS 48H",
                    "persona_used": persona_key,
                    "specialiste": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"]
                },
                "next_steps": [
                    "1. Confirmer le diagnostic cliniquement",
                    "2. " + ("Appeler la DSP immédiatement" if has_urgent else "Compléter le formulaire AS-770"),
                    "3. Documenter la déclaration dans le dossier médical",
                    "4. Assurer le suivi avec le patient"
                ],
                "resources": {
                    "formulaire_as770": MADO_CONFIG["form_url"],
                    "liste_mado_complete": "https://www.msss.gouv.qc.ca/professionnels/maladies-a-declaration-obligatoire/mado/",
                    "contacts_dsp_regionaux": self.regional_contacts
                }
            }
        else:
            # Diseases detected but not relevant to this persona
            return {
                "mado_detected": True,
                "report_required": False,
                "message": "MADO détectée mais hors champ de compétence du spécialiste",
                "detected_diseases": [d["name_fr"] for d in detected_diseases],
                "recommandation": "Référer au médecin approprié ou déclarer comme généraliste",
                "persona_used": persona_key,
                "specialiste": PERSONAS.get(persona_key, PERSONAS["generalist"])["name"]
            }


# Create the root agent instance
root_agent = MADOReportingAgentWrapper()

# Optional: Test function
if __name__ == "__main__":
    # Test with sample transcript
    test_transcript = """
    Patient Jean Dupont, RAMQ DUJP12345678, né le 15/03/1975.
    Adresse: 123 rue Principale, Montréal, H3A 1A1, tel: 514-123-4567.
    Présente une toux productive depuis 3 semaines avec fièvre nocturne.
    Perte de poids de 5 kg. Rayons X suggestifs de tuberculose pulmonaire.
    Prélèvements envoyés au laboratoire de microbiologie.
    """
    
    agent = MADOReportingAgentWrapper()
    result = agent.run({
        "transcript": test_transcript,
        "persona": "pulmonologist",
        "patient_context": {
            "full_name": "Jean Dupont",
            "sexe": "M",
            "profession": "Enseignant"
        }
    })
    
    print("Test Result:")
    print(json.dumps(result, indent=2, ensure_ascii=False))