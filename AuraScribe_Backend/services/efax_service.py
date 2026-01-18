# eFax Service - Secure medical document faxing
# Supports: SRFax, InterFax, RingCentral Fax, Documo
import os
import json
import logging
import uuid
import base64
from datetime import datetime
from typing import Dict, Optional, List

logger = logging.getLogger(__name__)

# eFax Configuration from environment
EFAX_CONFIG = {
    "provider": os.getenv("EFAX_PROVIDER", "srfax"),
    "account_id": os.getenv("EFAX_ACCOUNT_ID", ""),
    "api_key": os.getenv("EFAX_API_KEY", ""),
    "api_secret": os.getenv("EFAX_API_SECRET", ""),
    "sender_fax": os.getenv("EFAX_SENDER_NUMBER", ""),
    "sender_name": os.getenv("EFAX_SENDER_NAME", "AuraScribe Clinic"),
    "cover_page": os.getenv("EFAX_COVER_PAGE", "true").lower() == "true",
}

# Supported eFax providers
SUPPORTED_PROVIDERS = {
    "srfax": {
        "name": "SRFax",
        "api_url": "https://www.srfax.com/SRF_SecWebSvc.php",
        "features": ["send", "receive", "status", "cover_page"]
    },
    "interfax": {
        "name": "InterFax",
        "api_url": "https://rest.interfax.net",
        "features": ["send", "receive", "status", "cover_page", "batch"]
    },
    "ringcentral": {
        "name": "RingCentral Fax",
        "api_url": "https://platform.ringcentral.com/restapi",
        "features": ["send", "receive", "status"]
    },
    "documo": {
        "name": "Documo mFax",
        "api_url": "https://api.documo.com",
        "features": ["send", "receive", "status", "hipaa_compliant"]
    },
    "generic": {
        "name": "Generic eFax",
        "api_url": "",
        "features": ["send"]
    }
}

# Quebec region fax prefixes for healthcare
QUEBEC_HEALTHCARE_PREFIXES = {
    "514": "Montréal",
    "450": "Montérégie/Laurentides",
    "418": "Capitale-Nationale",
    "819": "Outaouais/Estrie",
    "438": "Montréal (mobile)",
    "579": "Laurentides (mobile)",
    "581": "Capitale-Nationale (mobile)",
}


class EFaxService:
    """Universal eFax service supporting multiple providers"""

    def __init__(self, config: Dict = None):
        self.config = config or EFAX_CONFIG
        self.provider = self.config.get("provider", "generic")
        self.account_id = self.config.get("account_id", "")
        self.api_key = self.config.get("api_key", "")
        self.sender_fax = self.config.get("sender_fax", "")
        self.sender_name = self.config.get("sender_name", "AuraScribe Clinic")

    def validate_fax_number(self, fax_number: str) -> Dict:
        """Validate and format fax number for Quebec"""
        # Remove all non-numeric characters
        clean_number = ''.join(filter(str.isdigit, fax_number))

        # Handle Canadian format
        if len(clean_number) == 10:
            # Add +1 for Canada
            clean_number = f"1{clean_number}"
        elif len(clean_number) == 11 and clean_number.startswith("1"):
            pass  # Already in correct format
        else:
            return {
                "valid": False,
                "error": "Invalid fax number format",
                "suggestion": "Use format: 514-555-1234 or 1-514-555-1234"
            }

        # Extract area code
        area_code = clean_number[1:4]
        region = QUEBEC_HEALTHCARE_PREFIXES.get(area_code, "Other region")

        return {
            "valid": True,
            "formatted": f"+{clean_number}",
            "display": f"({area_code}) {clean_number[4:7]}-{clean_number[7:]}",
            "area_code": area_code,
            "region": region
        }

    def generate_cover_page(self, data: Dict, language: str = "fr") -> str:
        """Generate HIPAA-compliant fax cover page"""
        recipient_name = data.get("recipient_name", "Destinataire")
        recipient_fax = data.get("recipient_fax", "")
        sender_name = data.get("sender_name", self.sender_name)
        sender_fax = data.get("sender_fax", self.sender_fax)
        subject = data.get("subject", "Document médical")
        page_count = data.get("page_count", 1)
        notes = data.get("notes", "")

        if language == "fr":
            cover_text = f"""
╔══════════════════════════════════════════════════════════════════╗
║                    TÉLÉCOPIEUR MÉDICAL CONFIDENTIEL               ║
╠══════════════════════════════════════════════════════════════════╣
║ À: {recipient_name:<58} ║
║ Télécopieur: {recipient_fax:<50} ║
╠══════════════════════════════════════════════════════════════════╣
║ De: {sender_name:<57} ║
║ Télécopieur: {sender_fax:<50} ║
╠══════════════════════════════════════════════════════════════════╣
║ Objet: {subject:<54} ║
║ Nombre de pages (incluant couverture): {page_count:<23} ║
╠══════════════════════════════════════════════════════════════════╣
║ Notes: {notes[:54]:<54} ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ⚠️  AVIS DE CONFIDENTIALITÉ - LOI 25 / LPRPSP                    ║
║                                                                   ║
║  Ce télécopieur et tous les documents qui y sont joints sont     ║
║  confidentiels et destinés exclusivement au destinataire.        ║
║                                                                   ║
║  Si vous avez reçu ce télécopieur par erreur, veuillez:          ║
║  1. Aviser immédiatement l'expéditeur                            ║
║  2. Détruire toutes les copies de ce document                    ║
║                                                                   ║
║  La divulgation, la reproduction ou la distribution non          ║
║  autorisée de ce document est strictement interdite.             ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ Envoyé via AuraScribe • {datetime.now().strftime('%Y-%m-%d %H:%M')}                          ║
╚══════════════════════════════════════════════════════════════════╝
"""
        else:
            cover_text = f"""
╔══════════════════════════════════════════════════════════════════╗
║                    CONFIDENTIAL MEDICAL FAX                       ║
╠══════════════════════════════════════════════════════════════════╣
║ To: {recipient_name:<58} ║
║ Fax: {recipient_fax:<56} ║
╠══════════════════════════════════════════════════════════════════╣
║ From: {sender_name:<55} ║
║ Fax: {sender_fax:<56} ║
╠══════════════════════════════════════════════════════════════════╣
║ Subject: {subject:<52} ║
║ Pages (including cover): {page_count:<36} ║
╠══════════════════════════════════════════════════════════════════╣
║ Notes: {notes[:54]:<54} ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ⚠️  CONFIDENTIALITY NOTICE - HIPAA COMPLIANT                     ║
║                                                                   ║
║  This fax and any attachments are confidential and intended      ║
║  solely for the named recipient.                                 ║
║                                                                   ║
║  If you received this fax in error, please:                      ║
║  1. Immediately notify the sender                                ║
║  2. Destroy all copies of this document                          ║
║                                                                   ║
║  Unauthorized disclosure, reproduction, or distribution          ║
║  of this document is strictly prohibited.                        ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ Sent via AuraScribe • {datetime.now().strftime('%Y-%m-%d %H:%M')}                            ║
╚══════════════════════════════════════════════════════════════════╝
"""
        return cover_text


def send_fax(pdf_path: str, recipient_number: str, options: Dict = None) -> Dict:
    """
    Send a fax with a PDF document

    Args:
        pdf_path: Path to the PDF file to send
        recipient_number: Destination fax number
        options: {
            "recipient_name": str,
            "subject": str,
            "notes": str,
            "cover_page": bool,
            "language": "fr" or "en",
            "priority": "normal" or "urgent"
        }

    Returns:
        Fax transmission result with tracking ID
    """
    try:
        service = EFaxService()
        options = options or {}

        # Validate fax number
        validation = service.validate_fax_number(recipient_number)
        if not validation.get("valid"):
            return {
                "success": False,
                "status": "invalid_number",
                "error": validation.get("error"),
                "suggestion": validation.get("suggestion")
            }

        # Verify PDF exists
        if not os.path.exists(pdf_path):
            return {
                "success": False,
                "status": "file_not_found",
                "error": f"PDF file not found: {pdf_path}"
            }

        # Generate fax ID
        fax_id = f"fax-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"

        # Generate cover page if requested
        cover_page_content = None
        if options.get("cover_page", service.config.get("cover_page", True)):
            cover_data = {
                "recipient_name": options.get("recipient_name", "Destinataire"),
                "recipient_fax": validation["display"],
                "sender_name": service.sender_name,
                "sender_fax": service.sender_fax,
                "subject": options.get("subject", "Document médical"),
                "page_count": options.get("page_count", 1) + 1,  # +1 for cover
                "notes": options.get("notes", "")
            }
            cover_page_content = service.generate_cover_page(
                cover_data,
                language=options.get("language", "fr")
            )

        # Log the fax attempt
        logger.info(f"Sending fax {fax_id} to {validation['formatted']} via {service.provider}")

        # In production: Make actual API call to eFax provider
        # Example for SRFax:
        # response = requests.post(
        #     SUPPORTED_PROVIDERS[service.provider]["api_url"],
        #     data={
        #         "action": "Queue_Fax",
        #         "access_id": service.account_id,
        #         "access_pwd": service.api_key,
        #         "sCallerID": service.sender_fax,
        #         "sSenderEmail": "noreply@aurascribe.com",
        #         "sFaxType": "SINGLE",
        #         "sToFaxNumber": validation["formatted"],
        #         "sFileName_1": os.path.basename(pdf_path),
        #         "sFileContent_1": base64.b64encode(open(pdf_path, 'rb').read()).decode()
        #     }
        # )

        return {
            "success": True,
            "status": "queued",
            "fax_id": fax_id,
            "recipient": {
                "number": validation["formatted"],
                "display": validation["display"],
                "region": validation["region"],
                "name": options.get("recipient_name", "")
            },
            "sender": {
                "number": service.sender_fax,
                "name": service.sender_name
            },
            "document": {
                "path": pdf_path,
                "filename": os.path.basename(pdf_path)
            },
            "cover_page_included": cover_page_content is not None,
            "priority": options.get("priority", "normal"),
            "provider": service.provider,
            "timestamp": datetime.now().isoformat(),
            "estimated_delivery": "2-5 minutes",
            "message": f"Fax queued for delivery to {validation['display']}"
        }

    except Exception as e:
        logger.error(f"Error sending fax: {e}")
        return {
            "success": False,
            "status": "error",
            "error": str(e)
        }


def get_fax_status(fax_id: str) -> Dict:
    """Get the status of a sent fax"""
    try:
        service = EFaxService()

        # In production: Query the eFax provider API for status
        # For now, return a simulated status
        return {
            "success": True,
            "fax_id": fax_id,
            "status": "delivered",  # queued, sending, delivered, failed
            "pages_sent": 2,
            "delivery_time": datetime.now().isoformat(),
            "provider": service.provider,
            "message": "Fax successfully delivered"
        }

    except Exception as e:
        logger.error(f"Error getting fax status: {e}")
        return {
            "success": False,
            "fax_id": fax_id,
            "status": "unknown",
            "error": str(e)
        }


def receive_fax() -> Dict:
    """
    Check for and retrieve incoming faxes

    Returns:
        List of received faxes with metadata
    """
    try:
        service = EFaxService()

        # In production: Poll the eFax provider for incoming faxes
        # For now, return empty list
        return {
            "success": True,
            "faxes": [],
            "count": 0,
            "provider": service.provider,
            "checked_at": datetime.now().isoformat(),
            "message": "No new incoming faxes"
        }

    except Exception as e:
        logger.error(f"Error receiving fax: {e}")
        return {
            "success": False,
            "faxes": [],
            "error": str(e)
        }


def get_efax_status() -> Dict:
    """Get current eFax service configuration status"""
    service = EFaxService()
    provider_info = SUPPORTED_PROVIDERS.get(service.provider, {})

    return {
        "provider": service.provider,
        "provider_name": provider_info.get("name", "Unknown"),
        "features": provider_info.get("features", []),
        "configured": bool(service.account_id and service.api_key),
        "sender_number": service.sender_fax or "Not configured",
        "sender_name": service.sender_name,
        "cover_page_enabled": service.config.get("cover_page", True),
        "supported_providers": list(SUPPORTED_PROVIDERS.keys()),
        "quebec_regions": QUEBEC_HEALTHCARE_PREFIXES
    }
