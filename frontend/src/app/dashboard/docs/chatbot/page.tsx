"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Brain, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Database, 
  Cpu, 
  BookOpen, 
  PlayCircle, 
  Copy, 
  Check, 
  ArrowLeft,
  Terminal,
  Sliders
} from "lucide-react";

export default function ChatbotTrainingDocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"architecture" | "training" | "dataset" | "guardrails" | "playground">("architecture");

  // Playground simulator state
  const [simulatorInput, setSimulatorInput] = useState("Sobrang hirap ng Math namin, feeling ko babagsak ako sa Prelim at wala na akong pag-asa...");
  const [simulatedEmotion, setSimulatedEmotion] = useState<{ emotion: string; score: number; domain: string; isCrisis: boolean } | null>(null);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2500);
    }
  };

  const handleSimulate = () => {
    const text = simulatorInput.toLowerCase();
    let emotion = "stress";
    let score = 0.88;
    let domain = "academic";
    let isCrisis = false;

    if (text.includes("mamatay") || text.includes("ayaw ko na") || text.includes("walang pag-asa") || text.includes("suicide") || text.includes("end my life")) {
      isCrisis = true;
      emotion = "hopelessness / crisis";
      domain = "mental_health";
      score = 0.98;
    } else if (text.includes("math") || text.includes("bagsak") || text.includes("exam") || text.includes("grade")) {
      domain = "academic";
      emotion = "anxiety / academic fear";
      score = 0.85;
    } else if (text.includes("pera") || text.includes("tuition") || text.includes("baon") || text.includes("financial")) {
      domain = "financial";
      emotion = "distress";
      score = 0.82;
    } else if (text.includes("magulang") || text.includes("bahay") || text.includes("away") || text.includes("tatay") || text.includes("nanay")) {
      domain = "family";
      emotion = "sadness";
      score = 0.79;
    } else if (text.includes("sakit") || text.includes("lagnat") || text.includes("hospital") || text.includes("pagod")) {
      domain = "health";
      emotion = "fatigue";
      score = 0.75;
    }

    setSimulatedEmotion({ emotion, score, domain, isCrisis });
  };

  const SAMPLE_JSONL_TRAINING_DATA = `{"messages": [{"role": "system", "content": "You are Padua Bot, the official empathic AI guidance companion of San Antonio de Padua College (SAPC). You support students with academic coaching and psychosocial check-ins in warm, encouraging English and Taglish. You never give harmful advice and escalate emergencies immediately to the Guidance Office."}, {"role": "user", "content": "Sobrang pressure po sa Grade 11 STEM, parang di ko na kayang habulin yung 3 missing requirements sa Pre-Cal."}, {"role": "assistant", "content": "Kumusta, ramdam ko yung bigat ng nararamdaman mo. Valid na ma-overwhelm lalo na sa STEM strand, pero hindi ka nag-iisa. Una, huminga tayo nang malalim. Pwede nating i-break down yung 3 requirements: alin doon ang pinakamadaling simulan ngayon? Pwede rin kitang tulungan mag-draft ng extension request sa teacher mo o i-connect ka sa peer tutor natin sa Guidance Center."}]}`;

  const SAMPLE_FINE_TUNING_SCRIPT = `# fine_tune_padua_bot.py
# SAPC IntellySys: Fine-Tuning Pipeline for Gemini 1.5 Flash / Open-Source LLMs
import json
import os
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 1. Upload Training Dataset (JSONL formatted)
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
`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Breadcrumb */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard/docs" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B0014] dark:text-rose-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Main Documentation Hub
            </Link>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              System Specification v2.5
            </span>
          </div>

          <div className="bg-gradient-to-r from-[#8B0014] via-[#A30018] to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-rose-200 text-xs font-semibold backdrop-blur-sm">
                  <Bot className="h-4 w-4" />
                  NLP & Generative AI Engineering
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  PaduaBot: AI Guidance Chatbot & Training Guide
                </h1>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  Comprehensive guide on the natural language architecture, 5-domain intent classification, 
                  Calvo & D&apos;Mello educational affect modeling, supervised fine-tuning (SFT), and crisis safety guardrails for San Antonio de Padua College.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center min-w-[220px]">
                <p className="text-xs text-rose-200 uppercase font-bold tracking-wider">Underlying Model</p>
                <p className="text-2xl font-black mt-1">Gemini 1.5 / 2.0</p>
                <p className="text-xs text-slate-300 mt-1">+ VADER & Affective Classifier</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "architecture", label: "1. Architecture & Affect Theory", icon: <Brain className="h-4 w-4" /> },
            { id: "training", label: "2. How to Train & Fine-Tune", icon: <Cpu className="h-4 w-4" /> },
            { id: "dataset", label: "3. Training Data Schema (JSONL)", icon: <Database className="h-4 w-4" /> },
            { id: "guardrails", label: "4. Crisis & Safety Guardrails", icon: <ShieldAlert className="h-4 w-4" /> },
            { id: "playground", label: "5. Interactive Intent Simulator", icon: <PlayCircle className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-[#8B0014] text-white shadow-md shadow-rose-900/20"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ARCHITECTURE */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="p-3 w-fit rounded-xl bg-rose-50 dark:bg-rose-950 text-[#8B0014] dark:text-rose-400">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">1. Generative LLM Core</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Powers empathetic conversational interactions, homework structuring, study schedules, and non-clinical counseling check-ins using Google Gemini with structured system prompts.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="p-3 w-fit rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Sliders className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">2. Educational Affect Model</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Implements the <strong>Calvo & D&apos;Mello (2010)</strong> 10-emotion taxonomy tailored to Philippine secondary education (Joy, Sadness, Anger, Fear, Anxiety, Stress, Hope, Confusion, Frustration, Neutral).
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="p-3 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">3. Rule-Based Crisis Firewall</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deterministic regex and keyword scanning across 25+ Tagalog and English self-harm/crisis markers to trigger immediate triage before LLM generation.
                </p>
              </div>
            </div>

            {/* Theoretical Framework Deep Dive */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
                5-Domain Extraction & Sentiment Integration
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                During every dialogue exchange, PaduaBot feeds detected domain sentiment scores into the **AHP Multi-Criteria Risk Engine** to dynamically update the student&apos;s holistic risk profile:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { domain: "Academic", weight: "30%", color: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30", desc: "Exams, homework pacing, failing subjects, missing requirements" },
                  { domain: "Family", weight: "20%", color: "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30", desc: "Parental conflict, domestic chores, OFW parents, household stability" },
                  { domain: "Health", weight: "20%", color: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30", desc: "Clinic visits, chronic fatigue, headaches, physical illness" },
                  { domain: "Mental Health", weight: "15%", color: "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30", desc: "Anxiety, depressive moods, isolation, feeling overwhelmed" },
                  { domain: "Financial", weight: "15%", color: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30", desc: "Tuition promissory notes, allowance shortages, working student strain" }
                ].map((d) => (
                  <div key={d.domain} className={`p-4 rounded-xl border-l-4 ${d.color} space-y-1`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{d.domain}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 shadow-xs">{d.weight}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOW TO TRAIN & FINE-TUNE */}
        {activeTab === "training" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
                Step-by-Step Training & Fine-Tuning Pipeline
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    step: "Step 1: Dataset Curation & Tagalog/English Conversational Corpus",
                    desc: "Collect real, anonymized guidance session transcripts and student questions under RA 10173 privacy standards. Format into structured multi-turn JSONL dialogue pairs containing system prompts, user utterances, and vetted counselor responses."
                  },
                  {
                    step: "Step 2: System Prompt Engineering & Persona Calibration",
                    desc: "Lock the model's behavioral boundaries: define PaduaBot as an educational companion and triage agent, strictly prohibited from dispensing medical diagnoses or modifying official DepEd grades."
                  },
                  {
                    step: "Step 3: Supervised Fine-Tuning (SFT)",
                    desc: "Train the base model (Gemini 1.5 Flash or open-source LLaMA/Mistral) using low-rank adaptation (LoRA) or Google Vertex AI Fine-Tuning API with 3–5 epochs, learning rate 0.001, and temperature 0.4 for consistent, grounded responses."
                  },
                  {
                    step: "Step 4: RAG Ingestion (Retrieval-Augmented Generation)",
                    desc: "Index SAPC Institutional Documents (Student Handbook, DepEd Order No. 8 s. 2015, Academic Calendar, Scholarship Guidelines) into a vector database (Firestore / pgvector) so the bot retrieves authoritative facts."
                  },
                  {
                    step: "Step 5: Human-in-the-Loop RGC (Registered Guidance Counselor) Audit",
                    desc: "Licensed Guidance Counselors review model output on 200 benchmark test prompts across all 5 domains, grading empathy, cultural nuance (Taglish respect terms 'po/opo'), and crisis escalation accuracy."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B0014] text-white font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base">{item.step}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fine Tuning Script Example */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4 border border-slate-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                  <Terminal className="h-4 w-4" />
                  Python Fine-Tuning Execution Script
                </div>
                <button
                  onClick={() => handleCopy("ft-script", SAMPLE_FINE_TUNING_SCRIPT)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedSection === "ft-script" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedSection === "ft-script" ? "Copied!" : "Copy Code"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
                <code>{SAMPLE_FINE_TUNING_SCRIPT}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: DATASET SCHEMA */}
        {activeTab === "dataset" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
                JSONL Training Data Schema & Examples
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Training data for PaduaBot must follow the OpenAI/Google standard `messages` array structure with role definitions (`system`, `user`, `assistant`).
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sample Training Pair (Academic & Stress Coaching)</span>
                  <button
                    onClick={() => handleCopy("jsonl-data", SAMPLE_JSONL_TRAINING_DATA)}
                    className="text-xs text-[#8B0014] dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedSection === "jsonl-data" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedSection === "jsonl-data" ? "Copied JSONL" : "Copy JSONL Sample"}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  <code>{SAMPLE_JSONL_TRAINING_DATA}</code>
                </pre>
              </div>

              {/* Training Corpus Balance Guidelines */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-base">Recommended Dataset Distribution (1,000 Sample Target)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-sm text-blue-600 dark:text-blue-400">40% Academic Inquiries</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Homework breakdown, exam anxiety, missing task makeup strategies, study schedules.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-sm text-purple-600 dark:text-purple-400">25% Psychosocial & Mood</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Stress management, burnout recovery, emotional check-ins, peer relations.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">20% Institutional FAQ & RAG</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">SAPC portal logins, grade computation formulas, schedule of quarterly examinations.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-sm text-rose-600 dark:text-rose-400">15% Safety & Refusal Pairs</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Appropriate refusal of clinical diagnoses, immediate warm handoffs to hotlines and RGC.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CRISIS & GUARDRAILS */}
        {activeTab === "guardrails" && (
          <div className="space-y-6">
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-800 dark:text-rose-300">
                <ShieldAlert className="h-6 w-6 flex-shrink-0" />
                <h3 className="text-xl font-bold">Zero-Tolerance Crisis Escalation Protocol</h3>
              </div>
              <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed">
                Whenever a student message matches explicit or implicit indicators of self-harm, severe domestic abuse, or extreme hopelessness, the system <strong>bypasses standard chatbot generation</strong> and executes the Crisis Watch Protocol.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-2">
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">🚨 Automated System Actions:</h4>
                  <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                    <li>Instantly presents 24/7 National Center for Mental Health (NCMH) Hotlines: <strong>1553</strong> or <strong>0917-899-USAP (8727)</strong>.</li>
                    <li>Dispatches immediate high-priority alert notification to the SAPC Registered Guidance Counselor.</li>
                    <li>Prompts the student with warm, de-escalating grounding language and an instant one-click button to speak with a counselor.</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-2">
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">🛡️ Guardrail Rules:</h4>
                  <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                    <li><strong>No Medical Diagnosis:</strong> PaduaBot never prescribes medications or diagnoses psychiatric conditions.</li>
                    <li><strong>Data Confidentiality (RA 10173):</strong> Chat transcripts are encrypted and accessible only to authorized RGC personnel.</li>
                    <li><strong>Strict Academic Integrity:</strong> The bot does not write essays or solve exam problems directly; it coaches step-by-step reasoning.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PLAYGROUND SIMULATOR */}
        {activeTab === "playground" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
                Live NLP Intent & Emotion Classifier Playground
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Type or select a sample student utterance to test the NLP pipeline&apos;s emotion classification, domain tagging, and safety firewall.
              </p>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Student Utterance (Taglish / English)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatorInput}
                    onChange={(e) => setSimulatorInput(e.target.value)}
                    placeholder="Enter student query..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                  <button
                    onClick={handleSimulate}
                    className="px-6 py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm shadow-md transition flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze
                  </button>
                </div>
              </div>

              {/* Preset quick test chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500 font-semibold py-1">Quick Presets:</span>
                {[
                  "Sobrang hirap ng Math namin, feeling ko babagsak ako...",
                  "Wala po akong pambayad ng tuition this month, paano po yun?",
                  "Laging nag-aaway magulang ko sa bahay, di ako makapag-aral.",
                  "Sobrang pagod na ako, ayaw ko na mabuhay pa...",
                  "Pano po mag-request ng peer tutor sa Guidance Office?"
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSimulatorInput(preset);
                      setTimeout(handleSimulate, 50);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                  >
                    {preset.slice(0, 30)}...
                  </button>
                ))}
              </div>

              {/* Simulation Result */}
              {simulatedEmotion && (
                <div className={`p-6 rounded-2xl border transition ${
                  simulatedEmotion.isCrisis 
                    ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800" 
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}>
                  <h4 className="font-bold text-base flex items-center justify-between">
                    <span>Analysis Output:</span>
                    {simulatedEmotion.isCrisis ? (
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider animate-pulse">
                        🚨 Crisis Firewall Triggered
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                        ✓ Safety Approved
                      </span>
                    )}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 font-semibold">Primary Emotion</p>
                      <p className="text-base font-bold capitalize mt-0.5 text-[#8B0014] dark:text-rose-400">{simulatedEmotion.emotion}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 font-semibold">Target Domain</p>
                      <p className="text-base font-bold capitalize mt-0.5 text-blue-600 dark:text-blue-400">{simulatedEmotion.domain.replace("_", " ")}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 font-semibold">Classifier Confidence</p>
                      <p className="text-base font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">{(simulatedEmotion.score * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
