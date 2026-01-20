from agents.medical_persona_system import MedicalPersona
import concurrent.futures
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class Orchestrator:
    """Enhanced orchestrator with parallel execution and confidence scoring"""

    def __init__(self):
        self.current_persona = MedicalPersona("generalist")
        self.execution_stats = {}

    def set_persona(self, persona_key):
        self.current_persona = MedicalPersona(persona_key)

    def _run_single_agent(self, agent, agent_name, payload):
        """Run a single agent with timing and error handling"""
        if agent is None:
            return {"status": "unavailable", "error": f"{agent_name} not loaded"}

        start_time = time.time()
        try:
            result = agent.run(payload)
            execution_time = time.time() - start_time

            # Add metadata to result
            if isinstance(result, dict):
                result['_meta'] = {
                    'agent_name': agent_name,
                    'execution_time_ms': round(execution_time * 1000, 2),
                    'status': 'success'
                }
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Agent {agent_name} failed after {execution_time:.2f}s: {e}")
            return {
                "error": str(e),
                "_meta": {
                    'agent_name': agent_name,
                    'execution_time_ms': round(execution_time * 1000, 2),
                    'status': 'error'
                }
            }

    def orchestrate_transcript_parallel(self, transcript_text, persona_key="generalist"):
        """Run all agents in parallel for faster processing"""
        self.set_persona(persona_key)
        persona_summary = self.current_persona.get_persona_summary()

        # Build payload with persona context
        payload = {
            "transcript": transcript_text,
            "persona": persona_key,
            "persona_summary": persona_summary
        }

        # Define agents to run
        agents_to_run = [
            (clinical_doc_agent, 'ClinicalDocumentationAgent'),
            (prescription_lab_agent, 'PrescriptionLabAgent'),
            (mado_agent, 'MADO_ReportingAgent'),
            (compliance_agent, 'ComplianceMonitorAgent'),
            (ramq_billing_agent, 'RAMQ_BillingAgent'),
            (task_manager_agent, 'TaskManagerAgent'),
        ]

        agent_results = {}
        total_start = time.time()

        # Run agents in parallel using ThreadPoolExecutor
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            future_to_agent = {
                executor.submit(self._run_single_agent, agent, name, payload): name
                for agent, name in agents_to_run if agent is not None
            }

            for future in concurrent.futures.as_completed(future_to_agent):
                agent_name = future_to_agent[future]
                try:
                    result = future.result(timeout=30)
                    agent_results[agent_name] = result
                except concurrent.futures.TimeoutError:
                    agent_results[agent_name] = {"error": "Agent timed out", "status": "timeout"}
                except Exception as e:
                    agent_results[agent_name] = {"error": str(e), "status": "error"}

        total_time = time.time() - total_start

        # Calculate overall confidence and summary
        executed_agents = [name for name, result in agent_results.items()
                         if result and result.get('_meta', {}).get('status') == 'success']
        failed_agents = [name for name, result in agent_results.items()
                        if result and result.get('_meta', {}).get('status') != 'success']

        # Generate smart summary based on results
        summary = self._generate_orchestration_summary(agent_results, transcript_text)

        return {
            "orchestrator": "AuraScribeOrchestrator",
            "version": "2.0",
            "transcript": transcript_text,
            "transcript_length": len(transcript_text),
            "persona": persona_summary,
            "agents_executed": executed_agents,
            "agents_failed": failed_agents,
            "agent_results": agent_results,
            "execution_stats": {
                "total_time_ms": round(total_time * 1000, 2),
                "agents_run": len(agents_to_run),
                "agents_succeeded": len(executed_agents),
                "parallel_execution": True
            },
            "summary": summary,
            "confidence": self._calculate_overall_confidence(agent_results),
            "timestamp": datetime.now().isoformat()
        }

    def _generate_orchestration_summary(self, agent_results, transcript):
        """Generate intelligent summary based on all agent outputs"""
        summaries = []

        # Check clinical documentation
        clinical = agent_results.get('ClinicalDocumentationAgent', {})
        if clinical and 'soap_note' in clinical:
            soap = clinical['soap_note']
            if soap.get('assessment'):
                summaries.append("SOAP documentation generated")

        # Check MADO
        mado = agent_results.get('MADO_ReportingAgent', {})
        if mado and mado.get('mado_detected'):
            summaries.append(f"MADO ALERT: {mado.get('summary', {}).get('action_required', 'Review required')}")

        # Check prescriptions
        rx = agent_results.get('PrescriptionLabAgent', {})
        if rx and (rx.get('prescription') or rx.get('lab_order')):
            if rx.get('prescription'):
                summaries.append("Prescription suggestions available")
            if rx.get('lab_order'):
                summaries.append("Lab orders recommended")

        # Check tasks
        tasks = agent_results.get('TaskManagerAgent', {})
        if tasks and tasks.get('tasks'):
            task_count = len(tasks['tasks'])
            summaries.append(f"{task_count} follow-up task(s) identified")

        # Check billing
        billing = agent_results.get('RAMQ_BillingAgent', {})
        if billing and billing.get('suggested_codes'):
            summaries.append(f"RAMQ billing codes suggested: {billing.get('total_estimate', 'N/A')}")

        if not summaries:
            return "Medical case processed. Review agent outputs for details."

        return " | ".join(summaries)

    def _calculate_overall_confidence(self, agent_results):
        """Calculate overall confidence score based on agent results"""
        confidence_scores = []

        for name, result in agent_results.items():
            if not result or 'error' in result:
                confidence_scores.append(0)
            elif result.get('confidence') == 'high':
                confidence_scores.append(1.0)
            elif result.get('confidence') == 'medium':
                confidence_scores.append(0.7)
            elif result.get('confidence') == 'low':
                confidence_scores.append(0.4)
            else:
                # Default confidence based on whether agent produced output
                if any(k for k in result.keys() if not k.startswith('_')):
                    confidence_scores.append(0.6)
                else:
                    confidence_scores.append(0.3)

        if not confidence_scores:
            return "low"

        avg_confidence = sum(confidence_scores) / len(confidence_scores)

        if avg_confidence >= 0.8:
            return "high"
        elif avg_confidence >= 0.5:
            return "medium"
        else:
            return "low"
# AuraScribe Orchestrator - Coordinates all agents for medical documentation
# Note: google.adk is not available, using local wrapper implementations

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


# Global orchestrator instance for parallel execution
_orchestrator_instance = None

def _get_orchestrator():
    """Get or create orchestrator instance"""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = Orchestrator()
    return _orchestrator_instance


def orchestrate_transcript(transcript_text, persona_key="generalist", use_parallel=True):
    """
    Production orchestrator: runs all agents and aggregates their outputs.

    Args:
        transcript_text: The medical transcript to process
        persona_key: Medical specialty persona (generalist, cardiologist, etc.)
        use_parallel: If True, runs agents in parallel for better performance

    Returns:
        dict with agent results, summary, confidence score, and execution stats
    """
    # Use parallel execution for better performance
    if use_parallel:
        orchestrator = _get_orchestrator()
        return orchestrator.orchestrate_transcript_parallel(transcript_text, persona_key)

    # Fallback to sequential execution
    agent_results = {}

    # Build payload with persona
    payload = {"transcript": transcript_text, "persona": persona_key}

    # Run each agent safely and collect results
    agent_results['ClinicalDocumentationAgent'] = _run_agent_safe(clinical_doc_agent, 'ClinicalDocumentationAgent', payload)
    agent_results['ComplianceMonitorAgent'] = _run_agent_safe(compliance_agent, 'ComplianceMonitorAgent', payload)
    agent_results['CustomFormAgent'] = _run_agent_safe(custom_form_agent, 'CustomFormAgent', payload)
    agent_results['MADO_ReportingAgent'] = _run_agent_safe(mado_agent, 'MADO_ReportingAgent', payload)
    agent_results['PrescriptionLabAgent'] = _run_agent_safe(prescription_lab_agent, 'PrescriptionLabAgent', payload)
    agent_results['RAMQ_BillingAgent'] = _run_agent_safe(ramq_billing_agent, 'RAMQ_BillingAgent', payload)
    agent_results['TaskManagerAgent'] = _run_agent_safe(task_manager_agent, 'TaskManagerAgent', payload)

    # Filter out agents that actually ran
    executed_agents = [name for name, result in agent_results.items() if result and 'error' not in result]

    return {
        "orchestrator": "AuraScribeOrchestrator",
        "version": "2.0",
        "transcript": transcript_text,
        "transcript_length": len(transcript_text),
        "persona": persona_key,
        "agents_executed": executed_agents,
        "agent_results": agent_results,
        "summary": "Medical case processed successfully",
        "next_steps": "Review documentation and complete tasks",
        "timestamp": datetime.now().isoformat()
    }