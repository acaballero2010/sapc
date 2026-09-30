import re
import os
import random
from typing import Dict, Any, List, Tuple, Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.models.chatbot import SentimentCategory

# 25+ Explicit Bilingual Crisis & Self-Harm Expressions (English & Filipino)
CRITICAL_DISTRESS_KEYWORDS = [
    # Filipino / Tagalog / Taglish Crisis Expressions
    "i want to die", "gusto ko na mamatay", "walang pag-asa", "ayaw ko na",
    "burden", "pabigat lang ako", "wala ng dahilan", "pagod na mabuhay",
    "di ko na kaya", "hindi ko na kaya", "ayoko na", "suko na ako",
    "patayin ang sarili", "gusto ko nang mawala", "magpakamatay", "sukong suko na",
    "sinasaktan ang sarili", "sinasaktan sa bahay", "sinasaktan", "walang kwenta ang buhay",
    "walang makain", "ginugutom", "nagugutom kami",
    # English Crisis Expressions
    "suicide", "end my life", "kill myself", "depressed", "depression",
    "hopeless", "give up on life", "can't take it anymore", "worthless", "self harm",
    "cutting myself", "no reason to live", "overwhelmed", "panic attack",
    "breaking down", "abused", "violence at home", "starving"
]

# 10 Emotion Lexicons based on Calvo & D'Mello (2010) Educational Affect Framework
EMOTION_LEXICON_MAP = {
    "joy": ["masaya", "happy", "excited", "proud", "grateful", "salamat", "passed", "nakapasa", "natutuwa", "blessed", "good", "great"],
    "sadness": ["sad", "malungkot", "iyak", "crying", "heartbroken", "down", "lonely", "mag-isa", "lungkot", "tearful", "depressed", "luha"],
    "anger": ["galit", "angry", "pissed", "unfair", "inis", "asar", "nakakainis", "mad", "hate", "bwisit", "gigil"],
    "fear": ["takot", "scared", "afraid", "terrified", "kinakabahan", "nervous", "dread", "frightened", "nangangamba", "kaba"],
    "anxiety": ["anxious", "balisa", "panic", "overthinking", "kabado", "nag-aalala", "restless", "shaking", "panic attack", "di makatulog"],
    "stress": ["stressed", "stress", "pagod", "overwhelmed", "dami gawain", "burnout", "exhausted", "puyat", "pressure", "hirap"],
    "hope": ["hopeful", "kaya pa", "optimistic", "looking forward", "bawi", "kakayanin", "positive", "may pag-asa", "tiwala", "ayos"],
    "confusion": ["confused", "di maintindihan", "lost", "gulo", "magulo", "di ko gets", "puzzled", "unclear", "doubt", "paano"],
    "frustration": ["frustrated", "bagsak", "stuck", "sayang", "hirap", "nahihirapan", "failed", "disappointed", "struggling", "walang kwenta"],
    "neutral": ["okay", "normal", "ordinary", "regular", "kumusta", "ayos lang", "class", "schedule", "school", "info"]
}

def has_keyword_match(text: str, keywords: List[str]) -> bool:
    clean = text.lower()
    for kw in keywords:
        kw_clean = kw.lower().strip()
        pattern = r'(?:\b|\A)' + re.escape(kw_clean) + r'(?:\b|\Z)'
        if re.search(pattern, clean):
            return True
    return False

DOMAIN_KEYWORD_MAP = {
    "mental_health": [
        "sad", "depressed", "crying", "anxious", "stress", "sleep", "insomnia", 
        "panic", "lonely", "hopeless", "lungkot", "iyak", "takot", "balisa", "mental", "pagod", "kausap", "mag-isa"
    ],
    "financial": [
        "tuition", "money", "allowance", "broke", "expensive", "fees", "bills", 
        "debt", "afford", "pera", "baon", "utang", "pambayad", "walang pera", "promissory", "4ps", "financial"
    ],
    "family": [
        "parents", "father", "mother", "fighting", "divorce", "abuse", "argument", 
        "home", "siblings", "magulang", "tatay", "nanay", "away", "kapatid", "ofw", "panganay", "bahay", "family"
    ],
    "academic": [
        "exam", "exams", "grades", "grade", "failed", "homework", "project", "deadline", "deadlines", "prof", 
        "teacher", "subject", "subjects", "studying", "study", "bagsak", "aral", "pasa", "guro", 
        "recitation", "quiz", "quizzes", "math", "science", "chemistry", "physics", "calculus", 
        "research", "thesis", "nahihirapan", "hirap", "lesson", "lessons", "mababa", "module", "modules",
        "requirement", "requirements", "daming requirements", "dami requirements", "tambak", "gawain", 
        "simula", "magsimula", "unahin", "prioritize", "study plan"
    ],
    "health": [
        "sick", "hospital", "illness", "fever", "headache", "pain", "doctor", 
        "clinic", "medication", "sakit", "lagnat", "gamot", "doktor", "asthma", "hika", "migraine", "health"
    ]
}

SUBJECT_NAMES = [
    "General Mathematics", "Math", "Pre-Calculus", "Calculus", "Basic Calculus",
    "General Chemistry", "Chemistry", "General Physics", "Physics", "General Biology", "Biology",
    "Oral Communication", "Reading and Writing", "Komunikasyon", "Pagbasa at Pagsusuri",
    "21st Century Literature", "Contemporary Philippine Arts", "Media and Information Literacy",
    "Empowerment Technologies", "Understanding Culture, Society and Politics", "UCSP",
    "Physical Science", "Earth and Life Science", "Disaster Readiness", "DRRR",
    "Practical Research", "Research", "Inquiries, Investigations and Immersion", "3Is",
    "Accountancy", "Business Math", "Economics", "Philosophy", "English", "Filipino"
]

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
            count = sum(1 for kw in keywords if has_keyword_match(clean_text, [kw]))
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

        # 1. Companionship
        if has_keyword_match(clean, ["kausap", "makausap", "talk to someone", "lonely", "mag-isa", "wala akong kaibigan", "samahan", "kwentuhan"]):
            return "companionship"

        # 2. Academic difficulty, requirements overload & study advice
        if domain == "academic" or has_keyword_match(clean, [
            "nahihirapan", "hirap", "bagsak", "failed", "grades", "subject", "subjects", 
            "exam", "exams", "lesson", "lessons", "homework", "requirement", "requirements", 
            "daming requirements", "dami requirements", "paano magsimula", "paano simulan", 
            "tambak", "unahin", "prioritize", "study tips"
        ]):
            return "advice"

        # 3. General advice / help
        if has_keyword_match(clean, ["help", "tulong", "ano gagawin", "what should i do", "advice", "paano", "tips"]):
            return "advice"

        # 4. Referrals
        if has_keyword_match(clean, ["counselor", "guidance", "office", "schedule", "appointment"]):
            return "referral"

        # 5. Resources
        if has_keyword_match(clean, ["scholarship", "clinic", "hotline", "form", "permit", "room", "handbook", "hours"]):
            return "resource_sharing"

        # 6. Gratitude
        if has_keyword_match(clean, ["salamat", "thank you", "thanks", "appreciate", "ok na", "okay na"]):
            return "gratitude"

        # 7. Greeting (Only for standalone greeting or very short greetings)
        greeting_words = ["hi", "hello", "kumusta", "kamusta", "hey", "good morning", "magandang umaga", "magandang hapon", "good afternoon", "good evening", "magandang gabi"]
        if clean in greeting_words or (len(clean.split()) <= 3 and has_keyword_match(clean, greeting_words)):
            return "greeting"

        return "reflection"

    def analyze_message(self, text: str) -> Dict[str, Any]:
        """
        8-Stage Conversational NLP Analysis Pipeline:
        1. Bilingual Text Preprocessing
        2. VADER Sentiment Scoring
        3. 25+ Crisis Expression Evaluation
        4. 10-Emotion Detection (Calvo & D'Mello)
        5. Domain Identification
        6. Intent Classification
        7. Scaffolded Dynamic Response Formulation (Vygotsky ZPD)
        8. Conversation State / Safety Audit
        """
        clean_text = text.lower().strip()
        scores = self.analyzer.polarity_scores(text)
        compound = scores["compound"] # -1.0 to 1.0

        # 25+ Crisis Trigger Detection
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
        elif compound < -0.05 or intent == "companionship":
            sentiment_cat = SentimentCategory.NEGATIVE if compound < -0.05 else SentimentCategory.NEUTRAL
            distress_score = min(60.0, 30.0 + (abs(compound) * 30.0) + (15.0 if intent == "companionship" else 0))
            counselor_flag = False
            flag_reason = None
        elif compound > 0.05 or top_emotion in ["joy", "hope"] or intent == "gratitude":
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
            "inferred_domain": inferred_domain if inferred_domain != "general" else ("mental_health" if detected_distress or intent == "companionship" else "general"),
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

    def extract_detected_subject(self, text: str) -> Optional[str]:
        clean = text.lower()
        for subj in SUBJECT_NAMES:
            if re.search(r'\b' + re.escape(subj.lower()) + r'\b', clean):
                return subj
        return None

    def get_contextual_resources(self, domain: str, emotion: str, detected_subject: Optional[str] = None) -> List[str]:
        """
        Returns relevant SAPC institutional resources matching the identified domain and emotion.
        """
        if domain == "academic":
            subj_label = f" for {detected_subject}" if detected_subject else ""
            return [
                f"SAPC Academic Peer Tutoring{subj_label} (Room 104, Learning Commons)",
                "Subject Teacher Consultation & Remedial Program",
                "Form 137 / Grade Recovery Roadmap"
            ]
        elif domain == "financial":
            return [
                "SAPC Student Assistance & Scholarship Office (Bldg A Ground Floor)",
                "Accounting Office Promissory Note Support",
                "Work-Study Student Program Application"
            ]
        elif domain == "family":
            return [
                "Confidential Family Counseling Assistance (Room 204)",
                "Guidance Wellness Safe Space",
                "Student Welfare Support"
            ]
        elif domain == "health":
            return [
                "SAPC Health Services Clinic (Ground Floor, Admin Bldg)",
                "Campus Physician Consultation: Mon-Fri 9AM-3PM",
                "Emergency First Aid & Health Clearance"
            ]
        elif emotion in ["anxiety", "fear"]:
            return [
                "5-Minute Guided Box Breathing Technique",
                "SAPC Peer Wellness Support Circle",
                "Guidance Relaxation & Mindfulness Corner (Room 204)"
            ]
        else:
            return [
                "SAPC Guidance & Counseling Center (Room 204, Bldg A • Mon-Fri 8AM-5PM)",
                "Counselor Direct Email: guidance@sapc.edu.ph",
                "Online Appointment Request via Student Dashboard"
            ]

    def call_gemini_guidance(
        self, 
        message: str, 
        analysis: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        student_context: Optional[Dict[str, Any]] = None,
        knowledge_context: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Calls Google Gemini Generative API (e.g. gemini-2.5-flash, gemini-1.5-flash, gemini-2.0-flash)
        for personalized, highly empathetic, culturally-grounded counseling dialogue.
        Supports multi-turn conversational history, student profile awareness, and dynamic institutional knowledge injection.
        Falls back gracefully if GEMINI_API_KEY is not configured or on network timeout.
        Returns: (response_text, model_name_used)
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None, None

        primary_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        candidate_models = [primary_model]
        for fallback in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        domain = analysis.get("inferred_domain", "general")
        emotion = analysis.get("detected_emotion", "neutral")
        confidence = analysis.get("emotion_confidence", 0.85)
        intent = analysis.get("intent", "reflection")
        subject = self.extract_detected_subject(message)

        student_name = student_context.get("name", "Student") if student_context else "Student"
        student_year = student_context.get("year_level", "") if student_context else ""
        student_strand = student_context.get("strand", "") if student_context else ""
        student_desc = f"Student Name: {student_name}" + (f", Level: {student_year}" if student_year else "") + (f", Strand/Course: {student_strand}" if student_strand else "")

        # Format Institutional Knowledge Base context if matched
        kb_prompt_section = ""
        if knowledge_context and len(knowledge_context) > 0:
            kb_prompt_section = "\n\n--- INSTITUTIONAL COUNSELOR KNOWLEDGE BASE (TRAINED GUIDELINES & POLICIES) ---\n"
            kb_prompt_section += "The registered guidance counselors of SAPC have explicitly trained the following official guidelines, steps, and campus resources for this scenario. Ground your factual advice (room numbers, schedules, steps) on these institutional guidelines:\n"
            for item in knowledge_context:
                title = item.get("title", "Guidance Policy")
                content = item.get("content", "")
                res_list = item.get("resources", [])
                res_str = f" | Campus Resources: {', '.join(res_list)}" if res_list else ""
                kb_prompt_section += f"• [{title}]: {content}{res_str}\n"
            kb_prompt_section += "--------------------------------------------------------------------------------\n"

        system_prompt = (
            "You are the official AI Guidance Counselor Companion for San Antonio de Padua College (SAPC), "
            "modeled after a compassionate, warm, and highly skilled Registered Guidance Counselor (RGC).\n\n"
            "CRITICAL COUNSELOR BEHAVIORAL RULES:\n"
            "1. NEVER give a quick brush-off or immediately deflect/redirect the student to the Guidance Office or Room 204. "
            "Your first duty is to BE THERE FOR THEM: listen attentively, hold space, and genuinely converse with empathy.\n"
            "2. EMOTIONAL VALIDATION FIRST: Acknowledge what the student is feeling with genuine compassion (e.g. 'Ramdam ko ang bigat...', 'Naiintindihan ko kung bakit ka nabibigatan...', 'Valid at normal ang nararamdaman mo...'). "
            "Never minimize their struggles.\n"
            "3. ACTIONABLE GUIDANCE FOR PRACTICAL QUESTIONS: When a student asks a practical question (e.g., 'Sobrang daming requirements, paano magsimula?', 'Paano mag-aral?', 'Paano unahin?'), DO NOT reply only with another question. Provide clear, structured, bite-sized steps (e.g., 1. 5-Minute Brain Dump on paper, 2. Rule of 1 Quick Win / nearest deadline, 3. 25/5 Pomodoro Pacing). After providing the steps, gently invite them to pick their first step.\n"
            "4. WARM & NATURAL TONE: Speak in comforting, conversational Taglish, Filipino, or English (matching the student's language style). Use gentle, reassuring, and affirming language ('Nandito ako para sa iyo', 'Hindi ka nag-iisa', 'Huwag kang matakot').\n"
            "5. COGNITIVE REFRAMING & COPING: Gently reframe academic setbacks (grades do not define your worth as a person) and suggest calming techniques (4-4-6 breathing, sensory grounding, or breaking tasks into 1 small manageable step).\n"
            "6. CAMPUS TOUCHPOINTS (Subtle & Gentle): Only mention campus resources (like Room 104 Peer Tutoring, Financial Aid Desk, or Ms. Maria Theresa Cruz in Room 204) naturally at the end of the conversation as optional, gentle invitations—never as an abrupt handoff.\n"
            "7. SAFETY: Never give psychiatric clinical diagnoses or prescribe medication. If extreme self-harm is expressed, reassure them of their safety and activate immediate care.\n\n"
            "Format Rule: Keep your message conversational, digestible, and empathetic (2-3 short, soothing paragraphs or numbered steps). Talk like a caring counselor sitting right across from them in a quiet, safe room.\n\n"
            f"Student Profile: {student_desc}\n"
            f"Affective Analysis: Detected Emotion={emotion} ({int(confidence*100)}% confidence), Domain={domain}, Intent={intent}, Subject Focus={subject or 'General'}."
            f"{kb_prompt_section}"
        )

        # Build contents array with multi-turn history if present
        contents = []
        if conversation_history:
            for turn in conversation_history[-6:]:  # include up to last 6 turns for context
                role = "user" if turn.get("sender") in ["student", "user"] else "model"
                text_content = turn.get("text") or turn.get("message_text", "")
                if text_content.strip():
                    contents.append({
                        "role": role,
                        "parts": [{"text": text_content.strip()}]
                    })

        # Append current user prompt
        contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 450,
                "topP": 0.95
            }
        }

        import httpx
        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                with httpx.Client(timeout=10.0) as client:
                    res = client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"].strip(), model
                    elif res.status_code == 400:
                        # If system_instruction is not supported in older model format, fallback to inline context
                        alt_payload = {
                            "contents": [
                                {
                                    "parts": [{"text": f"System Context:\n{system_prompt}\n\nStudent Message:\n{message}"}]
                                }
                            ],
                            "generationConfig": {
                                "temperature": 0.7,
                                "maxOutputTokens": 450,
                                "topP": 0.95
                            }
                        }
                        alt_res = client.post(url, json=alt_payload)
                        if alt_res.status_code == 200:
                            data = alt_res.json()
                            candidates = data.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                parts = candidates[0]["content"].get("parts", [])
                                if parts and "text" in parts[0]:
                                    return parts[0]["text"].strip(), model
            except Exception as e:
                print(f"[Gemini Guidance Notice]: Model {model} request notice ({e}), trying next candidate...")
                continue

        return None, None

    def generate_supportive_response(
        self, 
        analysis: Dict[str, Any], 
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        student_context: Optional[Dict[str, Any]] = None,
        knowledge_context: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[str, List[str], bool, Optional[str]]:
        """
        Scaffolded Bilingual Conversational Response Generator (Vygotsky ZPD & WHO Protocols).
        Prioritizes Google Gemini AI for personalized counseling responses with automatic
        fallback to institutional rule-based scaffolded responses.
        Returns: (reply_text, suggested_resources, is_gemini_powered, model_used)
        """
        domain = analysis["inferred_domain"]
        is_crisis = analysis.get("crisis_flag", False)
        emotion = analysis.get("detected_emotion", "neutral")
        intent = analysis.get("intent", "reflection")
        clean = message.lower().strip()
        detected_subject = self.extract_detected_subject(message)

        # 1. CRISIS / SELF-HARM PROTOCOL (Always takes hard precedence over AI generation for safety)
        if is_crisis:
            reply = (
                "Naririnig kita nang buong puso, at gusto kong ipaalala sa iyo na hindi ka nag-iisa. "
                "Napakahalaga ng buhay mo at may mga taong tunay na nagmamalasakit at handang makinig sa iyo ngayon nang walang anumang paghuhusga.\n\n"
                "Nandito ako para sa iyo, at maaari mo ring makausap agad ang ating Guidance Counselors o tumawag sa ating 24/7 confidential hotlines. "
                "Huminga tayo nang dahan-dahan. Kumusta ang lagay mo ngayon sa sandaling ito?"
            )
            resources = [
                "SAPC Guidance & Counseling Office (Room 204, Bldg A • Mon-Fri 8AM-5PM)",
                "National Center for Mental Health (NCMH) 24/7 Crisis Hotline: 1553 (Toll-Free)",
                "Hopeline Philippines: 0917-558-4673 / (02) 8804-4673",
                "Philippine Red Cross 24/7 Helpline: 143"
            ]
            return reply, resources, False, None

        # 2. Check if Google Gemini generative guidance is available
        gemini_text, model_used = self.call_gemini_guidance(
            message=message, 
            analysis=analysis, 
            conversation_history=conversation_history,
            student_context=student_context,
            knowledge_context=knowledge_context
        )
        if gemini_text:
            resources = self.get_contextual_resources(domain, emotion, detected_subject)
            if knowledge_context:
                for kb_item in knowledge_context:
                    for r in kb_item.get("resources", []):
                        if r not in resources:
                            resources.append(r)
            return gemini_text, resources, True, model_used

        # 3. REQUIREMENT OVERLOAD & HOW TO START / STUDY PLANNING (Gerard Egan Stage 3 & Pomodoro Scaffolding)
        if has_keyword_match(clean, [
            "daming requirements", "dami requirements", "requirements", "requirement",
            "paano magsimula", "paano simulan", "saan magsisimula", "tambak", 
            "paano unahin", "unahin", "prioritize", "tambak na gawain", "daming gawain",
            "study plan", "paano mag-aral", "paano mag aral"
        ]):
            reply = (
                "Naiintindihan ko kung gaano kabigat sa pakiramdam kapag sabay-sabay ang requirements at hindi mo na alam kung saan magsisimula. "
                "Normal lang na ma-overwhelm kapag tambak ang gawain, pero tandaan mo: hindi mo kailangang tapusin ang lahat nang sabay-sabay.\n\n"
                "Subukan natin itong simpleng 3-Step Action Plan:\n\n"
                "1. 📝 5-Minute Brain Dump\n"
                "Ilapag sa isang papel o notebook ang lahat ng iniisip mong kailangang gawin. Mas madaling kontrolin ang mga gawain kapag nakikita mo sa papel kaysa kapag umiikot lang sa isip.\n\n"
                "2. 🎯 The Rule of 1 (Pumili ng 1 Quick Win)\n"
                "Pumili ng isa (1) lang muna na pinakamadaling tapusin o may pinakamalapit na deadline bukas. Ang matapos ang kahit 1 maliit na gawain ay magbibigay sa iyo ng lakas ng loob at momentum.\n\n"
                "3. ⏳ 25/5 Pomodoro Pacing\n"
                "Mag-focus sa napili mong gawain sa loob ng 25 minutes (i-off muna ang social media notifications), tapos magpahinga nang buong 5 minutes para makahinga ang isip mo.\n\n"
                "Gusto mo bang ilista natin dito ang 2 hanggang 3 gawain na pinaka-nagpapabigat sa iyo ngayon para matulungan kitang pumili kung alin ang pinakamagandang unahin?"
            )
            resources = [
                "SAPC Time Management & Priority Matrix Guide",
                "SAPC Learning Commons Study Pods (Room 104)",
                "5-Minute Focus & Hydration Break Reminder"
            ]
            return reply, resources, False, None

        # 4. ACADEMIC SPECIFIC CONCERNS (e.g. failing grades, subject difficulties, study strategies)
        if domain == "academic" or has_keyword_match(clean, ["bagsak", "mababa", "grades", "grade", "exam", "exams", "quiz", "subject", "subjects", "prof", "teacher", "nahihirapan", "hirap", "failed", "homework", "project", "lesson", "lessons", "math", "science", "chemistry", "physics"]):
            subject_mention = f" sa {detected_subject}" if detected_subject else " sa iyong mga aralin"
            reply = (
                f"Ramdam ko ang bigat at pagod na nararanasan mo kapag nahihirapan ka{subject_mention}. "
                "Gusto kong ipaalala sa iyo: hindi nasusukat ng isang mababang marka o mahirap na exam ang buong talino at kakayahan mo bilang tao. Normal lang na magkaroon ng mga hamon sa pag-aaral.\n\n"
                "Huwag kang mag-alala, may mga paraan para makabawi. Maaari nating himayin ang mga araling nakakalito isa-isa, at may libreng peer tutoring din sa Learning Commons (Room 104) kung saan may mga kapwa estudyante na handang magpaliwanag nang dahan-dahan.\n\n"
                "Ano ba ang partikular na topic o bahagi na pinaka-nagpapahirap sa iyo ngayon? Pwede nating pag-usapan para makagawa tayo ng simpleng hakbang."
            )
            resources = [
                "SAPC Free Academic Peer Tutoring (Room 104, Learning Commons)",
                "Subject Teacher Consultation & Remedial Program",
                "Form 137 / Grade Recovery Roadmap"
            ]
            return reply, resources, False, None

        # 5. DIRECT COMPANIONSHIP / NEED SOMEONE TO TALK TO ("Gusto ko ng kausap", "I feel lonely", "Mag-isa ako")
        if intent == "companionship" or has_keyword_match(clean, ["kausap", "makausap", "lonely", "mag-isa", "makikipag-usap", "kwentuhan", "samahan", "wala akong kaibigan", "nalulungkot"]):
            companionship_replies = [
                "Nandito ako at buong puso akong handang makinig sa iyo. Minsan, nakakagaan talaga sa pakiramdam kapag may napagsasabihan tayo ng ating mga naiisip at nararamdaman nang walang takot na husgahan. Ano ang mga bagay na tumatakbo sa isip mo ngayon? Malaya mong maibabahagi sa akin ang lahat.",
                "Salamat sa pagtitiwala na magsabi sa akin. Hindi mo kailangang solohin ang anumang bigat na nararamdaman mo. Nandito ako para samahan ka at pakinggan ang kwento mo. May partikular bang nangyari sa school, sa bahay, o sa sarili mo na nagpapabigat sa iyo ngayon?",
                "Nandito ako kasama mo, at nakikinig ako. Tunay at valid ang nararamdaman mo, at normal lang na maghanap ng makakausap kapag tahimik o mabigat ang paligid. Pwede mong sabihin sa akin kahit anong nararamdaman mo ngayon—walang tama o maling sasabihin dito."
            ]
            reply = random.choice(companionship_replies)
            resources = [
                "SAPC Peer Wellness Listening Buddy Circle",
                "Guidance Relaxation & Mindfulness Corner (Room 204)",
                "Daily Student Wellness Journal & Reflection Space"
            ]
            return reply, resources, False, None

        # 5. ANXIETY, PANIC, OVERTHINKING ("Kinakabahan ako", "Overthinking", "Di ako makatulog")
        if emotion in ["anxiety", "fear"] or has_keyword_match(clean, ["panic", "kaba", "kinakabahan", "overthinking", "takot", "balisa", "di makatulog", "insomnia"]):
            reply = (
                "Ramdam ko ang kaba at bilis ng tibok ng puso na nararanasan mo ngayon. Ligtas ka sa sandaling ito, at lilipas din ang bugso ng kaba.\n\n"
                "Subukan nating huminga nang magkasama:\n"
                "• Dahan-dahang huminga papasok sa ilong sa loob ng 4 na segundo...\n"
                "• Pigilin ang hininga nang 4 na segundo...\n"
                "• Dahan-dahang ibuga sa bibig nang 6 na segundo.\n\n"
                "Nandito lang ako para sa iyo. Ano ang pinakamalaking bagay na nagpapaikot sa isip mo ngayon? Pwede mong ikwento sa akin para maibsan natin ang bigat."
            )
            resources = [
                "5-Minute Guided Box Breathing Technique",
                "SAPC Peer Wellness Support Circle",
                "Guidance Relaxation & Mindfulness Corner (Room 204)"
            ]
            return reply, resources, False, None

        # 6. STRESS, BURNOUT, EXHAUSTION ("Sobrang pagod", "Burnout", "Daming requirements")
        if emotion in ["stress", "frustration"] or has_keyword_match(clean, ["stress", "pagod", "burnout", "exhausted", "puyat", "daming gawain", "dami requirements", "tambak"]):
            reply = (
                "Naiintindihan ko kung gaano nakakaubos ang sunod-sunod na requirements at puyat. Normal lang na maramdaman ang matinding pagod, at valid na hilingin mong magpahinga.\n\n"
                "Tandaan: Hindi mo kailangang gawin o lutasin ang lahat nang sabay-sabay sa isang iglap. Subukan nating unahin ang 1 maliit na bagay muna, o kaya'y maglaan ng 10 minutong break para makahinga ang isip mo.\n\n"
                "Gusto mo bang pag-usapan natin kung aling gawain ang pinaka-nakaka-stress sa iyo ngayon para matulungan kitang i-prioritize ito?"
            )
            resources = [
                "SAPC Time Management & Priority Matrix Guide",
                "Guidance Peer Tutoring & Study Pods",
                "5-Minute Break & Hydration Reminder"
            ]
            return reply, resources, False, None

        # 7. GUIDANCE OFFICE / CAMPUS SERVICE INQUIRIES ("Saan ang guidance office", "anong oras bukas")
        if has_keyword_match(clean, ["saan ang guidance", "location", "office hours", "oras ng guidance", "appointment schedule", "counselor schedule"]):
            reply = (
                "Ang ating SAPC Guidance & Counseling Office ay matatagpuan sa Room 204, 2nd Floor ng Building A. "
                "Bukas ang opisina mula Lunes hanggang Biyernes, 8:00 AM hanggang 5:00 PM.\n\n"
                "Laging bukas ang pintuan para sa confidential walk-in consultations, o maaari ka ring mag-set ng schedule sa pamamagitan ng iyong Student Dashboard. "
                "Lahat ng ibabahagi mo ay kumpidensyal at ligtas. May partikular ka bang gustong i-consult sa ating Guidance Counselor?"
            )
            resources = [
                "Guidance & Counseling Center: Room 204, Bldg A (Mon-Fri 8AM-5PM)",
                "Counselor Direct Email: guidance@sapc.edu.ph",
                "Online Appointment Request via Student Dashboard"
            ]
            return reply, resources, False, None

        # 8. FINANCIAL CONCERNS ("Tuition", "Walang pera", "Baon", "Promissory")
        if domain == "financial" or has_keyword_match(clean, ["pera", "tuition", "baon", "bayad", "promissory", "allowance", "utang", "fees", "scholarship"]):
            reply = (
                "Naiintindihan ko kung gaano kabigat sa dibdib at isip ang mga alalahaning pinansyal. Gusto kong ipaalala na hindi mo kasalanan ito at hindi ka dapat mahiya.\n\n"
                "Sa SAPC, may mga paraan para masuportahan ka—tulad ng Student Assistance Grants, flexible promissory notes na walang interest penalties, at scholarship endorsements. Hindi dapat maging hadlang ang pera sa iyong pangarap.\n\n"
                "Gusto mo bang gabayan kita kung paano makakuha ng emergency promissory note o financial assistance endorsement?"
            )
            resources = [
                "SAPC Student Assistance & Scholarship Office (Bldg A Ground Floor)",
                "Accounting Office Promissory Note Support",
                "Work-Study Student Program Application"
            ]
            return reply, resources, False, None

        # 9. FAMILY & HOME RELATIONSHIPS ("Away sa bahay", "Magulang", "Family")
        if domain == "family" or has_keyword_match(clean, ["magulang", "tatay", "nanay", "away", "kapatid", "pamilya", "bahay", "parents"]):
            reply = (
                "Napakabigat sa kalooban kapag may tensyon o hindi pagkakaunawaan sa tahanan, lalo na't nakakaapekto ito sa iyong katahimikan at pag-aaral. "
                "Karapatan mong maramdaman ang kapayapaan at pag-unawa.\n\n"
                "Nandito ako para pakinggan ka nang buong puso. Kung nais mong ilabas ang sama ng loob o ang mga nararamdaman mo, bukas ang espasyong ito para sa iyo nang walang anumang panghuhusga."
            )
            resources = [
                "Confidential Family Counseling Assistance (Room 204)",
                "Guidance Wellness Safe Space",
                "Student Welfare Support"
            ]
            return reply, resources, False, None

        # 10. GRATITUDE ("Salamat", "Thank you")
        if intent == "gratitude" or has_keyword_match(clean, ["salamat", "thank you", "thanks", "salamat po", "maraming salamat"]):
            gratitude_replies = [
                "Walang anuman! Masaya ako na nakatulong ako at nakasama kita ngayon. Tandaan mo na palagi kang may kakampi at handang makinig dito. Mag-ingat ka palagi at maging mabait sa sarili mo!",
                "You're very welcome! Proud ako sa lakas ng loob mong magbahagi at magpatuloy. Kung sakaling kailangan mo ulit ng makakausap, nandito lang ako anumang oras.",
                "Walang anuman, SAPCian! Take things one breath and one step at a time. May maitutulong pa ba ako sa iyo bago ka magpatuloy?"
            ]
            reply = random.choice(gratitude_replies)
            resources = [
                "Guidance Center Ongoing Support (Room 204)",
                "SAPC Daily Wellness Affirmations"
            ]
            return reply, resources, False, None

        # 11. GREETINGS & CASUAL CHECK-INS (ONLY when intent is greeting and domain is general)
        if intent == "greeting" or clean in ["hi", "hello", "kumusta", "kamusta", "hey", "good morning", "good afternoon", "magandang umaga", "magandang hapon", "magandang gabi"]:
            greeting_replies = [
                "Hello! Magandang araw sa iyo. Kumusta ang pakiramdam mo at ang mga klase mo ngayong araw? Nandito ako bilang iyong Guidance Companion para makinig at sumuporta sa iyo.",
                "Hi there! Masaya akong naka-connect tayo. Kumusta ang lagay mo ngayong linggo? Feel free to share anything on your mind—academic man o nararamdaman mo sa araw-araw.",
                "Kumusta! Nandito ako handang makinig sa kahit anong gusto mong pag-usapan. Ano ang pinagkakaabalahan o naiisip mo ngayon?"
            ]
            reply = random.choice(greeting_replies)
            resources = [
                "SAPC Student Wellness & Counseling Services",
                "Guidance Office Hours: Mon-Fri 8:00 AM - 5:00 PM"
            ]
            return reply, resources, False, None

        # 12. POSITIVE / HOPE ("Masaya ako", "Nakapasa ako", "Kaya pa")
        if emotion in ["joy", "hope"] or has_keyword_match(clean, ["masaya", "passed", "nakapasa", "good", "great", "proud", "blessed"]):
            reply = (
                "Nakakataba ng puso at nakakaproud marinig 'yan! Ipagpatuloy mo ang magandang sigla, at huwag kalimutang pasalamatan at i-celebrate ang sarili mo sa iyong mga tagumpay, malaki man o maliit. "
                "Paano pa ako makakatulong o makakasama sa iyong journey ngayong linggo?"
            )
            resources = [
                "SAPC Student Achievement Board",
                "Extracurricular Clubs & Leadership Programs"
            ]
            return reply, resources, False, None

        # 13. DYNAMIC CONVERSATIONAL FALLBACK (Contextual reflection)
        fallback_replies = [
            f"Salamat sa pagbabahagi nito sa akin. Naririnig ko ang sinabi mo tungkol sa iyong pinagdaraanan. Gusto kong malaman mo na mahalaga ang nararamdaman mo at nandito ako para makinig. Nais mo bang magkwento pa para mas maintindihan kita?",
            "Naiintindihan ko ang iyong punto. Nandito ako bilang iyong ligtas at kumpidensyal na kausap sa iyong pag-aaral at well-being. Paano kita pinakamagandang matutulungan o masasamahan sa sandaling ito?",
            "Thank you for opening up to me. Your feelings and thoughts matter deeply, and this is a safe, caring space for you. What feels like the most supportive thing we can focus on right now?"
        ]
        reply = random.choice(fallback_replies)
        resources = [
            "SAPC Student Handbook & Guidance Directory",
            "Guidance Center Office Hours: Mon-Fri 8:00 AM - 5:00 PM (Room 204)"
        ]
        return reply, resources, False, None

nlp_service = NLPService()

