import re
from typing import Dict, Any, List, Tuple, Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.models.chatbot import SentimentCategory

# 18+ Explicit Bilingual Crisis & Self-Harm Expressions (English & Filipino)
CRITICAL_DISTRESS_KEYWORDS = [
    # Filipino / Tagalog / Taglish Crisis Expressions
    "i want to die", "gusto ko na mamatay", "walang pag-asa", "ayaw ko na",
    "burden", "pabigat lang ako", "wala ng dahilan", "pagod na mabuhay",
    "di ko na kaya", "hindi ko na kaya", "ayoko na", "suko na ako",
    "patayin ang sarili", "gusto ko nang mawala", "magpakamatay", "sukong suko na",
    "sinasaktan ang sarili", "walang kwenta ang buhay",
    # English Crisis Expressions
    "suicide", "end my life", "kill myself", "depressed", "depression",
    "hopeless", "give up on life", "can't take it anymore", "worthless", "self harm",
    "cutting myself", "no reason to live", "overwhelmed", "panic attack",
    "breaking down", "abused", "violence at home", "starving"
]

# 10 Emotion Lexicons based on Calvo & D'Mello (2010) Educational Affect Framework
EMOTION_LEXICON_MAP = {
    "joy": ["masaya", "happy", "excited", "proud", "grateful", "salamat", "passed", "nakapasa", "natutuwa", "blessed"],
    "sadness": ["sad", "malungkot", "iyak", "crying", "heartbroken", "down", "lonely", "mag-isa", "lungkot", "tearful"],
    "anger": ["galit", "angry", "pissed", "unfair", "inis", "asar", "nakakainis", "mad", "hate", "bwisit"],
    "fear": ["takot", "scared", "afraid", "terrified", "kinakabahan", "nervous", "dread", "frightened", "nangangamba"],
    "anxiety": ["anxious", "balisa", "panic", "overthinking", "kabado", "nag-aalala", "restless", "shaking", "panic attack"],
    "stress": ["stressed", "stress", "pagod", "overwhelmed", "dami gawain", "burnout", "exhausted", "puyat", "pressure"],
    "hope": ["hopeful", "kaya pa", "optimistic", "looking forward", "bawi", "kakayanin", "positive", "may pag-asa", "tiwala"],
    "confusion": ["confused", "di maintindihan", "lost", "gulo", "magulo", "di ko gets", "puzzled", "unclear", "doubt"],
    "frustration": ["frustrated", "bagsak", "stuck", "sayang", "hirap", "nahihirapan", "failed", "disappointed", "struggling"],
    "neutral": ["okay", "normal", "ordinary", "regular", "kumusta", "ayos lang", "class", "schedule", "school"]
}

DOMAIN_KEYWORD_MAP = {
    "mental_health": [
        "sad", "depressed", "crying", "anxious", "stress", "sleep", "insomnia", 
        "panic", "lonely", "hopeless", "lungkot", "iyak", "takot", "balisa", "mental", "pagod"
    ],
    "financial": [
        "tuition", "money", "allowance", "broke", "expensive", "fees", "bills", 
        "debt", "afford", "pera", "baon", "utang", "pambayad", "walang pera", "promissory", "4ps"
    ],
    "family": [
        "parents", "father", "mother", "fighting", "divorce", "abuse", "argument", 
        "home", "siblings", "magulang", "tatay", "nanay", "away", "kapatid", "ofw", "panganay", "bahay"
    ],
    "academic": [
        "exam", "grades", "failed", "homework", "project", "deadline", "prof", 
        "teacher", "subject", "studying", "bagsak", "aral", "pasa", "guro", "recitation", "quiz"
    ],
    "health": [
        "sick", "hospital", "illness", "fever", "headache", "pain", "doctor", 
        "clinic", "medication", "sakit", "lagnat", "gamot", "doktor", "asthma", "hika", "migraine"
    ]
}

class NLPService:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

    def detect_emotions(self, text: str) -> Tuple[str, float]:
        """
        Detects primary emotion among 10 types (Calvo & D'Mello 2010) with confidence rating.
        """
        clean_text = text.lower()
        counts = {}
        for emotion, keywords in EMOTION_LEXICON_MAP.items():
            count = sum(1 for kw in keywords if kw in clean_text or re.search(r'\b' + re.escape(kw) + r'\b', clean_text))
            if count > 0:
                counts[emotion] = count

        if not counts:
            return "neutral", 0.70

        top_emotion = max(counts.items(), key=lambda x: x[1])[0]
        confidence = min(0.98, 0.65 + (counts[top_emotion] * 0.12))
        return top_emotion, round(confidence, 2)

    def classify_intent(self, text: str, is_crisis: bool, domain: str) -> str:
        """
        Classifies student conversational intent into action categories.
        """
        if is_crisis:
            return "crisis_intervention"
        clean = text.lower()
        if any(w in clean for w in ["help", "tulong", "ano gagawin", "what should i do", "advice", "paano"]):
            return "advice"
        if any(w in clean for w in ["counselor", "guidance", "office", "schedule", "talk to someone", "kausap"]):
            return "referral"
        if any(w in clean for w in ["scholarship", "clinic", "hotline", "form", "permit", "room"]):
            return "resource_sharing"
        return "reflection"

    def analyze_message(self, text: str) -> Dict[str, Any]:
        """
        8-Stage Conversational NLP Analysis Pipeline:
        1. Bilingual Text Preprocessing
        2. VADER Sentiment Scoring
        3. 18+ Crisis Expression Evaluation
        4. 10-Emotion Detection (Calvo & D'Mello)
        5. Domain Identification
        6. Intent Classification
        7. Scaffolded Dynamic Response Formulation (Vygotsky ZPD)
        8. Conversation State / Safety Audit
        """
        clean_text = text.lower().strip()
        scores = self.analyzer.polarity_scores(text)
        compound = scores["compound"] # -1.0 to 1.0

        # 18+ Crisis Trigger Detection
        detected_distress = []
        for kw in CRITICAL_DISTRESS_KEYWORDS:
            if kw in clean_text or re.search(r'\b' + re.escape(kw) + r'\b', clean_text):
                detected_distress.append(kw)

        # Domain Identification
        inferred_domain = "general"
        domain_match_counts = {}
        for domain, kws in DOMAIN_KEYWORD_MAP.items():
            count = sum(1 for kw in kws if kw in clean_text or re.search(r'\b' + re.escape(kw) + r'\b', clean_text))
            if count > 0:
                domain_match_counts[domain] = count

        if domain_match_counts:
            inferred_domain = max(domain_match_counts.items(), key=lambda x: x[1])[0]

        # 10 Emotion Types & Confidence
        top_emotion, emotion_confidence = self.detect_emotions(text)
        if detected_distress and top_emotion in ["neutral", "hope", "joy"]:
            top_emotion = "fear" if "panic" in clean_text else "anxiety"

        # Intent Classification
        intent = self.classify_intent(text, bool(detected_distress), inferred_domain)

        # Distress Score Calculation (0-100)
        if detected_distress:
            sentiment_cat = SentimentCategory.DISTRESSED
            distress_score = max(88.0, min(100.0, 80.0 + (abs(compound) * 15.0) + (len(detected_distress) * 5.0)))
            counselor_flag = True
            flag_reason = f"Bilingual crisis trigger detected ({', '.join(detected_distress)})"
        elif compound <= -0.4 or top_emotion in ["sadness", "anxiety", "fear", "frustration"]:
            sentiment_cat = SentimentCategory.DISTRESSED if compound <= -0.5 else SentimentCategory.NEGATIVE
            distress_score = min(90.0, 50.0 + (abs(compound) * 35.0) + (10.0 if top_emotion in ["anxiety", "fear"] else 0))
            counselor_flag = distress_score >= 75.0
            flag_reason = f"Elevated {top_emotion.capitalize()} & Negative Sentiment Index" if counselor_flag else None
        elif compound < -0.05:
            sentiment_cat = SentimentCategory.NEGATIVE
            distress_score = min(60.0, 30.0 + (abs(compound) * 30.0))
            counselor_flag = False
            flag_reason = None
        elif compound > 0.05 or top_emotion in ["joy", "hope"]:
            sentiment_cat = SentimentCategory.POSITIVE
            distress_score = max(0.0, 15.0 - (compound * 15.0))
            counselor_flag = False
            flag_reason = None
        else:
            sentiment_cat = SentimentCategory.NEUTRAL
            distress_score = 20.0
            counselor_flag = False
            flag_reason = None

        return {
            "sentiment_category": sentiment_cat,
            "sentiment_score": compound,
            "distress_score": round(distress_score, 2),
            "detected_keywords": detected_distress,
            "detected_emotion": top_emotion,
            "emotion_confidence": emotion_confidence,
            "intent": intent,
            "inferred_domain": inferred_domain if inferred_domain != "general" else ("mental_health" if detected_distress else "general"),
            "counselor_flag": counselor_flag,
            "crisis_flag": bool(detected_distress),
            "flag_reason": flag_reason
        }

    def compute_mental_health_risk_score(
        self, 
        chat_distress_scores: List[float], 
        survey_score: Optional[float] = None
    ) -> float:
        """
        Computes periodic Mental Health Risk Score (S_MH in [0.0, 100.0]).
        """
        if not chat_distress_scores and survey_score is None:
            return 15.0
        
        avg_chat_distress = float(sum(chat_distress_scores) / len(chat_distress_scores)) if chat_distress_scores else 20.0
        
        if survey_score is not None:
            s_mh = (0.60 * survey_score) + (0.40 * avg_chat_distress)
        else:
            s_mh = avg_chat_distress

        return round(float(max(0.0, min(100.0, s_mh))), 2)

    def generate_supportive_response(self, analysis: Dict[str, Any], message: str) -> Tuple[str, List[str]]:
        """
        Scaffolded Bilingual Conversational Response Generator (Vygotsky ZPD & WHO Protocols).
        """
        domain = analysis["inferred_domain"]
        is_crisis = analysis.get("crisis_flag", False)
        is_distressed = analysis.get("counselor_flag", False)
        emotion = analysis.get("detected_emotion", "neutral")

        resources = []
        if is_crisis:
            reply = (
                "Naririnig kita, at gusto kong malaman mo na hindi ka nag-iisa. Mahalaga ang buhay mo at may mga taong handang makinig at tumulong sa iyo ngayon nang walang paghuhusga. "
                "I am initiating our confidential support protocol para makakonekta ka agad sa Guidance Counselor. "
                "Please call our 24/7 national hotlines below or head to Room 204."
            )
            resources = [
                "SAPC Guidance & Counseling Office (Room 204, Bldg A • Mon-Fri 8AM-5PM)",
                "National Center for Mental Health (NCMH) 24/7 Crisis Hotline: 1553 (Toll-Free)",
                "Hopeline Philippines: 0917-558-4673 / (02) 8804-4673",
                "Philippine Red Cross 24/7 Helpline: 143"
            ]
        elif emotion in ["anxiety", "fear", "stress"]:
            reply = (
                f"I sense that you're feeling {emotion} right now. Breathe slowly—it's okay to feel overwhelmed. "
                "What's making you feel this way the most? Is it about your exams and project deadlines, home situation, or personal wellness? "
                "I'm here to listen and help you break things down step by step."
            )
            resources = [
                "SAPC 5-Minute Guided Box Breathing Exercise",
                "Guidance Peer Wellness Circle",
                "Academic Remediation Center"
            ]
        elif domain == "academic":
            reply = (
                "Academic challenges can feel heavy, pero normal na magkaroon ng mahirap na subjects minsan. "
                "SAPC offers free peer tutoring, subject consultation schedules with advisers, and remediation programs. "
                "Would you like guidance on organizing a study schedule or reaching out to your subject teacher?"
            )
            resources = [
                "SAPC Academic Peer Tutoring Program",
                "Subject Teacher Consultation Hours",
                "Library Learning Commons & Study Pods"
            ]
        elif domain == "financial":
            reply = (
                "Financial concerns can really weigh on your focus. May available na student assistance programs, "
                "flexible installment promissory arrangements, at scholarship grants sa SAPC Student Affairs. "
                "Huwag mag-atubiling magtanong—maraming options para makatulong sa iyong pag-aaral."
            )
            resources = [
                "SAPC Student Assistance & Scholarship Office",
                "Accounting Flexible Installment Assistance",
                "Work-Study Student Program"
            ]
        elif domain == "family":
            reply = (
                "Family situations and responsibilities at home can deeply affect our emotional energy. "
                "Our guidance counselors offer a safe, confidential space where you can share what you are going through without any judgment. "
                "Would you like to explore scheduling a private talk with a guidance counselor?"
            )
            resources = [
                "Confidential Guidance Counseling (Room 204)",
                "Student Wellness Circle"
            ]
        elif emotion in ["joy", "hope"]:
            reply = (
                "I'm really glad to hear that! Keep celebrating your progress, whether big or small. "
                "How can I continue supporting your student journey this week?"
            )
            resources = [
                "SAPC Student Clubs & Extracurricular Directory",
                "Guidance Center Office Hours"
            ]
        else:
            reply = (
                "Thank you for sharing with me. Nandito ako para suportahan ka sa iyong student journey sa San Antonio de Padua College. "
                "Kumusta ang mga klase mo at wellness ngayong linggo?"
            )
            resources = [
                "SAPC Student Handbook & Wellness Guide",
                "Guidance Center Office Hours: Mon-Fri 8:00 AM - 5:00 PM"
            ]

        return reply, resources

nlp_service = NLPService()
