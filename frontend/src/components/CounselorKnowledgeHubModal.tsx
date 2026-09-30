"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  AlertCircle, 
  BrainCircuit, 
  MessageSquare, 
  Download, 
  RefreshCw,
  Shield,
  Tag,
  Layers,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  CheckCircle2
} from "lucide-react";
import { 
  CounselorKnowledgeItem, 
  KnowledgeCategory, 
  getStoredKnowledgeBase, 
  saveKnowledgeItem, 
  deleteKnowledgeItem, 
  searchKnowledgeBase, 
  loadKnowledgeBaseFromFirestore 
} from "@/lib/counselor-kb-store";
import { fetchWithAuth } from "@/lib/api";

interface CounselorKnowledgeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: string;
  currentUserName?: string;
}

interface ChatCritiqueItem {
  id: number;
  session_token?: string;
  student_prompt: string;
  bot_response: string;
  rating: string;
  critique_tags?: string;
  critique_notes?: string;
  counselor_suggested_answer?: string;
  reviewer_role: string;
  applied_to_kb: boolean;
  created_at: string;
}

const CATEGORY_LABELS: Record<KnowledgeCategory, { label: string; color: string; bg: string; border: string }> = {
  academic_policy: {
    label: "Academic Policy",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-900"
  },
  counseling_faq: {
    label: "Counseling FAQ",
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-900"
  },
  crisis_protocol: {
    label: "Crisis Protocol",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-900"
  },
  campus_resource: {
    label: "Campus Resource",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-900"
  },
  study_tip: {
    label: "Study & Wellness Tip",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-900"
  },
  financial_aid: {
    label: "Financial & 4Ps Aid",
    color: "text-cyan-700 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-200 dark:border-cyan-900"
  }
};

export const CounselorKnowledgeHubModal: React.FC<CounselorKnowledgeHubModalProps> = ({
  isOpen,
  onClose,
  currentUserRole = "counselor",
  currentUserName = "Ms. Maria Theresa Cruz, RGC"
}) => {
  const [items, setItems] = useState<CounselorKnowledgeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "editor" | "simulator" | "critiques">("library");
  
  // Editor Form State
  const [editingItem, setEditingItem] = useState<Partial<CounselorKnowledgeItem> | null>(null);
  const [formCategory, setFormCategory] = useState<KnowledgeCategory>("counseling_faq");
  const [formTitle, setFormTitle] = useState("");
  const [formKeywords, setFormKeywords] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formResources, setFormResources] = useState("");
  const [formPriority, setFormPriority] = useState<number>(3);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Simulator / Test Playground State
  const [simQuery, setSimQuery] = useState("Sobrang daming requirements, paano magsimula?");
  const [simResults, setSimResults] = useState<CounselorKnowledgeItem[]>([]);
  const [simResponse, setSimResponse] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Critiques & RLHF Queue State
  const [critiques, setCritiques] = useState<ChatCritiqueItem[]>([]);
  const [isLoadingCritiques, setIsLoadingCritiques] = useState(false);

  const fetchCritiques = useCallback(async () => {
    setIsLoadingCritiques(true);
    try {
      const res = await fetchWithAuth("/chatbot/critiques");
      if (Array.isArray(res)) {
        setCritiques(res);
      }
    } catch (err) {
      console.warn("Could not load critiques from backend:", err);
    } finally {
      setIsLoadingCritiques(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const initial = getStoredKnowledgeBase();
    setItems(initial);
    loadKnowledgeBaseFromFirestore().then((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setItems(cloudItems);
      }
    });
    fetchCritiques();
  }, [isOpen, fetchCritiques]);

  if (!isOpen) return null;

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenEditor = (item?: CounselorKnowledgeItem) => {
    if (item) {
      setEditingItem(item);
      setFormCategory(item.category);
      setFormTitle(item.title);
      setFormKeywords(item.keywords.join(", "));
      setFormContent(item.content);
      setFormResources(item.suggested_resources.join("\n"));
      setFormPriority(item.priority_weight || 3);
      setFormIsActive(item.is_active ?? true);
    } else {
      setEditingItem(null);
      setFormCategory("counseling_faq");
      setFormTitle("");
      setFormKeywords("");
      setFormContent("");
      setFormResources("");
      setFormPriority(3);
      setFormIsActive(true);
    }
    setActiveTab("editor");
    setFeedbackMsg(null);
  };

  const handleAdoptCritique = (c: ChatCritiqueItem) => {
    setEditingItem(null);
    setFormCategory("counseling_faq");
    setFormTitle(`Counselor Protocol: ${c.student_prompt.slice(0, 45)}...`);
    setFormKeywords(c.student_prompt.toLowerCase().split(/[ ,?.!]+/).filter(w => w.length > 2).join(", "));
    setFormContent(c.counselor_suggested_answer || c.bot_response);
    setFormResources("SAPC Guidance & Counseling Center (Room 204, Bldg A)\nLearning Commons Study Pods (Room 104)");
    setFormPriority(4);
    setFormIsActive(true);
    setActiveTab("editor");
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setFeedbackMsg({ text: "Please enter a valid title and counseling guidance content.", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const keywordsArray = formKeywords
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const resourcesArray = formResources
        .split("\n")
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const saved = await saveKnowledgeItem({
        id: editingItem?.id,
        category: formCategory,
        title: formTitle.trim(),
        keywords: keywordsArray,
        content: formContent.trim(),
        suggested_resources: resourcesArray,
        author_name: currentUserName || "Counselor",
        author_role: currentUserRole === "admin" ? "Guidance Admin" : "Registered Guidance Counselor",
        is_active: formIsActive,
        priority_weight: Number(formPriority)
      });

      const updated = getStoredKnowledgeBase();
      setItems(updated);
      setFeedbackMsg({ text: `Guideline "${saved.title}" successfully synced across SAPC Guidance System!`, type: "success" });
      setTimeout(() => {
        setActiveTab("library");
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg({ text: `Failed saving guideline: ${err?.message || "Unknown error"}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the active AI knowledge base?`)) return;
    await deleteKnowledgeItem(id);
    const updated = getStoredKnowledgeBase();
    setItems(updated);
  };

  const handleRunSimulation = () => {
    if (!simQuery.trim()) return;
    setIsSimulating(true);

    const matches = searchKnowledgeBase(simQuery, 3);
    setSimResults(matches);

    let simulated = `[Simulated Guidance AI Response using ${matches.length} matched institutional knowledge items]:\n\n`;
    
    if (matches.length > 0) {
      const topMatch = matches[0];
      simulated += `Naririnig kita nang buong puso. Ayon sa ating institutional guidance guideline (${topMatch.title}):\n\n`;
      simulated += `"${topMatch.content}"\n\n`;
      if (topMatch.suggested_resources && topMatch.suggested_resources.length > 0) {
        simulated += `Maaari mong bisitahin ang mga sumusunod na opisina sa campus:\n`;
        topMatch.suggested_resources.forEach(res => {
          simulated += `• ${res}\n`;
        });
      }
      simulated += `\nHindi ka nag-iisa, at laging bukas ang Guidance Office para sumuporta sa iyo.`;
    } else {
      simulated += `Naiintindihan ko ang iyong nararamdaman. (Walang specific keyword match; gagamitin ng AI ang pangkalahatang Sikolohiyang Pilipino at Carl Rogers empathy framework.)`;
    }

    setSimResponse(simulated);
    setIsSimulating(false);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sapc_guidance_knowledge_base_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col h-[820px] max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#8B0014] to-[#B91C1C] flex items-center justify-center text-white shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Counselor Knowledge &amp; Training Hub
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
                  RAG &amp; RLHF Training
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Train, critique, and ground the SAPC Guidance AI with official institutional protocols and counseling frameworks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              title="Export Knowledge Base JSON"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("library")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "library"
                ? "border-[#8B0014] text-[#8B0014] dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Knowledge Library ({items.length})
          </button>
          <button
            onClick={() => handleOpenEditor()}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "editor"
                ? "border-[#8B0014] text-[#8B0014] dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Plus className="h-4 w-4" />
            {editingItem ? "Edit Knowledge Item" : "Train New Guideline"}
          </button>
          <button
            onClick={() => {
              setActiveTab("critiques");
              fetchCritiques();
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "critiques"
                ? "border-[#8B0014] text-[#8B0014] dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <MessageSquarePlus className="h-4 w-4" />
            Critiques &amp; Training Queue ({critiques.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("simulator");
              handleRunSimulation();
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "simulator"
                ? "border-[#8B0014] text-[#8B0014] dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            AI Retrieval Simulator
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {feedbackMsg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
              feedbackMsg.type === "success" 
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800" 
                : "bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
            }`}>
              {feedbackMsg.type === "success" ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* TAB 1: KNOWLEDGE LIBRARY */}
          {activeTab === "library" && (
            <div className="space-y-4">
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 [scrollbar-width:none]">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      selectedCategory === "all"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    All ({items.length})
                  </button>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                        selectedCategory === catKey
                          ? `${catMeta.bg} ${catMeta.color} border ${catMeta.border} font-bold`
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {catMeta.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search guidelines or keywords..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const catMeta = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.counseling_faq;
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}>
                            {catMeta.label}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                            <span>Weight {item.priority_weight || 1}x</span>
                            <span>•</span>
                            <span className={item.is_active ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}>
                              {item.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {item.content}
                        </p>

                        {/* Keyword Chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.keywords.slice(0, 5).map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-medium flex items-center gap-1"
                            >
                              <Tag className="h-2.5 w-2.5 opacity-60" />
                              {kw}
                            </span>
                          ))}
                          {item.keywords.length > 5 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{item.keywords.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <div className="text-[11px] truncate max-w-[200px]">
                          By <span className="font-semibold text-slate-600 dark:text-slate-300">{item.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditor(item)}
                            title="Edit this guideline"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            title="Remove guideline"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EDITOR */}
          {activeTab === "editor" && (
            <form onSubmit={handleSaveItem} className="max-w-3xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as KnowledgeCategory)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Priority Weight (1-5) *
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={1}>1 - Normal Supplemental</option>
                    <option value={2}>2 - Standard Guideline</option>
                    <option value={3}>3 - Important Campus Policy</option>
                    <option value={4}>4 - High Priority Intervention</option>
                    <option value={5}>5 - Mandatory Emergency Protocol</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Guideline Title / Scenario *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Empathetic Support for Failing Grades & Grade Recovery Policy"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold"
                  required
                />
              </div>

              {/* Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Trigger Keywords &amp; Tagalog Phrases (comma separated) *
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. bagsak, remedial, mababang grade, exam, nahihirapan sa klase, hiya"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Counseling Guidance Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Counselor Guidance Content / Exact Institutional Protocol *
                </label>
                <textarea
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the exact guidance, school policy details, room numbers, steps, or psychological reframing instructions you want Guidance AI to convey to students..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              {/* Suggested Resources */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Suggested Action Resources &amp; Offices (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={formResources}
                  onChange={(e) => setFormResources(e.target.value)}
                  placeholder="e.g.&#10;SAPC Guidance Office (Room 204, Bldg A • Mon-Fri 8AM-5PM)&#10;Free Peer Tutoring Desk (Room 104 Learning Commons)&#10;Grade Recomputation Form 137"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Active Toggle & Submit */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Active in AI Context Injection</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("library")}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#8B0014] to-[#B91C1C] text-white hover:opacity-90 shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>{editingItem ? "Update Guideline" : "Train & Save Guideline"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: CRITIQUES & RLHF QUEUE */}
          {activeTab === "critiques" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold">Student &amp; Counselor RLHF Feedback Queue</p>
                  <p className="text-[11px] text-amber-700">
                    Review ratings, critiques, and gold-standard corrections submitted during guidance chat sessions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchCritiques}
                  className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {isLoadingCritiques ? (
                <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-[#8B0014]" />
                  <span>Loading feedback records...</span>
                </div>
              ) : critiques.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  No critiques recorded yet. Try clicking 👍 or 👎 on messages in the Guidance Companion to record feedback.
                </div>
              ) : (
                <div className="space-y-3">
                  {critiques.map((c) => {
                    let tags: string[] = [];
                    try {
                      if (c.critique_tags) {
                        tags = JSON.parse(c.critique_tags);
                      }
                    } catch {
                      if (c.critique_tags) tags = [c.critique_tags];
                    }

                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                              c.rating === "thumbs_up"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              {c.rating === "thumbs_up" ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                              {c.rating === "thumbs_up" ? "Helpful" : "Needs Improvement"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              By {c.reviewer_role} • {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAdoptCritique(c)}
                            className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                            <span>Adopt as Knowledge Base Protocol</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-slate-500 mb-1">Student Asked:</p>
                            <p className="text-slate-900 dark:text-white italic">&quot;{c.student_prompt}&quot;</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-slate-500 mb-1">AI Responded:</p>
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-3">{c.bot_response}</p>
                          </div>
                        </div>

                        {/* Critique Tags & Ideal Answer */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center text-[10px]">
                            <span className="font-bold text-slate-500">Critique Tags:</span>
                            {tags.map((t, tIdx) => (
                              <span key={tIdx} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {c.counselor_suggested_answer && (
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                            <p className="font-bold text-emerald-900 mb-0.5">🌟 Suggested Gold-Standard Ideal Answer:</p>
                            <p className="text-emerald-950 whitespace-pre-wrap">{c.counselor_suggested_answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SIMULATOR & PLAYGROUND */}
          {activeTab === "simulator" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-1">
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <BrainCircuit className="h-4 w-4" />
                  Live Retrieval &amp; Prompt Simulator
                </h4>
                <p className="text-[11px] text-purple-700 dark:text-purple-400">
                  Test how the AI Counselor matches student messages against your trained knowledge base and constructs personalized guidance responses in real time.
                </p>
              </div>

              {/* Input test prompt */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Simulated Student Message
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simQuery}
                    onChange={(e) => setSimQuery(e.target.value)}
                    placeholder="Type a simulated student query (e.g. Sobrang daming requirements, paano magsimula?)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white text-xs font-bold hover:bg-[#6D0010] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isSimulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    <span>Test Retrieval</span>
                  </button>
                </div>
              </div>

              {/* Simulation Result Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Left: Matched Knowledge Items */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-purple-500" />
                      Matched Knowledge Items ({simResults.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ranked by Priority</span>
                  </div>

                  {simResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No specific keyword or title match. Fallback to general counseling model.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {simResults.map((match, idx) => (
                        <div
                          key={match.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                              #{idx + 1} {match.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                              Weight {match.priority_weight}x
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                            {match.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Simulated AI Response */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BrainCircuit className="h-4 w-4 text-emerald-500" />
                      Simulated AI Guidance Response
                    </span>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {simResponse || "Click 'Test Retrieval' to generate a simulated response."}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span>Compliant with DepEd Child Protection &amp; RA 10173 Guidelines</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
