"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
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
  ArrowRight
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

interface CounselorKnowledgeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: string;
  currentUserName?: string;
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
  const [activeTab, setActiveTab] = useState<"library" | "editor" | "simulator">("library");
  
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
  const [simQuery, setSimQuery] = useState("Bagsak ako sa Math at nahihiya ako sa parents ko. Paano mag-remedials?");
  const [simResults, setSimResults] = useState<CounselorKnowledgeItem[]>([]);
  const [simResponse, setSimResponse] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const initial = getStoredKnowledgeBase();
    setItems(initial);
    loadKnowledgeBaseFromFirestore().then((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setItems(cloudItems);
      }
    });
  }, [isOpen]);

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
        author_role: currentUserRole === "admin" ? "System Administrator" : "Registered Guidance Counselor",
        is_active: formIsActive,
        priority_weight: formPriority
      });

      const updated = getStoredKnowledgeBase();
      setItems(updated);
      setFeedbackMsg({ text: `Successfully saved "${saved.title}" to AI Counselor Knowledge Base!`, type: "success" });
      setTimeout(() => {
        setActiveTab("library");
      }, 1000);
    } catch (err) {
      setFeedbackMsg({ text: `Failed to save knowledge item: ${String(err)}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
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

    // Generate preview response simulating Gemini's in-context prompt
    let simulated = `[Simulated Gemini AI Response using ${matches.length} matched institutional knowledge items]:\n\n`;
    
    if (matches.length > 0) {
      const topMatch = matches[0];
      simulated += `Naririnig kita, at natural lang na maramdaman ang lungkot o pag-aalinlangan kapag may mababang marka. Ayon sa ${topMatch.title}:\n\n`;
      simulated += `"${topMatch.content}"\n\n`;
      simulated += `Maaari mong puntahan ang mga sumusunod na opisina sa campus:\n`;
      topMatch.suggested_resources.forEach(res => {
        simulated += `• ${res}\n`;
      });
      simulated += `\nHindi ka nag-iisa sa laban na ito, at nandito ang Guidance Office para gabayan ka hakbang-hakbang.`;
    } else {
      simulated += `Naiintindihan ko ang iyong sitwasyon. (Note: Walang direct custom knowledge match; gagamit ang AI ng general Sikolohiyang Pilipino at Carl Rogers empathy framework.)`;
    }

    setSimResponse(simulated);
    setIsSimulating(false);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sapc_counselor_knowledge_base_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col h-[760px] max-h-[94vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-900/10 via-slate-50 to-emerald-900/10 dark:from-purple-950/40 dark:via-slate-900 dark:to-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md">
              <div className="h-full w-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  AI Counselor Knowledge Base &amp; Training Hub
                </h3>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Live RAG Injection
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize and train the institutional guidance guidelines, FAQs, room locations, and student crisis playbooks.
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
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 gap-2">
          <button
            onClick={() => setActiveTab("library")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "library"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
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
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Plus className="h-4 w-4" />
            {editingItem ? "Edit Knowledge Item" : "Train New Guideline"}
          </button>
          <button
            onClick={() => {
              setActiveTab("simulator");
              handleRunSimulation();
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "simulator"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            AI Retrieval Simulator &amp; Playground
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: KNOWLEDGE LIBRARY */}
          {activeTab === "library" && (
            <div className="space-y-6">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, keywords, or content..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                      selectedCategory === "all"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    All ({items.length})
                  </button>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, meta]) => (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                        selectedCategory === catKey
                          ? `${meta.bg} ${meta.color} border ${meta.border} font-bold`
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl space-y-3">
                  <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No knowledge items match your search.</p>
                  <button
                    onClick={() => handleOpenEditor()}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition cursor-pointer"
                  >
                    Add First Custom Knowledge Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map((item) => {
                    const catMeta = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.counseling_faq;
                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}>
                              {catMeta.label}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <span className="font-semibold">Weight: {item.priority_weight}x</span>
                              {item.is_active ? (
                                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active in AI context" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-slate-400" title="Disabled" />
                              )}
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                            {item.content}
                          </p>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {/* Keywords */}
                          <div className="flex flex-wrap gap-1 items-center">
                            <Tag className="h-3 w-3 text-slate-400 mr-1" />
                            {item.keywords.slice(0, 4).map((kw, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                              >
                                #{kw}
                              </span>
                            ))}
                            {item.keywords.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-mono">+{item.keywords.length - 4} more</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              By {item.author_name}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditor(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                                title="Edit Knowledge Item"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id, item.title)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                                title="Delete Knowledge Item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDITOR FORM */}
          {activeTab === "editor" && (
            <form onSubmit={handleSaveItem} className="space-y-5 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-purple-600" />
                  {editingItem ? `Edit: ${editingItem.title}` : "Create & Train New Counselor Knowledge Item"}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab("library")}
                  className="text-xs text-slate-500 hover:underline cursor-pointer"
                >
                  Cancel and return to library
                </button>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                    feedbackMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200"
                      : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Knowledge Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as KnowledgeCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="academic_policy">Academic Policy &amp; Remedial</option>
                    <option value="counseling_faq">Counseling FAQ &amp; Protocols</option>
                    <option value="crisis_protocol">Crisis &amp; Emergency Protocol</option>
                    <option value="campus_resource">Campus Resource &amp; Tutoring</option>
                    <option value="study_tip">Study, Focus &amp; Wellness Tip</option>
                    <option value="financial_aid">Financial Assistance &amp; 4Ps Aid</option>
                  </select>
                </div>

                {/* Priority Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Priority Weight in AI Context (1 to 5)
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={1}>1 - Normal Supplemental Context</option>
                    <option value={2}>2 - Standard Advice</option>
                    <option value={3}>3 - Important Guideline (Recommended)</option>
                    <option value={4}>4 - High Priority Institutional Policy</option>
                    <option value={5}>5 - Top Priority / Mandatory Trigger</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Topic / Policy Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. SAPC Grade Recovery & Remedial Schedule for Failing Subjects"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              {/* Keywords / Trigger Phrases */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Trigger Keywords &amp; Student Slang (comma-separated)
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. bagsak, remedial, grade recovery, math fail, exam retake, mababa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Include English, Tagalog, and informal student terms. The AI will automatically trigger this context when matched.
                </p>
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
                  placeholder="Write the exact guidance, school policy details, room numbers, steps, or psychological reframing instructions you want Gemini AI to convey to students..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              {/* Suggested Resources (One per line) */}
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
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>{editingItem ? "Update Guideline" : "Train & Save Guideline"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: SIMULATOR & PLAYGROUND */}
          {activeTab === "simulator" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-1">
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
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
                    placeholder="Type a simulated student query (e.g. Bagsak ako sa Math, paano mag-remedials?)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                      <Sparkles className="h-4 w-4 text-emerald-500" />
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
