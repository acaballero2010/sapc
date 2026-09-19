import pytest
from app.services.nlp_service import nlp_service
from app.models.chatbot import SentimentCategory

def test_nlp_distress_detection():
    msg = "I feel completely hopeless and depressed, I cannot handle my exams anymore"
    result = nlp_service.analyze_message(msg)
    assert result["counselor_flag"] is True
    assert result["sentiment_category"] == SentimentCategory.DISTRESSED
    assert "hopeless" in result["detected_keywords"] or "depressed" in result["detected_keywords"]
    assert result["inferred_domain"] in ["mental_health", "academic"]

def test_nlp_financial_domain_inference():
    msg = "My family is struggling to pay my tuition fee and allowance this semester"
    result = nlp_service.analyze_message(msg)
    assert result["inferred_domain"] == "financial"

def test_nlp_supportive_response_generation():
    analysis = nlp_service.analyze_message("I am really overwhelmed and want to give up")
    reply, resources = nlp_service.generate_supportive_response(analysis, "I am really overwhelmed and want to give up")
    assert len(resources) > 0
    assert "Guidance" in reply or "hotline" in reply or "support" in reply
