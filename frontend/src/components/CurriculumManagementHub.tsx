"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Download, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  AlertCircle
} from "lucide-react";
import { 
  CurriculumSubject, 
  GradeLevel, 
  AcademicQuarter, 
  SubjectStrand, 
  SubjectCategory, 
  AcademicSemester,
  getActiveCurriculum, 
  toggleSubjectActiveStatus, 
  toggleSubjectQuarter, 
  updateSubject, 
  addCustomSubject, 
  deleteCustomSubject, 
  resetCurriculumToDefault, 
  exportCurriculumToCSV, 
  subscribeToCurriculum,
  loadCurriculumFromFirestore
} from "@/lib/curriculum-store";

export interface CurriculumManagementHubProps {
  onClose?: () => void;
  userRole?: string;
  userName?: string;
  isModal?: boolean;
}

export function CurriculumManagementHub({
  onClose,
  userRole = "Administrator",
  userName = "Academic Coordinator",
  isModal = false
}: CurriculumManagementHubProps) {
  const [curriculum, setCurriculum] = useState<CurriculumSubject[]>(() => getActiveCurriculum());
  const [selectedGrade, setSelectedGrade] = useState<"ALL" | GradeLevel>("ALL");
  const [selectedStrand, setSelectedStrand] = useState<"ALL" | SubjectStrand>("ALL");
  const [selectedQuarter, setSelectedQuarter] = useState<"ALL" | AcademicQuarter>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  // Add / Edit Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<CurriculumSubject | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    grade_level: GradeLevel;
    strand: SubjectStrand;
    semester: AcademicSemester;
    quarters_offered: AcademicQuarter[];
    category: SubjectCategory;
    weight_ww: number;
    weight_pt: number;
    weight_qa: number;
    passing_threshold: number;
    units: number;
  }>({
    code: "",
    name: "",
    description: "",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 40,
    weight_pt: 40,
    weight_qa: 20,
    passing_threshold: 75.0,
    units: 1
  });

  // Load from Firestore on mount & subscribe to real-time changes
  useEffect(() => {
    loadCurriculumFromFirestore().then(data => {
      if (data && data.length > 0) setCurriculum(data);
    });

    const unsub = subscribeToCurriculum((data) => {
      setCurriculum(data);
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const showFeedback = (text: string, type: "success" | "info" | "error" = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Filtered Subject List
  const filteredCurriculum = useMemo(() => {
    return curriculum.filter(subj => {
      // Grade Level filter
      if (selectedGrade !== "ALL" && subj.grade_level !== selectedGrade) return false;

      // Strand filter
      if (selectedStrand !== "ALL") {
        if (subj.strand !== selectedStrand && subj.strand !== "ALL") return false;
      }

      // Quarter filter
      if (selectedQuarter !== "ALL") {
        if (!subj.quarters_offered || !subj.quarters_offered.includes(selectedQuarter)) return false;
      }

      // Active status filter
      if (selectedStatus === "ACTIVE" && !subj.is_active) return false;
      if (selectedStatus === "INACTIVE" && subj.is_active) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = subj.code.toLowerCase().includes(q);
        const matchName = subj.name.toLowerCase().includes(q);
        const matchDesc = (subj.description || "").toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.grade_level !== b.grade_level) return a.grade_level - b.grade_level;
      return a.code.localeCompare(b.code);
    });
  }, [curriculum, selectedGrade, selectedStrand, selectedQuarter, selectedStatus, searchQuery]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = curriculum.length;
    const active = curriculum.filter(s => s.is_active).length;
    const inactive = total - active;
    const jhsCount = curriculum.filter(s => s.grade_level <= 10).length;
    const shsCount = curriculum.filter(s => s.grade_level >= 11).length;
    const customCount = curriculum.filter(s => s.custom).length;

    return { total, active, inactive, jhsCount, shsCount, customCount };
  }, [curriculum]);

  // Handle Toggle Active Status
  const handleToggleActive = (subjectId: string, currentStatus: boolean, subjectName: string) => {
    const updated = toggleSubjectActiveStatus(subjectId, !currentStatus, `${userName} (${userRole})`);
    setCurriculum(updated);
    showFeedback(`Subject "${subjectName}" is now ${!currentStatus ? "ACTIVE (Offered)" : "INACTIVE (Suspended)"}.`, "info");
  };

  // Handle Toggle Quarter Offering
  const handleToggleQuarter = (subjectId: string, quarter: AcademicQuarter, subjectName: string) => {
    const updated = toggleSubjectQuarter(subjectId, quarter, `${userName} (${userRole})`);
    setCurriculum(updated);
    showFeedback(`Updated offering for ${quarter} in "${subjectName}".`, "info");
  };

  // Open Edit Modal
  const handleOpenEdit = (subj: CurriculumSubject) => {
    setEditingSubject(subj);
    setFormData({
      code: subj.code,
      name: subj.name,
      description: subj.description || "",
      grade_level: subj.grade_level,
      strand: subj.strand,
      semester: subj.semester,
      quarters_offered: subj.quarters_offered || ["Q1", "Q2", "Q3", "Q4"],
      category: subj.category,
      weight_ww: Math.round(subj.weight_ww * 100),
      weight_pt: Math.round(subj.weight_pt * 100),
      weight_qa: Math.round(subj.weight_qa * 100),
      passing_threshold: subj.passing_threshold,
      units: subj.units || 1
    });
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      grade_level: selectedGrade !== "ALL" ? selectedGrade : 7,
      strand: selectedStrand !== "ALL" ? selectedStrand : (selectedGrade !== "ALL" && selectedGrade >= 11 ? "STEM" : "JHS"),
      semester: selectedGrade !== "ALL" && selectedGrade >= 11 ? "1st Semester" : "Full Year",
      quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
      category: "Core",
      weight_ww: 40,
      weight_pt: 40,
      weight_qa: 20,
      passing_threshold: 75.0,
      units: 1
    });
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Subject
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const sumWeights = formData.weight_ww + formData.weight_pt + formData.weight_qa;
    if (sumWeights !== 100) {
      showFeedback(`Weights must sum to exactly 100% (currently ${sumWeights}%).`, "error");
      return;
    }

    if (!formData.code.trim() || !formData.name.trim()) {
      showFeedback("Subject code and name are required.", "error");
      return;
    }

    if (formData.quarters_offered.length === 0) {
      showFeedback("Please select at least one quarter where this subject is offered.", "error");
      return;
    }

    if (editingSubject) {
      const updated = updateSubject(editingSubject.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        grade_level: formData.grade_level,
        strand: formData.strand,
        semester: formData.semester,
        quarters_offered: formData.quarters_offered,
        category: formData.category,
        weight_ww: formData.weight_ww / 100,
        weight_pt: formData.weight_pt / 100,
        weight_qa: formData.weight_qa / 100,
        passing_threshold: formData.passing_threshold,
        units: formData.units
      }, `${userName} (${userRole})`);
      setCurriculum(updated);
      showFeedback(`Successfully updated subject "${formData.name}".`, "success");
    } else {
      addCustomSubject({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        grade_level: formData.grade_level,
        strand: formData.strand,
        semester: formData.semester,
        quarters_offered: formData.quarters_offered,
        category: formData.category,
        weight_ww: formData.weight_ww / 100,
        weight_pt: formData.weight_pt / 100,
        weight_qa: formData.weight_qa / 100,
        passing_threshold: formData.passing_threshold,
        units: formData.units,
        is_active: true
      }, `${userName} (${userRole})`);
      setCurriculum(getActiveCurriculum());
      showFeedback(`Added new elective / subject "${formData.name}".`, "success");
    }

    setIsAddModalOpen(false);
  };

  // Delete Subject
  const handleDelete = (subjectId: string, subjectName: string) => {
    if (confirm(`Are you sure you want to remove custom subject "${subjectName}"?`)) {
      const updated = deleteCustomSubject(subjectId, `${userName} (${userRole})`);
      setCurriculum(updated);
      showFeedback(`Custom subject "${subjectName}" deleted.`, "info");
    }
  };

  // Reset to DepEd Defaults
  const handleResetToDefault = () => {
    const res = resetCurriculumToDefault(`${userName} (${userRole})`);
    setCurriculum(res);
    setIsResetConfirmOpen(false);
    showFeedback("Curriculum has been reset to official DepEd K-12 defaults.", "success");
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = exportCurriculumToCSV(filteredCurriculum);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SAPC_Curriculum_Registry_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Curriculum registry downloaded as CSV.", "success");
  };

  return (
    <div className={`space-y-6 ${isModal ? "p-6 bg-slate-50 min-h-screen" : ""}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <BookOpen className="w-80 h-80" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> DepEd DO 8, s. 2015 Compliant Academic Registry
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-emerald-400" />
              Pre-defined Curriculum & Subject Management
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
              Configure baseline subject offerings per Grade Level (7–12) and SHS Strands. Easily activate or suspend subjects per quarter or semester to align with your school year schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Subject / Elective
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs flex items-center gap-2 border border-white/10 transition"
              title="Download full subject catalogue as CSV"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 font-medium rounded-xl text-xs flex items-center gap-1.5 transition"
              title="Reset to official DepEd catalogue"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
            feedbackMsg.type === "success" 
              ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200" 
              : feedbackMsg.type === "error"
              ? "bg-red-500/20 border border-red-400/40 text-red-200"
              : "bg-teal-500/20 border border-teal-400/40 text-teal-200"
          }`}>
            <Sparkles className="w-4 h-4 shrink-0" />
            {feedbackMsg.text}
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Subjects</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Catalogue Pool</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm bg-emerald-50/30">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active (Offered)
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">In Gradebooks</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm bg-amber-50/30">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Suspended
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.inactive}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Offered Later</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm bg-blue-50/30">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">JHS (Grades 7–10)</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.jhsCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Core Curriculum</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm bg-purple-50/30">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">SHS (Grades 11–12)</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.shsCount}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">Tracks & Strands</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm bg-teal-50/30">
          <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">School Electives</div>
          <div className="text-2xl font-black text-teal-700 mt-1">{stats.customCount}</div>
          <div className="text-[10px] text-teal-600/80 mt-0.5">Custom Added</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Grade Level Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 shrink-0">Grade Level:</span>
          {[
            { id: "ALL", label: "All Grades (7-12)" },
            { id: 7, label: "Grade 7" },
            { id: 8, label: "Grade 8" },
            { id: 9, label: "Grade 9" },
            { id: 10, label: "Grade 10" },
            { id: 11, label: "Grade 11 (SHS)" },
            { id: 12, label: "Grade 12 (SHS)" }
          ].map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGrade(g.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedGrade === g.id 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Second Row Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search code or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Strand Filter */}
          <div>
            <select
              value={selectedStrand}
              onChange={e => setSelectedStrand(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-700"
            >
              <option value="ALL">All Strands & Tracks</option>
              <option value="JHS">JHS (Junior High School)</option>
              <option value="STEM">STEM (Science, Tech & Math)</option>
              <option value="ABM">ABM (Accountancy & Business)</option>
              <option value="HUMSS">HUMSS (Social Sciences)</option>
              <option value="TVL">TVL (Tech-Vocational)</option>
            </select>
          </div>

          {/* Quarter Filter */}
          <div>
            <select
              value={selectedQuarter}
              onChange={e => setSelectedQuarter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-700"
            >
              <option value="ALL">All Quarters (Q1 - Q4)</option>
              <option value="Q1">Quarter 1 (Prelims / Q1)</option>
              <option value="Q2">Quarter 2 (Midterms / Q2)</option>
              <option value="Q3">Quarter 3 (Semi-Finals / Q3)</option>
              <option value="Q4">Quarter 4 (Finals / Q4)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-700"
            >
              <option value="ALL">All Status (Active & Suspended)</option>
              <option value="ACTIVE">🟢 Active / Offered Only</option>
              <option value="INACTIVE">⚪ Suspended / Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Curriculum Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Curriculum Roster ({filteredCurriculum.length} subjects found)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            Click any quarter pill (Q1-Q4) or status toggle to activate/deactivate instant offering.
          </div>
        </div>

        {filteredCurriculum.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-slate-600">No subjects match the selected filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or add a new custom subject.</p>
            <button
              onClick={() => { setSelectedGrade("ALL"); setSelectedStrand("ALL"); setSelectedQuarter("ALL"); setSelectedStatus("ALL"); setSearchQuery(""); }}
              className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="p-3 pl-4">Subject Code & Name</th>
                  <th className="p-3">Grade & Strand</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Quarters Offered</th>
                  <th className="p-3">DepEd Weight Matrix</th>
                  <th className="p-3">Pass Mark</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCurriculum.map((subj) => {
                  const quarters = subj.quarters_offered || [];
                  const ww = Math.round(subj.weight_ww * 100);
                  const pt = Math.round(subj.weight_pt * 100);
                  const qa = Math.round(subj.weight_qa * 100);

                  return (
                    <tr 
                      key={subj.id}
                      className={`hover:bg-slate-50/80 transition ${!subj.is_active ? "bg-slate-50/40 opacity-70" : ""}`}
                    >
                      {/* Code & Name */}
                      <td className="p-3 pl-4">
                        <div className="font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                          {subj.code}
                          {subj.custom && (
                            <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[9px] font-bold rounded-md font-sans">
                              Elective
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-800 text-xs mt-0.5">{subj.name}</div>
                        {subj.description && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                            {subj.description}
                          </div>
                        )}
                      </td>

                      {/* Grade & Strand */}
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">
                          Grade {subj.grade_level}
                        </span>
                        <div className="text-[10px] text-slate-500 font-medium mt-1">
                          {subj.strand === "ALL" ? "All Strands" : subj.strand} • {subj.semester}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          subj.category === "Core"
                            ? "bg-blue-100 text-blue-800"
                            : subj.category === "Specialized"
                            ? "bg-purple-100 text-purple-800"
                            : subj.category === "Applied"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-teal-100 text-teal-800"
                        }`}>
                          {subj.category}
                        </span>
                      </td>

                      {/* Quarters Offered */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {(["Q1", "Q2", "Q3", "Q4"] as AcademicQuarter[]).map(q => {
                            const isOffered = quarters.includes(q);
                            return (
                              <button
                                key={q}
                                onClick={() => handleToggleQuarter(subj.id, q, subj.name)}
                                title={`Click to ${isOffered ? "disable" : "enable"} in ${q}`}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                                  isOffered 
                                    ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700" 
                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                }`}
                              >
                                {q}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* DepEd Weight Matrix */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                          <span className="text-blue-700" title="Written Work">WW: {ww}%</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-emerald-700" title="Performance Tasks">PT: {pt}%</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-amber-700" title="Quarterly Assessment">QA: {qa}%</span>
                        </div>
                        {/* Mini Bar */}
                        <div className="w-32 h-1.5 bg-slate-200 rounded-full flex overflow-hidden mt-1">
                          <div style={{ width: `${ww}%` }} className="bg-blue-500" />
                          <div style={{ width: `${pt}%` }} className="bg-emerald-500" />
                          <div style={{ width: `${qa}%` }} className="bg-amber-500" />
                        </div>
                      </td>

                      {/* Pass Mark */}
                      <td className="p-3">
                        <span className="font-bold text-slate-700">{subj.passing_threshold.toFixed(1)}%</span>
                      </td>

                      {/* Active Toggle */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleActive(subj.id, subj.is_active, subj.name)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition ${
                            subj.is_active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                        >
                          {subj.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500" /> Suspended
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(subj)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Weights & Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {subj.custom && (
                            <button
                              onClick={() => handleDelete(subj.id, subj.name)}
                              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Delete custom elective"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                {editingSubject ? `Edit Subject: ${editingSubject.code}` : "Add New Subject / Elective"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="mt-4 space-y-4 text-xs">
              {/* Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingSubject}
                    placeholder="e.g. JHS-ROBOTICS9"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robotics & AI Foundations"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Syllabus</label>
                <textarea
                  rows={2}
                  placeholder="Overview of topics and competencies..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Grade Level, Strand & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade Level</label>
                  <select
                    value={formData.grade_level}
                    onChange={e => setFormData({ ...formData, grade_level: Number(e.target.value) as GradeLevel })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {[7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Strand / Track</label>
                  <select
                    value={formData.strand}
                    onChange={e => setFormData({ ...formData, strand: e.target.value as SubjectStrand })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="JHS">JHS (Grades 7–10)</option>
                    <option value="ALL">All SHS Strands</option>
                    <option value="STEM">STEM</option>
                    <option value="ABM">ABM</option>
                    <option value="HUMSS">HUMSS</option>
                    <option value="TVL">TVL</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as SubjectCategory })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Core">Core</option>
                    <option value="Applied">Applied</option>
                    <option value="Specialized">Specialized</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>

              {/* Quarters Offered Checkboxes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Quarters Offered *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Q1", "Q2", "Q3", "Q4"] as AcademicQuarter[]).map(q => {
                    const checked = formData.quarters_offered.includes(q);
                    return (
                      <label
                        key={q}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          checked 
                            ? "bg-emerald-50 border-emerald-400 text-emerald-800" 
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            const next = e.target.checked
                              ? [...formData.quarters_offered, q]
                              : formData.quarters_offered.filter(item => item !== q);
                            setFormData({ ...formData, quarters_offered: next });
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        {q}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* DepEd Weights (WW %, PT %, QA %) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">DepEd Grading Weights (Total must = 100%)</label>
                  <span className={`font-bold text-xs ${
                    formData.weight_ww + formData.weight_pt + formData.weight_qa === 100 
                      ? "text-emerald-600" 
                      : "text-red-600"
                  }`}>
                    Total: {formData.weight_ww + formData.weight_pt + formData.weight_qa}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Written Work (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.weight_ww}
                      onChange={e => setFormData({ ...formData, weight_ww: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Performance Task (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.weight_pt}
                      onChange={e => setFormData({ ...formData, weight_pt: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Quarterly Exam (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.weight_qa}
                      onChange={e => setFormData({ ...formData, weight_qa: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* Passing Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passing Mark (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    step={0.5}
                    value={formData.passing_threshold}
                    onChange={e => setFormData({ ...formData, passing_threshold: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Units</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.units}
                    onChange={e => setFormData({ ...formData, units: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition"
                >
                  {editingSubject ? "Update Subject" : "Save to Curriculum"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-scaleIn">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Reset to DepEd Standards?</h3>
                <p className="text-xs text-slate-500">Restore baseline K-12 subjects</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This will restore all pre-defined Grade 7–10 and Grade 11–12 subjects and weights back to official DepEd DO 8, s. 2015 defaults. Any custom electives you created will be preserved or reset.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-red-600/20"
              >
                Yes, Reset Curriculum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
