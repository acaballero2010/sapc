import re
from typing import Dict, Any, List, Tuple, Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.models.chatbot import SentimentCategory

# Explicit Tagalog/Taglish & English Crisis and Self-Harm Override Keywords
CRITICAL_DISTRESS_KEYWORDS = [
    # Tagalog & Taglish Crisis Expressions
    "ayaw ko na", "pagod na mabuhay", "sinasaktan", "walang makain",
    "magpakamatay", "gusto ko nang mawala", "sukong suko na", "di ko na kaya",
    "hindi ko na kaya", "ayoko na", "suko na ako", "patayin",
    # English Crisis Expressions
    "suicide", "end my life", "kill myself", "depressed", "depression",
    "hopeless", "give up", "can't take it", "worthless", "self harm", "cutting",
    "overwhelmed", "panic attack", "anxiety", "breaking down", "abused",
    "violence at home", "starving", "no money for food", "dropout", "hate myself"
]

DOMAIN_KEYWORD_MAP = {
    "mental_health": [
        "sad", "depressed", "crying", "anxious", "stress", "sleep", "insomnia", 
        "panic", "lonely", "hopeless", "lungkot", "iyak", "takot", "balisa"
    ],
    "financial": [
        "tuition", "money", "allowance", "broke", "expensive", "fees", "bills", 
        "debt", "afford", "pera", "baon", "utang", "pambayad", "walang pera"
    ],
    "family": [
        "parents", "father", "mother", "fighting", "divorce", "abuse", "argument", 
        "home", "siblings", "magulang", "tatay", "nanay", "away", "kapatid"
    ],
    "academic": [
        "exam", "grades", "failed", "homework", "project", "deadline", "prof", 
        "teacher", "subject", "studying", "bagsak", "aral", "pasa", "guro"
    ],
    "health": [
        "sick", "hospital", "illness", "fever", "headache", "pain", "doctor", 
        "clinic", "medication", "sakit", "lagnat", "gamot", "doktor"
    ]
}

class NLPService:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

    def analyze_message(self, text: str) -> Dict[str, Any]:
        """
        Analyzes student text for sentiment, distress indicators, Tagalog/Taglish crisis triggers,
        and domain classification.
        """
        clean_text = text.lower().strip()
        scores = self.analyzer.polarity_scores(text)
        compound = scores["compound"] # -1.0 to 1.0

        # Exact phrase and keyword watcher for Tagalog & English crisis triggers
        detected_distress = []
        for kw in CRITICAL_DISTRESS_KEYWORDS:
            if kw in clean_text or re.search(r'\b' + re.escape(kw) + r'\b', clean_text):
                detected_distress.append(kw)

        # Classify inferred domain
        inferred_domain = "general"
        domain_match_counts = {}
        for domain, kws in DOMAIN_KEYWORD_MAP.items():
            count = sum(1 for kw in kws if kw in clean_text or re.search(r'\b' + re.escape(kw) + r'\b', clean_text))
            if count > 0:
                domain_match_counts[domain] = count

        if domain_match_counts:
            inferred_domain = max(domain_match_counts.items(), key=lambda x: x[1])[0]

        # Calculate normalized distress score (0.0 to 100.0)
        # If crisis keyword matched, elevate directly into high distress (>= 85.0)
        if detected_distress:
            sentiment_cat = SentimentCategory.DISTRESSED
            distress_score = max(85.0, min(100.0, 75.0 + (abs(compound) * 20.0) + (len(detected_distress) * 5.0)))
            counselor_flag = True
            flag_reason = f"Tagalog/English crisis trigger detected ({', '.join(detected_distress)})"
        elif compound <= -0.5:
            sentiment_cat = SentimentCategory.DISTRESSED
            distress_score = min(100.0, 60.0 + (abs(compound) * 40.0))
            counselor_flag = distress_score >= 80.0
            flag_reason = "High negative emotional distress index"
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
            "inferred_domain": inferred_domain if inferred_domain != "general" else ("mental_health" if detected_distress else "general"),
            "counselor_flag": counselor_flag,
            "crisis_flag": counselor_flag,
            "flag_reason": flag_reason
        }

    def compute_mental_health_risk_score(
        self, 
        chat_distress_scores: List[float], 
        survey_score: Optional[float] = None
    ) -> float:
        """
        Computes periodic Mental Health Risk Score (S_MH in [0.0, 100.0])
        aggregated from weekly chatbot sentiment trends and qualitative survey inputs.
        """
        if not chat_distress_scores and survey_score is None:
            return 15.0  # Baseline low risk
        
        avg_chat_distress = float(sum(chat_distress_scores) / len(chat_distress_scores)) if chat_distress_scores else 20.0
        
        if survey_score is not None:
            # 60% survey weight + 40% real-time chat trend
            s_mh = (0.60 * survey_score) + (0.40 * avg_chat_distress)
        else:
            s_mh = avg_chat_distress

        return round(float(max(0.0, min(100.0, s_mh))), 2)

    def generate_supportive_response(self, analysis: Dict[str, Any], message: str) -> Tuple[str, List[str]]:
        """
        Generates an empathetic and solution-oriented DSS chatbot response with crisis hotlines.
        """
        domain = analysis["inferred_domain"]
        is_distressed = analysis["counselor_flag"]

        resources = []
        if is_distressed:
            reply = (
                "I hear how overwhelming things feel right now, and I want you to know that you are not alone. "
                "I have notified the SAPC Guidance & Counseling Center so a counselor can reach out and provide safe, confidential support. "
                "Please connect with our guidance office or reach out immediately to the national 24/7 crisis hotlines listed below."
            )
            resources = [
                "SAPC Guidance & Counseling Office (Room 204, Bldg A • Mon-Fri 8AM-5PM)",
                "National Center for Mental Health (NCMH) Crisis Hotline: 1553 (Toll-Free 24/7)",
                "Hopeline Philippines: 0917-558-4673 / (02) 8804-4673",
                "Philippine Red Cross Helpline: 143"
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
