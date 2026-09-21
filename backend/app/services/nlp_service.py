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
        "exam", "exams", "grades", "grade", "failed", "homework", "project", "deadline", "prof", 
        "teacher", "subject", "subjects", "studying", "study", "bagsak", "aral", "pasa", "guro", 
        "recitation", "quiz", "quizzes", "math", "science", "chemistry", "physics", "calculus", 
        "research", "thesis", "nahihirapan", "hirap", "lesson", "lessons", "mababa", "module", "modules"
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

        # 2. Academic difficulty & study advice
        if domain == "academic" or has_keyword_match(clean, ["nahihirapan", "hirap", "bagsak", "failed", "grades", "subject", "subjects", "exam", "exams", "lesson", "lessons", "homework"]):
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
            "a caring educational institution in the Philippines.\n"
            "Your mission is to respond with the warmth, deep empathy, non-judgmental presence, and practical wisdom of a human Registered Guidance Counselor (RGC).\n\n"
            "Clinical & Counseling Frameworks:\n"
            "1. Person-Centered Empathy (Carl Rogers): ALWAYS validate the student's emotional state before offering suggestions. Make them feel genuinely seen, heard, and respected.\n"
            "2. Cognitive Reframing (CBT): Gently help students unburden feelings of failure or shame ('hiya'). Reframe academic setbacks or stress as solvable moments, not permanent definitions of their worth.\n"
            "3. ZPD Scaffolding (Vygotsky): When a student feels overwhelmed, break challenges down into 1 or 2 small, empowering, bite-sized next steps.\n"
            "4. Cultural Grounding (Sikolohiyang Pilipino): Match their language naturally in warm, comforting Taglish, Filipino, or English. Be sensitive to local student experiences (panganay domestic loads, family expectations, allowance/baon worries, peer pressure).\n"
            "5. Campus Touchpoints: Seamlessly anchor students to real campus support when appropriate (Ms. Maria Theresa Cruz, RGC in Room 204 Guidance Office, Peer Tutoring in Room 104 Learning Commons, Student Assistance Desk).\n"
            "6. Safety & Non-Diagnostic Rule: NEVER provide clinical psychiatric diagnoses, never dismiss their feelings, and always maintain unconditional supportive warmth.\n\n"
            "Format Rule: Keep replies breathable, conversational, and digestible (2-3 concise paragraphs or clear bullet points max). Do not overwhelm the student with long lectures.\n\n"
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
                "Naririnig kita, at gusto kong malaman mo na hindi ka nag-iisa. Mahalaga ang buhay mo at may mga taong handang makinig at tumulong sa iyo ngayon nang walang paghuhusga. "
                "I am initiating our confidential support protocol para makakonekta ka agad sa Guidance Counselor. "
                "Please reach out to our Guidance Office or call the 24/7 national hotlines below."
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

        # 3. ACADEMIC SPECIFIC CONCERNS (e.g. failing grades, subject difficulties, study strategies)
        if domain == "academic" or has_keyword_match(clean, ["bagsak", "mababa", "grades", "grade", "exam", "exams", "quiz", "subject", "subjects", "prof", "teacher", "nahihirapan", "hirap", "failed", "homework", "project", "lesson", "lessons", "math", "science", "chemistry", "physics"]):
            subject_mention = f" sa subject na {detected_subject}" if detected_subject else " sa iyong mga subjects"
            reply = (
                f"Naiintindihan ko kung gaano kabigat kapag nahihirapan ka{subject_mention}. Ang academic challenges ay normal at natural na bahagi ng pagkatuto, pero hindi ito sumusukat sa buong kakayahan mo bilang estudyante.\n\n"
                "• May libreng Academic Peer Tutoring ang SAPC sa Room 104 (Learning Commons).\n"
                "• Maaari ka ring mag-request ng remedial consultation o consultation hours sa iyong subject teacher para sa one-on-one guidance.\n\n"
                "Gusto mo bang himayin natin ang mga partikular na aralin o topics na pinaka-nahihirapan ka, para makagawa tayo ng structured study plan?"
            )
            resources = [
                "SAPC Free Academic Peer Tutoring (Room 104, Learning Commons)",
                "Subject Teacher Consultation & Remedial Program",
                "Form 137 / Grade Recovery Roadmap"
            ]
            return reply, resources, False, None

        # 4. DIRECT COMPANIONSHIP / NEED SOMEONE TO TALK TO ("Gusto ko ng kausap", "I feel lonely")
        if intent == "companionship" or has_keyword_match(clean, ["kausap", "makausap", "lonely", "mag-isa", "makikipag-usap", "kwentuhan", "samahan", "wala akong kaibigan"]):
            companionship_replies = [
                "Nandito ako para sa iyo at buong puso akong handang makinig. Minsan nakakagaan talaga sa dibdib kapag may napagsasabihan tayo ng ating mga naiisip o nararamdaman. Ano ang mga tumatakbo sa isip mo ngayon? Pwede mong ikwento sa akin nang malaya at walang paghuhusga.",
                "Salamat sa pagtitiwala na magsabi sa akin. Hindi mo kailangang sarilinin ang nararamdaman mo. Nandito ako para samahan ka. May partikular bang nangyari sa school, sa bahay, o sa personal mong buhay na nagpapabigat sa iyo ngayon?",
                "I am right here with you, and I am listening. Valid ang nararamdaman mo, at normal lang na maghanap ng makakausap kapag mabigat o tahimik ang paligid. Pwede mong sabihin sa akin kahit anong nasa isip mo ngayon."
            ]
            reply = random.choice(companionship_replies)
            resources = [
                "SAPC Guidance Counselor Confidential Walk-In (Room 204, Bldg A)",
                "Peer Wellness Listening Buddy Circle",
                "Student Lounge & Quiet Meditation Space (Bldg B)"
            ]
            return reply, resources, False, None

        # 5. ANXIETY, PANIC, OVERTHINKING ("Kinakabahan ako", "Overthinking", "Di ako makatulog")
        if emotion in ["anxiety", "fear"] or has_keyword_match(clean, ["panic", "kaba", "kinakabahan", "overthinking", "takot", "balisa", "di makatulog", "insomnia"]):
            reply = (
                "Ramdam ko ang bigat at kaba na nararamdaman mo ngayon. Subukan nating huminga nang malalim nang magkasama:\n\n"
                "• Huminga papasok sa ilong sa loob ng 4 na segundo...\n"
                "• Pigilin ang hininga ng 4 na segundo...\n"
                "• Dahan-dahang ibuga sa bibig sa loob ng 6 na segundo.\n\n"
                "Ligtas ka rito. Ano ang pinagmumulan ng kaba o overthinking mo ngayon? Pwede mong himayin at sabihin sa akin para maibsan ang bigat."
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
                "Naiintindihan ko ang nararamdaman mong pagod. Normal lang na maramdaman ang burnout lalo na kapag sunod-sunod ang mga academic deadlines at responsibilidad. "
                "Tandaan na hindi mo kailangang tapusin ang lahat nang sabay-sabay.\n\n"
                "Subukan nating gamitin ang 'Pomodoro Technique' (25 minutes focus, 5 minutes rest) at unahin ang 1 pinaka-urgent na gawain muna. "
                "Gusto mo bang tulungan kitang ayusin ang study priorities mo?"
            )
            resources = [
                "SAPC Time Management & Priority Matrix Guide",
                "Guidance Peer Tutoring & Study Pods",
                "5-Minute Break & Hydration Reminder"
            ]
            return reply, resources, False, None

        # 7. GUIDANCE OFFICE / CAMPUS SERVICE INQUIRIES ("Saan ang guidance office", "anong oras bukas")
        if has_keyword_match(clean, ["saan", "location", "office", "oras", "hours", "appointment", "schedule counseling", "counselor"]):
            reply = (
                "Ang SAPC Guidance and Counseling Office ay matatagpuan sa Room 204, 2nd Floor ng Building A. "
                "Bukas ang opisina mula Lunes hanggang Biyernes, 8:00 AM hanggang 5:00 PM. "
                "Maaari kang mag-walk in para sa confidential consultation o mag-request ng appointment sa pamamagitan ng iyong Student Portal. "
                "Ang ating Registered Guidance Counselor na si Ms. Maria Theresa Cruz, RGC ay handang tumulong sa iyo."
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
                "Naiintindihan ko kung gaano kabigat sa isip ang mga alalahaning pinansyal. "
                "Gusto kong ipaalala na may mga support programs ang San Antonio de Padua College tulad ng Student Assistance Grants, flexible promissory note arrangements sa Accounting, at CHED/DepEd educational subsidy assistance. "
                "Maaari kang dumulog sa Student Affairs Office upang malaman ang mga available na ayuda para sa iyong pag-aaral."
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
                "Ang mga problema o tensyon sa tahanan ay may malaking epekto sa ating emosyon at pokus sa pag-aaral. "
                "Ang Guidance Office ay nagbibigay ng ligtas, pribado, at kumpidensyal na espasyo kung saan maaari mong ibahagi ang iyong pinagdaraanan nang walang takot o panghuhusga. "
                "Nandito ako para makinig kung nais mong magbahagi pa."
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
                "Walang anuman! I'm really glad I could be here for you. Tandaan mo na palagi kang welcome mag-chat dito anumang oras na kailangan mo ng gabay o makakausap. Ingat ka palagi!",
                "You're very welcome! Proud ako sa pagsisikap mo. Kung may iba ka pang katanungan o gusto mong pag-usapan later, nandito lang ako palagi para sa iyo.",
                "Walang anuman, SAPCian! Keep taking care of yourself and taking things one step at a time. May maitutulong pa ba ako bago ka magpatuloy?"
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
                "Hello! Magandang araw sa iyo. Nandito ako bilang iyong SAPC Guidance Companion. Kumusta ang iyong araw, klase, at pakiramdam ngayon? May maitutulong ba ako sa iyo?",
                "Hi there! Happy to connect with you today. Kumusta ang mga requirements at wellness mo ngayong linggo? Feel free to share anything on your mind!",
                "Kumusta! Nandito ako handang makinig at gumabay sa iyong academic at wellness journey sa SAPC. Ano ang pinagkakaabalahan o naiisip mo ngayon?"
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
                "Nakakataba ng puso marinig 'yan! Ipagpatuloy mo ang magandang momentum at huwag kalimutang i-celebrate ang iyong mga tagumpay, malaki man o maliit. "
                "Paano pa ako makakatulong sa iyong student journey ngayong linggo?"
            )
            resources = [
                "SAPC Student Achievement Board",
                "Extracurricular Clubs & Leadership Programs"
            ]
            return reply, resources, False, None

        # 13. DYNAMIC CONVERSATIONAL FALLBACK (Contextual reflection)
        fallback_replies = [
            f"Salamat sa pagbabahagi nito sa akin. Naririnig ko ang sinabi mo tungkol sa '{message[:40]}...'. Mahalaga sa amin sa SAPC ang kapakanan mo. Nais mo bang magkwento pa nang mas detalyado para mas matulungan kita?",
            "Naiintindihan ko ang iyong punto. Nandito ako para magbigay ng ligtas at kumpidensyal na suporta sa iyong pag-aaral at well-being. Ano ang pinakamagandang maitutulong ko sa iyo ngayon?",
            "Thank you for sharing that with me. Your perspective matters, and I am here to assist you with academic guidance, emotional wellness, and campus resources. How would you like to proceed?"
        ]
        reply = random.choice(fallback_replies)
        resources = [
            "SAPC Student Handbook & Guidance Directory",
            "Guidance Center Office Hours: Mon-Fri 8:00 AM - 5:00 PM (Room 204)"
        ]
        return reply, resources, False, None

nlp_service = NLPService()

