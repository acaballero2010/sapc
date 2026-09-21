/**
 * SAPC IntellySys — Counselor Knowledge Base & Training Store
 * Manages institutional knowledge, FAQs, counseling playbooks, and campus resources
 * with real-time Google Cloud Firestore synchronization and local caching.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  Unsubscribe 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type KnowledgeCategory = 
  | "academic_policy"
  | "counseling_faq"
  | "crisis_protocol"
  | "campus_resource"
  | "study_tip"
  | "financial_aid";

export interface CounselorKnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  keywords: string[];
  content: string;
  suggested_resources: string[];
  author_name: string;
  author_role: string;
  is_active: boolean;
  priority_weight: number; // 1 (normal) to 5 (urgent/mandatory)
  created_at: string;
  updated_at: string;
}

const LOCAL_STORAGE_KEY = "sapc_counselor_kb_v1";

export const DEFAULT_KNOWLEDGE_BASE: CounselorKnowledgeItem[] = [
  {
    id: "kb-acad-001",
    category: "academic_policy",
    title: "SAPC Remedial Program & Grade Recovery Policy (DepEd DO 8, s. 2015)",
    keywords: ["bagsak", "remedial", "grade recovery", "failing grade", "remedials", "mababa ang grade", "summer class", "failed subject"],
    content: "Under DepEd Order No. 8, s. 2015 and SAPC Institutional Academic Policy, students receiving a quarterly grade below 75.0 in any subject are entitled to free remedial classes and intervention sessions. Remedials are conducted every Wednesday and Friday, 3:30 PM - 5:00 PM at Building B Room 104 (Learning Commons). Completion of remedial tasks enables grade recomputation up to a passing mark of 75-80.",
    suggested_resources: [
      "SAPC Remedial Consultation Desk (Room 104 Learning Commons)",
      "Form 137 / Grade Recomputation Request Form",
      "Subject Teacher Consultation Hours (Mon-Fri 3:30 PM)"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-01-15T08:00:00.000Z",
    updated_at: "2026-09-01T10:30:00.000Z"
  },
  {
    id: "kb-counsel-001",
    category: "counseling_faq",
    title: "Guidance Office Walk-In & Confidentiality Protocols",
    keywords: ["guidance office", "counselor", "consultation", "kausap", "confidential", "room 204", "appointment", "schedule"],
    content: "The SAPC Guidance & Counseling Office is located at Room 204, 2nd Floor, Building A. Office hours are Monday to Friday, 8:00 AM to 5:00 PM. All counseling sessions are strictly confidential under Republic Act No. 9258 (Guidance and Counseling Act of 2004) and RA 10173 (Data Privacy Act). No counseling notes are shared with parents or teachers without the student's explicit, informed consent, except in immediate life-safety emergencies.",
    suggested_resources: [
      "SAPC Guidance Office: Room 204, Building A (Mon-Fri 8AM-5PM)",
      "Confidential Counselor Email: guidance@sapc.edu.ph",
      "Online Guidance Appointment Request via Student Dashboard"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor",
    is_active: true,
    priority_weight: 5,
    created_at: "2026-01-15T08:00:00.000Z",
    updated_at: "2026-09-01T10:30:00.000Z"
  },
  {
    id: "kb-crisis-001",
    category: "crisis_protocol",
    title: "5-Step Crisis De-escalation & 24/7 Mental Health Hotlines",
    keywords: ["suicide", "self harm", "mamatay", "ayaw ko na", "di ko na kaya", "suko na", "cutting", "nasasaktan", "hopeless", "end my life"],
    content: "IMMEDIATE EMERGENCY SAFETY PROTOCOL: 1. Validate immediate safety without judgment. 2. Connect with licensed professional. 3. Activate institutional child protection support (DepEd DO 40, s. 2012). National Hotlines: National Center for Mental Health (NCMH) 24/7 Crisis Hotline: 1553 (Toll-Free landline) or 0917-899-USAP (8727); Hopeline Philippines: (02) 8804-4673 / 0917-558-4673; Philippine Red Cross 24/7 Helpline: 143.",
    suggested_resources: [
      "National Center for Mental Health (NCMH) 24/7 Crisis Hotline: 1553 (Toll-Free)",
      "Hopeline Philippines: 0917-558-4673 / (02) 8804-4673",
      "SAPC 24/7 Emergency Clinic & Guidance Responder: (049) 545-0000 loc 204",
      "Philippine Red Cross: 143"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor",
    is_active: true,
    priority_weight: 5,
    created_at: "2026-01-15T08:00:00.000Z",
    updated_at: "2026-09-01T10:30:00.000Z"
  },
  {
    id: "kb-resource-001",
    category: "campus_resource",
    title: "Free Peer Tutoring & Learning Commons Study Pods",
    keywords: ["peer tutoring", "tutor", "math tutor", "science tutor", "study pod", "room 104", "learning commons", "free tutoring"],
    content: "The SAPC Learning Commons (Building B, Room 104) offers free, student-to-student peer tutoring across STEM, ABM, HUMSS, and Junior High School subjects. Senior High honor students and student leaders volunteer daily from 12:00 PM - 1:00 PM and 4:00 PM - 5:30 PM. Group study pods equipped with whiteboards and reference modules are open to all students with no advance booking required.",
    suggested_resources: [
      "SAPC Learning Commons: Building B, Room 104",
      "Peer Tutoring Request Desk (Mon-Fri 12PM-1PM & 4PM-5:30PM)",
      "Senior High Academic League Mentors Directory"
    ],
    author_name: "Academic Affairs & Guidance Team",
    author_role: "Academic Support Committee",
    is_active: true,
    priority_weight: 3,
    created_at: "2026-01-20T09:00:00.000Z",
    updated_at: "2026-09-05T14:00:00.000Z"
  },
  {
    id: "kb-study-001",
    category: "study_tip",
    title: "5-4-3-2-1 Grounding & Pomodoro Exam Stress Recovery",
    keywords: ["anxiety", "panic", "overthinking", "kaba", "kinakabahan", "di makatulog", "exam stress", "pomodoro", "grounding", "box breathing"],
    content: "When experiencing sudden academic anxiety or panic before an exam: 1. Practice 4-4-6 Box Breathing (Inhale 4s, Hold 4s, Exhale 6s). 2. Use the 5-4-3-2-1 Sensory Grounding method: Notice 5 things you can see, 4 things you can feel, 3 sounds you can hear, 2 things you can smell, and 1 positive affirmation ('I am safe, this moment will pass'). For study fatigue, apply the 25/5 Pomodoro rhythm: 25 minutes focused single-tasking, followed by 5 minutes away from screens.",
    suggested_resources: [
      "SAPC Mindfulness Corner & Quiet Zone (Room 204)",
      "Guided 5-Minute Box Breathing Audio Card",
      "Time Management & Focus Planner Sheet (Downloadable)"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-02-01T11:00:00.000Z",
    updated_at: "2026-09-10T16:00:00.000Z"
  },
  {
    id: "kb-fin-001",
    category: "financial_aid",
    title: "SAPC Institutional Scholarship, 4Ps & Emergency Student Aid",
    keywords: ["scholarship", "tuition", "promissory note", "4ps", "financial", "allowance", "baon", "walang pera", "utang", "discount"],
    content: "Students facing financial hardships can apply for SAPC Emergency Student Assistance, Tuition Installment Plans, or 4Ps Academic Grant validation at the Financial Aid Desk (Admin Building, Ground Floor). Emergency Promissory Notes for exam permits can be endorsed by the Guidance Counselor or Section Adviser with zero interest penalties. Application window opens 2 weeks before quarterly examinations.",
    suggested_resources: [
      "Financial Aid & Scholarships Office (Admin Bldg, Ground Floor)",
      "Guidance Endorsement for Emergency Exam Promissory Note",
      "DepEd Senior High School Voucher Program Helpdesk"
    ],
    author_name: "Student Welfare & Finance Office",
    author_role: "Student Assistance Committee",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-02-10T10:00:00.000Z",
    updated_at: "2026-09-12T09:00:00.000Z"
  }
];

let memoryKnowledgeBase: CounselorKnowledgeItem[] = [...DEFAULT_KNOWLEDGE_BASE];

/**
 * Initializes and loads the Counselor Knowledge Base from local storage & Firestore
 */
export function getStoredKnowledgeBase(): CounselorKnowledgeItem[] {
  if (typeof window === "undefined") return memoryKnowledgeBase;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryKnowledgeBase = parsed;
        return memoryKnowledgeBase;
      }
    }
  } catch (e) {
    console.warn("[Counselor KB] Failed reading from localStorage:", e);
  }

  // Seed default items
  memoryKnowledgeBase = [...DEFAULT_KNOWLEDGE_BASE];
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memoryKnowledgeBase));
  }
  return memoryKnowledgeBase;
}

/**
 * Persists knowledge base to local storage
 */
export function saveKnowledgeBaseLocally(items: CounselorKnowledgeItem[]): void {
  memoryKnowledgeBase = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("[Counselor KB] Failed writing to localStorage:", e);
    }
  }
}

/**
 * Syncs the entire knowledge base from Google Cloud Firestore
 */
export async function loadKnowledgeBaseFromFirestore(): Promise<CounselorKnowledgeItem[]> {
  try {
    const colRef = collection(db, "counselor_knowledge_base");
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const cloudItems: CounselorKnowledgeItem[] = [];
      snapshot.forEach((docSnap) => {
        cloudItems.push(docSnap.data() as CounselorKnowledgeItem);
      });
      // Sort by priority weight descending, then title ascending
      cloudItems.sort((a, b) => (b.priority_weight || 1) - (a.priority_weight || 1));
      saveKnowledgeBaseLocally(cloudItems);
      return cloudItems;
    } else {
      // Seed default items to Firestore
      for (const item of DEFAULT_KNOWLEDGE_BASE) {
        await syncKnowledgeItemToFirestore(item);
      }
      return DEFAULT_KNOWLEDGE_BASE;
    }
  } catch (err) {
    console.warn("[Counselor KB] Firestore fetch failed, using cached knowledge base:", err);
    return getStoredKnowledgeBase();
  }
}

/**
 * Subscribes to real-time updates from Cloud Firestore
 */
export function subscribeToKnowledgeBase(
  onUpdate: (items: CounselorKnowledgeItem[]) => void
): Unsubscribe {
  try {
    const colRef = collection(db, "counselor_knowledge_base");
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const cloudItems: CounselorKnowledgeItem[] = [];
        snapshot.forEach((docSnap) => {
          cloudItems.push(docSnap.data() as CounselorKnowledgeItem);
        });
        cloudItems.sort((a, b) => (b.priority_weight || 1) - (a.priority_weight || 1));
        saveKnowledgeBaseLocally(cloudItems);
        onUpdate(cloudItems);
      }
    }, (error) => {
      console.warn("[Counselor KB] Snapshot listener error:", error);
      onUpdate(getStoredKnowledgeBase());
    });
  } catch (err) {
    console.warn("[Counselor KB] Failed creating onSnapshot listener:", err);
    return () => {};
  }
}

/**
 * Creates or updates a single knowledge item in memory and Firestore
 */
export async function saveKnowledgeItem(
  item: Omit<CounselorKnowledgeItem, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<CounselorKnowledgeItem> {
  const current = getStoredKnowledgeBase();
  const now = new Date().toISOString();

  let targetItem: CounselorKnowledgeItem;

  if (item.id) {
    const existingIndex = current.findIndex(i => i.id === item.id);
    targetItem = {
      ...item,
      id: item.id,
      created_at: existingIndex >= 0 ? current[existingIndex].created_at : now,
      updated_at: now
    };
    if (existingIndex >= 0) {
      current[existingIndex] = targetItem;
    } else {
      current.unshift(targetItem);
    }
  } else {
    targetItem = {
      ...item,
      id: `kb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now
    };
    current.unshift(targetItem);
  }

  saveKnowledgeBaseLocally(current);
  await syncKnowledgeItemToFirestore(targetItem);
  return targetItem;
}

/**
 * Deletes a knowledge item from memory and Firestore
 */
export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  const current = getStoredKnowledgeBase();
  const updated = current.filter(item => item.id !== id);
  saveKnowledgeBaseLocally(updated);

  try {
    const docRef = doc(db, "counselor_knowledge_base", id);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.warn(`[Counselor KB] Failed deleting doc ${id} in Firestore:`, e);
    return false;
  }
}

/**
 * Syncs an individual item to Firestore doc
 */
export async function syncKnowledgeItemToFirestore(item: CounselorKnowledgeItem): Promise<void> {
  try {
    const docRef = doc(db, "counselor_knowledge_base", item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (e) {
    console.warn(`[Counselor KB] Failed syncing doc ${item.id} to Firestore:`, e);
  }
}

/**
 * Semantic & Keyword RAG Search:
 * Matches student prompt against active knowledge items and returns relevant items for context injection.
 */
export function searchKnowledgeBase(
  query: string, 
  maxResults: number = 3
): CounselorKnowledgeItem[] {
  const items = getStoredKnowledgeBase().filter(item => item.is_active);
  if (!query || items.length === 0) return [];

  const cleanQuery = query.toLowerCase();
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 2);

  const scored = items.map(item => {
    let score = 0;

    // 1. Direct title match
    if (cleanQuery.includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(cleanQuery)) {
      score += 10;
    }

    // 2. Keyword trigger matches
    for (const kw of item.keywords) {
      const cleanKw = kw.toLowerCase().trim();
      if (cleanQuery.includes(cleanKw)) {
        score += 8;
      }
    }

    // 3. Token overlaps in content
    for (const token of queryTokens) {
      if (item.content.toLowerCase().includes(token)) {
        score += 2;
      }
    }

    // Priority multiplier
    score *= (item.priority_weight || 1);

    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.item);
}
