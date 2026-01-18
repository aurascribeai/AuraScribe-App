# AskAura_agent - Interactive assistant for medical queries
# Enhanced version with improved clinical reasoning and bilingual support
import re
from datetime import datetime

# --- PERSONA SUPPORT ---
PERSONAS = {
    "generalist": {
        "name": "Médecin Généraliste",
        "name_en": "General Practitioner",
        "focus": "Soins primaires et médecine familiale",
        "focus_en": "Primary care and family medicine",
        "expertise": ["preventive care", "chronic disease management", "initial diagnosis"]
    },
    "cardiologist": {
        "name": "Cardiologue",
        "name_en": "Cardiologist",
        "focus": "Maladies cardiovasculaires",
        "focus_en": "Cardiovascular diseases",
        "expertise": ["heart failure", "arrhythmias", "coronary artery disease", "hypertension"]
    },
    "pulmonologist": {
        "name": "Pneumologue",
        "name_en": "Pulmonologist",
        "focus": "Maladies respiratoires",
        "focus_en": "Respiratory diseases",
        "expertise": ["COPD", "asthma", "pneumonia", "lung cancer", "sleep apnea"]
    },
    "neurologist": {
        "name": "Neurologue",
        "name_en": "Neurologist",
        "focus": "Système nerveux",
        "focus_en": "Nervous system",
        "expertise": ["stroke", "epilepsy", "headache", "Parkinson's", "multiple sclerosis"]
    },
    "psychiatrist": {
        "name": "Psychiatre",
        "name_en": "Psychiatrist",
        "focus": "Santé mentale",
        "focus_en": "Mental health",
        "expertise": ["depression", "anxiety", "bipolar disorder", "schizophrenia", "PTSD"]
    },
    "pediatrician": {
        "name": "Pédiatre",
        "name_en": "Pediatrician",
        "focus": "Santé des enfants",
        "focus_en": "Child health",
        "expertise": ["growth", "development", "vaccinations", "pediatric infections"]
    }
}

def apply_persona(persona_key="generalist", language="fr"):
    """Apply persona to the agent's responses"""
    persona = PERSONAS.get(persona_key, PERSONAS["generalist"])
    if language == "fr":
        return f"\n[Perspective: {persona['name']} - {persona['focus']}]\n"
    return f"\n[Perspective: {persona['name_en']} - {persona['focus_en']}]\n"

class AskAuraAgentWrapper:
    def __init__(self, name="AskAura"):
        self.name = name
        self.persona_key = "generalist"

        # Enhanced medical contexts with clinical decision support
        self.medical_contexts = {
            # Pain assessment
            "douleur": {
                "questions": ["localisation", "intensité", "durée", "caractère", "facteurs aggravants", "irradiation"],
                "recommendations": [
                    "Évaluer l'échelle de douleur (0-10)",
                    "Rechercher les signes d'urgence (douleur thoracique, abdomen aigu)",
                    "Considérer les diagnostics différentiels selon la localisation",
                    "Documenter le traitement antalgique actuel et son efficacité",
                    "Évaluer l'impact fonctionnel sur les activités quotidiennes"
                ],
                "red_flags": ["douleur thoracique", "céphalée explosive", "douleur abdominale sévère", "douleur au repos"],
                "differential_diagnosis": ["musculoskeletal", "neuropathic", "visceral", "inflammatory"]
            },
            "pain": {
                "questions": ["location", "intensity", "duration", "character", "aggravating factors", "radiation"],
                "recommendations": [
                    "Assess pain scale (0-10)",
                    "Check for red flags (chest pain, acute abdomen)",
                    "Consider differential diagnosis based on location",
                    "Document current analgesic treatment and efficacy",
                    "Evaluate functional impact on daily activities"
                ],
                "red_flags": ["chest pain", "thunderclap headache", "severe abdominal pain", "pain at rest"],
                "differential_diagnosis": ["musculoskeletal", "neuropathic", "visceral", "inflammatory"]
            },
            # Cardiovascular
            "cardiaque": {
                "questions": ["dyspnée", "palpitations", "œdème", "syncope", "douleur thoracique"],
                "recommendations": [
                    "ECG 12 dérivations",
                    "Évaluation des signes vitaux et saturation",
                    "Auscultation cardiaque et pulmonaire",
                    "Évaluer les facteurs de risque cardiovasculaire"
                ],
                "red_flags": ["douleur thoracique à l'effort", "syncope", "dyspnée de repos"],
                "differential_diagnosis": ["SCA", "insuffisance cardiaque", "arythmie", "EP"]
            },
            "cardiac": {
                "questions": ["dyspnea", "palpitations", "edema", "syncope", "chest pain"],
                "recommendations": [
                    "12-lead ECG",
                    "Vital signs and oxygen saturation",
                    "Cardiac and pulmonary auscultation",
                    "Assess cardiovascular risk factors"
                ],
                "red_flags": ["exertional chest pain", "syncope", "dyspnea at rest"],
                "differential_diagnosis": ["ACS", "heart failure", "arrhythmia", "PE"]
            },
            "toux": {
                "questions": ["durée", "productivité", "fièvre associée", "dyspnée", "facteurs déclenchants"],
                "recommendations": [
                    "Évaluer la saturation en oxygène",
                    "Auscultation pulmonaire complète",
                    "Considérer une radiographie thoracique si durée > 3 semaines",
                    "Rechercher des signes d'infection (fièvre, expectorations)"
                ],
                "red_flags": ["hémoptysie", "dyspnée sévère", "fièvre persistante"]
            },
            "cough": {
                "questions": ["duration", "productivity", "associated fever", "dyspnea", "triggers"],
                "recommendations": [
                    "Assess oxygen saturation",
                    "Complete lung auscultation",
                    "Consider chest X-ray if duration > 3 weeks",
                    "Look for signs of infection (fever, sputum)"
                ],
                "red_flags": ["hemoptysis", "severe dyspnea", "persistent fever"]
            },
            "fièvre": {
                "questions": ["durée", "pic thermique", "symptômes associés", "voyage récent", "immunosuppression"],
                "recommendations": [
                    "Vérifier les constantes vitales complètes",
                    "Rechercher un foyer infectieux",
                    "Planifier un bilan biologique (NFS, CRP, hémocultures)",
                    "Évaluer le risque de sepsis"
                ],
                "red_flags": ["hypotension", "confusion", "déshydratation sévère"]
            },
            "fever": {
                "questions": ["duration", "peak temperature", "associated symptoms", "recent travel", "immunosuppression"],
                "recommendations": [
                    "Check complete vital signs",
                    "Search for infection focus",
                    "Plan laboratory workup (CBC, CRP, blood cultures)",
                    "Assess sepsis risk"
                ],
                "red_flags": ["hypotension", "confusion", "severe dehydration"]
            },
            "rash": {
                "questions": ["distribution", "appearance", "pruritus", "onset", "associated symptoms"],
                "recommendations": [
                    "Describe lesion morphology precisely",
                    "Check for systemic symptoms",
                    "Consider infectious vs allergic etiology",
                    "Assess for meningeal signs if petechial"
                ],
                "red_flags": ["fever with rash", "rapid progression", "mucosal involvement"]
            },
            "eruption": {
                "questions": ["distribution", "aspect", "prurit", "début", "symptômes associés"],
                "recommendations": [
                    "Décrire précisément la morphologie des lésions",
                    "Rechercher des symptômes systémiques",
                    "Considérer une étiologie infectieuse vs allergique",
                    "Évaluer les signes méningés si pétéchies"
                ],
                "red_flags": ["fièvre avec éruption", "progression rapide", "atteinte muqueuse"],
                "differential_diagnosis": ["viral exanthem", "drug reaction", "autoimmune", "bacterial"]
            },
            # Mental health
            "anxiété": {
                "questions": ["durée", "fréquence des crises", "impact fonctionnel", "idées suicidaires", "consommation substances"],
                "recommendations": [
                    "Utiliser l'échelle GAD-7 pour quantifier",
                    "Évaluer le risque suicidaire",
                    "Explorer les comorbidités (dépression, insomnie)",
                    "Considérer thérapie cognitivo-comportementale",
                    "Discuter options pharmacologiques si indiqué"
                ],
                "red_flags": ["idées suicidaires", "automutilation", "psychose"],
                "differential_diagnosis": ["GAD", "trouble panique", "PTSD", "TOC"]
            },
            "anxiety": {
                "questions": ["duration", "panic attack frequency", "functional impact", "suicidal ideation", "substance use"],
                "recommendations": [
                    "Use GAD-7 scale for quantification",
                    "Assess suicidal risk",
                    "Explore comorbidities (depression, insomnia)",
                    "Consider cognitive behavioral therapy",
                    "Discuss pharmacological options if indicated"
                ],
                "red_flags": ["suicidal ideation", "self-harm", "psychosis"],
                "differential_diagnosis": ["GAD", "panic disorder", "PTSD", "OCD"]
            },
            "dépression": {
                "questions": ["durée des symptômes", "anhédonie", "troubles du sommeil", "idées suicidaires", "changement d'appétit"],
                "recommendations": [
                    "Utiliser l'échelle PHQ-9",
                    "Évaluation du risque suicidaire obligatoire",
                    "Explorer les facteurs déclenchants",
                    "Discuter les options de traitement (thérapie, médication)"
                ],
                "red_flags": ["idées suicidaires actives", "plan suicidaire", "psychose"],
                "differential_diagnosis": ["MDD", "trouble bipolaire", "dysthymie", "trouble d'adaptation"]
            },
            "depression": {
                "questions": ["symptom duration", "anhedonia", "sleep disturbance", "suicidal ideation", "appetite changes"],
                "recommendations": [
                    "Use PHQ-9 scale",
                    "Mandatory suicidal risk assessment",
                    "Explore triggering factors",
                    "Discuss treatment options (therapy, medication)"
                ],
                "red_flags": ["active suicidal ideation", "suicide plan", "psychosis"],
                "differential_diagnosis": ["MDD", "bipolar disorder", "dysthymia", "adjustment disorder"]
            },
            # Diabetes
            "diabète": {
                "questions": ["type de diabète", "contrôle glycémique (HbA1c)", "complications", "médication actuelle", "autosurveillance"],
                "recommendations": [
                    "Vérifier HbA1c récente",
                    "Dépistage des complications (néphropathie, rétinopathie, neuropathie)",
                    "Évaluation cardiovasculaire",
                    "Revoir les cibles glycémiques individualisées",
                    "Éducation sur l'hypoglycémie"
                ],
                "red_flags": ["acidocétose", "hypoglycémie sévère", "pied diabétique infecté"],
                "differential_diagnosis": ["Type 1", "Type 2", "LADA", "MODY"]
            },
            "diabetes": {
                "questions": ["diabetes type", "glycemic control (HbA1c)", "complications", "current medication", "self-monitoring"],
                "recommendations": [
                    "Check recent HbA1c",
                    "Screen for complications (nephropathy, retinopathy, neuropathy)",
                    "Cardiovascular assessment",
                    "Review individualized glycemic targets",
                    "Hypoglycemia education"
                ],
                "red_flags": ["DKA", "severe hypoglycemia", "infected diabetic foot"],
                "differential_diagnosis": ["Type 1", "Type 2", "LADA", "MODY"]
            }
        }

        # Evidence-based medicine resources
        self.ebm_resources = {
            "fr": {
                "guidelines": [
                    {"name": "Collège des médecins du Québec", "url": "http://www.cmq.org/"},
                    {"name": "INESSS - Guides de pratique", "url": "https://www.inesss.qc.ca/"},
                    {"name": "Santé Canada - Lignes directrices", "url": "https://www.canada.ca/fr/sante-canada.html"}
                ],
                "databases": [
                    {"name": "UpToDate (via institution)", "url": "https://www.uptodate.com/"},
                    {"name": "Cochrane Library", "url": "https://www.cochranelibrary.com/"},
                    {"name": "PubMed", "url": "https://pubmed.ncbi.nlm.nih.gov/"}
                ]
            },
            "en": {
                "guidelines": [
                    {"name": "CMA Practice Guidelines", "url": "https://joulecma.ca/cpg"},
                    {"name": "NICE Guidelines", "url": "https://www.nice.org.uk/guidance"},
                    {"name": "AHA/ACC Guidelines", "url": "https://www.acc.org/guidelines"}
                ],
                "databases": [
                    {"name": "UpToDate", "url": "https://www.uptodate.com/"},
                    {"name": "Cochrane Library", "url": "https://www.cochranelibrary.com/"},
                    {"name": "PubMed", "url": "https://pubmed.ncbi.nlm.nih.gov/"}
                ]
            }
        }
        
        self.general_recommendations = {
            "fr": [
                "Vérifier les constantes vitales et documenter toute anomalie",
                "Considérer les diagnostics différentiels pertinents",
                "Établir un plan de suivi approprié",
                "Documenter clairement les décisions cliniques"
            ],
            "en": [
                "Check vital signs and document any abnormalities",
                "Consider relevant differential diagnoses",
                "Establish appropriate follow-up plan",
                "Document clinical decisions clearly"
            ]
        }

    def _parse_input(self, payload):
        """Parse and validate input payload"""
        transcript = ""
        question = ""
        context = ""
        language = "fr"

        if isinstance(payload, dict):
            transcript = payload.get("transcript", "") or ""
            question = payload.get("question", "") or payload.get("message", "") or ""
            context = payload.get("context", "") or ""
            language = payload.get("language", "fr")
        elif isinstance(payload, str):
            transcript = payload
        else:
            transcript = str(payload)

        # Auto-detect language if not specified
        if language not in ["fr", "en"]:
            # Simple language detection based on common words
            text_for_detection = (question + transcript + context).lower()
            french_words = ["le", "la", "les", "de", "des", "du", "au", "aux"]
            english_words = ["the", "a", "an", "to", "for", "with", "and", "but"]
            
            french_count = sum(1 for word in french_words if word in text_for_detection)
            english_count = sum(1 for word in english_words if word in text_for_detection)
            
            language = "fr" if french_count > english_count else "en"

        return transcript.strip(), question.strip(), context.strip(), language.lower()

    def _extract_keywords(self, text, language):
        """Extract relevant medical keywords from text"""
        text_lower = text.lower()
        keywords = []
        
        # Check for medical contexts
        for keyword, context_info in self.medical_contexts.items():
            if keyword in text_lower:
                keywords.append(keyword)
        
        # Additional medical term detection
        medical_terms = {
            "fr": ["cardiaque", "respiratoire", "neurologique", "gastro", "urinaire", 
                  "infectieux", "traumatique", "métabolique", "psychiatrique"],
            "en": ["cardiac", "respiratory", "neurological", "gastro", "urinary",
                  "infectious", "traumatic", "metabolic", "psychiatric"]
        }
        
        lang_terms = medical_terms.get(language, medical_terms["fr"])
        for term in lang_terms:
            if term in text_lower:
                keywords.append(term)
        
        return list(set(keywords))  # Remove duplicates

    def _generate_structured_response(self, question, transcript, context, keywords, language):
        """Generate a structured medical response"""
        
        # Determine primary medical context
        primary_context = None
        for keyword in keywords:
            if keyword in self.medical_contexts:
                primary_context = keyword
                break
        
        # Build response sections
        sections = []
        
        # 1. Greeting and acknowledgment
        if language == "fr":
            sections.append("### Analyse Clinique Assistée Aura")
            if question:
                sections.append(f"**Question analysée :** {question}")
        else:
            sections.append("### Aura Clinical Analysis")
            if question:
                sections.append(f"**Question analyzed :** {question}")
        
        # 2. Context summary
        if transcript or context:
            if language == "fr":
                sections.append("**Contexte disponible :**")
            else:
                sections.append("**Available context :**")
            
            summary_text = ""
            if context:
                summary_text = context[:200] + ("..." if len(context) > 200 else "")
            elif transcript:
                summary_text = transcript[:200] + ("..." if len(transcript) > 200 else "")
            
            sections.append(summary_text)
        
        # 3. Medical recommendations based on context
        if primary_context:
            context_info = self.medical_contexts[primary_context]
            if language == "fr":
                sections.append("### Recommandations spécifiques")
                sections.append(f"Pour la présentation de type **{primary_context}**, voici les points à considérer :")
            else:
                sections.append("### Specific Recommendations")
                sections.append(f"For **{primary_context}** presentation, consider the following:")
            
            for i, rec in enumerate(context_info["recommendations"], 1):
                sections.append(f"{i}. {rec}")
            
            # Add red flags if present in text
            red_flags_found = []
            text_for_check = (question + transcript + context).lower()
            for flag in context_info["red_flags"]:
                if flag.lower() in text_for_check:
                    red_flags_found.append(flag)
            
            if red_flags_found:
                if language == "fr":
                    sections.append("\n**⚠️ Signaux d'alarme identifiés :**")
                else:
                    sections.append("\n**⚠️ Red flags identified :**")
                for flag in red_flags_found:
                    sections.append(f"- {flag}")
        
        # 4. General recommendations
        if language == "fr":
            sections.append("### Recommandations générales")
        else:
            sections.append("### General Recommendations")
        
        general_recs = self.general_recommendations.get(language, self.general_recommendations["fr"])
        for i, rec in enumerate(general_recs, 1):
            sections.append(f"{i}. {rec}")
        
        # 5. Questions for clarification
        if primary_context:
            context_info = self.medical_contexts[primary_context]
            if language == "fr":
                sections.append("### Points à clarifier")
                sections.append("Pour affiner l'analyse, il serait utile de préciser :")
            else:
                sections.append("### Points for Clarification")
                sections.append("To refine the analysis, please clarify:")
            
            questions = context_info["questions"][:3]  # First 3 questions
            for i, q in enumerate(questions, 1):
                sections.append(f"{i}. {q}")
        
        # 6. Closing
        sections.append("\n---")
        if language == "fr":
            sections.append("*Cette analyse est générée par l'assistant Aura pour soutenir le raisonnement clinique. Toutes les décisions doivent être validées par un médecin.*")
            sources = [
                "Guide de pratique clinique - Collège des Médecins du Québec",
                "Manuel Merck - Édition Médicale",
                "UpToDate - Évidence médicale"
            ]
        else:
            sections.append("*This analysis is generated by Aura assistant to support clinical reasoning. All decisions should be validated by a physician.*")
            sources = [
                "Clinical Practice Guidelines",
                "Merck Manual Professional Edition",
                "UpToDate Medical Evidence"
            ]
        
        # Join all sections with line breaks
        response_text = "\n".join(sections)
        
        # Generate summary
        summary_parts = []
        if primary_context:
            if language == "fr":
                summary_parts.append(f"Analyse {primary_context}")
            else:
                summary_parts.append(f"{primary_context} analysis")
        
        if keywords:
            keyword_str = ", ".join(keywords[:3])
            if language == "fr":
                summary_parts.append(f"Termes clés: {keyword_str}")
            else:
                summary_parts.append(f"Key terms: {keyword_str}")
        
        summary = " | ".join(summary_parts) if summary_parts else "Analyse clinique générique"
        
        # Generate suggestions from recommendations
        suggestions = []
        if primary_context:
            suggestions.extend(self.medical_contexts[primary_context]["recommendations"][:2])
        suggestions.extend(general_recs[:2])
        
        return response_text, summary, suggestions, sources

    def set_persona(self, persona_key):
        """Set the medical persona for contextual responses"""
        if persona_key in PERSONAS:
            self.persona_key = persona_key

    def _get_ebm_sources(self, keywords, language):
        """Get relevant evidence-based medicine sources"""
        sources = []
        resources = self.ebm_resources.get(language, self.ebm_resources["fr"])

        # Add guideline sources
        for guideline in resources["guidelines"][:2]:
            sources.append(f"{guideline['name']}")

        # Add database sources
        for db in resources["databases"][:2]:
            sources.append(f"{db['name']}")

        return sources

    def _generate_clinical_reasoning(self, keywords, contexts_found, language):
        """Generate clinical reasoning based on detected contexts"""
        reasoning = []

        for ctx_name in contexts_found:
            ctx = self.medical_contexts.get(ctx_name, {})
            if ctx.get("differential_diagnosis"):
                if language == "fr":
                    reasoning.append(f"Diagnostics différentiels à considérer pour {ctx_name}: {', '.join(ctx['differential_diagnosis'])}")
                else:
                    reasoning.append(f"Differential diagnoses to consider for {ctx_name}: {', '.join(ctx['differential_diagnosis'])}")

        return reasoning

    def run(self, payload):
        """Main method to process medical queries with enhanced clinical reasoning"""
        try:
            transcript, question, context, language = self._parse_input(payload)

            # Extract persona from payload if provided
            if isinstance(payload, dict):
                persona_key = payload.get("persona", "generalist")
                self.set_persona(persona_key)

            # Validate input
            if not transcript and not question:
                if language == "fr":
                    return {
                        "response": "Merci de fournir une question clinique ou un résumé de consultation pour que je puisse vous assister.",
                        "summary": "Contexte insuffisant",
                        "suggestions": ["Fournir plus de détails cliniques"],
                        "status": "need_more_context",
                        "sources": [],
                        "language": language,
                        "confidence": "low"
                    }
                else:
                    return {
                        "response": "Please provide a clinical question or consultation summary for me to assist you.",
                        "summary": "Insufficient context",
                        "suggestions": ["Provide more clinical details"],
                        "status": "need_more_context",
                        "sources": [],
                        "language": language,
                        "confidence": "low"
                    }

            # Extract keywords
            combined_text = " ".join(filter(None, [question, context, transcript]))
            keywords = self._extract_keywords(combined_text, language)

            # Identify which medical contexts are relevant
            contexts_found = [kw for kw in keywords if kw in self.medical_contexts]

            # Generate structured response
            response, summary, suggestions, sources = self._generate_structured_response(
                question, transcript, context, keywords, language
            )

            # Get EBM sources
            ebm_sources = self._get_ebm_sources(keywords, language)
            all_sources = list(set(sources + ebm_sources))

            # Generate clinical reasoning
            clinical_reasoning = self._generate_clinical_reasoning(keywords, contexts_found, language)

            # Determine confidence based on context matches
            if len(contexts_found) >= 2:
                confidence = "high"
            elif len(contexts_found) == 1:
                confidence = "medium"
            else:
                confidence = "low"

            # Get persona info
            persona = PERSONAS.get(self.persona_key, PERSONAS["generalist"])
            persona_name = persona["name"] if language == "fr" else persona["name_en"]

            return {
                "response": response,
                "summary": summary,
                "suggestions": suggestions,
                "status": "ready_for_documentation",
                "sources": all_sources,
                "language": language,
                "keywords": keywords,
                "clinical_reasoning": clinical_reasoning,
                "contexts_detected": contexts_found,
                "confidence": confidence,
                "persona": {
                    "key": self.persona_key,
                    "name": persona_name,
                    "expertise": persona.get("expertise", [])
                },
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            error_msg = f"Error processing request: {str(e)}"
            return {
                "response": error_msg,
                "summary": "Erreur de traitement" if "fr" in str(payload) else "Processing error",
                "suggestions": ["Veuillez réessayer avec une formulation différente"],
                "status": "error",
                "sources": [],
                "language": "fr",
                "confidence": "low",
                "error": str(e)
            }


# Create the root agent instance
root_agent = AskAuraAgentWrapper()