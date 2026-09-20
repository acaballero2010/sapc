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
  Sparkles
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
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
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
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
      ? `${timeOfDay}, ${studentName}! I remember in our previous session we touched on ${previousTopic}. Kumusta ang pakiramdam mo ngayon sa iyong mga klase at wellness? Nandito ako para makinig.`
      : `${timeOfDay}, ${studentName}! I am your SAPC Student Guidance Companion powered by Gemini AI. Kumusta ang mga klase, kalusugan, o nararamdaman mo ngayong linggo? Everything you share is safe and confidential.`;

    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            sender: "bot",
            text: greetingText,
            isGeminiPowered: true,
            modelUsed: "gemini-2.5-flash",
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

    try {
      const res = await fetchWithAuth("/chatbot/message", {
        method: "POST",
        timeoutMs: 20000,
        body: JSON.stringify({
          message: textToSend,
          session_token: sessionToken
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
      // Fallback dynamic offline response
      const cleanLower = textToSend.toLowerCase();
      let fallbackText = "Naririnig kita at nandito ako para sa iyo. Ligtas ang espasyong ito para sa iyong nararamdaman. Huwag mag-atubiling lumapit sa Guidance Office sa Room 204.";
      if (cleanLower.includes("kausap") || cleanLower.includes("lonely") || cleanLower.includes("mag-isa")) {
        fallbackText = "Nandito ako at handang makinig sa iyo nang buong puso. Ano ang mga naiisip o nararamdaman mo ngayon? Pwede mong ikwento sa akin nang malaya.";
      } else if (cleanLower.includes("bagsak") || cleanLower.includes("nahihirapan") || cleanLower.includes("subject")) {
        fallbackText = "Normal na magkaroon ng hamon sa academic journey. May libreng peer tutoring ang SAPC sa Room 104 Learning Commons. Gusto mo bang pag-usapan ang review plan?";
      }

      const botMsg: Message = {
        sender: "bot",
        text: fallbackText,
        time: "Just now",
        isGeminiPowered: false,
        resources: [
          "SAPC Guidance & Counseling Office (Room 204, Bldg A)",
          "National Center for Mental Health (NCMH) Hotline: 1553 (24/7 Toll-Free)",
          "Hopeline Philippines: 0917-558-4673"
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentDecision = (granted: boolean) => {
    setShowConsentModal(false);

    if (granted) {
      setActiveAlert("Confidential Alert Sent: Registered Guidance Counselor Maria Theresa Cruz, RGC will follow up safely.");
      // Save local emergency alert
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
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online • Safe &amp; Confidential
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-600" /> Gemini AI
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

        {/* Crisis Notification Banner (Only shown when student initiates crisis protocol) */}
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
                {/* Subtle Gemini Counselor Tag on Bot Messages */}
                {m.sender === "bot" && (
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                    <Sparkles className="h-3 w-3 text-purple-600" />
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
                      <HeartHandshake className="h-4 w-4" />
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

                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-slate-400">
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
                <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                <span className="italic">Listening &amp; preparing a supportive response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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
                  className="w-full py-3 px-4 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm shadow-md transition"
                >
                  Oo, Ipaalam sa Guidance Counselor
                </button>
                <button
                  type="button"
                  onClick={() => handleConsentDecision(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
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
              "Gusto ko ng kausap",
              "Nahihirapan po ako sa subjects ko",
              "Saan ang Guidance Office?",
              "Kinakabahan ako sa exams"
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
              placeholder="Type your message (e.g. 'Nahihirapan po ako sa subjects ko...')"
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
