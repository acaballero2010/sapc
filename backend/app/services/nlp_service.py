import re
from typing import Dict, Any, List, Tuple
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.models.chatbot import SentimentCategory

# High-risk / distress terminology indicating mental health, severe family, or suicide crisis
CRITICAL_DISTRESS_KEYWORDS = [
    "hopeless", "give up", "suicide", "end my life", "depressed", "depression",
    "can't take it", "worthless", "self harm", "cutting", "overwhelmed",
    "panic attack", "anxiety", "breaking down", "abused", "violence at home",
    "starving", "no money for food", "dropout", "drop out", "hate myself"
]

DOMAIN_KEYWORD_MAP = {
    "mental_health": ["sad", "depressed", "crying", "anxious", "stress", "sleep", "insomnia", "panic", "lonely", "hopeless"],
    "financial": ["tuition", "money", "allowance", "broke", "expensive", "fees", "bills", "debt", "afford"],
    "family": ["parents", "father", "mother", "fighting", "divorce", "abuse", "argument", "home", "siblings"],
    "academic": ["exam", "grades", "failed", "homework", "project", "deadline", "prof", "teacher", "subject", "studying"],
    "health": ["sick", "hospital", "illness", "fever", "headache", "pain", "doctor", "clinic", "medication"]
}

class NLPService:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

    def analyze_message(self, text: str) -> Dict[str, Any]:
        """
        Analyzes student text for sentiment, distress indicators, and domain classification.
        """
        clean_text = text.lower().strip()
        scores = self.analyzer.polarity_scores(text)
        compound = scores["compound"] # -1.0 to 1.0

        # Detect critical distress keywords
        detected_distress = []
        for kw in CRITICAL_DISTRESS_KEYWORDS:
            if re.search(r'\b' + re.escape(kw) + r'\b', clean_text):
                detected_distress.append(kw)

        # Classify inferred domain
        inferred_domain = "general"
        domain_match_counts = {}
        for domain, kws in DOMAIN_KEYWORD_MAP.items():
            count = sum(1 for kw in kws if re.search(r'\b' + re.escape(kw) + r'\b', clean_text))
            if count > 0:
                domain_match_counts[domain] = count

        if domain_match_counts:
            inferred_domain = max(domain_match_counts.items(), key=lambda x: x[1])[0]

        # Determine sentiment category & distress level
        if detected_distress or compound <= -0.5:
            sentiment_cat = SentimentCategory.DISTRESSED
            # Map compound to 0-100 distress score
            distress_score = min(100.0, 50.0 + (abs(compound) * 30.0) + (len(detected_distress) * 20.0))
            counselor_flag = True
            flag_reason = f"Distress detected ({', '.join(detected_distress) if detected_distress else 'High negative sentiment'})"
        elif compound < -0.05:
            sentiment_cat = SentimentCategory.NEGATIVE
            distress_score = min(60.0, 30.0 + (abs(compound) * 30.0))
            counselor_flag = False
            flag_reason = None
        elif compound > 0.05:
            sentiment_cat = SentimentCategory.POSITIVE
            distress_score = max(0.0, 20.0 - (compound * 20.0))
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
            "inferred_domain": inferred_domain,
            "counselor_flag": counselor_flag,
            "flag_reason": flag_reason
        }

    def generate_supportive_response(self, analysis: Dict[str, Any], message: str) -> Tuple[str, List[str]]:
        """
        Generates an empathetic and solution-oriented DSS chatbot response with recommended resources.
        """
        domain = analysis["inferred_domain"]
        is_distressed = analysis["counselor_flag"]

        resources = []
        if is_distressed:
            reply = (
                "I hear how overwhelming things feel right now, and I want you to know you don't have to carry this alone. "
                "I have notified the SAPC Guidance Center so a counselor can reach out and provide confidential support. "
                "If you are in immediate distress, please connect with the guidance clinic or our 24/7 hotline."
            )
            resources = [
                "SAPC Guidance & Counseling Office (Room 204, Bldg A)",
                "National Center for Mental Health Crisis Hotline: 1553",
                "Hopeline Philippines: 0917-558-4673"
            ]
        elif domain == "academic":
            reply = (
                "Academic challenges can be stressful, but with structured support you can definitely improve your standing. "
                "SAPC offers peer tutoring, study consultations with your subject teachers, and academic remediation sessions."
            )
            resources = [
                "SAPC Academic Tutoring Program",
                "Consultation Schedule with Subject Advisers",
                "Library Learning Commons"
            ]
        elif domain == "financial":
            reply = (
                "Financial concerns can weigh heavily on your focus. SAPC has student assistance funds, flexible payment plans, "
                "and scholarship grants available through the Student Affairs Office."
            )
            resources = [
                "SAPC Student Assistance & Scholarship Office",
                "Accounting Office Flexible Installment Assistance",
                "Work-Study Student Program"
            ]
        elif domain == "family":
            reply = (
                "Family situations can deeply impact your emotional well-being and focus. Our guidance counselors offer "
                "a safe, neutral space to talk through what you are experiencing."
            )
            resources = [
                "Confidential Guidance Counseling",
                "Student Wellness Circle"
            ]
        else:
            reply = (
                "Thank you for sharing with me. I am here to help support your student journey at San Antonio de Padua College. "
                "How are your classes and wellness going this week?"
            )
            resources = [
                "SAPC Student Handbook & Wellness Guide",
                "Guidance Center Office Hours: Mon-Fri 8:00 AM - 5:00 PM"
            ]

        return reply, resources

nlp_service = NLPService()
