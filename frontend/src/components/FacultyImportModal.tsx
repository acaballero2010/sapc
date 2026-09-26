"use client";

import React, { useState, useMemo, useRef } from "react";
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  ShieldCheck,
  RefreshCw,
  FileText
} from "lucide-react";
import { importFacultyCSV } from "@/lib/dataset-store";

interface FacultyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

const SAMPLE_CSV_TEMPLATE = `full_name,institutional_email,role,department,advisory_section,assigned_grade,employee_id,prc_license_no,initial_password,status,phone
"Ms. Elena Bautista, LPT",elena.bautista@sapc.edu.ph,teacher,Junior High Department,Grade 7 - St. Anthony,Grade 7,SAPC-FAC-2023-001,,teacher123,Active,+63 917 112 0001
"Mr. Carlos Dizon, LPT",carlos.dizon@sapc.edu.ph,teacher,Junior High Department,Grade 7 - St. Bernadette,Grade 7,SAPC-FAC-2023-002,,teacher123,Active,+63 917 112 0002
"Ms. Maria Theresa Cruz, LPT",maria.cruz@sapc.edu.ph,teacher,Junior High Department,Grade 7 - St. Francis,Grade 7,SAPC-FAC-2023-003,,teacher123,Active,+63 917 112 0003
"Mr. Roberto Santos, LPT",roberto.santos@sapc.edu.ph,teacher,Senior High STEM Department,Grade 11 - St. Augustine (STEM),Grade 11,SAPC-FAC-2023-014,,teacher123,Active,+63 917 842 1092
"Ms. Katrina Salazar, LPT",katrina.salazar@sapc.edu.ph,teacher,Junior High Department,Grade 8 - St. Dominic,Grade 8,SAPC-FAC-2024-005,,teacher123,Active,+63 917 112 0005
"Mr. Joseph Morales, LPT",joseph.morales@sapc.edu.ph,teacher,Junior High Department,Grade 8 - St. Benedict,Grade 8,SAPC-FAC-2022-006,,teacher123,Active,+63 917 112 0006
"Mr. Mark Villanueva, LPT",mark.villanueva@sapc.edu.ph,teacher,Junior High Department,Grade 8 - St. Rita,Grade 8,SAPC-FAC-2024-007,,teacher123,Active,+63 917 112 0007
"Ms. Angela Reyes, LPT",angela.reyes@sapc.edu.ph,teacher,Junior High Department,Grade 8 - St. Clare,Grade 8,SAPC-FAC-2023-008,,teacher123,Active,+63 917 112 0008
"Ms. Pamela Rivera, LPT",pamela.rivera@sapc.edu.ph,teacher,Junior High Department,Grade 9 - St. Lorenzo Ruiz,Grade 9,SAPC-FAC-2023-009,,teacher123,Active,+63 917 112 0009
"Mr. Ronald Ramos, LPT",ronald.ramos@sapc.edu.ph,teacher,Junior High Department,Grade 9 - St. Martin de Porres,Grade 9,SAPC-FAC-2022-010,,teacher123,Active,+63 917 112 0010
"Mr. Emmanuel Flores, LPT",emmanuel.flores@sapc.edu.ph,teacher,Junior High Department,Grade 9 - St. Pedro Calungsod,Grade 9,SAPC-FAC-2024-011,,teacher123,Active,+63 917 112 0011
"Ms. Clarisse Ocampo, LPT",clarisse.ocampo@sapc.edu.ph,teacher,Junior High Department,Grade 9 - St. Cecilia,Grade 9,SAPC-FAC-2023-012,,teacher123,Active,+63 917 112 0012
"Ms. Jennifer Tolentino, LPT",jennifer.tolentino@sapc.edu.ph,teacher,Junior High Department,Grade 10 - St. Vincent de Paul,Grade 10,SAPC-FAC-2021-013,,teacher123,Active,+63 917 112 0013
"Ms. Veronica Dimaculangan, LPT",veronica.dimaculangan@sapc.edu.ph,teacher,Junior High Department,Grade 10 - St. Augustine,Grade 10,SAPC-FAC-2023-014,,teacher123,Active,+63 917 112 0014
"Mr. Dennis Castro, LPT",dennis.castro@sapc.edu.ph,teacher,Junior High Department,Grade 10 - St. Ignatius,Grade 10,SAPC-FAC-2022-015,,teacher123,Active,+63 917 112 0015
"Mrs. Teresa Santos, LPT",teresa.santos@sapc.edu.ph,teacher,Junior High Department,Grade 10 - St. Thomas Aquinas,Grade 10,SAPC-FAC-2022-089,,teacher123,Active,+63 918 331 4059
"Mrs. Clara Buenaflor, LPT",clara.buenaflor@sapc.edu.ph,teacher,Senior High HUMSS Department,Grade 11 - St. Thomas (HUMSS),Grade 11,SAPC-FAC-2023-016,,teacher123,Active,+63 918 442 5060
"Mr. Arnold Dizon, LPT",arnold.dizon@sapc.edu.ph,teacher,Senior High ABM Department,Grade 11 - St. Clare (ABM),Grade 11,SAPC-FAC-2024-017,,teacher123,Active,+63 919 553 6071
"Prof. Annalyn Cruz, LPT",annalyn.cruz@sapc.edu.ph,teacher,Senior High ABM Department,Grade 12 - St. Jude (ABM),Grade 12,SAPC-FAC-2024-002,,teacher123,Active,+63 920 119 2847
"Engr. Paul Valdez",paul.valdez@sapc.edu.ph,teacher,Senior High STEM Department,Chemistry & Physics Faculty,Grade 11-12,SAPC-FAC-2021-045,,teacher123,Active,+63 922 776 5432
"Ms. Jessica Alcantara, LPT",jessica.alcantara@sapc.edu.ph,teacher,Senior High HUMSS Department,Grade 11 - San Lorenzo Ruiz (HUMSS),Grade 11,SAPC-FAC-2024-019,,teacher123,Active,+63 915 678 1234
"Dr. Elena Ramos, RGC",elena.ramos@sapc.edu.ph,guidance_counselor,Guidance & Counseling Center,Guidance Office - Room 204,Grades 11-12,SAPC-COUN-2021-008,PRC-RGC-008924,counselor123,Active,+63 917 555 8924
"Mr. Francis M. Tolentino, RGC",francis.tolentino@sapc.edu.ph,guidance_counselor,Guidance & Counseling Center,Guidance Office - Room 202,Grades 7-10,SAPC-COUN-2022-019,PRC-RGC-009102,counselor123,Active,+63 919 444 3210
"Dr. Victor Hernandez, RGC",victor.hernandez@sapc.edu.ph,guidance_counselor,Guidance & Counseling Center,Guidance Office - Room 205,Grades 11-12,SAPC-COUN-2023-025,PRC-RGC-009841,counselor123,Active,+63 918 223 4567
"Ms. Clarissa Ramos, RGC",clarissa.ramos@sapc.edu.ph,guidance_counselor,Guidance & Counseling Center,Guidance Office - Room 203,Grades 7-10,SAPC-COUN-2024-031,PRC-RGC-009912,counselor123,Active,+63 920 445 6789`;

export const FacultyImportModal: React.FC<FacultyImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<"idle" | "preview" | "success" | "error">("idle");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse preview
  const previewRows = useMemo(() => {
    if (!csvContent.trim()) return [];
    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
    const nameIdx = headers.findIndex(h => h.includes("name"));
    const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
    const roleIdx = headers.findIndex(h => h.includes("role") || h.includes("type") || h.includes("position"));
    const deptIdx = headers.findIndex(h => h.includes("dept") || h.includes("department"));
    const secIdx = headers.findIndex(h => h.includes("section") || h.includes("advisory"));
    const empIdx = headers.findIndex(h => h.includes("employee") || h.includes("id"));

    return lines.slice(1, 11).map((line, idx) => {
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(val => val.replace(/^"|"$/g, "").trim()) || line.split(",").map(v => v.trim());
      const name = nameIdx !== -1 ? cols[nameIdx] : cols[0] || "";
      const email = emailIdx !== -1 ? cols[emailIdx] : cols[1] || "";
      const role = roleIdx !== -1 ? cols[roleIdx] : cols[2] || "teacher";
      const department = deptIdx !== -1 ? cols[deptIdx] : cols[3] || "";
      const section = secIdx !== -1 ? cols[secIdx] : cols[4] || "";
      const employeeId = empIdx !== -1 ? cols[empIdx] : "";

      const isValidEmail = email && email.includes("@");
      const isValid = Boolean(name && isValidEmail);

      return {
        rowNum: idx + 2,
        name,
        email,
        role: role.toLowerCase().includes("counsel") || role.toLowerCase().includes("rgc") ? "Counselor" : "Teacher",
        department,
        section,
        employeeId,
        isValid,
        error: !name ? "Missing name" : (!isValidEmail ? "Invalid email" : null)
      };
    });
  }, [csvContent]);

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "SAPC_Faculty_Counselors_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContent(text);
        setImportStatus("preview");
        setImportErrors([]);
      };
      reader.readAsText(file);
    }
  };

  const handleImportSubmit = async () => {
    if (!csvContent.trim()) return;
    setIsProcessing(true);
    setImportErrors([]);

    try {
      const res = await importFacultyCSV(csvContent);
      if (res.success && res.count > 0) {
        setImportStatus("success");
        setImportedCount(res.count);
        setResultMessage(`Successfully imported and synchronized ${res.count} faculty and counselor accounts with Cloud Firestore.`);
        setImportErrors(res.errors);
        onSuccess(res.count);
      } else {
        setImportStatus("error");
        setResultMessage("Failed to import CSV records.");
        setImportErrors(res.errors.length > 0 ? res.errors : ["No valid records could be extracted from the provided file."]);
      }
    } catch (err: any) {
      setImportStatus("error");
      setResultMessage(err.message || "An unexpected error occurred during CSV parsing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCsvContent("");
    setFileName("");
    setImportStatus("idle");
    setImportErrors([]);
    setResultMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#8B0014] to-[#6A0010] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Import Teachers &amp; Guidance Counselors</h3>
              <p className="text-xs text-rose-100">Batch CSV Ingestion • Cloud Firestore Synchronized</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {importStatus === "success" ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">Ingestion Complete ({importedCount} Accounts)</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto">{resultMessage}</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>🟢 Cloud Firestore Collection: faculty_records Synced</span>
              </div>
              {importErrors.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Ingestion Notices ({importErrors.length}):
                  </span>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                    {importErrors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition shadow-md"
                >
                  Return to Faculty Roster
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions & Template Download Bar */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-black text-amber-950 flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                    Standard SAPC Faculty CSV Schema
                  </span>
                  <p className="text-amber-800">
                    Upload accounts with columns: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">full_name, institutional_email, role, department, advisory_section, employee_id</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="shrink-0 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-amber-900 font-bold hover:bg-amber-100 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Sample Template</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-[#8B0014] rounded-3xl p-6 text-center transition bg-slate-50/50 hover:bg-rose-50/20">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="faculty-csv-upload"
                />
                <label htmlFor="faculty-csv-upload" className="cursor-pointer block space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-rose-100 text-[#8B0014] flex items-center justify-center mx-auto">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800">
                      {fileName ? fileName : "Click to browse or drop Faculty CSV file"}
                    </span>
                    <p className="text-xs text-slate-500">Supports .csv exported from DepEd LIS, HRIS, or Excel</p>
                  </div>
                </label>
              </div>

              {/* Live Preview Table */}
              {previewRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      Previewing Extracted Records ({previewRows.length} rows preview)
                    </h4>
                    <button
                      onClick={handleReset}
                      className="text-xs text-slate-500 hover:text-rose-600 transition"
                    >
                      Clear File
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Institutional Email</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Department / Advisory</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewRows.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}>
                            <td className="p-2.5 font-bold text-slate-900">{row.name || <span className="text-rose-500 italic">Empty</span>}</td>
                            <td className="p-2.5 font-mono text-slate-600">{row.email || <span className="text-rose-500 italic">Empty</span>}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                row.role === "Counselor" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                              }`}>
                                {row.role}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600 truncate max-w-[150px]">{row.section || row.department || "General"}</td>
                            <td className="p-2.5 text-center">
                              {row.isValid ? (
                                <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold text-[11px] flex items-center justify-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5" /> {row.error}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {importStatus === "error" && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    Import Failed
                  </span>
                  <p>{resultMessage}</p>
                  {importErrors.length > 0 && (
                    <ul className="list-disc pl-5 pt-1 space-y-0.5">
                      {importErrors.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {importStatus !== "success" && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={previewRows.length === 0 || isProcessing}
              onClick={handleImportSubmit}
              className="px-6 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Syncing to Firestore...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Import &amp; Sync to Firestore ({previewRows.filter(r => r.isValid).length} Records)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
