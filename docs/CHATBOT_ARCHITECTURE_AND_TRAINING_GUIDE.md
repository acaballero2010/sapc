# SAPC IntellySys: AI Guidance Chatbot (PaduaBot) Architecture & Training Guide
**Document Version:** 2.5  
**Target System:** San Antonio de Padua College (SAPC) Multi-Factor Decision Support & Student Guidance System  
**Compliance Standards:** Republic Act No. 10173 (Data Privacy Act of 2012) & DepEd Child Protection Policy (DO 40, s. 2012)

---

## Table of Contents
1. [Overview & Guidance Philosophy](#1-overview--guidance-philosophy)
2. [NLP Architecture & Generative AI Stack](#2-nlp-architecture--generative-ai-stack)
3. [Educational Affective Computing (10 Emotion Taxonomy)](#3-educational-affective-computing-10-emotion-taxonomy)
4. [Cross-Domain Risk Integration (5 Domains)](#4-cross-domain-risk-integration-5-domains)
5. [Step-by-Step Chatbot Training & Fine-Tuning Workflow](#5-step-by-step-chatbot-training--fine-tuning-workflow)
6. [Training Dataset Specifications (JSONL Format)](#6-training-dataset-specifications-jsonl-format)
7. [Crisis Detection, Safety Guardrails & Emergency Escalation](#7-crisis-detection-safety-guardrails--emergency-escalation)
8. [Sample Fine-Tuning Execution Script](#8-sample-fine-tuning-execution-script)

---

## 1. Overview & Guidance Philosophy

In junior and senior high school environments, students facing academic failure or psychosocial distress often experience hesitation when seeking help due to stigma, fear of judgment, or social anxiety. 

**PaduaBot** serves as a **24/7 empathetic conversational first-responder and academic triage companion**. It is designed to:
- Provide immediate, confidential, and culturally sensitive academic coaching in English, Filipino, and Taglish.
- Detect emotional distress, burnout, and cognitive friction across all **5 validated holistic domains**.
- Feed real-time psychometric sentiment signals into the **AHP Multi-Criteria Decision Engine**.
- Execute a **zero-latency safety firewall** that immediately escalates critical distress signals (self-harm, domestic violence, extreme helplessness) directly to licensed Registered Guidance Counselors (RGC).

> [!IMPORTANT]
> **Ethical Boundary:** PaduaBot is an educational triage agent and empathetic study coach. It is **strictly prohibited** from dispensing medical/psychiatric diagnoses, prescribing medications, or modifying official DepEd grades.

---

## 2. NLP Architecture & Generative AI Stack

PaduaBot uses a **hybrid multi-layer NLP pipeline**:

```
[Student Message (Taglish / English)]
                │
                ▼
┌────────────────────────────────────────────────────────┐
│ LAYER 1: Deterministic Crisis Firewall & Regex Scanner │
│ Checks 25+ bilingual self-harm & acute distress terms. │
└───────────────────────┬────────────────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼ (If Crisis Detected)            ▼ (Normal Dialogue)
┌──────────────────────────────┐ ┌──────────────────────────────────────┐
│ Immediate Escalation:        │ │ LAYER 2: Educational Emotion & Domain │
│ • Present 24/7 NCMH Hotlines │ │          Classifier (Calvo & D'Mello)│
│ • Alert Guidance Office      │ │ Detects primary emotion & 5 domains. │
└──────────────────────────────┘ └──────────────────┬───────────────────┘
                                                    │
                                                    ▼
                                 ┌──────────────────────────────────────┐
                                 │ LAYER 3: RAG Knowledge Retrieval     │
                                 │ Fetches SAPC Handbook, Grading Rules │
                                 └──────────────────┬───────────────────┘
                                                    │
                                                    ▼
                                 ┌──────────────────────────────────────┐
                                 │ LAYER 4: Generative LLM Core         │
                                 │ (Gemini 1.5/2.0 Flash / Tuned SFT)   │
                                 │ Generates warm, contextual response. │
                                 └──────────────────────────────────────┘
```

---

## 3. Educational Affective Computing (10 Emotion Taxonomy)

PaduaBot incorporates the **Calvo & D'Mello (2010)** educational affect framework, classifying student expressions into 10 distinct affective states:

| Emotion | Tagalog / Taglish Key Identifiers | Guidance Objective |
| :--- | :--- | :--- |
| **Joy / Pride** | *masaya, happy, excited, nakapasa, grateful, salamat* | Reinforce positive learning habits and celebrate milestones. |
| **Sadness** | *malungkot, lungkot, down, lonely, umiiyak, luha* | Empathic active listening and emotional validation. |
| **Anger / Injustice** | *galit, unfair, inis, asar, bwisit, gigil* | De-escalation and constructive conflict reframing. |
| **Fear** | *takot, scared, terrified, nangangamba, kaba* | Reassurance and safe problem exploration. |
| **Anxiety** | *anxious, balisa, panic, overthinking, kabado, di makatulog* | Grounding techniques (4-7-8 breathing) and manageable step planning. |
| **Stress / Burnout** | *pagod, overwhelmed, dami gawain, puyat, burnout, hirap* | Workload prioritization and study pacing. |
| **Hope / Optimism** | *hopeful, kaya pa, bawi, kakayanin, may pag-asa* | Goal setting and structured action planning. |
| **Confusion** | *di maintindihan, lost, gulo, di ko gets, paano* | Socratic explanation and academic remediation referral. |
| **Frustration** | *bagsak, stuck, nahihirapan, failed, struggling* | Growth-mindset reframing and peer tutoring connection. |
| **Neutral** | *okay, normal, schedule, class, inquiry* | Direct, helpful institutional information delivery. |

---

## 4. Cross-Domain Risk Integration (5 Domains)

Every student conversation extracts real-time domain intensity scores:
- **Academic (30%)**: Exam pressure, missing assignments, subject difficulty.
- **Family (20%)**: Parental expectations, home arguments, OFW family dynamics.
- **Health (20%)**: Chronic fatigue, clinic visits, headaches, physical ailments.
- **Mental Health (15%)**: Isolation, anxiety, depressive symptoms.
- **Financial (15%)**: Tuition dues, allowance constraints, working student stress.

---

## 5. Step-by-Step Chatbot Training & Fine-Tuning Workflow

### Step 1: Data Curation & Privacy Scrubbing (RA 10173)
1. Collect student interaction queries from advisory records and guidance consultations.
2. Anonymize all Personally Identifiable Information (strip LRNs, real student names, teacher names, telephone numbers).
3. Ensure linguistic diversity across English, formal Tagalog, and casual Taglish slang.

### Step 2: System Prompt Definition
Anchor the assistant with clear institutional persona and ethical boundaries.

### Step 3: Supervised Fine-Tuning (SFT)
Format training data into standard multi-turn JSONL format and train using Parameter-Efficient Fine-Tuning (LoRA) or Google Vertex AI Fine-Tuning.

### Step 4: Retrieval-Augmented Generation (RAG) Ingestion
Embed institutional PDFs into a vector store (pgvector / Firestore vector search):
- SAPC Student Handbook (Dress code, attendance rules, honors qualifications)
- DepEd Order No. 8, s. 2015 (Grading components and transmuted grade formulas)
- SAPC Academic Calendar & Exam Schedules

### Step 5: Guidance Counselor Rubric Evaluation (RLHF)
Have licensed RGCs grade 200 benchmark evaluation prompts on a 1–5 scale for:
1. **Empathy & Cultural Resonance** (proper use of *po/opo* and warm tone)
2. **Pedagogical Actionability** (breaks tasks into realistic steps)
3. **Safety & Crisis Escalation Speed** (100% accuracy on crisis detection)

---

## 6. Training Dataset Specifications (JSONL Format)

Training data files must follow the standard JSONL format:

```json
{"messages": [{"role": "system", "content": "You are Padua Bot, the official empathetic AI guidance companion of San Antonio de Padua College (SAPC). You support students with academic coaching and psychosocial check-ins in warm, encouraging English and Taglish. You never give harmful advice and escalate emergencies immediately to the Guidance Office."}, {"role": "user", "content": "Sobrang pressure po sa Grade 11 STEM, parang di ko na kayang habulin yung 3 missing requirements sa Pre-Cal."}, {"role": "assistant", "content": "Kumusta, ramdam ko yung bigat ng nararamdaman mo. Valid na ma-overwhelm lalo na sa STEM strand, pero hindi ka nag-iisa. Una, huminga tayo nang malalim. Pwede nating i-break down yung 3 requirements: alin doon ang pinakamadaling simulan ngayon? Pwede rin kitang tulungan mag-draft ng extension request sa teacher mo o i-connect ka sa peer tutor natin sa Guidance Center."}]}
```

---

## 7. Crisis Detection, Safety Guardrails & Emergency Escalation

When any of the 25+ critical distress markers are detected:
1. **Firewall Trigger:** Bypasses LLM text generation to prevent hallucinated advice.
2. **Instant Hotlines Display:** Shows National Center for Mental Health (NCMH) Hotlines:
   - **Toll-Free:** `1553`
   - **Mobile:** `0917-899-USAP (8727)` / `0966-351-4518`
3. **Counselor Dispatch:** Triggers an immediate urgent alert notification in the Guidance Counselor Portal.

---

## 8. Sample Fine-Tuning Execution Script

```python
# fine_tune_padua_bot.py
# SAPC IntellySys: Fine-Tuning Pipeline for Gemini 1.5 Flash
import os
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 1. Upload Training Dataset
training_file = client.files.upload(
    file="sapc_chatbot_guidance_training.jsonl",
    mime_type="text/json"
)
print(f"Uploaded training file: {training_file.name}")

# 2. Launch Parameter-Efficient Fine-Tuning Job
tuning_job = client.tunings.create(
    model="models/gemini-1.5-flash-001-tuning",
    training_data=training_file,
    epochs=5,
    batch_size=4,
    learning_rate=0.001,
    tuned_model_display_name="PaduaBot-Guidance-v2.5"
)

print(f"Tuning job started: {tuning_job.name}")
print("Status:", tuning_job.state)
```
