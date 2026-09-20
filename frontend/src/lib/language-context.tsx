"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SupportedLanguage = "en" | "fil" | "ceb";

export interface Translations {
  // Navigation & Branding
  brand_title: string;
  brand_subtitle: string;
  quick_search: string;
  book_consultation: string;
  email_sms_gateway: string;
  notifications: string;
  calendar: string;
  export_reports: string;
  dark_mode: string;
  light_mode: string;
  language: string;
  role_counselor: string;
  role_teacher: string;
  role_admin: string;
  role_student: string;
  role_parent: string;
  
  // Risk & Triage
  risk_high: string;
  risk_medium: string;
  risk_low: string;
  urgent_action: string;
  crisis_triage: string;
  early_warning: string;
  ahp_framework: string;
  
  // Domains
  domain_academic: string;
  domain_family: string;
  domain_health: string;
  domain_mental: string;
  domain_financial: string;
  
  // Common Actions
  save: string;
  cancel: string;
  export: string;
  close: string;
  confirm: string;
  download_pdf: string;
  download_csv: string;
  sync_google_cal: string;
}

export const dictionaries: Record<SupportedLanguage, Translations> = {
  en: {
    brand_title: "SAPC IntellySys",
    brand_subtitle: "San Antonio de Padua College • Multi-Factor Decision Support",
    quick_search: "Quick Search",
    book_consultation: "Book Consultation",
    email_sms_gateway: "Resend / SMS Gateway",
    notifications: "Notifications",
    calendar: "Academic Calendar",
    export_reports: "Export Reports",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",
    language: "Language",
    role_counselor: "Counselor Portal",
    role_teacher: "Teacher / Adviser",
    role_admin: "Administrator",
    role_student: "Student View",
    role_parent: "Parent View",
    risk_high: "High Risk",
    risk_medium: "Moderate Risk",
    risk_low: "Low Risk",
    urgent_action: "Urgent Action Required",
    crisis_triage: "Crisis Triage Queue",
    early_warning: "Early Warning System",
    ahp_framework: "AHP 5-Domain Decision Matrix",
    domain_academic: "Academic Performance (30%)",
    domain_family: "Family Dynamics (20%)",
    domain_health: "Physical Health (20%)",
    domain_mental: "Mental Health (15%)",
    domain_financial: "Financial Stability (15%)",
    save: "Save Changes",
    cancel: "Cancel",
    export: "Export Report",
    close: "Close",
    confirm: "Confirm",
    download_pdf: "Download PDF (Form 138)",
    download_csv: "Export CSV Dataset",
    sync_google_cal: "Sync with Google Calendar"
  },
  fil: {
    brand_title: "SAPC IntellySys",
    brand_subtitle: "San Antonio de Padua College • Multi-Factor Suporta sa Pagpapasiya",
    quick_search: "Mabilisang Paghahanap",
    book_consultation: "Magpa-iskedyul ng Konsultasyon",
    email_sms_gateway: "Resend / SMS Gateway",
    notifications: "Mga Abiso",
    calendar: "Akademikong Kalendaryo",
    export_reports: "I-export ang Ulat",
    dark_mode: "Madilim na Tema",
    light_mode: "Maliwanag na Tema",
    language: "Wika",
    role_counselor: "Portal ng Guidance Counselor",
    role_teacher: "Guro / Gurong Tagapayo",
    role_admin: "Administrador ng Sistema",
    role_student: "Pasilip ng Mag-aaral",
    role_parent: "Pasilip ng Magulang",
    risk_high: "Mataas na Peligro",
    risk_medium: "Katamtamang Peligro",
    risk_low: "Mababang Peligro",
    urgent_action: "Kagyat na Aksyon ang Kailangan",
    crisis_triage: "Triage sa Krisis at Tulong",
    early_warning: "Sistemang Maagang Babala",
    ahp_framework: "AHP 5-Domain Matris ng Desisyon",
    domain_academic: "Akademikong Pagganap (30%)",
    domain_family: "Kalagayan ng Pamilya (20%)",
    domain_health: "Kalusugang Pisikal (20%)",
    domain_mental: "Kalusugang Pangkaisipan (15%)",
    domain_financial: "Pinansyal na Katatagan (15%)",
    save: "I-save ang Pagbabago",
    cancel: "Kanselahin",
    export: "I-export ang Dokumento",
    close: "Isara",
    confirm: "Kumpirmahin",
    download_pdf: "I-download ang PDF (Form 138)",
    download_csv: "I-export ang CSV Dataset",
    sync_google_cal: "I-sync sa Google Calendar"
  },
  ceb: {
    brand_title: "SAPC IntellySys",
    brand_subtitle: "San Antonio de Padua College • Multi-Factor Suporta sa Pagdesisyon",
    quick_search: "Daliang Pagpangita",
    book_consultation: "Pag-iskedyul og Konsultasyon",
    email_sms_gateway: "Resend / SMS Gateway",
    notifications: "Mga Pahibalo",
    calendar: "Akademikong Kalendaryo",
    export_reports: "I-export ang Report",
    dark_mode: "Ngitngit nga Mode",
    light_mode: "Hayag nga Mode",
    language: "Pinulongan",
    role_counselor: "Portal sa Guidance Counselor",
    role_teacher: "Maestro / Magtutudlo",
    role_admin: "Tagdumala sa Sistema",
    role_student: "Tan-aw sa Estudyante",
    role_parent: "Tan-aw sa Ginikanan",
    risk_high: "Taas nga Peligro",
    risk_medium: "Taliwala nga Peligro",
    risk_low: "Ubos nga Peligro",
    urgent_action: "Gikinahanglan ang Daling Aksyon",
    crisis_triage: "Triage sa Krisis ug Tabang",
    early_warning: "Sayo nga Pasidaan",
    ahp_framework: "AHP 5-Domain Matris sa Pagdesisyon",
    domain_academic: "Akademikong Kalampusan (30%)",
    domain_family: "Kahimtang sa Pamilya (20%)",
    domain_health: "Pisikal nga Panglawas (20%)",
    domain_mental: "Panghunahuna nga Panglawas (15%)",
    domain_financial: "Pinansyal nga Kalig-on (15%)",
    save: "I-save ang Kausaban",
    cancel: "Kanselahon",
    export: "I-export ang Report",
    close: "Isira",
    confirm: "Kumpirmahon",
    download_pdf: "I-download ang PDF (Form 138)",
    download_csv: "I-export ang CSV Dataset",
    sync_google_cal: "I-sync sa Google Calendar"
  }
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const stored = localStorage.getItem("sapc-lang") as SupportedLanguage | null;
    if (stored && (stored === "en" || stored === "fil" || stored === "ceb")) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("sapc-lang", lang);
  };

  const t = dictionaries[language] || dictionaries.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
