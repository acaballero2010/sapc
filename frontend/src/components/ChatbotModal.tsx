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
  Activity
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
  resources?: string[];
  time: string;
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am your SAPC Student Support Companion. How are your classes, health, or emotional wellness feeling lately? Everything you share is treated with utmost care and guidance support.",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput("");

    const newMsg: Message = {
      sender: "student",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const res = await fetchWithAuth("/chatbot/message", {
        method: "POST",
        body: JSON.stringify({
          message: userText,
          session_token: sessionToken
        })
      });

      if (res.session_token) {
        setSessionToken(res.session_token);
      }

      if (res.counselor_flagged) {
        setActiveAlert("Guidance Counselor Notification Sent: A counselor has been alerted for priority support.");
      }

      const botMsg: Message = {
        sender: "bot",
        text: res.reply,
        sentiment: res.sentiment,
        distressScore: res.distress_score,
        flagged: res.counselor_flagged,
        resources: res.suggested_resources,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am here for you, though I encountered a connection issue. Please feel free to reach out to the Guidance Office directly at Room 204.",
          time: "Just now"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col h-[680px] max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#8B0014] to-[#B91C1C] p-0.5 shadow-xs">
              <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center">
                <Bot className="h-6 w-6 text-[#8B0014]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">SAPC Guidance Companion</h3>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1">
                  <Activity className="h-3 w-3 text-emerald-600" /> NLP Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">San Antonio de Padua College • Confidential Wellness Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
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
                className={`max-w-[82%] rounded-2xl px-5 py-3.5 text-sm sm:text-base leading-relaxed ${
                  m.sender === "student"
                    ? "bg-[#8B0014] text-white rounded-tr-none shadow-xs"
                    : "bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs"
                }`}
              >
                <p>{m.text}</p>

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

                <div className="mt-1.5 flex items-center justify-end gap-2 text-xs text-slate-400">
                  <span>{m.time}</span>
                  {m.distressScore !== undefined && m.distressScore > 40 && (
                    <span className="text-rose-600 font-bold">• Risk Tagged</span>
                  )}
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
              <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3.5 text-sm italic shadow-xs">
                Analyzing distress indicators & formulating guidance response...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
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
              placeholder="Type your message (e.g. 'I am feeling overwhelmed with my grades...')"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold flex items-center gap-2 transition disabled:opacity-50 active:scale-95 shadow-xs text-sm sm:text-base"
            >
              <Send className="h-5 w-5 text-white" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              RA 10173 Protected • Guidance Counselor Access Only
            </span>
            <span>National Crisis Hotline: <strong className="text-slate-900 font-bold">1553</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
