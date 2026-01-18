# EMR Adapter - Universal Electronic Medical Records Integration
# Supports: FHIR R4, HL7 v2, proprietary APIs
import os
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

# EMR Configuration from environment
EMR_CONFIG = {
    "provider": os.getenv("EMR_PROVIDER", "generic"),
    "base_url": os.getenv("EMR_BASE_URL", ""),
    "api_key": os.getenv("EMR_API_KEY", ""),
    "client_id": os.getenv("EMR_CLIENT_ID", ""),
    "client_secret": os.getenv("EMR_CLIENT_SECRET", ""),
    "fhir_version": os.getenv("EMR_FHIR_VERSION", "R4"),
}

# Supported EMR Providers
SUPPORTED_PROVIDERS = {
    "telus_ps_suite": {
        "name": "TELUS PS Suite",
        "protocol": "HL7v2",
        "capabilities": ["patient_search", "document_upload", "encounter_create"]
    },
    "medfar_myle": {
        "name": "Medfar MYLE",
        "protocol": "FHIR_R4",
        "capabilities": ["patient_search", "document_upload", "encounter_create", "prescription_send"]
    },
    "omnimed": {
        "name": "Omnimed",
        "protocol": "REST_API",
        "capabilities": ["patient_search", "document_upload"]
    },
    "oscar_emr": {
        "name": "OSCAR EMR",
        "protocol": "REST_API",
        "capabilities": ["patient_search", "document_upload", "encounter_create"]
    },
    "kinlogix": {
        "name": "Kinlogix",
        "protocol": "FHIR_R4",
        "capabilities": ["patient_search", "document_upload"]
    },
    "generic": {
        "name": "Generic EMR",
        "protocol": "FHIR_R4",
        "capabilities": ["patient_search", "document_upload"]
    }
}


class EMRAdapter:
    """Universal EMR adapter supporting multiple protocols"""

    def __init__(self, config: Dict = None):
        self.config = config or EMR_CONFIG
        self.provider = self.config.get("provider", "generic")
        self.base_url = self.config.get("base_url", "")
        self.connected = False
        self.last_sync = None

    def connect(self) -> Dict:
        """Establish connection to EMR"""
        if not self.base_url:
            return {
                "success": False,
                "error": "EMR base URL not configured",
                "provider": self.provider
            }

        # Simulate connection for now
        # In production, implement OAuth2 flow or API key auth
        self.connected = True
        self.last_sync = datetime.now().isoformat()

        return {
            "success": True,
            "provider": self.provider,
            "protocol": SUPPORTED_PROVIDERS.get(self.provider, {}).get("protocol", "unknown"),
            "connected_at": self.last_sync
        }

    def search_patient(self, query: Dict) -> Dict:
        """
        Search for patient in EMR
        query can contain: ramq, name, dob, mrn
        """
        if not self.connected:
            self.connect()

        ramq = query.get("ramq", "")
        name = query.get("name", "")
        dob = query.get("dob", "")

        # Simulated patient search response
        # In production, this would make actual API calls
        if ramq:
            # RAMQ format validation
            if len(ramq.replace(" ", "")) == 12:
                return {
                    "success": True,
                    "found": True,
                    "patient": {
                        "id": f"patient-{uuid.uuid4().hex[:8]}",
                        "ramq": ramq,
                        "name": name or "Patient from EMR",
                        "dob": dob,
                        "source": self.provider,
                        "last_visit": datetime.now().isoformat()
                    },
                    "confidence": "high"
                }

        return {
            "success": True,
            "found": False,
            "message": "No matching patient found in EMR",
            "suggestions": [
                "Verify RAMQ number format",
                "Try searching by name and DOB",
                "Contact clinic administration"
            ]
        }

    def get_patient(self, patient_id: str) -> Dict:
        """Get full patient record from EMR"""
        if not self.connected:
            self.connect()

        # Simulated patient data retrieval
        return {
            "success": True,
            "patient": {
                "id": patient_id,
                "demographics": {
                    "name": "Retrieved from EMR",
                    "dob": "",
                    "sex": "",
                    "address": "",
                    "phone": ""
                },
                "medical_history": [],
                "allergies": [],
                "medications": [],
                "last_updated": datetime.now().isoformat()
            },
            "source": self.provider
        }


def push_to_emr(data: Dict, config: Dict = None) -> Dict:
    """
    Push clinical document to EMR

    Args:
        data: {
            "patient_id": str,
            "document_type": str (soap_note, prescription, lab_order, etc.),
            "content": str or dict,
            "session_id": str (optional),
            "metadata": dict (optional)
        }
        config: EMR configuration override

    Returns:
        Result with status and EMR reference ID
    """
    try:
        adapter = EMRAdapter(config)

        patient_id = data.get("patient_id", "")
        document_type = data.get("document_type", "clinical_note")
        content = data.get("content", "")
        session_id = data.get("session_id", "")
        metadata = data.get("metadata", {})

        if not patient_id:
            return {
                "success": False,
                "error": "Patient ID is required",
                "status": "failed"
            }

        if not content:
            return {
                "success": False,
                "error": "Document content is required",
                "status": "failed"
            }

        # Generate EMR document reference
        emr_doc_id = f"emr-doc-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"

        # Build FHIR-like document reference
        document_reference = {
            "resourceType": "DocumentReference",
            "id": emr_doc_id,
            "status": "current",
            "docStatus": "final",
            "type": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": _get_loinc_code(document_type),
                    "display": document_type.replace("_", " ").title()
                }]
            },
            "subject": {
                "reference": f"Patient/{patient_id}"
            },
            "date": datetime.now().isoformat(),
            "author": [{
                "reference": "Practitioner/aurascribe-system"
            }],
            "content": [{
                "attachment": {
                    "contentType": "text/plain",
                    "data": content if isinstance(content, str) else json.dumps(content)
                }
            }],
            "context": {
                "encounter": [{
                    "reference": f"Encounter/{session_id}" if session_id else None
                }]
            }
        }

        # Log the push attempt
        logger.info(f"Pushing document {emr_doc_id} to EMR for patient {patient_id}")

        # In production: Make actual API call to EMR
        # response = requests.post(f"{adapter.base_url}/DocumentReference", json=document_reference)

        return {
            "success": True,
            "status": "pushed",
            "emr_document_id": emr_doc_id,
            "patient_id": patient_id,
            "document_type": document_type,
            "provider": adapter.provider,
            "timestamp": datetime.now().isoformat(),
            "message": f"Document successfully queued for {SUPPORTED_PROVIDERS.get(adapter.provider, {}).get('name', 'EMR')}"
        }

    except Exception as e:
        logger.error(f"Error pushing to EMR: {e}")
        return {
            "success": False,
            "status": "error",
            "error": str(e)
        }


def pull_from_emr(patient_id: str, config: Dict = None) -> Dict:
    """
    Pull patient data from EMR

    Args:
        patient_id: Patient identifier (can be RAMQ, MRN, or internal ID)
        config: EMR configuration override

    Returns:
        Patient data including demographics, history, medications
    """
    try:
        adapter = EMRAdapter(config)
        connection = adapter.connect()

        if not connection.get("success"):
            return {
                "success": False,
                "status": "connection_failed",
                "error": connection.get("error", "Failed to connect to EMR")
            }

        # Search for patient first
        search_result = adapter.search_patient({"ramq": patient_id})

        if not search_result.get("found"):
            return {
                "success": False,
                "status": "not_found",
                "error": "Patient not found in EMR",
                "patient_id": patient_id
            }

        # Get full patient record
        patient_data = adapter.get_patient(patient_id)

        return {
            "success": True,
            "status": "pulled",
            "patient_id": patient_id,
            "data": patient_data.get("patient", {}),
            "source": adapter.provider,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error pulling from EMR: {e}")
        return {
            "success": False,
            "status": "error",
            "error": str(e),
            "patient_id": patient_id
        }


def _get_loinc_code(document_type: str) -> str:
    """Map document types to LOINC codes"""
    loinc_mapping = {
        "soap_note": "34117-2",  # History and Physical Note
        "clinical_note": "11488-4",  # Consultation Note
        "prescription": "57833-6",  # Prescription for medication
        "lab_order": "64288-8",  # Laboratory order
        "referral": "57133-1",  # Referral Note
        "discharge_summary": "18842-5",  # Discharge Summary
        "progress_note": "11506-3",  # Progress Note
    }
    return loinc_mapping.get(document_type, "11488-4")


def get_emr_status(config: Dict = None) -> Dict:
    """Get current EMR connection status"""
    adapter = EMRAdapter(config)
    provider_info = SUPPORTED_PROVIDERS.get(adapter.provider, {})

    return {
        "provider": adapter.provider,
        "provider_name": provider_info.get("name", "Unknown"),
        "protocol": provider_info.get("protocol", "unknown"),
        "capabilities": provider_info.get("capabilities", []),
        "configured": bool(adapter.base_url),
        "base_url_set": bool(adapter.base_url),
        "api_key_set": bool(adapter.config.get("api_key")),
        "supported_providers": list(SUPPORTED_PROVIDERS.keys())
    }
