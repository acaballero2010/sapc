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
  RefreshCw
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">SAPC Guidance Companion</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  NLP Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Confidential AI Mental Health & Academic Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crisis Notification Banner (If triggered) */}
        {activeAlert && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center gap-3 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="flex-1">{activeAlert}</span>
            <div className="flex items-center gap-1 font-semibold text-amber-200">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>NCMH 1553</span>
            </div>
          </div>
        )}

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === "student" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="h-8 w-8 rounded-full bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-indigo-300" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === "student"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-sm"
                }`}
              >
                <p>{m.text}</p>

                {/* Suggested Campus / Crisis Resources */}
                {m.resources && m.resources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/70 text-xs">
                    <p className="font-semibold text-indigo-300 mb-1.5 flex items-center gap-1">
                      <HeartHandshake className="h-3.5 w-3.5" />
                      Recommended Support Resources:
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      {m.resources.map((r, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-400 opacity-80">
                  <span>{m.time}</span>
                  {m.distressScore !== undefined && m.distressScore > 40 && (
                    <span className="text-amber-400 font-bold">• Risk Tagged</span>
                  )}
                </div>
              </div>

              {m.sender === "student" && (
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center shrink-0">
                <RefreshCw className="h-4 w-4 text-indigo-300 animate-spin" />
              </div>
              <div className="bg-slate-800/60 text-slate-400 border border-slate-700/40 rounded-2xl rounded-tl-none px-4 py-3 text-xs italic">
                Analyzing distress indicators & formulating guidance response...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message (e.g. 'I am feeling overwhelmed with my grades...')"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              RA 10173 Protected • Guidance Counselor Access Only
            </span>
            <span>National Crisis Hotline: 1553</span>
          </div>
        </div>
      </div>
    </div>
  );
};
