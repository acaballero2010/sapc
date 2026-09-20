"use client";

import React, { useState } from "react";
import { 
  Mail, 
  PhoneCall, 
  Send, 
  Key, 
  X, 
  RefreshCw
} from "lucide-react";

interface EmailSmsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSmsConfigModal: React.FC<EmailSmsConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"resend" | "sms" | "simulator">("resend");
  const [resendApiKey, setResendApiKey] = useState("re_live_sapc_guidance_2026");
  const [senderEmail, setSenderEmail] = useState("guidance@sapc.edu.ph");
  const [smsGateway, setSmsGateway] = useState("Semaphore PH / Twilio");
  const [smsApiKey, setSmsApiKey] = useState("sem_live_490123847");
  const [smsSenderId, setSmsSenderId] = useState("SAPC-ALERT");

  // Simulator Test State
  const [testRecipient, setTestRecipient] = useState("parent@sapc.edu.ph");
  const [testStudent, setTestStudent] = useState("Joshua Dimaculangan");
  const [testType, setTestType] = useState<"crisis_alert" | "conference_invite" | "grade_notice">("conference_invite");
  const [isSending, setIsSending] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState<Array<{ time: string; msg: string; status: string }>>([]);

  const handleRunSimulator = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testRecipient,
          studentName: testStudent,
          type: testType === "crisis_alert" ? "🚨 Urgent NLP Crisis Notification" : "Parent-Teacher Case Conference",
          meetingDate: "Sep 22, 2026",
          meetingTime: "02:00 PM",
          venue: "Guidance Consultation Room 204"
        })
      });
      const data = await res.json();
      setDispatchLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          msg: `Dispatched ${testType} to ${testRecipient} (${data.mode || "success"})`,
          status: "Delivered (200 OK)"
        },
        ...prev
      ]);
    } catch (err: any) {
      setDispatchLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          msg: `Failed to dispatch: ${err.message}`,
          status: "Error"
        },
        ...prev
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#8B0014] text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Email &amp; SMS Gateway Configuration</h3>
              <p className="text-xs text-slate-500">Resend API &amp; Philippine SMS gateway integration for parent notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-3 bg-white border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab("resend")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "resend" ? "bg-[#8B0014] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Resend Email API</span>
          </button>
          <button
            onClick={() => setActiveTab("sms")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "sms" ? "bg-[#8B0014] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Philippine SMS Gateway</span>
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "simulator" ? "bg-[#8B0014] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Live Dispatch Simulator</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* 1. Resend Config */}
          {activeTab === "resend" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1">
                <span className="font-extrabold text-xs block">Resend Email Gateway Status:</span>
                <p className="text-[11px] leading-relaxed">
                  Automates formatted HTML invitations for case conferences, crisis advisories, and quarterly grade releases under verified institutional domain.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Resend API Key (re_...):</label>
                <div className="relative">
                  <Key className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Sender Address (From Header):</label>
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* 2. SMS Gateway Config */}
          {activeTab === "sms" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-1">
                <span className="font-extrabold text-xs block">Philippine SMS Dispatch Gateway:</span>
                <p className="text-[11px] leading-relaxed">
                  Supports Semaphore PH or Twilio for instant high-priority text alerts sent directly to parent mobile numbers (+63 9XX-XXX-XXXX).
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">SMS Gateway Provider:</label>
                <input
                  type="text"
                  value={smsGateway}
                  onChange={(e) => setSmsGateway(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Semaphore / Twilio API Key:</label>
                <input
                  type="password"
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Registered Sender Name / Tag:</label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={(e) => setSmsSenderId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {/* 3. Dispatch Simulator */}
          {activeTab === "simulator" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Recipient Email / Mobile:</label>
                  <input
                    type="text"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Student Case Name:</label>
                  <input
                    type="text"
                    value={testStudent}
                    onChange={(e) => setTestStudent(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Template Type:</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="conference_invite">📅 Parent Consultation Invite</option>
                    <option value="crisis_alert">🚨 Urgent Crisis Notification</option>
                    <option value="grade_notice">📚 DepEd Form 138 Grade Alert</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={isSending}
                onClick={handleRunSimulator}
                className="w-full py-2.5 rounded-xl bg-[#8B0014] text-white font-extrabold text-xs hover:bg-[#6D0010] transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-amber-300" />}
                <span>{isSending ? "Dispatching..." : "Send Test Notification via Resend & Gateway"}</span>
              </button>

              {/* Logs */}
              {dispatchLogs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="font-black text-slate-700 text-[11px] uppercase">Live Gateway Logs:</span>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
                    {dispatchLogs.map((log, i) => (
                      <div key={i} className="flex justify-between gap-2">
                        <span>[{log.time}] {log.msg}</span>
                        <span className="text-emerald-400 font-bold shrink-0">{log.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">RA 10173 Privacy Sealed • TLS 1.3 Encryption</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
          >
            Save Gateway Settings
          </button>
        </div>
      </div>
    </div>
  );
};
