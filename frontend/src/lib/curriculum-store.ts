// Curriculum Management Store
// Pre-defined Grade Level & SHS Strand Curriculum aligned with DepEd K to 12 Standards (DO 8, s. 2015)
// Supports dynamic active/inactive toggles per quarter/semester, custom subjects, and Firestore persistence.

import { db, auth } from "@/lib/firebase";
import { collection, doc, writeBatch, getDocs, setDoc, deleteDoc, onSnapshot, Unsubscribe } from "firebase/firestore";

export type GradeLevel = 7 | 8 | 9 | 10 | 11 | 12;
export type AcademicQuarter = "Q1" | "Q2" | "Q3" | "Q4";
export type AcademicSemester = "1st Semester" | "2nd Semester" | "Full Year";
export type SubjectStrand = "JHS" | "STEM" | "ABM" | "HUMSS" | "TVL" | "GAS" | "ALL";
export type SubjectCategory = "Core" | "Applied" | "Specialized" | "Elective";

export interface CurriculumSubject {
  id: string;
  code: string;
  name: string;
  description?: string;
  grade_level: GradeLevel;
  strand: SubjectStrand;
  semester: AcademicSemester;
  quarters_offered: AcademicQuarter[];
  category: SubjectCategory;
  weight_ww: number; // Written work weight (e.g. 0.40)
  weight_pt: number; // Performance task weight (e.g. 0.40)
  weight_qa: number; // Quarterly assessment weight (e.g. 0.20)
  passing_threshold: number; // e.g. 75.0
  is_active: boolean; // Active or Suspended for current academic cycle
  units?: number;
  prerequisites?: string[];
  custom?: boolean;
  updated_at?: string;
  updated_by?: string;
}

// DepEd K to 12 Standard Baseline Curriculum
export const DEFAULT_CURRICULUM_REGISTRY: CurriculumSubject[] = [
  // ==========================================
  // JUNIOR HIGH SCHOOL - GRADE 7
  // ==========================================
  {
    id: "JHS-MATH7",
    code: "JHS-MATH7",
    name: "Mathematics 7 (Elementary Algebra & Geometry)",
    description: "Sets, real number system, algebraic expressions, linear equations, geometry & statistics.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-SCI7",
    code: "JHS-SCI7",
    name: "Science 7 (Integrated General Science)",
    description: "Scientific investigations, matter, diversity of materials, living things, force and energy.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ENG7",
    code: "JHS-ENG7",
    name: "English 7 (Philippine Literature & Grammar)",
    description: "Philippine folk literature, oral language, reading styles, search engines, grammar and writing.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-FIL7",
    code: "JHS-FIL7",
    name: "Filipino 7 (Ibong Adarna at Panitikang Rehiyunal)",
    description: "Kwentong-bayan, pabula, alamat, epiko, at ang koridong Ibong Adarna.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-AP7",
    code: "JHS-AP7",
    name: "Araling Panlipunan 7 (Araling Asyano)",
    description: "Katangiang pisikal ng Asya, sinaunang kabihasnan, kolonyalismo, at modernong Asya.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-TLE7",
    code: "JHS-TLE7",
    name: "TLE 7 (Exploratory ICT & Home Economics)",
    description: "Basic computer operations, drafting, commercial cooking, beauty care, and agriculture.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-MAPEH7",
    code: "JHS-MAPEH7",
    name: "MAPEH 7 (Music, Arts, PE & Health)",
    description: "Philippine regional music, folk arts, physical fitness, nutrition, and holistic health.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ESP7",
    code: "JHS-ESP7",
    name: "Edukasyon sa Pagpapakatao 7 (EsP)",
    description: "Mga angkop na inaasahang kakayahan, pagtuklas ng talento, hilig, at pagpapahalaga.",
    grade_level: 7,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // ==========================================
  // JUNIOR HIGH SCHOOL - GRADE 8
  // ==========================================
  {
    id: "JHS-MATH8",
    code: "JHS-MATH8",
    name: "Mathematics 8 (Linear Equations, Geometry & Probability)",
    description: "Factoring polynomials, rational expressions, linear functions, axiomatic geometry.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-SCI8",
    code: "JHS-SCI8",
    name: "Science 8 (Biology, Chemistry, Physics & Earth Science)",
    description: "Newton's laws of motion, periodic table, digestive system, earthquakes, and typhoons.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ENG8",
    code: "JHS-ENG8",
    name: "English 8 (Afro-Asian Literature & Analytical Reading)",
    description: "Afro-Asian folk epics, sensory imagery, idioms, visual media analysis, synthesis.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-FIL8",
    code: "JHS-FIL8",
    name: "Filipino 8 (Florante at Laura at Panitikang Pambansa)",
    description: "Panitikan sa panahon ng katutubo, espanyol, hapon at ang awit na Florante at Laura.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-AP8",
    code: "JHS-AP8",
    name: "Araling Panlipunan 8 (Kasaysayan ng Daigdig)",
    description: "Sinaunang kabihasnan ng mundo, Renaissance, Rebolusyong Industriyal, at Digmaang Pandaigdig.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-TLE8",
    code: "JHS-TLE8",
    name: "TLE 8 (Computer Hardware Servicing & Electronics)",
    description: "Computer hardware assembly, cable crimping, diagnostic tools, and electrical circuits.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-MAPEH8",
    code: "JHS-MAPEH8",
    name: "MAPEH 8 (Music, Arts, PE & Health)",
    description: "East/Southeast Asian traditional arts, team sports, human sexuality, and disease prevention.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ESP8",
    code: "JHS-ESP8",
    name: "Edukasyon sa Pagpapakatao 8 (EsP)",
    description: "Ang pamilya bilang pundasyon, pakikipagkapwa, katapatan, at sekswalidad.",
    grade_level: 8,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // ==========================================
  // JUNIOR HIGH SCHOOL - GRADE 9
  // ==========================================
  {
    id: "JHS-MATH9",
    code: "JHS-MATH9",
    name: "Mathematics 9 (Quadratic Functions & Trigonometry)",
    description: "Quadratic equations, variations, radicals, parallelogram properties, right triangle trigonometry.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-SCI9",
    code: "JHS-SCI9",
    name: "Science 9 (Living Things, Chemical Reactions & Electricity)",
    description: "Respiratory & circulatory systems, heredity & biodiversity, ionic/covalent bonding, climate change.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ENG9",
    code: "JHS-ENG9",
    name: "English 9 (Anglo-American Literature & Public Speaking)",
    description: "Anglo-American poetry and prose, Romeo & Juliet, argumentative essays, conditionals, modals.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-FIL9",
    code: "JHS-FIL9",
    name: "Filipino 9 (Noli Me Tangere at Panitikang Asyano)",
    description: "Maikling kwento, tula, dula ng Timog-Silangang Asya at ang nobelang Noli Me Tangere.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-AP9",
    code: "JHS-AP9",
    name: "Araling Panlipunan 9 (Ekonomiks at Pambansang Kaunlaran)",
    description: "Maykroekonomiks, makroekonomiks, demand & supply, implasyon, patakarang piskal at pananalapi.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-TLE9",
    code: "JHS-TLE9",
    name: "TLE 9 (Technical Drafting, Web Design & Commercial Arts)",
    description: "Architectural layouts, HTML/CSS web design fundamentals, illustration, and graphic design.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-MAPEH9",
    code: "JHS-MAPEH9",
    name: "MAPEH 9 (Music, Arts, PE & Health)",
    description: "Medieval to Romantic period music, Western art styles, social dancing, injury management.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ESP9",
    code: "JHS-ESP9",
    name: "Edukasyon sa Pagpapakatao 9 (EsP)",
    description: "Lipunang sibil, katarungang panlipunan, kagalingan sa paggawa, at paghahanda sa karera.",
    grade_level: 9,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // ==========================================
  // JUNIOR HIGH SCHOOL - GRADE 10
  // ==========================================
  {
    id: "JHS-MATH10",
    code: "JHS-MATH10",
    name: "Mathematics 10 (Polynomials, Sequences & Probability)",
    description: "Arithmetic & geometric sequences, polynomial equations, circle geometry, combinatorics & statistics.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-SCI10",
    code: "JHS-SCI10",
    name: "Science 10 (Earth & Space, Heredity & Electromagnetism)",
    description: "Plate tectonics, electromagnetic spectrum, endocrine/nervous systems, gas laws, chemical reactions.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.40,
    weight_pt: 0.40,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ENG10",
    code: "JHS-ENG10",
    name: "English 10 (World Literature & Persuasive Writing)",
    description: "Greek & Roman mythology, world masterpieces, research paper writing, speech delivery, public debate.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-FIL10",
    code: "JHS-FIL10",
    name: "Filipino 10 (El Filibusterismo at Pandaigdigang Akda)",
    description: "Mitolohiya ng Rome, nobelang pandaigdig, sanaysay, at ang obra maestrang El Filibusterismo.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-AP10",
    code: "JHS-AP10",
    name: "Araling Panlipunan 10 (Mga Kontemporaryong Isyu)",
    description: "Kalamidad, climate change, kawalan ng trabaho, globalisasyon, karapatang pantao, kasarian, at pamamahala.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-TLE10",
    code: "JHS-TLE10",
    name: "TLE 10 (Computer Systems Servicing & Coding)",
    description: "Network configuration, router setup, server maintenance, and Python/JavaScript programming.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-MAPEH10",
    code: "JHS-MAPEH10",
    name: "MAPEH 10 (Music, Arts, PE & Health)",
    description: "20th-21st century music, digital media arts, street dance & cheer dancing, global health trends.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "JHS-ESP10",
    code: "JHS-ESP10",
    name: "Edukasyon sa Pagpapakatao 10 (EsP)",
    description: "Ang mataas na gamit ng isip at kilos-loob, dignidad ng tao, pagmamahal sa Diyos at kapwa.",
    grade_level: 10,
    strand: "JHS",
    semester: "Full Year",
    quarters_offered: ["Q1", "Q2", "Q3", "Q4"],
    category: "Core",
    weight_ww: 0.30,
    weight_pt: 0.50,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // ==========================================
  // SENIOR HIGH SCHOOL - GRADE 11 CORE & APPLIED
  // ==========================================
  {
    id: "SHS-GMATH11",
    code: "SHS-GMATH11",
    name: "General Mathematics",
    description: "Functions and their graphs, rational functions, exponential & logarithmic functions, business mathematics.",
    grade_level: 11,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STAT11",
    code: "SHS-STAT11",
    name: "Statistics and Probability",
    description: "Random variables, normal distributions, sampling distributions, hypothesis testing & linear regression.",
    grade_level: 11,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ORAL11",
    code: "SHS-ORAL11",
    name: "Oral Communication in Context",
    description: "Nature and elements of communication, speech styles, speech acts, and communicative strategies.",
    grade_level: 11,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-READ11",
    code: "SHS-READ11",
    name: "Reading and Writing Skills",
    description: "Critical reading across text types, text patterns, contextual evaluation, and professional academic prose.",
    grade_level: 11,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-KOM11",
    code: "SHS-KOM11",
    name: "Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino",
    description: "Konseptong pangwika, gamit ng wika sa lipunan, kasaysayan ng wikang pambansa, at sitwasyong pangwika.",
    grade_level: 11,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PAG11",
    code: "SHS-PAG11",
    name: "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
    description: "Pagsusuri ng tekstong impormatibo, deskriptibo, persuweysib, naratibo, at pagbuo ng konseptong papel.",
    grade_level: 11,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-EARTH11",
    code: "SHS-EARTH11",
    name: "Earth and Life Science",
    description: "Origin and structure of the Earth, earth materials and processes, natural hazards, biological concepts.",
    grade_level: 11,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PHYSCI11",
    code: "SHS-PHYSCI11",
    name: "Physical Science",
    description: "Evolution of elements in the universe, molecular polarity, chemical reactions, optics, and relativity.",
    grade_level: 11,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PE11A",
    code: "SHS-PE11A",
    name: "Physical Education & Health 1 (Exercise for Fitness)",
    description: "Aerobic, muscle- and bone-strengthening exercises, fitness goal setting, and healthy lifestyle habits.",
    grade_level: 11,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PE11B",
    code: "SHS-PE11B",
    name: "Physical Education & Health 2 (Sports & Team Play)",
    description: "Individual, dual, and team sports mechanics, tactical skills, sportsmanship, and safety protocols.",
    grade_level: 11,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-EMPOW11",
    code: "SHS-EMPOW11",
    name: "Empowerment Technologies (ICT for Professional Tracks)",
    description: "Advanced productivity tools, web design, collaborative online platforms, and ICT project management.",
    grade_level: 11,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Applied",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PRACRES1",
    code: "SHS-PRACRES1",
    name: "Practical Research 1 (Qualitative Research)",
    description: "Qualitative research design, data collection, thematic analysis, ethics, and field inquiry reports.",
    grade_level: 11,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Applied",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },

  // ==========================================
  // SENIOR HIGH SCHOOL - GRADE 11 STRAND SPECIALIZED
  // ==========================================
  // STEM Grade 11
  {
    id: "SHS-STEM-PRECALC",
    code: "SHS-STEM-PRECALC",
    name: "Pre-Calculus",
    description: "Conic sections, systems of nonlinear equations, mathematical induction, and circular trigonometry.",
    grade_level: 11,
    strand: "STEM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STEM-BASCALC",
    code: "SHS-STEM-BASCALC",
    name: "Basic Calculus",
    description: "Limits and continuity, derivatives of algebraic & transcendental functions, and integral calculus.",
    grade_level: 11,
    strand: "STEM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STEM-BIO1",
    code: "SHS-STEM-BIO1",
    name: "General Biology 1",
    description: "Cell biology, bioenergetics, cellular respiration, photosynthesis, and basic histology.",
    grade_level: 11,
    strand: "STEM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },

  // ABM Grade 11
  {
    id: "SHS-ABM-BMATH",
    code: "SHS-ABM-BMATH",
    name: "Business Mathematics",
    description: "Fractions, decimals, percentages, mark-on/mark-down, payroll accounting, and profit/loss computation.",
    grade_level: 11,
    strand: "ABM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ABM-FABM1",
    code: "SHS-ABM-FABM1",
    name: "Fundamentals of ABM 1",
    description: "Accounting concepts, bookkeeping principles, accounting cycle of service and merchandising businesses.",
    grade_level: 11,
    strand: "ABM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ABM-ORGMGT",
    code: "SHS-ABM-ORGMGT",
    name: "Organization and Management",
    description: "Management theories, organizational planning, staffing, leading, controlling, and enterprise operations.",
    grade_level: 11,
    strand: "ABM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ABM-PRINMKT",
    code: "SHS-ABM-PRINMKT",
    name: "Principles of Marketing",
    description: "Market research, customer value, marketing mix (4Ps), digital marketing, and competitive strategy.",
    grade_level: 11,
    strand: "ABM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },

  // HUMSS Grade 11
  {
    id: "SHS-HUMSS-DISS",
    code: "SHS-HUMSS-DISS",
    name: "Disciplines and Ideas in the Social Sciences (DISS)",
    description: "Major social science disciplines, structural-functionalism, Marxism, psychoanalysis, and Filipino psychology.",
    grade_level: 11,
    strand: "HUMSS",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-HUMSS-CW",
    code: "SHS-HUMSS-CW",
    name: "Creative Writing",
    description: "Poetry, short story writing, dramatic scripts, imagery, creative crafting, and literary workshops.",
    grade_level: 11,
    strand: "HUMSS",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.55,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-HUMSS-PPG",
    code: "SHS-HUMSS-PPG",
    name: "Philippine Politics and Governance",
    description: "Political concepts, 1987 Philippine Constitution, branches of government, civil society, citizenship.",
    grade_level: 11,
    strand: "HUMSS",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },

  // TVL Grade 11
  {
    id: "SHS-TVL-PROG1",
    code: "SHS-TVL-PROG1",
    name: "Computer Programming & Web Systems 1",
    description: "Software engineering logic, frontend development, JavaScript algorithms, UI/UX prototyping.",
    grade_level: 11,
    strand: "TVL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-TVL-CSS1",
    code: "SHS-TVL-CSS1",
    name: "Computer Systems Servicing NC II",
    description: "Hardware installation, OS configuration, networking cables, server configuration and maintenance.",
    grade_level: 11,
    strand: "TVL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // ==========================================
  // SENIOR HIGH SCHOOL - GRADE 12 CORE & APPLIED
  // ==========================================
  {
    id: "SHS-CPAR12",
    code: "SHS-CPAR12",
    name: "Contemporary Philippine Arts from the Regions",
    description: "Regional art forms, national artists, traditional craftsmanship, and contemporary media exhibitions.",
    grade_level: 12,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-MIL12",
    code: "SHS-MIL12",
    name: "Media and Information Literacy",
    description: "Information vetting, media ethics, digital citizenship, fake news prevention, and media production.",
    grade_level: 12,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ENTREP12",
    code: "SHS-ENTREP12",
    name: "Entrepreneurship",
    description: "Business plan development, financial feasibility, product prototyping, and market launch execution.",
    grade_level: 12,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Applied",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-EAPP12",
    code: "SHS-EAPP12",
    name: "English for Academic and Professional Purposes (EAPP)",
    description: "Critical review writing, concept papers, position papers, survey reports, and technical manuals.",
    grade_level: 12,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Applied",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PRACRES2",
    code: "SHS-PRACRES2",
    name: "Practical Research 2 (Quantitative Research)",
    description: "Quantitative research design, statistical sampling, survey instruments, data analysis, and oral defense.",
    grade_level: 12,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Applied",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-3IS12",
    code: "SHS-3IS12",
    name: "Inquiries, Investigations and Immersion (3Is)",
    description: "Synthesis of research knowledge, capstone implementation, peer review, and community presentation.",
    grade_level: 12,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Applied",
    weight_ww: 0.25,
    weight_pt: 0.55,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PE12A",
    code: "SHS-PE12A",
    name: "Physical Education & Health 3 (Traditional & Contemporary Dance)",
    description: "Philippine folk dances, ballroom, modern dance, choreography, and artistic expression.",
    grade_level: 12,
    strand: "ALL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-PE12B",
    code: "SHS-PE12B",
    name: "Physical Education & Health 4 (Outdoor & Recreational Activities)",
    description: "Trekking, orienteering, swimming, water safety, disaster resilience, and lifetime fitness.",
    grade_level: 12,
    strand: "ALL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Core",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // ==========================================
  // SENIOR HIGH SCHOOL - GRADE 12 STRAND SPECIALIZED
  // ==========================================
  // STEM Grade 12
  {
    id: "SHS-STEM-PHYS1",
    code: "SHS-STEM-PHYS1",
    name: "General Physics 1",
    description: "Kinematics, vectors, dynamics, work and energy, impulse, rotational equilibrium, fluids & thermodynamics.",
    grade_level: 12,
    strand: "STEM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STEM-CHEM1",
    code: "SHS-STEM-CHEM1",
    name: "General Chemistry 1",
    description: "Stoichiometry, thermochemistry, quantum atomic structure, chemical bonding, and gas laws.",
    grade_level: 12,
    strand: "STEM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STEM-PHYS2",
    code: "SHS-STEM-PHYS2",
    name: "General Physics 2",
    description: "Electricity, electrostatics, DC/AC circuits, magnetism, electromagnetic induction, and geometric optics.",
    grade_level: 12,
    strand: "STEM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STEM-CHEM2",
    code: "SHS-STEM-CHEM2",
    name: "General Chemistry 2",
    description: "Intermolecular forces, solutions, chemical kinetics, chemical equilibrium, acids and bases, electrochemistry.",
    grade_level: 12,
    strand: "STEM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STEM-BIO2",
    code: "SHS-STEM-BIO2",
    name: "General Biology 2",
    description: "Genetics, molecular biology, evolution, systematics, animal and plant physiology.",
    grade_level: 12,
    strand: "STEM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-STEM-CAPSTONE",
    code: "SHS-STEM-CAPSTONE",
    name: "STEM Work Immersion / Research Capstone",
    description: "Industry internship, hardware/software capstone prototype development, and academic symposium defense.",
    grade_level: 12,
    strand: "STEM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // ABM Grade 12
  {
    id: "SHS-ABM-FABM2",
    code: "SHS-ABM-FABM2",
    name: "Fundamentals of ABM 2",
    description: "Statement of Financial Position, Income Statement, Cash Flows, financial ratios, and tax returns.",
    grade_level: 12,
    strand: "ABM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ABM-BFIN",
    code: "SHS-ABM-BFIN",
    name: "Business Finance",
    description: "Financial system, capital budgeting, working capital management, risk management, and loan portfolio analysis.",
    grade_level: 12,
    strand: "ABM",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.45,
    weight_qa: 0.30,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ABM-APPALEC",
    code: "SHS-ABM-APPALEC",
    name: "Applied Economics",
    description: "Economic analysis of contemporary Philippine business problems, industry competitiveness, poverty reduction.",
    grade_level: 12,
    strand: "ABM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ABM-ETHICS",
    code: "SHS-ABM-ETHICS",
    name: "Business Ethics and Social Responsibility",
    description: "Corporate governance, business ethics philosophies, corporate social responsibility, and fair workplace standards.",
    grade_level: 12,
    strand: "ABM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-ABM-IMMERSION",
    code: "SHS-ABM-IMMERSION",
    name: "ABM Work Immersion / Business Simulation",
    description: "On-the-job enterprise simulation, office administration, retail operations, and audit practicum.",
    grade_level: 12,
    strand: "ABM",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // HUMSS Grade 12
  {
    id: "SHS-HUMSS-CNF",
    code: "SHS-HUMSS-CNF",
    name: "Creative Nonfiction",
    description: "Literary journalism, autobiographical memoirs, travelogues, personal essays, and narrative non-fiction.",
    grade_level: 12,
    strand: "HUMSS",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.55,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-HUMSS-TNCT",
    code: "SHS-HUMSS-TNCT",
    name: "Trends, Networks, and Critical Thinking in the 21st Century",
    description: "Global trends, neural & social networks, democratic participation, planetary networks, technology impact.",
    grade_level: 12,
    strand: "HUMSS",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.50,
    weight_qa: 0.25,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-HUMSS-COMM",
    code: "SHS-HUMSS-COMM",
    name: "Community Engagement, Solidarity, and Citizenship",
    description: "Community action initiatives, grassroots advocacy, human rights defense, and civic engagement.",
    grade_level: 12,
    strand: "HUMSS",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.25,
    weight_pt: 0.55,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-HUMSS-CULMINATING",
    code: "SHS-HUMSS-CULMINATING",
    name: "HUMSS Culminating Activity & Portfolio Exhibit",
    description: "Multidisciplinary social research showcase, public policy brief presentation, and community portfolio.",
    grade_level: 12,
    strand: "HUMSS",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },

  // TVL Grade 12
  {
    id: "SHS-TVL-PROG2",
    code: "SHS-TVL-PROG2",
    name: "Advanced Programming & Database Systems",
    description: "Full-stack development, SQL databases, API integrations, responsive applications, and testing.",
    grade_level: 12,
    strand: "TVL",
    semester: "1st Semester",
    quarters_offered: ["Q1", "Q2"],
    category: "Specialized",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  },
  {
    id: "SHS-TVL-IMMERSION",
    code: "SHS-TVL-IMMERSION",
    name: "TVL Work Immersion / Technical Apprenticeship",
    description: "Industry-partnered practicum, hardware lab deployment, technical helpdesk support, and NC II certification.",
    grade_level: 12,
    strand: "TVL",
    semester: "2nd Semester",
    quarters_offered: ["Q3", "Q4"],
    category: "Specialized",
    weight_ww: 0.20,
    weight_pt: 0.60,
    weight_qa: 0.20,
    passing_threshold: 75.0,
    is_active: true
  }
];

const CURRICULUM_STORAGE_KEY = "sapc_curriculum_registry_v1";

/**
 * Gets the current active curriculum registry from memory / localStorage
 */
export function getActiveCurriculum(): CurriculumSubject[] {
  if (typeof window === "undefined") {
    return DEFAULT_CURRICULUM_REGISTRY;
  }
  try {
    const raw = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(DEFAULT_CURRICULUM_REGISTRY));
      return DEFAULT_CURRICULUM_REGISTRY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CURRICULUM_REGISTRY;
  } catch (err) {
    console.warn("Could not read local curriculum registry:", err);
    return DEFAULT_CURRICULUM_REGISTRY;
  }
}

/**
 * Saves the active curriculum registry and notifies listeners & Firestore
 */
export function saveActiveCurriculum(
  curriculum: CurriculumSubject[],
  syncedBy: string = "Admin / Academic Coordinator"
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(curriculum));
    window.dispatchEvent(new CustomEvent("sapc:curriculum-updated", { detail: curriculum }));
  } catch (err) {
    console.error("Failed to save local curriculum:", err);
  }

  // Sync to Firestore in background
  if (auth.currentUser) {
    syncCurriculumToFirestore(curriculum, syncedBy).catch(err => {
      console.warn("Background Firestore curriculum sync error:", err);
    });
  }
}

/**
 * Sync entire curriculum to Cloud Firestore
 */
export async function syncCurriculumToFirestore(
  curriculum: CurriculumSubject[],
  actor: string
): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const batch = writeBatch(db);
    const colRef = collection(db, "curriculum_registry");
    
    // Save metadata document
    const metaDocRef = doc(colRef, "_meta_registry");
    batch.set(metaDocRef, {
      total_subjects: curriculum.length,
      active_subjects: curriculum.filter(s => s.is_active).length,
      updated_at: new Date().toISOString(),
      updated_by: actor
    }, { merge: true });

    // Batch write up to 450 subjects
    for (const subj of curriculum) {
      const sanitizedDoc: Record<string, any> = {
        id: subj.id,
        code: subj.code,
        name: subj.name,
        description: subj.description || "",
        grade_level: Number(subj.grade_level),
        strand: subj.strand,
        semester: subj.semester,
        quarters_offered: subj.quarters_offered || ["Q1", "Q2", "Q3", "Q4"],
        category: subj.category,
        weight_ww: Number(subj.weight_ww),
        weight_pt: Number(subj.weight_pt),
        weight_qa: Number(subj.weight_qa),
        passing_threshold: Number(subj.passing_threshold || 75.0),
        is_active: Boolean(subj.is_active),
        units: subj.units ? Number(subj.units) : 1,
        custom: Boolean(subj.custom),
        updated_at: new Date().toISOString(),
        updated_by: actor
      };
      if (subj.prerequisites && subj.prerequisites.length > 0) {
        sanitizedDoc.prerequisites = subj.prerequisites;
      }
      const subjectDocRef = doc(colRef, subj.id);
      batch.set(subjectDocRef, sanitizedDoc, { merge: true });
    }

    await batch.commit();
    console.log(`[CurriculumStore] Successfully synced ${curriculum.length} subjects to Firestore.`);
  } catch (err) {
    console.error("[CurriculumStore] Error syncing curriculum to Firestore:", err);
    throw err;
  }
}

/**
 * Load curriculum registry from Cloud Firestore
 */
export async function loadCurriculumFromFirestore(): Promise<CurriculumSubject[]> {
  if (!auth.currentUser) return getActiveCurriculum();
  try {
    const colRef = collection(db, "curriculum_registry");
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const current = getActiveCurriculum();
      await syncCurriculumToFirestore(current, "Initial Seed");
      return current;
    }

    const loaded: CurriculumSubject[] = [];
    snap.forEach(docSnap => {
      if (docSnap.id === "_meta_registry") return;
      const data = docSnap.data() as CurriculumSubject;
      loaded.push(data);
    });

    if (loaded.length > 0) {
      localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(loaded));
      window.dispatchEvent(new CustomEvent("sapc:curriculum-updated", { detail: loaded }));
      return loaded;
    }
    return getActiveCurriculum();
  } catch (err) {
    console.warn("[CurriculumStore] Firestore load error, using local fallback:", err);
    return getActiveCurriculum();
  }
}

/**
 * Real-time subscription to curriculum changes
 */
export function subscribeToCurriculum(
  callback: (curriculum: CurriculumSubject[]) => void
): Unsubscribe | (() => void) {
  if (typeof window === "undefined") return () => {};

  const handleLocal = (e: Event) => {
    const custom = e as CustomEvent<CurriculumSubject[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getActiveCurriculum());
    }
  };
  window.addEventListener("sapc:curriculum-updated", handleLocal);

  let unsubFirestore: Unsubscribe | null = null;
  if (auth.currentUser) {
    try {
      const colRef = collection(db, "curriculum_registry");
      unsubFirestore = onSnapshot(colRef, (snap) => {
        const remote: CurriculumSubject[] = [];
        snap.forEach(docSnap => {
          if (docSnap.id === "_meta_registry") return;
          remote.push(docSnap.data() as CurriculumSubject);
        });
        if (remote.length > 0) {
          localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(remote));
          callback(remote);
        }
      }, (err) => {
        console.warn("[CurriculumStore] Real-time listener fallback:", err);
      });
    } catch (e) {
      console.warn("[CurriculumStore] Failed to attach snapshot listener:", e);
    }
  }

  return () => {
    window.removeEventListener("sapc:curriculum-updated", handleLocal);
    if (unsubFirestore) unsubFirestore();
  };
}

/**
 * Toggles whether a subject is active/offered
 */
export function toggleSubjectActiveStatus(
  subjectId: string,
  forceActive?: boolean,
  actor: string = "Teacher / Administrator"
): CurriculumSubject[] {
  const list = getActiveCurriculum();
  const updated = list.map(s => {
    if (s.id === subjectId || s.code === subjectId) {
      return {
        ...s,
        is_active: forceActive !== undefined ? forceActive : !s.is_active,
        updated_at: new Date().toISOString(),
        updated_by: actor
      };
    }
    return s;
  });
  saveActiveCurriculum(updated, actor);
  return updated;
}

/**
 * Toggles a specific quarter offering for a subject (e.g. Q1, Q2, Q3, Q4)
 */
export function toggleSubjectQuarter(
  subjectId: string,
  quarter: AcademicQuarter,
  actor: string = "Teacher / Administrator"
): CurriculumSubject[] {
  const list = getActiveCurriculum();
  const updated = list.map(s => {
    if (s.id === subjectId || s.code === subjectId) {
      const currentQuarters = s.quarters_offered || [];
      const hasQuarter = currentQuarters.includes(quarter);
      let nextQuarters: AcademicQuarter[];
      if (hasQuarter) {
        nextQuarters = currentQuarters.filter(q => q !== quarter);
      } else {
        const order: Record<AcademicQuarter, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
        nextQuarters = [...currentQuarters, quarter].sort((a, b) => order[a] - order[b]);
      }
      return {
        ...s,
        quarters_offered: nextQuarters,
        // If no quarters offered, mark inactive
        is_active: nextQuarters.length > 0 ? s.is_active : false,
        updated_at: new Date().toISOString(),
        updated_by: actor
      };
    }
    return s;
  });
  saveActiveCurriculum(updated, actor);
  return updated;
}

/**
 * Updates a subject's metadata, weights, or details
 */
export function updateSubject(
  subjectId: string,
  updates: Partial<CurriculumSubject>,
  actor: string = "Administrator"
): CurriculumSubject[] {
  const list = getActiveCurriculum();
  const updated = list.map(s => {
    if (s.id === subjectId || s.code === subjectId) {
      return {
        ...s,
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: actor
      };
    }
    return s;
  });
  saveActiveCurriculum(updated, actor);
  return updated;
}

/**
 * Adds a new custom subject or elective
 */
export function addCustomSubject(
  subject: Omit<CurriculumSubject, "id">,
  actor: string = "Administrator"
): CurriculumSubject {
  const list = getActiveCurriculum();
  const id = subject.code.trim().toUpperCase().replace(/\s+/g, "-");
  const newSubject: CurriculumSubject = {
    ...subject,
    id,
    code: id,
    custom: true,
    is_active: true,
    updated_at: new Date().toISOString(),
    updated_by: actor
  };
  const updated = [...list.filter(s => s.id !== id), newSubject];
  saveActiveCurriculum(updated, actor);
  return newSubject;
}

/**
 * Deletes a custom subject
 */
export function deleteCustomSubject(
  subjectId: string,
  actor: string = "Administrator"
): CurriculumSubject[] {
  const list = getActiveCurriculum();
  const updated = list.filter(s => s.id !== subjectId && s.code !== subjectId);
  saveActiveCurriculum(updated, actor);
  
  if (auth.currentUser) {
    try {
      const docRef = doc(db, "curriculum_registry", subjectId);
      deleteDoc(docRef).catch(err => console.warn("Firestore subject deletion note:", err));
    } catch (e) {
      console.warn("Firestore delete call skipped:", e);
    }
  }
  return updated;
}

/**
 * Resets curriculum to DepEd standard default catalogue
 */
export function resetCurriculumToDefault(
  actor: string = "Administrator"
): CurriculumSubject[] {
  saveActiveCurriculum(DEFAULT_CURRICULUM_REGISTRY, actor);
  return DEFAULT_CURRICULUM_REGISTRY;
}

/**
 * Filters the curriculum for a specific grade level, strand, and quarter
 */
export function getCurriculumForGrade(
  gradeLevel: number,
  strand?: string,
  quarter?: AcademicQuarter,
  onlyActive: boolean = true
): CurriculumSubject[] {
  const all = getActiveCurriculum();
  return all.filter(subj => {
    // Grade Level check
    if (subj.grade_level !== gradeLevel) return false;

    // Active status check
    if (onlyActive && !subj.is_active) return false;

    // Quarter offering check
    if (quarter && subj.quarters_offered && !subj.quarters_offered.includes(quarter)) {
      return false;
    }

    // Strand check for SHS (Grades 11-12)
    if (gradeLevel >= 11) {
      if (subj.strand === "ALL") return true;
      if (strand && subj.strand.toLowerCase() === strand.toLowerCase()) return true;
      if (!strand) return true;
      return false;
    }

    return true;
  });
}

/**
 * Exports the active curriculum to CSV string
 */
export function exportCurriculumToCSV(curriculum: CurriculumSubject[] = getActiveCurriculum()): string {
  const headers = [
    "Subject ID",
    "Subject Code",
    "Subject Name",
    "Grade Level",
    "Strand",
    "Semester",
    "Quarters Offered",
    "Category",
    "Written Work Weight (%)",
    "Performance Task Weight (%)",
    "Quarterly Exam Weight (%)",
    "Passing Mark",
    "Status (Active/Inactive)",
    "Description"
  ];

  const rows = curriculum.map(s => [
    `"${s.id}"`,
    `"${s.code}"`,
    `"${s.name.replace(/"/g, '""')}"`,
    s.grade_level,
    `"${s.strand}"`,
    `"${s.semester}"`,
    `"${(s.quarters_offered || []).join(";")}"`,
    `"${s.category}"`,
    Math.round(s.weight_ww * 100),
    Math.round(s.weight_pt * 100),
    Math.round(s.weight_qa * 100),
    s.passing_threshold,
    s.is_active ? "Active" : "Inactive",
    `"${(s.description || "").replace(/"/g, '""')}"`
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
}
