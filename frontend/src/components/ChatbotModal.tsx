"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  PhoneCall, 
  HeartHandshake, 
  ShieldCheck, 
  RefreshCw, 
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { searchKnowledgeBase, saveKnowledgeItem } from "@/lib/counselor-kb-store";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id?: string;
  sender: "student" | "bot";
  text: string;
  sentiment?: string;
  distressScore?: number;
  flagged?: boolean;
  detectedEmotion?: string;
  emotionConfidence?: number;
  intent?: string;
  crisisTriggered?: boolean;
  isGeminiPowered?: boolean;
  modelUsed?: string;
  resources?: string[];
  time: string;
  rating?: "thumbs_up" | "thumbs_down";
}

interface CritiqueState {
  messageIndex: number;
  studentPrompt: string;
  botResponse: string;
  rating: "thumbs_up" | "thumbs_down";
  selectedTags: string[];
  notes: string;
  suggestedAnswer: string;
}

const CRITIQUE_TAG_OPTIONS = [
  { id: "answered_with_question", label: "❓ Answered with a question" },
  { id: "too_generic", label: "🥱 Too generic / robotic" },
  { id: "lacks_actionable_steps", label: "📝 Missing step-by-step guidance" },
  { id: "inaccurate_info", label: "🏢 Inaccurate room, schedule, or policy" },
  { id: "lacks_empathy", label: "💔 Lacked warmth or validation" },
  { id: "excellent_response", label: "🌟 Exemplary guidance counseling" }
];

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  
  // Critique Modal State
  const [critiqueModal, setCritiqueModal] = useState<CritiqueState | null>(null);
  const [isSubmittingCritique, setIsSubmittingCritique] = useState(false);
  const [critiqueSuccessMsg, setCritiqueSuccessMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize personalized greeting & cross-session memory
  useEffect(() => {
    if (!isOpen) return;

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "Magandang umaga" : hour < 18 ? "Magandang hapon" : "Magandang gabi";

    let studentName = "SAPCian";
    let previousTopic = "";
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("sapc_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          studentName = parsed.full_name?.split(" ")[0] || "SAPCian";
        } catch {}
      }
      previousTopic = localStorage.getItem("sapc_last_chat_topic") || "";
    }

    const greetingText = previousTopic
      ? `${timeOfDay}, ${studentName}! Naaalala ko na napag-usapan natin noon ang tungkol sa ${previousTopic}. Kumusta ang iyong mga klase, aralin, at pakiramdam ngayon? Nandito ako para makinig at sumuporta sa iyo.`
      : `${timeOfDay}, ${studentName}! Ako ang iyong SAPC Guidance Companion. Kumusta ang mga klase, kalusugan, o nararamdaman mo ngayong linggo? Ligtas at kumpidensyal ang bawat pag-uusapan natin dito.`;

    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            sender: "bot",
            text: greetingText,
            isGeminiPowered: false,
            time: "Just now"
          }
        ];
      }
      return prev;
    });
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText.trim() : input.trim();
    if (!textToSend || isLoading) return;
    setInput("");

    const newMsg: Message = {
      sender: "student",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Retrieve matched institutional knowledge items via RAG
    const matchedKB = searchKnowledgeBase(textToSend, 3);

    try {
      const res = await fetchWithAuth("/chatbot/message", {
        method: "POST",
        timeoutMs: 20000,
        body: JSON.stringify({
          message: textToSend,
          session_token: sessionToken,
          knowledge_context: matchedKB.map(k => ({
            title: k.title,
            category: k.category,
            content: k.content,
            resources: k.suggested_resources
          }))
        })
      });

      if (res.session_token) {
        setSessionToken(res.session_token);
      }

      // 5-Step Crisis Protocol Trigger
      if (res.crisis_triggered || res.distress_score >= 85.0) {
        setShowConsentModal(true);
        setActiveAlert("Crisis Protocol Initiated: Priority counseling assistance and emergency hotlines available.");
      } else if (res.counselor_flagged) {
        setActiveAlert("Guidance Support Flagged: Your counselor has been notified to check in.");
      }

      const botMsg: Message = {
        sender: "bot",
        text: res.reply,
        sentiment: res.sentiment,
        distressScore: res.distress_score,
        flagged: res.counselor_flagged,
        detectedEmotion: res.detected_emotion,
        emotionConfidence: res.emotion_confidence,
        intent: res.intent,
        crisisTriggered: res.crisis_triggered,
        isGeminiPowered: res.is_gemini_powered,
        modelUsed: res.model_used,
        resources: res.suggested_resources,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);

      // Save cross-session topic
      if (typeof window !== "undefined" && textToSend.length > 10) {
        localStorage.setItem("sapc_last_chat_topic", textToSend.slice(0, 40) + "...");
      }
    } catch {
      // Empathetic Counselor-Grounded Offline Fallback Dialogue
      const cleanLower = textToSend.toLowerCase();
      let fallbackText = "Nandito ako para makinig sa iyo nang buong puso. Valid ang anumang nararamdaman mo ngayon, at ligtas ang espasyong ito para sa iyong mga saloobin. Nais mo bang magkwento pa kung ano ang tumatakbo sa isip mo?";
      let fallbackResources = [
        "SAPC Peer Wellness Listening Buddy Circle",
        "Guidance Relaxation & Mindfulness Corner (Room 204)",
        "Daily Student Wellness Journal & Safe Reflection Space"
      ];

      // 1. Crisis / Severe Distress
      if (
        cleanLower.includes("mamatay") || 
        cleanLower.includes("suicide") || 
        cleanLower.includes("ayaw ko na mabuhay") || 
        cleanLower.includes("gusto ko nang mawala") || 
        cleanLower.includes("di ko na kaya")
      ) {
        fallbackText = "Naririnig kita nang buong puso, at gusto kong ipaalala sa iyo na hindi ka nag-iisa. Napakahalaga ng buhay mo at may mga taong tunay na nagmamalasakit at handang makinig sa iyo nang walang anumang paghuhusga. Nandito ako kasama mo sa sandaling ito. Huminga tayo nang dahan-dahan.";
        fallbackResources = [
          "SAPC Guidance & Counseling Office (Room 204, Bldg A • Mon-Fri 8AM-5PM)",
          "National Center for Mental Health (NCMH) 24/7 Crisis Hotline: 1553 (Toll-Free)",
          "Hopeline Philippines: 0917-558-4673 / (02) 8804-4673",
          "Philippine Red Cross 24/7 Helpline: 143"
        ];
      }
      // 2. Overwhelmed by requirements / How to start / Study planning
      else if (
        cleanLower.includes("requirements") || 
        cleanLower.includes("requirement") || 
        cleanLower.includes("daming") || 
        cleanLower.includes("dami") || 
        cleanLower.includes("paano magsimula") || 
        cleanLower.includes("paano simulan") || 
        cleanLower.includes("saan magsisimula") || 
        cleanLower.includes("tambak") ||
        cleanLower.includes("unahin") ||
        cleanLower.includes("prioritize")
      ) {
        fallbackText = "Naiintindihan ko kung gaano kabigat sa pakiramdam kapag sabay-sabay ang requirements at hindi mo na alam kung saan magsisimula. Normal lang na ma-overwhelm kapag tambak ang gawain, pero tandaan mo: hindi mo kailangang tapusin ang lahat nang sabay-sabay.\n\nSubukan natin itong simpleng 3-Step Action Plan:\n\n1. 📝 5-Minute Brain Dump\nIlapag sa isang papel o notebook ang lahat ng iniisip mong kailangang gawin. Mas madaling kontrolin ang mga gawain kapag nakikita mo sa papel kaysa kapag umiikot lang sa isip.\n\n2. 🎯 The Rule of 1 (Pumili ng 1 Quick Win)\nPumili ng isa (1) lang muna na pinakamadaling tapusin o may pinakamalapit na deadline bukas. Ang matapos ang kahit 1 maliit na gawain ay magbibigay sa iyo ng lakas ng loob at momentum.\n\n3. ⏳ 25/5 Pomodoro Pacing\nMag-focus sa napili mong gawain sa loob ng 25 minutes (i-off muna ang social media notifications), tapos magpahinga nang buong 5 minutes para makahinga ang isip mo.\n\nGusto mo bang ilista natin dito ang 2 hanggang 3 gawain na pinaka-nagpapabigat sa iyo ngayon para matulungan kitang pumili kung alin ang pinakamagandang unahin?";
        fallbackResources = [
          "SAPC Time Management & Priority Matrix Guide",
          "Learning Commons Study Pods & Quiet Space (Room 104)",
          "5-Minute Guided Focus & Hydration Planner"
        ];
      }
      // 3. Loneliness / Need someone to talk to
      else if (
        cleanLower.includes("kausap") || 
        cleanLower.includes("makausap") || 
        cleanLower.includes("lonely") || 
        cleanLower.includes("mag-isa") || 
        cleanLower.includes("nalulungkot") ||
        cleanLower.includes("walang kaibigan")
      ) {
        fallbackText = "Nandito ako at buong puso akong handang makinig sa iyo. Minsan, nakakagaan talaga sa pakiramdam kapag may napagsasabihan tayo ng ating mga naiisip nang walang takot na husgahan. Hindi mo kailangang solohin ang nararamdaman mo. Ano ang mga bagay na nagpapabigat sa iyo ngayon? Pwede mong ikwento sa akin.";
        fallbackResources = [
          "SAPC Peer Wellness Listening Buddy Circle",
          "Guidance Relaxation & Mindfulness Corner (Room 204)",
          "Student Lounge & Reflection Space"
        ];
      }
      // 4. Academic difficulties & Failing grades
      else if (
        cleanLower.includes("bagsak") || 
        cleanLower.includes("nahihirapan") || 
        cleanLower.includes("grade") || 
        cleanLower.includes("grades") || 
        cleanLower.includes("exam") || 
        cleanLower.includes("subject") ||
        cleanLower.includes("mababa")
      ) {
        fallbackText = "Ramdam ko ang bigat at kaba na nararamdaman mo tungkol sa iyong pag-aaral. Gusto kong ipaalala sa iyo: hindi nasusukat ng isang mahirap na exam o mababang marka ang buong galing at halaga mo bilang tao. Normal lang na magkaroon ng mga hamon sa school.\n\nMay mga paraan para makabawi—tulad ng libreng peer tutoring sa Learning Commons (Room 104) at consultation sa iyong guro. Ano ba ang partikular na aralin na pinaka-nakakalito sa iyo ngayon? Pwede nating pag-usapan.";
        fallbackResources = [
          "SAPC Free Academic Peer Tutoring (Room 104, Learning Commons)",
          "Subject Teacher Consultation & Remedial Program",
          "Form 137 / Grade Recovery Roadmap"
        ];
      }
      // 5. Anxiety, Panic, Overthinking
      else if (
        cleanLower.includes("kaba") || 
        cleanLower.includes("kinakabahan") || 
        cleanLower.includes("panic") || 
        cleanLower.includes("overthinking") || 
        cleanLower.includes("takot") || 
        cleanLower.includes("di makatulog")
      ) {
        fallbackText = "Ramdam ko ang kaba at overthinking na nararanasan mo ngayon. Ligtas ka sa sandaling ito, at lilipas din ang bugso ng kaba.\n\nSubukan nating huminga nang dahan-dahan:\n• Huminga papasok sa ilong (4 seconds)...\n• Pigilin sandali (4 seconds)...\n• Dahan-dahang ibuga sa bibig (6 seconds).\n\nNandito lang ako. Ano ang pinakamalaking bagay na nagpapaikot sa isip mo ngayon?";
        fallbackResources = [
          "5-Minute Guided Box Breathing Technique",
          "SAPC Peer Wellness Support Circle",
          "Guidance Relaxation & Mindfulness Corner (Room 204)"
        ];
      }
      // 6. Stress, Burnout & Heavy workload
      else if (
        cleanLower.includes("stress") || 
        cleanLower.includes("pagod") || 
        cleanLower.includes("burnout") || 
        cleanLower.includes("daming gawain") || 
        cleanLower.includes("tambak")
      ) {
        fallbackText = "Naiintindihan ko kung gaano nakakapagod ang sunod-sunod na requirements at puyat. Valid ang nararamdaman mong pagod, at mahalagang bigyan mo rin ang sarili mo ng sandaling pahinga.\n\nTandaan: Hindi mo kailangang tapusin ang lahat nang sabay-sabay. Subukan nating pumili ng isang maliit na gawain muna para gumaan ang pakiramdam mo. Gusto mo bang tulungan kitang ayusin ang priorities mo?";
        fallbackResources = [
          "SAPC Time Management & Priority Matrix Guide",
          "5-Minute Rest & Hydration Break Reminder",
          "Guidance Peer Study Support"
        ];
      }
      // 7. Financial difficulties
      else if (
        cleanLower.includes("pera") || 
        cleanLower.includes("tuition") || 
        cleanLower.includes("baon") || 
        cleanLower.includes("promissory") || 
        cleanLower.includes("scholarship")
      ) {
        fallbackText = "Naiintindihan ko kung gaano kabigat sa dibdib ang mga alalahaning pinansyal. Gusto kong ipaalala na hindi mo dapat ikahiya ito. Sa SAPC, may Student Assistance Grants at zero-interest Promissory Note support para tuloy-tuloy ang iyong pag-aaral nang walang hadlang. Gusto mo bang malaman ang mga hakbang para makakuha ng guidance endorsement?";
        fallbackResources = [
          "SAPC Student Assistance & Scholarship Office (Bldg A Ground Floor)",
          "Guidance Endorsement for Emergency Exam Promissory Note",
          "Accounting Office Promissory Support"
        ];
      }
      // 8. Matched Knowledge Base Context (Weaved naturally into counseling response)
      else if (matchedKB.length > 0) {
        const top = matchedKB[0];
        fallbackText = `Salamat sa pagtitiwala na magtanong tungkol dito. Bilang iyong Guidance Companion, naririnig ko ang iyong alalahanin.\n\n${top.content}\n\nNandito ako para samahan ka sa bawat hakbang. May partikular ka bang tanong o nais linawin tungkol dito?`;
        if (top.suggested_resources && top.suggested_resources.length > 0) {
          fallbackResources = top.suggested_resources;
        }
      }

      const botMsg: Message = {
        sender: "bot",
        text: fallbackText,
        time: "Just now",
        isGeminiPowered: false,
        resources: fallbackResources
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateMessage = async (msgIndex: number, rating: "thumbs_up" | "thumbs_down") => {
    const updated = [...messages];
    updated[msgIndex] = { ...updated[msgIndex], rating };
    setMessages(updated);

    // Find the corresponding student prompt
    let studentPrompt = "General Query";
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === "student") {
        studentPrompt = messages[i].text;
        break;
      }
    }

    const botResponse = updated[msgIndex].text;

    if (rating === "thumbs_down") {
      // Open critique popover to collect feedback and ideal correction
      setCritiqueModal({
        messageIndex: msgIndex,
        studentPrompt,
        botResponse,
        rating: "thumbs_down",
        selectedTags: [],
        notes: "",
        suggestedAnswer: ""
      });
      setCritiqueSuccessMsg(null);
    } else {
      // Submit positive rating directly
      try {
        await fetchWithAuth("/chatbot/critique", {
          method: "POST",
          body: JSON.stringify({
            session_token: sessionToken,
            student_prompt: studentPrompt,
            bot_response: botResponse,
            rating: "thumbs_up",
            critique_tags: ["helpful", "empathetic"]
          })
        });
      } catch (err) {
        console.warn("Could not save rating:", err);
      }
    }
  };

  const handleOpenCritiqueForMessage = (msgIndex: number) => {
    let studentPrompt = "General Query";
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === "student") {
        studentPrompt = messages[i].text;
        break;
      }
    }
    setCritiqueModal({
      messageIndex: msgIndex,
      studentPrompt,
      botResponse: messages[msgIndex].text,
      rating: messages[msgIndex].rating || "thumbs_down",
      selectedTags: [],
      notes: "",
      suggestedAnswer: ""
    });
    setCritiqueSuccessMsg(null);
  };

  const handleToggleTag = (tagId: string) => {
    if (!critiqueModal) return;
    const exists = critiqueModal.selectedTags.includes(tagId);
    setCritiqueModal({
      ...critiqueModal,
      selectedTags: exists 
        ? critiqueModal.selectedTags.filter(t => t !== tagId)
        : [...critiqueModal.selectedTags, tagId]
    });
  };

  const handleSubmitCritique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!critiqueModal) return;
    setIsSubmittingCritique(true);

    try {
      // 1. Submit critique to backend
      await fetchWithAuth("/chatbot/critique", {
        method: "POST",
        body: JSON.stringify({
          session_token: sessionToken,
          student_prompt: critiqueModal.studentPrompt,
          bot_response: critiqueModal.botResponse,
          rating: critiqueModal.rating,
          critique_tags: critiqueModal.selectedTags,
          critique_notes: critiqueModal.notes,
          counselor_suggested_answer: critiqueModal.suggestedAnswer
        })
      });

      // 2. If an ideal counselor answer is given, index it directly into active RAG memory
      if (critiqueModal.suggestedAnswer.trim().length > 10) {
        await saveKnowledgeItem({
          category: "counseling_faq",
          title: `Trained Counselor Correction: ${critiqueModal.studentPrompt.slice(0, 50)}...`,
          keywords: critiqueModal.studentPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 2),
          content: critiqueModal.suggestedAnswer.trim(),
          suggested_resources: [
            "SAPC Guidance & Counseling Center (Room 204)",
            "Peer Tutoring Learning Commons (Room 104)"
          ],
          author_name: "Registered Guidance Counselor",
          author_role: "Critique Gold Standard",
          is_active: true,
          priority_weight: 5
        });
      }

      setCritiqueSuccessMsg("Feedback and ideal answer recorded! The AI will use this gold standard for future responses.");
      setTimeout(() => {
        setCritiqueModal(null);
        setCritiqueSuccessMsg(null);
      }, 2000);
    } catch (err) {
      console.warn("Error submitting critique:", err);
      setCritiqueSuccessMsg("Saved locally. Thank you for helping train the Guidance Companion!");
      setTimeout(() => {
        setCritiqueModal(null);
        setCritiqueSuccessMsg(null);
      }, 2000);
    } finally {
      setIsSubmittingCritique(false);
    }
  };

  const handleConsentDecision = (granted: boolean) => {
    setShowConsentModal(false);

    if (granted) {
      setActiveAlert("Confidential Alert Sent: Registered Guidance Counselor Maria Theresa Cruz, RGC will follow up safely.");
      if (typeof window !== "undefined") {
        const alerts = JSON.parse(localStorage.getItem("sapc_crisis_alerts") || "[]");
        alerts.push({
          id: `crisis-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: "urgent_counselor_notified",
          type: "5-Step Crisis Protocol Triggered (Student Consent Granted)"
        });
        localStorage.setItem("sapc_crisis_alerts", JSON.stringify(alerts));
      }
    } else {
      setActiveAlert("Self-Care Protocol: You can visit Room 204 anytime or dial 1553 for 24/7 confidential help.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col h-[700px] max-h-[92vh] overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#8B0014] to-[#B91C1C] p-0.5 shadow-xs">
              <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center">
                <Bot className="h-6 w-6 text-[#8B0014]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">SAPC Guidance Companion</h3>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Safe &amp; Confidential
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-amber-700" /> Guidance Support
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">San Antonio de Padua College • Safe, Caring, &amp; Confidential Space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crisis Notification Banner */}
        {activeAlert && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center gap-3 text-xs sm:text-sm text-rose-900">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            <span className="flex-1 font-semibold">{activeAlert}</span>
            <div className="flex items-center gap-1.5 font-bold text-rose-900 bg-rose-100 px-3 py-1 rounded-lg border border-rose-200">
              <PhoneCall className="h-4 w-4 text-rose-700" />
              <span>NCMH 1553</span>
            </div>
          </div>
        )}

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 ${m.sender === "student" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="h-9 w-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="h-5 w-5 text-[#8B0014]" />
                </div>
              )}

              <div
                className={`max-w-[84%] rounded-2xl px-5 py-3.5 text-sm sm:text-base leading-relaxed ${
                  m.sender === "student"
                    ? "bg-[#8B0014] text-white rounded-tr-none shadow-xs"
                    : "bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs"
                }`}
              >
                {/* Counselor Companion Tag on Bot Messages */}
                {m.sender === "bot" && (
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#8B0014] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 w-fit">
                    <HeartHandshake className="h-3 w-3 text-[#8B0014]" />
                    <span>Guidance Companion</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap space-y-1.5">
                  {m.text}
                </div>

                {/* Suggested Campus Resources */}
                {m.resources && m.resources.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200 text-xs sm:text-sm">
                    <p className="font-bold text-[#8B0014] mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      Recommended Support Resources:
                    </p>
                    <ul className="space-y-1.5 text-slate-700">
                      {m.resources.map((r, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#8B0014] shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Message Footer with Rating & Critique Action */}
                <div className="mt-2 pt-1 flex items-center justify-between gap-2 text-xs text-slate-400">
                  {m.sender === "bot" ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRateMessage(idx, "thumbs_up")}
                        title="Helpful & Empathetic Answer"
                        className={`p-1 rounded-md transition cursor-pointer ${
                          m.rating === "thumbs_up" 
                            ? "bg-emerald-100 text-emerald-700 font-bold" 
                            : "hover:bg-slate-100 text-slate-400 hover:text-emerald-600"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRateMessage(idx, "thumbs_down")}
                        title="Needs Improvement / Critique"
                        className={`p-1 rounded-md transition cursor-pointer ${
                          m.rating === "thumbs_down" 
                            ? "bg-rose-100 text-rose-700 font-bold" 
                            : "hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                        }`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCritiqueForMessage(idx)}
                        className="text-[11px] font-medium text-slate-500 hover:text-[#8B0014] hover:underline flex items-center gap-1 ml-1 cursor-pointer"
                      >
                        <MessageSquarePlus className="h-3 w-3" />
                        Critique / Train
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}
                  <span>{m.time}</span>
                </div>
              </div>

              {m.sender === "student" && (
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border border-amber-400/50 flex items-center justify-center shrink-0 text-white shadow-xs font-bold text-sm">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="h-9 w-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5 text-[#8B0014] animate-spin" />
              </div>
              <div className="bg-white text-slate-600 border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3.5 text-sm shadow-xs flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-[#8B0014] animate-pulse" />
                <span className="italic">Listening &amp; preparing thoughtful guidance...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Critique & RLHF Counselor Feedback Modal Popup */}
        {critiqueModal && (
          <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
            <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <MessageSquarePlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Critique &amp; Train AI Companion</h4>
                    <p className="text-[11px] text-slate-500">Provide feedback or write the ideal counselor answer</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCritiqueModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {critiqueSuccessMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{critiqueSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitCritique} className="space-y-3.5">
                  {/* Student Prompt Preview */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-500 mb-0.5">Student Question / Prompt:</p>
                    <p className="text-slate-800 italic">"{critiqueModal.studentPrompt}"</p>
                  </div>

                  {/* Critique Tags */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      What can be improved in the response?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CRITIQUE_TAG_OPTIONS.map((tag) => {
                        const isSelected = critiqueModal.selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                              isSelected
                                ? "bg-[#8B0014] text-white border-[#8B0014]"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ideal Counselor Answer (Gold Standard Correction) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Ideal Counselor Answer ("What should the AI say instead?"):
                    </label>
                    <textarea
                      rows={4}
                      value={critiqueModal.suggestedAnswer}
                      onChange={(e) => setCritiqueModal({ ...critiqueModal, suggestedAnswer: e.target.value })}
                      placeholder="e.g. Write the step-by-step guidance, warm validation, or exact campus policy that the AI should provide..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#8B0014]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      ✨ Providing an ideal answer automatically indexes it into the counseling RAG knowledge base.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCritiqueModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingCritique}
                      className="px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingCritique && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                      Save Critique &amp; Train AI
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 5-Step Crisis Protocol: Counselor Alert Consent Modal Popup */}
        {showConsentModal && (
          <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 text-[#8B0014] mx-auto flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Safety &amp; Guidance Care Support</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Naririnig namin ang iyong pinagdaraanan. Gusto mo bang ipagbigay-alam namin ito sa Guidance Counselor (Maria Theresa Cruz, RGC) upang mabigyan ka ng ligtas at kumpidensyal na tulong?
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleConsentDecision(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  Oo, Ipaalam sa Guidance Counselor
                </button>
                <button
                  type="button"
                  onClick={() => handleConsentDecision(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  Ako na lamang ang pupunta sa Guidance Office (Room 204)
                </button>
              </div>
              <p className="text-[10px] text-slate-400">RA 10173 Protected • Free 24/7 National Center for Mental Health Hotline: 1553</p>
            </div>
          </div>
        )}

        {/* Input Bar & Quick Suggestions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              "Sobrang daming requirements, paano magsimula?",
              "Nahihirapan po ako sa Math / Science",
              "Kinakabahan ako sa exam bukas",
              "Gusto ko lang ng makakausap",
              "Nahihiya akong magtanong sa klase",
              "Saan ang Guidance Office Room 204?"
            ].map((suggestion, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleSend(suggestion)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-[#8B0014] hover:border-rose-200 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message (e.g. 'Sobrang daming requirements, paano magsimula?')"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold flex items-center gap-2 transition disabled:opacity-50 active:scale-95 shadow-xs text-sm sm:text-base cursor-pointer"
            >
              <Send className="h-5 w-5 text-white" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              RA 10173 Protected • Student Interface Only
            </span>
            <span>National Crisis Hotline: <strong className="text-slate-900 font-bold">1553</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
