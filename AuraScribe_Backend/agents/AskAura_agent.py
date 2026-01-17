# AskAura_agent - Interactive assistant for medical queries
# Standalone implementation without google.adk dependency
import re
 # --- PERSONA SUPPORT ---
# Simple persona system - just copy and paste this into each agent

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

class AskAuraAgentWrapper:
    def __init__(self, name="AskAura"):
        self.name = name
        self.medical_contexts = {
            "douleur": {
                "questions": ["localisation", "intensité", "durée", "caractère", "facteurs aggravants"],
                "recommendations": [
                    "Évaluer l'échelle de douleur (0-10)",
                    "Rechercher les signes d'urgence (douleur thoracique, abdomen aigu)",
                    "Considérer les diagnostics différentiels selon la localisation",
                    "Documenter le traitement antalgique actuel et son efficacité"
                ],
                "red_flags": ["douleur thoracique", "céphalée explosive", "douleur abdominale sévère"]
            },
            "pain": {
                "questions": ["location", "intensity", "duration", "character", "aggravating factors"],
                "recommendations": [
                    "Assess pain scale (0-10)",
                    "Check for red flags (chest pain, acute abdomen)",
                    "Consider differential diagnosis based on location",
                    "Document current analgesic treatment and efficacy"
                ],
                "red_flags": ["chest pain", "thunderclap headache", "severe abdominal pain"]
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
                "red_flags": ["fièvre avec éruption", "progression rapide", "atteinte muqueuse"]
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

    def run(self, payload):
        """Main method to process medical queries"""
        try:
            transcript, question, context, language = self._parse_input(payload)

            # Validate input
            if not transcript and not question:
                if language == "fr":
                    return {
                        "response": "Merci de fournir une question clinique ou un résumé de consultation pour que je puisse vous assister.",
                        "summary": "Contexte insuffisant",
                        "suggestions": ["Fournir plus de détails cliniques"],
                        "status": "need_more_context",
                        "sources": [],
                        "language": language
                    }
                else:
                    return {
                        "response": "Please provide a clinical question or consultation summary for me to assist you.",
                        "summary": "Insufficient context",
                        "suggestions": ["Provide more clinical details"],
                        "status": "need_more_context",
                        "sources": [],
                        "language": language
                    }

            # Extract keywords
            combined_text = " ".join(filter(None, [question, context, transcript]))
            keywords = self._extract_keywords(combined_text, language)
            
            # Generate structured response
            response, summary, suggestions, sources = self._generate_structured_response(
                question, transcript, context, keywords, language
            )

            return {
                "response": response,
                "summary": summary,
                "suggestions": suggestions,
                "status": "ready_for_documentation",
                "sources": sources,
                "language": language,
                "keywords": keywords,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            error_msg = f"Error processing request: {str(e)}"
            return {
                "response": error_msg,
                "summary": "Erreur de traitement",
                "suggestions": ["Veuillez réessayer avec une formulation différente"],
                "status": "error",
                "sources": [],
                "language": "fr",
                "error": str(e)
            }


# Create the root agent instance
root_agent = AskAuraAgentWrapper()