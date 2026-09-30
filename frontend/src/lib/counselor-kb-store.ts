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
import { db, auth } from "@/lib/firebase";

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
    id: "kb-wellness-001",
    category: "counseling_faq",
    title: "Empathy, Emotional Unburdening & Safe Space Guidelines",
    keywords: ["kausap", "makausap", "lonely", "mag-isa", "lungkot", "malungkot", "nalulungkot", "iyak", "holding space", "confidential space"],
    content: "When students express feelings of loneliness, sadness, or need someone to listen, the primary objective is to provide unconditional positive regard, deep empathy, and non-judgmental holding space. Always acknowledge their feelings first, validate that their emotions are completely normal and safe to share, and gently encourage them to express what weighs heavily on their mind without rushing to give clinical or administrative solutions.",
    suggested_resources: [
      "SAPC Peer Wellness Listening Buddy Circle",
      "Guidance Relaxation & Mindfulness Corner (Room 204)",
      "Daily Student Wellness Journal & Safe Reflection Space"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-01-15T08:00:00.000Z",
    updated_at: "2026-09-30T10:30:00.000Z"
  },
  {
    id: "kb-acad-001",
    category: "academic_policy",
    title: "Empathetic Academic Support & SAPC Grade Recovery Policy",
    keywords: ["bagsak", "remedial", "grade recovery", "failing grade", "remedials", "mababa ang grade", "summer class", "failed subject", "nahihirapan sa klase"],
    content: "Academic setbacks can cause significant shame (hiya) and anxiety. Counselors must first unburden the student by affirming that grades do not define their self-worth. In SAPC, students with grades below 75.0 are supported with free remedial and consultation sessions every Wednesday and Friday (3:30 PM - 5:00 PM, Room 104 Learning Commons) allowing grade recomputation under DepEd DO 8, s. 2015. Always encourage the student that setbacks are growth opportunities.",
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
    updated_at: "2026-09-30T10:30:00.000Z"
  },
  {
    id: "kb-counsel-001",
    category: "counseling_faq",
    title: "Guidance Office Location, Office Hours & Confidentiality Policy",
    keywords: ["saan ang guidance", "location ng guidance", "guidance office hours", "appointment schedule", "room 204 location", "oras ng guidance"],
    content: "The SAPC Guidance & Counseling Office is located at Room 204, 2nd Floor, Building A. Office hours are Monday to Friday, 8:00 AM to 5:00 PM. Sessions are strictly confidential under RA 9258 and RA 10173. No notes are shared without explicit consent.",
    suggested_resources: [
      "SAPC Guidance Office: Room 204, Building A (Mon-Fri 8AM-5PM)",
      "Confidential Counselor Email: guidance@sapc.edu.ph",
      "Online Guidance Appointment Request via Student Dashboard"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor",
    is_active: true,
    priority_weight: 3,
    created_at: "2026-01-15T08:00:00.000Z",
    updated_at: "2026-09-30T10:30:00.000Z"
  },
  {
    id: "kb-crisis-001",
    category: "crisis_protocol",
    title: "5-Step Crisis De-escalation & 24/7 Mental Health Hotlines",
    keywords: ["suicide", "self harm", "mamatay", "ayaw ko na", "di ko na kaya", "suko na", "cutting", "nasasaktan", "hopeless", "end my life"],
    content: "IMMEDIATE EMERGENCY SAFETY PROTOCOL: 1. Validate immediate safety with deep warmth and zero judgment. 2. Connect with licensed professional. 3. Activate institutional child protection support (DepEd DO 40, s. 2012). National Hotlines: National Center for Mental Health (NCMH) 24/7 Crisis Hotline: 1553 (Toll-Free landline) or 0917-899-USAP (8727); Hopeline Philippines: (02) 8804-4673 / 0917-558-4673; Philippine Red Cross 24/7 Helpline: 143.",
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
    updated_at: "2026-09-30T10:30:00.000Z"
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
    title: "Empathetic Anxiety De-escalation: 5-4-3-2-1 Grounding & Box Breathing",
    keywords: ["anxiety", "panic", "overthinking", "kaba", "kinakabahan", "di makatulog", "exam stress", "pomodoro", "grounding", "box breathing", "takot"],
    content: "When students experience anxiety or overthinking: First, offer calming presence and validate their courage to speak up. Invite them into gentle 4-4-6 Box Breathing (Inhale 4s, Hold 4s, Exhale 6s) or the 5-4-3-2-1 Grounding technique. Reassure them that panic passes and they are safe right now in this moment.",
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
    updated_at: "2026-09-30T16:00:00.000Z"
  },
  {
    id: "kb-fin-001",
    category: "financial_aid",
    title: "Compassionate Financial Guidance: Scholarships, 4Ps & Emergency Aid",
    keywords: ["scholarship", "tuition", "promissory note", "4ps", "financial", "allowance", "baon", "walang pera", "utang", "discount", "pambayad"],
    content: "Financial worries cause deep emotional stress for students and their families. Always validate the student's resilience and unburden feelings of guilt. Guide them towards SAPC Emergency Student Assistance, Tuition Installment Plans, and zero-interest Promissory Note endorsements so financial challenges never prevent them from continuing their education.",
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
    updated_at: "2026-09-30T09:00:00.000Z"
  },
  {
    id: "kb-egan-001",
    category: "counseling_faq",
    title: "Gerard Egan's 3-Stage Skilled Helper Counseling Framework",
    keywords: ["paano mag-decide", "ano dapat kong gawin", "gulong-gulo", "nalilito", "confused", "lost", "step by step", "advice", "guidance step"],
    content: "When students feel confused or stuck in a dilemma: Apply Gerard Egan's Skilled Helper Model. Stage 1 (Exploration): Listen actively and help them clarify 'What is going on right now?' without judging. Stage 2 (Understanding): Help them reframe their perspectives and discover 'What do I really want to happen?' Stage 3 (Action Planning): Co-create 1 or 2 small, realistic micro-steps ('How do I get there?') that empower their own agency and self-efficacy.",
    suggested_resources: [
      "SAPC Decision-Making & Goal Setting Worksheet",
      "Confidential Counselor Strategy Session (Room 204)",
      "Student Empowerment Action Tracker"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor (Source: Gerard Egan)",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-03-01T08:00:00.000Z",
    updated_at: "2026-09-30T10:00:00.000Z"
  },
  {
    id: "kb-rogers-001",
    category: "counseling_faq",
    title: "Carl Rogers' Person-Centered Unconditional Positive Regard",
    keywords: ["nahihiya ako", "feeling ko bobo ako", "wala akong kwenta", "worthless", "judged", "hinuhusgahan", "tanggapin", "unconditional regard"],
    content: "Under Carl Rogers' Person-Centered Counseling Theory: Every student possesses inherent self-worth and an innate capacity for growth. When students express shame, feelings of stupidity, or fear of judgment, respond with unconditional positive regard. Never scold, dismiss, or moralize. Mirror their feelings back with warmth (*'Naiintindihan ko kung bakit ka nabibigatan, at hindi ka dapat mahiya sa nararamdaman mo'*), establishing an emotionally safe harbor.",
    suggested_resources: [
      "SAPC Safe Harbor Emotional Reflection Zone",
      "Guidance One-on-One Affirmation & Wellness Pod",
      "Daily Student Compassion Card"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor (Source: Carl Rogers)",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-03-05T08:00:00.000Z",
    updated_at: "2026-09-30T10:00:00.000Z"
  },
  {
    id: "kb-sikolohiya-001",
    category: "counseling_faq",
    title: "Sikolohiyang Pilipino: Kapwa, Pakikiramdam, Panganay & OFW Family Stress",
    keywords: ["panganay", "inaasahan", "ofw", "nanay nasa abroad", "tatay nasa abroad", "malayo ang magulang", "family expectation", "pabigat", "hiya", "utang na loob"],
    content: "Under Sikolohiyang Pilipino (Dr. Virgilio Enriquez): Filipino students often navigate unique familial and cultural pressures such as 'Panganay syndrome' (heavy domestic and financial expectations), parental absence due to OFW employment, and deep 'Hiya' when struggling in school. Counselors must practice 'Pakikiramdam' (attuned shared inner perception), treat the student with 'Kapwa' (shared human identity), and gently relieve excessive guilt while acknowledging their immense family loyalty and strength.",
    suggested_resources: [
      "SAPC OFW Children & Panganay Peer Support Group",
      "Family Guidance & Wellness Consultation Desk",
      "Guidance Pastoral & Counseling Care Program"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor (Source: Dr. Virgilio Enriquez)",
    is_active: true,
    priority_weight: 5,
    created_at: "2026-03-10T08:00:00.000Z",
    updated_at: "2026-09-30T10:00:00.000Z"
  },
  {
    id: "kb-cbt-001",
    category: "study_tip",
    title: "CBT Cognitive Reframing: Overcoming Exam Catastrophizing & Imposter Syndrome",
    keywords: ["katapusan na", "babagsak ako", "lahat sila magaling", "ako lang mahina", "catastrophizing", "overthinking exam", "perfectionism", "takot magkamali"],
    content: "Based on Cognitive Behavior Therapy (Dr. Judith S. Beck): Students under academic pressure frequently engage in cognitive distortions like All-or-Nothing Thinking ('Kung hindi ako maging honor student, failure ako') and Catastrophizing ('Mababagsak ako at mawawalan ng kinabukasan'). Counselors guide students to identify automatic negative thoughts, test reality gently ('Ano ang pinaka-makatotohanang mangyayari?'), and reframe challenges into workable learning steps.",
    suggested_resources: [
      "CBT Thought Record & Cognitive Reframing Guide",
      "SAPC Stress-Free Exam Preparation Toolkit",
      "Guidance Relaxation & Mindfulness Corner (Room 204)"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor (Source: Judith S. Beck)",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-03-15T08:00:00.000Z",
    updated_at: "2026-09-30T10:00:00.000Z"
  },
  {
    id: "kb-motivational-001",
    category: "study_tip",
    title: "Motivational Interviewing: Overcoming Procrastination & Strand Hesitation",
    keywords: ["tinatamad", "procrastination", "ayaw mag-aral", "walang gana", "hindi ko alam kukunin kong strand", "strand", "abm o stem", "humss", "career choice"],
    content: "Under Motivational Interviewing (Miller & Rollnick): Avoid arguing, confronting, or lecturing unmotivated students. Instead, roll with resistance and explore ambivalence ('Bahagi sa iyo ang gustong magpahinga, pero may bahagi rin sa iyo na gustong makatapos'). Help students articulate their own core values, life dreams, and intrinsic motivation to choose their Senior High School strand (STEM, ABM, HUMSS, TVL) with confidence.",
    suggested_resources: [
      "SAPC Senior High Strand Alignment & Career Assessment",
      "Goal Exploration & Values Clarification Matrix",
      "Career Guidance Counselor Consultation (Room 204)"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor (Source: Miller & Rollnick)",
    is_active: true,
    priority_weight: 4,
    created_at: "2026-03-20T08:00:00.000Z",
    updated_at: "2026-09-30T10:00:00.000Z"
  },
  {
    id: "kb-deped-child-001",
    category: "crisis_protocol",
    title: "DepEd Child Protection Policy (DO 40, s. 2012): Bullying & Peer Conflict",
    keywords: ["binubully", "inaasar", "pinagkakaisahan", "sinasaktan sa school", "cyberbullying", "tsismis", "bullying", "away sa klase"],
    content: "Under DepEd Order No. 40, s. 2012 (Child Protection Policy) and RA 10627 (Anti-Bullying Act): Every SAPCian has the right to a school environment free from fear, intimidation, and violence. When a student reports bullying, exclusion, or physical harassment: First, affirm that they are completely safe, believed, and not at fault. Activate confidential Child Protection Committee protocols with the Guidance Office to resolve peer conflicts safely and protect the student from retaliation.",
    suggested_resources: [
      "SAPC Child Protection Committee Helpdesk (Room 204)",
      "Confidential Bullying & Grievance Report Form",
      "Guidance Peer Mediation & Restorative Justice Circle"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor (Source: DepEd DO 40)",
    is_active: true,
    priority_weight: 5,
    created_at: "2026-03-25T08:00:00.000Z",
    updated_at: "2026-09-30T10:00:00.000Z"
  },
  {
    id: "kb-timemgmt-001",
    category: "study_tip",
    title: "Overcoming Requirement Overload & Study Planning: The 3-Step Action Plan",
    keywords: [
      "requirements", "daming requirements", "dami requirements", "paano magsimula", 
      "paano simulan", "tambak", "gawain", "deadline", "deadlines", "unahin", 
      "prioritize", "time management", "pomodoro", "study plan", "saan magsisimula"
    ],
    content: "When students are overwhelmed by heavy requirements, projects, and looming deadlines: Counselors validate their cognitive fatigue and provide structured, bite-sized scaffolding using Egan's Action Stage and the Pomodoro method: 1. 5-Minute Brain Dump (write all pending tasks on paper to empty mental anxiety), 2. Rule of 1 Quick Win (pick either the easiest 10-minute task to build momentum or the most urgent deadline), and 3. 25/5 Pomodoro Pacing (work for 25 minutes uninterrupted, followed by a mandatory 5-minute breather). Reassure them that completing 1 small step creates relief and unlocks progress.",
    suggested_resources: [
      "SAPC Time Management & Priority Matrix Guide",
      "Learning Commons Study Pods & Quiet Space (Room 104)",
      "5-Minute Guided Focus & Hydration Planner"
    ],
    author_name: "Ms. Maria Theresa Cruz, RGC",
    author_role: "Head Guidance Counselor (Source: Gerard Egan & Pomodoro)",
    is_active: true,
    priority_weight: 5,
    created_at: "2026-03-28T08:00:00.000Z",
    updated_at: "2026-09-30T17:00:00.000Z"
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
): Unsubscribe | (() => void) {
  if (!db || typeof window === "undefined") {
    return () => {};
  }
  if (!auth?.currentUser) {
    onUpdate(getStoredKnowledgeBase());
    return () => {};
  }
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
    }, (error: any) => {
      if (error?.code !== "permission-denied" && error?.code !== "unavailable") {
        console.warn("[Counselor KB] Snapshot listener notice:", error?.message || error);
      }
      onUpdate(getStoredKnowledgeBase());
    });
  } catch (err) {
    onUpdate(getStoredKnowledgeBase());
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
  // Tokenize and extract roots
  const rawTokens = cleanQuery.split(/[\s,?.!]+/).filter(t => t.length > 2);
  const queryTokens = new Set<string>(rawTokens);

  // Add common morphological variants for Taglish/Filipino student queries
  rawTokens.forEach(t => {
    if (t.endsWith("ing") && t.length > 4) queryTokens.add(t.replace(/ing$/, ""));
    if (t.startsWith("mag") && t.length > 5) queryTokens.add(t.replace(/^mag/, ""));
    if (t.startsWith("naka") && t.length > 6) queryTokens.add(t.replace(/^naka/, ""));
    if (t.startsWith("nahi") && t.length > 6) queryTokens.add(t.replace(/^nahi/, ""));
    if (t.endsWith("s") && t.length > 3) queryTokens.add(t.slice(0, -1));
  });

  const scored = items.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();

    // 1. Direct title match
    if (cleanQuery.includes(titleLower) || titleLower.includes(cleanQuery)) {
      score += 15;
    }

    // 2. Keyword trigger matches (phrase or individual keyword)
    for (const kw of item.keywords) {
      const cleanKw = kw.toLowerCase().trim();
      if (cleanQuery.includes(cleanKw)) {
        score += 12;
      } else {
        const kwParts = cleanKw.split(/\s+/);
        if (kwParts.every(part => cleanQuery.includes(part) || queryTokens.has(part))) {
          score += 8;
        }
      }
    }

    // 3. Token overlaps in content
    queryTokens.forEach(token => {
      if (titleLower.includes(token)) score += 4;
      if (contentLower.includes(token)) score += 2;
    });

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
