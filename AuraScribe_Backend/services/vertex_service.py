"""
vertex_service.py
Simple Vertex AI service for AuraScribe
UPDATED: Added environment variable loading
"""

import os
import json
import logging
from typing import Dict, Any
from google.cloud import aiplatform
from datetime import datetime
from dotenv import load_dotenv  # NEW

# Load environment variables FIRST
load_dotenv()  # NEW: This loads the .env file

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VertexAIService:
    def __init__(self):
        """Initialize Vertex AI service"""
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        self.location = os.getenv('GOOGLE_CLOUD_LOCATION')
        
        # Let's print what we're getting for debugging
        print(f"🔍 Debug: Project ID = {self.project_id}")
        print(f"🔍 Debug: Location = {self.location}")
        print(f"🔍 Debug: Creds path = {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
        
        if not self.project_id or not self.location:
            print("⚠️  Warning: Google Cloud environment variables not set")
            print("   This is OK for development - we'll use mock mode")
            self.initialized = False
            return
        
        logger.info(f"Initializing Vertex AI for project: {self.project_id}, location: {self.location}")
        
        try:
            # Initialize Vertex AI
            aiplatform.init(project=self.project_id, location=self.location)
            self.initialized = True
            logger.info("✅ Vertex AI initialized successfully")
        except Exception as e:
            print(f"⚠️  Vertex AI initialization failed: {e}")
            self.initialized = False
    
    def is_initialized(self) -> bool:
        """Check if Vertex AI is properly initialized"""
        return self.initialized
    
    def test_connection(self) -> Dict[str, Any]:
        """Test the Vertex AI connection"""
        if not self.initialized:
            return {
                "status": "not_initialized",
                "message": "Vertex AI not initialized. Check environment variables.",
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            return {
                "status": "connected",
                "project_id": self.project_id,
                "location": self.location,
                "initialized": self.initialized,
                "timestamp": datetime.now().isoformat(),
                "message": "Vertex AI is ready to use"
            }
        except Exception as e:
            logger.error(f"Vertex AI connection test failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def process_medical_transcript(self, transcript: str) -> Dict[str, Any]:
        """
        Process a medical transcript using Vertex AI
        For now, we'll create structured mock data that mimics what your agents will do
        """
        if not self.initialized:
            return self._mock_medical_analysis(transcript)
        
        logger.info(f"Processing medical transcript: {transcript[:50]}...")
        
        # For MVP, we'll return mock data that looks like agent output
        return {
            "status": "processed",
            "timestamp": datetime.now().isoformat(),
            "source": "vertex_ai_initialized",
            "agents_available": ["ClinicalDocumentationAgent", "TaskManagerAgent"],
            
            # Mock clinical documentation
            "clinical_documentation": {
                "soap_note": {
                    "subjective": f"Patient reports: {transcript}",
                    "objective": "Vital signs: Within normal limits",
                    "assessment": "Initial assessment based on presenting symptoms",
                    "plan": "Follow-up required for definitive diagnosis"
                },
                "patient_summary": "We've discussed your symptoms and next steps",
                "status": "draft"
            },
            
            # Mock tasks
            "tasks": [
                {
                    "id": "task_001",
                    "description": "Review diagnostic results",
                    "priority": "medium",
                    "assigned_to": "physician",
                    "due_date": datetime.now().isoformat()
                }
            ],
            
            "summary": {
                "main_findings": ["Symptoms documented", "Initial assessment complete"],
                "next_steps": ["Schedule follow-up", "Complete documentation"],
                "urgency": "routine"
            }
        }
    
    def _mock_medical_analysis(self, transcript: str) -> Dict[str, Any]:
        """Fallback mock analysis when Vertex AI isn't initialized"""
        return {
            "status": "mock_analysis",
            "timestamp": datetime.now().isoformat(),
            "source": "mock_fallback",
            "note": "Vertex AI not initialized. Using mock data.",
            
            "analysis": {
                "input_text": transcript,
                "recommendations": ["Clinical evaluation recommended"],
                "confidence": "mock_data"
            }
        }
    
    def simple_analysis(self, text: str) -> Dict[str, Any]:
        """
        Simple text analysis using Vertex AI
        This is a placeholder that will evolve into calling your specific agents
        """
        if not self.initialized:
            return self._mock_simple_analysis(text)
        
        # For now, return structured mock data
        # Later, we'll replace this with actual agent calls
        
        # Simple keyword analysis (mock)
        medical_keywords = {
            "pain": "Pain management consideration",
            "fever": "Possible infection",
            "cough": "Respiratory evaluation needed",
            "headache": "Neurological assessment",
            "nausea": "Gastrointestinal evaluation"
        }
        
        findings = []
        for keyword, assessment in medical_keywords.items():
            if keyword in text.lower():
                findings.append(assessment)
        
        return {
            "analysis": {
                "input_text": text,
                "detected_keywords": findings,
                "recommendations": ["Clinical evaluation recommended"] if findings else ["Routine follow-up"],
                "confidence": "vertex_ai_mock"
            },
            "vertex_ai_initialized": self.initialized,
            "timestamp": datetime.now().isoformat()
        }
    
    def _mock_simple_analysis(self, text: str) -> Dict[str, Any]:
        """Mock analysis when Vertex AI isn't available"""
        return {
            "analysis": {
                "input_text": text,
                "detected_keywords": ["Mock analysis"],
                "recommendations": ["Connect Vertex AI for real analysis"],
                "confidence": "mock_data"
            },
            "vertex_ai_initialized": False,
            "timestamp": datetime.now().isoformat(),
            "note": "Vertex AI not initialized. Using mock analysis."
        }

# Create a global instance for easy import
try:
    vertex_service = VertexAIService()
    print(f"✅ Vertex service created. Initialized: {vertex_service.initialized}")
except Exception as e:
    print(f"⚠️  Failed to create Vertex service: {e}")
    # Create a mock service
    vertex_service = None