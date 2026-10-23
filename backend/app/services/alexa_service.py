import json
from typing import Dict, Any, List
from app.config import settings
from app.services.evermind_engine import evermind_engine
from app.services.looseends_engine import looseends_engine
from app.services.doorstepops_service import doorstepops_service
from app.services.formshift_service import formshift_service

class AlexaService:
    def __init__(self):
        self.skill_id = settings.ALEXA_SKILL_ID

    def get_status(self) -> Dict[str, Any]:
        """
        Reports honest Alexa+ developer requirements and integration readiness.
        """
        is_configured = bool(self.skill_id)
        return {
            "status": "Available" if is_configured else "Authentication Required",
            "skill_id": self.skill_id or None,
            "ready_for_voice_requests": True,
            "supported_intents": [
                "GetEvermindMemoryIntent",
                "SummarizeCommitmentsIntent",
                "ReviewIncidentsIntent",
                "StartFormShiftWorkoutIntent"
            ],
            "requirements": (
                "To link with your Amazon Echo or Alexa+ device:\n"
                "1. Register a Custom Skill in the Alexa Developer Console (developer.amazon.com/alexa).\n"
                "2. Upload the Everlife AI Interaction Model JSON (downloadable from Integrations tab).\n"
                "3. Set HTTPS endpoint to your deployed Everlife AI Alexa webhook URL.\n"
                "4. Paste your Alexa Skill ID in Settings."
            )
        }

    def handle_alexa_request(self, body: Dict[str, Any]) -> Dict[str, Any]:
        """
        Standard Alexa Skills Kit (ASK) request handler compliant with Amazon Alexa API specifications.
        """
        req_type = body.get("request", {}).get("type", "LaunchRequest")

        if req_type == "LaunchRequest":
            speech = "Welcome to Everlife AI powered by Evermind. You can ask for your recent memories, unresolved commitments, business incident updates, or start a Fire TV workout."
            return self._build_alexa_response(speech, should_end=False)

        if req_type == "IntentRequest":
            intent_name = body.get("request", {}).get("intent", {}).get("name", "")
            slots = body.get("request", {}).get("intent", {}).get("slots", {})

            if intent_name == "GetEvermindMemoryIntent":
                query_slot = slots.get("Query", {}).get("value", "")
                result = evermind_engine.search_and_ground_answer(query_slot, top_k=2)
                speech = result.answer.split("Evidence Citations:")[0].strip()
                return self._build_alexa_response(speech)

            elif intent_name == "SummarizeCommitmentsIntent":
                commitments = looseends_engine.list_commitments(resolution_status="open")
                if not commitments:
                    speech = "You have no unresolved commitments in LooseEnds AI."
                else:
                    bullets = [f"{c.description}" for c in commitments[:3]]
                    speech = f"You have {len(commitments)} open commitment(s). The top ones are: " + "; ".join(bullets)
                return self._build_alexa_response(speech)

            elif intent_name == "ReviewIncidentsIntent":
                incidents = doorstepops_service.list_incidents(resolution_status="open")
                if not incidents:
                    speech = "All DoorstepOps business incidents are resolved. No active security cases."
                else:
                    top = incidents[0]
                    speech = f"There is an active {top.priority} priority incident from {top.source_device}: {top.description}."
                return self._build_alexa_response(speech)

            elif intent_name == "StartFormShiftWorkoutIntent":
                category = slots.get("Category", {}).get("value", "strength").lower()
                session = formshift_service.start_session(category=category)
                speech = f"Starting your FormShift {session.title} on Fire TV. Get ready for your first exercise: {session.exercises[0]['name']}."
                return self._build_alexa_response(speech)

        speech = "Everlife AI received your request. Ask for your memories, commitments, incidents, or workouts."
        return self._build_alexa_response(speech)

    def get_interaction_model_json(self) -> Dict[str, Any]:
        """
        Returns the official Amazon Alexa Developer Console Interaction Model JSON.
        """
        return {
            "interactionModel": {
                "languageModel": {
                    "invocationName": "everlife",
                    "intents": [
                        {
                            "name": "AMAZON.CancelIntent",
                            "samples": []
                        },
                        {
                            "name": "AMAZON.HelpIntent",
                            "samples": ["help", "what can you do"]
                        },
                        {
                            "name": "AMAZON.StopIntent",
                            "samples": ["stop", "exit"]
                        },
                        {
                            "name": "GetEvermindMemoryIntent",
                            "slots": [
                                {"name": "Query", "type": "AMAZON.SearchQuery"}
                            ],
                            "samples": [
                                "what did we decide about {Query}",
                                "what do you remember about {Query}",
                                "check evermind for {Query}",
                                "ask evermind {Query}"
                            ]
                        },
                        {
                            "name": "SummarizeCommitmentsIntent",
                            "samples": [
                                "what are my commitments",
                                "what do I need to follow up on",
                                "check loose ends",
                                "list my open commitments"
                            ]
                        },
                        {
                            "name": "ReviewIncidentsIntent",
                            "samples": [
                                "check ring incidents",
                                "any security cases",
                                "what happened at the doorstep",
                                "report doorstep ops"
                            ]
                        },
                        {
                            "name": "StartFormShiftWorkoutIntent",
                            "slots": [
                                {"name": "Category", "type": "AMAZON.Genre"}
                            ],
                            "samples": [
                                "start a workout",
                                "start form shift",
                                "start a {Category} workout on fire tv"
                            ]
                        }
                    ]
                }
            }
        }

    def _build_alexa_response(self, text: str, should_end: bool = True) -> Dict[str, Any]:
        return {
            "version": "1.0",
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": text
                },
                "shouldEndSession": should_end
            }
        }

alexa_service = AlexaService()
