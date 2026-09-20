import pytest
from app.services.nlp_service import nlp_service
from app.models.chatbot import SentimentCategory

def test_nlp_distress_detection_english():
    msg = "I feel completely hopeless and depressed, I cannot handle my exams anymore"
    result = nlp_service.analyze_message(msg)
    assert result["counselor_flag"] is True
    assert result["crisis_flag"] is True
    assert result["sentiment_category"] == SentimentCategory.DISTRESSED
    assert "hopeless" in result["detected_keywords"] or "depressed" in result["detected_keywords"]
    assert result["distress_score"] >= 75.0

def test_nlp_tagalog_taglish_crisis_override():
    # Tagalog crisis triggers
    tagalog_inputs = [
        "Sobrang pagod na mabuhay, ayaw ko na talaga",
        "Palagi akong sinasaktan sa bahay at walang makain",
        "Gusto ko nang mawala, di ko na kaya ang pressure"
    ]
    for text in tagalog_inputs:
        res = nlp_service.analyze_message(text)
        assert res["crisis_flag"] is True
        assert res["counselor_flag"] is True
        assert res["distress_score"] >= 85.0
        assert len(res["detected_keywords"]) > 0

def test_nlp_financial_domain_inference():
    msg = "My family is struggling to pay my tuition fee and allowance this semester, walang pera pambayad"
    result = nlp_service.analyze_message(msg)
    assert result["inferred_domain"] == "financial"

def test_nlp_supportive_response_with_crisis_hotline():
    analysis = nlp_service.analyze_message("Ayaw ko na, pagod na mabuhay")
    reply, resources, is_gemini, model = nlp_service.generate_supportive_response(analysis, "Ayaw ko na, pagod na mabuhay")
    assert len(resources) >= 3
    assert any("1553" in r or "National Center for Mental Health" in r for r in resources)
    assert "Guidance" in reply or "hotline" in reply or "support" in reply
    assert is_gemini is False
    assert model is None

def test_compute_mental_health_risk_score():
    # Aggregated weekly chatbot sentiment + survey inputs
    weekly_chat_distress = [85.0, 90.0, 80.0]  # avg = 85.0
    survey_input = 75.0
    # Expected: (0.60 * 75.0) + (0.40 * 85.0) = 45.0 + 34.0 = 79.0
    s_mh = nlp_service.compute_mental_health_risk_score(weekly_chat_distress, survey_input)
    assert s_mh == 79.0
    assert 0.0 <= s_mh <= 100.0

def test_gemini_guidance_fallback_without_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    analysis = nlp_service.analyze_message("Nahihirapan po ako sa math exam")
    reply, resources, is_gemini, model = nlp_service.generate_supportive_response(
        analysis=analysis,
        message="Nahihirapan po ako sa math exam",
        conversation_history=[{"sender": "student", "text": "Hi po"}],
        student_context={"name": "Juan Dela Cruz", "year_level": "Grade 11 - STEM"}
    )
    assert reply is not None
    assert len(reply) > 10
    assert len(resources) > 0
    assert is_gemini is False
    assert model is None

def test_gemini_guidance_successful_response(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_dummy_key_123")
    monkeypatch.setattr(
        nlp_service, 
        "call_gemini_guidance", 
        lambda message, analysis, conversation_history=None, student_context=None: (
            "Kumusta Juan! Normal lang ang kaba sa Math exam. Narito ang ilang hakbang para mag-review nang maayos.",
            "gemini-2.5-flash"
        )
    )
    analysis = nlp_service.analyze_message("Nahihirapan po ako sa math exam")
    reply, resources, is_gemini, model = nlp_service.generate_supportive_response(
        analysis=analysis,
        message="Nahihirapan po ako sa math exam",
        conversation_history=[{"sender": "student", "text": "Hi po"}],
        student_context={"name": "Juan Dela Cruz", "year_level": "Grade 11 - STEM"}
    )
    assert "Juan" in reply
    assert is_gemini is True
    assert model == "gemini-2.5-flash"
def test_student_intent_accuracy():
    # 1. Academic query should NOT be classified as greeting
    analysis_acad = nlp_service.analyze_message("Nahihirapan po ako sa subjects ko")
    assert analysis_acad["inferred_domain"] == "academic"
    assert analysis_acad["intent"] == "advice"
    reply_acad, resources_acad, _, _ = nlp_service.generate_supportive_response(
        analysis=analysis_acad,
        message="Nahihirapan po ako sa subjects ko"
    )
    assert "Peer Tutoring" in str(resources_acad)
    assert "academic" in reply_acad.lower() or "subjects" in reply_acad.lower() or "tutoring" in reply_acad.lower()

    # 2. Companionship query
    analysis_comp = nlp_service.analyze_message("Gusto ko ng kausap")
    assert analysis_comp["intent"] == "companionship"
    reply_comp, resources_comp, _, _ = nlp_service.generate_supportive_response(
        analysis=analysis_comp,
        message="Gusto ko ng kausap"
    )
    assert "makinig" in reply_comp.lower() or "nandito ako" in reply_comp.lower()

    # 3. Pure greeting query
    analysis_greet = nlp_service.analyze_message("Magandang umaga po")
    assert analysis_greet["intent"] == "greeting"


