from agents.medical_persona_system import MedicalPersona

class Orchestrator:
    def __init__(self):
        self.current_persona = MedicalPersona("generalist")

    def set_persona(self, persona_key):
        self.current_persona = MedicalPersona(persona_key)

    def orchestrate_transcript(self, transcript_text):
        agent_results = {}

        # Pass persona to each agent (if supported)
        if clinical_doc_agent is not None and hasattr(clinical_doc_agent, 'set_persona'):
            clinical_doc_agent.set_persona(self.current_persona)

        # Run clinical agent with persona in payload
        agent_results['ClinicalDocumentationAgent'] = clinical_doc_agent.run({
            "transcript": transcript_text,
            "persona": self.current_persona.get_persona_summary()
        }) if clinical_doc_agent else {}

        # Example for other agents (expand as needed)
        # agent_results['AskAura'] = ask_aura_agent.run({
        #     "transcript": transcript_text,
        #     "persona": self.current_persona.get_persona_summary()
        # }) if ask_aura_agent else {}

        # ...existing code for other agents...

        executed_agents = [name for name, result in agent_results.items() if result and 'error' not in result]
        return {
            "orchestrator": "AuraScribeOrchestrator",
            "transcript": transcript_text,
            "persona": self.current_persona.get_persona_summary(),
            "agents_executed": executed_agents,
            "agent_results": agent_results,
            "summary": "Medical case processed successfully",
            "next_steps": "Review documentation and complete tasks",
            "timestamp": datetime.now().isoformat()
        }
# AuraScribe Orchestrator - Coordinates all agents for medical documentation
# Note: google.adk is not available, using local wrapper implementations

from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Import agent wrappers (they don't need google.adk anymore)
try:
    from agents.ClinicalDocumentationAgent import root_agent as clinical_doc_agent
except ImportError as e:
    logger.warning(f"Could not import ClinicalDocumentationAgent: {e}")
    clinical_doc_agent = None

try:
    from agents.PrescriptionLabAgent import root_agent as prescription_lab_agent
except ImportError as e:
    logger.warning(f"Could not import PrescriptionLabAgent: {e}")
    prescription_lab_agent = None

try:
    from agents.MADO_ReportingAgent import root_agent as mado_agent
except ImportError as e:
    logger.warning(f"Could not import MADO_ReportingAgent: {e}")
    mado_agent = None

try:
    from agents.ComplianceMonitorAgent import root_agent as compliance_agent
except ImportError as e:
    logger.warning(f"Could not import ComplianceMonitorAgent: {e}")
    compliance_agent = None

try:
    from agents.RAMQ_BillingAgent import root_agent as ramq_billing_agent
except ImportError as e:
    logger.warning(f"Could not import RAMQ_BillingAgent: {e}")
    ramq_billing_agent = None

try:
    from agents.AskAura_agent import root_agent as ask_aura_agent
except ImportError as e:
    logger.warning(f"Could not import AskAura_agent: {e}")
    ask_aura_agent = None

try:
    from agents.CustomFormAgent import root_agent as custom_form_agent
except ImportError as e:
    logger.warning(f"Could not import CustomFormAgent: {e}")
    custom_form_agent = None

try:
    from agents.TaskManagerAgent import root_agent as task_manager_agent
except ImportError as e:
    logger.warning(f"Could not import TaskManagerAgent: {e}")
    task_manager_agent = None

def _run_agent_safe(agent, name, transcript_text):
    """Safely run an agent, returning empty dict if agent is None or fails."""
    if agent is None:
        logger.warning(f"Agent {name} is not available")
        return {}
    try:
        return agent.run(transcript_text)
    except Exception as e:
        logger.error(f"Error running agent {name}: {e}")
        return {"error": str(e)}


def orchestrate_transcript(transcript_text):
    """
    Production orchestrator: runs all agents and aggregates their outputs
    """
    agent_results = {}

    # Run each agent safely and collect results
    agent_results['AskAura'] = _run_agent_safe(ask_aura_agent, 'AskAura', transcript_text)
    agent_results['ClinicalDocumentationAgent'] = _run_agent_safe(clinical_doc_agent, 'ClinicalDocumentationAgent', transcript_text)
    agent_results['ComplianceMonitorAgent'] = _run_agent_safe(compliance_agent, 'ComplianceMonitorAgent', transcript_text)
    agent_results['CustomFormAgent'] = _run_agent_safe(custom_form_agent, 'CustomFormAgent', transcript_text)
    agent_results['MADO_ReportingAgent'] = _run_agent_safe(mado_agent, 'MADO_ReportingAgent', transcript_text)
    agent_results['PrescriptionLabAgent'] = _run_agent_safe(prescription_lab_agent, 'PrescriptionLabAgent', transcript_text)
    agent_results['RAMQ_BillingAgent'] = _run_agent_safe(ramq_billing_agent, 'RAMQ_BillingAgent', transcript_text)
    agent_results['TaskManagerAgent'] = _run_agent_safe(task_manager_agent, 'TaskManagerAgent', transcript_text)

    # Filter out agents that actually ran
    executed_agents = [name for name, result in agent_results.items() if result and 'error' not in result]

    return {
        "orchestrator": "AuraScribeOrchestrator",
        "transcript": transcript_text,
        "agents_executed": executed_agents,
        "agent_results": agent_results,
        "summary": "Medical case processed successfully",
        "next_steps": "Review documentation and complete tasks",
        "timestamp": datetime.now().isoformat()
    }