// Standardized CSV Templates and Metadata for all 5 AHP Multi-Factor Risk Domains

export type IngestionDomain = "academic" | "mental_health" | "financial" | "family" | "health";

export interface DomainMetadata {
  id: IngestionDomain;
  title: string;
  shortTitle: string;
  icon: string;
  weight: string;
  weightPercent: number;
  sourceDepartment: string;
  color: string;
  borderColor: string;
  bgLight: string;
  description: string;
  csvFileName: string;
  requiredColumns: string[];
  sampleData: string;
}

export const INGESTION_DOMAINS: Record<IngestionDomain, DomainMetadata> = {
  academic: {
    id: "academic",
    title: "Academic & Attendance (SASS)",
    shortTitle: "SASS Academic",
    icon: "📚",
    weight: "35% AHP Weight",
    weightPercent: 35,
    sourceDepartment: "Registrar & Academic Affairs Office",
    color: "text-rose-700",
    borderColor: "border-rose-300",
    bgLight: "bg-rose-50",
    description: "Ingests quarterly Grade Point Average (GPA), failing marks count, days absent, and incomplete tasks.",
    csvFileName: "SAPC_Academic_Attendance_Template.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "grade_level",
      "section",
      "quarter_gpa",
      "failing_subjects_count",
      "days_absent",
      "incomplete_requirements_count"
    ],
    sampleData: `lrn,student_name,grade_level,section,quarter_gpa,failing_subjects_count,days_absent,incomplete_requirements_count
109238475001,Jerome Santos,11,Grade 11 - St. Augustine (STEM),88.5,0,2,0
109238475002,Maria Clara Reyes,11,Grade 11 - St. Lorenzo (HUMSS),72.0,2,8,2
109238475003,Joshua Dimaculangan,11,Grade 11 - St. Augustine (STEM),69.5,3,11,3
109238475004,Samantha Nicole Reyes,11,Grade 11 - St. Lorenzo (HUMSS),74.0,1,9,1
109238475005,Christian Bautista,12,Grade 12 - St. Thomas Aquinas (STEM),93.0,0,1,0`
  },

  mental_health: {
    id: "mental_health",
    title: "Mental Health & Psychological Screenings",
    shortTitle: "Mental Health",
    icon: "🧠",
    weight: "25% AHP Weight",
    weightPercent: 25,
    sourceDepartment: "Guidance & Counseling Center (RGC)",
    color: "text-purple-700",
    borderColor: "border-purple-300",
    bgLight: "bg-purple-50",
    description: "Ingests standardized GAD-7 (Anxiety 0–21), PHQ-9 (Depression 0–27), stress level index (1–5), and confidential crisis flags.",
    csvFileName: "SAPC_Mental_Health_Screenings_Template.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "gad7_anxiety_score",
      "phq9_depression_score",
      "stress_level_1_to_5",
      "counselor_case_flag",
      "primary_distress_factor"
    ],
    sampleData: `lrn,student_name,gad7_anxiety_score,phq9_depression_score,stress_level_1_to_5,counselor_case_flag,primary_distress_factor
109238475001,Jerome Santos,4,3,2,no,Normal Exam Anxiety
109238475002,Maria Clara Reyes,16,14,4,yes,High Academic Pressure & Family Distress
109238475003,Joshua Dimaculangan,18,17,5,yes,Severe Test Anxiety & Midterm Panic
109238475004,Samantha Nicole Reyes,14,15,4,yes,Sleep Deprivation & Separation Anxiety
109238475005,Christian Bautista,2,1,1,no,None / Well Adjusted`
  },

  financial: {
    id: "financial",
    title: "Financial Stability & Subsidy Records",
    shortTitle: "Financial Records",
    icon: "💳",
    weight: "15% AHP Weight",
    weightPercent: 15,
    sourceDepartment: "Accounting & Scholarship Finance Office",
    color: "text-emerald-700",
    borderColor: "border-emerald-300",
    bgLight: "bg-emerald-50",
    description: "Ingests overdue installment counts, unpaid tuition balance, promissory notes, and DepEd SHS Voucher / ESC grant status.",
    csvFileName: "SAPC_Financial_Assistance_Template.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "overdue_installments",
      "unpaid_balance_php",
      "promissory_note_active",
      "voucher_subsidy_status",
      "alumni_grant_eligible"
    ],
    sampleData: `lrn,student_name,overdue_installments,unpaid_balance_php,promissory_note_active,voucher_subsidy_status,alumni_grant_eligible
109238475001,Jerome Santos,0,0,false,Full DepEd Voucher,false
109238475002,Maria Clara Reyes,2,14500,true,Partial Subsidy,true
109238475003,Joshua Dimaculangan,3,22000,true,None / Delayed Payment,true
109238475004,Samantha Nicole Reyes,1,7500,false,Full DepEd Voucher,false
109238475005,Christian Bautista,0,0,false,ESC Scholar,false`
  },

  family: {
    id: "family",
    title: "Family & Social Environment",
    shortTitle: "Family & Social",
    icon: "👨‍👩‍👦",
    weight: "15% AHP Weight",
    weightPercent: 15,
    sourceDepartment: "Class Advisers & Community Extension",
    color: "text-amber-700",
    borderColor: "border-amber-300",
    bgLight: "bg-amber-50",
    description: "Ingests OFW parent indicators, guardian contact responsiveness, single-parent domestic pressure, and adviser observation flags.",
    csvFileName: "SAPC_Family_Social_Support_Template.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "ofw_parent_status",
      "guardian_contact_rating",
      "domestic_distress_flag",
      "parent_conference_attended",
      "adviser_notes"
    ],
    sampleData: `lrn,student_name,ofw_parent_status,guardian_contact_rating,domestic_distress_flag,parent_conference_attended,adviser_notes
109238475001,Jerome Santos,None,High,false,true,Active guardian support during PTA
109238475002,Maria Clara Reyes,One Parent OFW,Moderate,true,false,Guardian works night shifts; student cares for younger siblings
109238475003,Joshua Dimaculangan,Both Parents OFW,Low,true,false,Lives with elderly grandmother; difficulty establishing contact
109238475004,Samantha Nicole Reyes,None,Low,true,true,Recent parental separation causing emotional distress
109238475005,Christian Bautista,None,High,false,true,Very responsive guardian`
  },

  health: {
    id: "health",
    title: "Physical Health & School Clinic Logs",
    shortTitle: "Health & Clinic",
    icon: "🏥",
    weight: "10% AHP Weight",
    weightPercent: 10,
    sourceDepartment: "SAPC Campus Health Services & Clinic",
    color: "text-cyan-700",
    borderColor: "border-cyan-300",
    bgLight: "bg-cyan-50",
    description: "Ingests quarterly clinic visits, chronic conditions (asthma, anemia, migraine), nutritional status (BMI), and physical education clearances.",
    csvFileName: "SAPC_Clinic_Health_Records_Template.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "quarterly_clinic_visits",
      "chronic_condition",
      "bmi_category",
      "physical_activity_clearance",
      "clinic_nurse_remarks"
    ],
    sampleData: `lrn,student_name,quarterly_clinic_visits,chronic_condition,bmi_category,physical_activity_clearance,clinic_nurse_remarks
109238475001,Jerome Santos,1,None,Normal,Cleared,Routine check-up
109238475002,Maria Clara Reyes,4,Bronchial Asthma,Underweight,Restricted,Frequent asthma episodes during morning PE
109238475003,Joshua Dimaculangan,6,Chronic Tension Headaches,Normal,Cleared,Clinic visits due to stress and sleep deprivation
109238475004,Samantha Nicole Reyes,5,Gastritis / Acid Reflux,Underweight,Cleared,Misses meals due to anxiety
109238475005,Christian Bautista,0,None,Normal,Cleared,Healthy physical status`
  }
};
