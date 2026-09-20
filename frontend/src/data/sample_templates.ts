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
  fullDatasetUrl: string;
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
    description: "Ingests quarterly Grade Point Average (GPA), failing marks count, days absent, attendance rate %, and student engagement factors (extracurricular clubs, participation levels, hobbies).",
    csvFileName: "SAPC_Academic_Attendance_Template.csv",
    fullDatasetUrl: "/samples/sapc_500_academic_sass.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "grade_level",
      "section",
      "quarter_gpa",
      "failing_subjects_count",
      "days_absent",
      "attendance_rate_pct",
      "incomplete_requirements_count",
      "extracurricular_club",
      "club_participation_level",
      "hobbies_interests"
    ],
    sampleData: `lrn,student_name,grade_level,section,quarter_gpa,failing_subjects_count,days_absent,attendance_rate_pct,incomplete_requirements_count,extracurricular_club,club_participation_level,hobbies_interests
109238475001,Jerome Santos,11,Grade 11 - St. Augustine (STEM),88.5,0,2,95.6,0,Robotics & Coding Society,High,Robotics & Web Development
109238475002,Maria Clara Reyes,11,Grade 11 - St. Lorenzo (HUMSS),72.0,2,8,82.4,2,None / Non-Member,None,Passive Screen Time / Social Media
109238475003,Joshua Dimaculangan,11,Grade 11 - St. Augustine (STEM),69.5,3,11,75.8,3,None / Non-Member,None,Unstructured Rest / Inactive
109238475004,Samantha Nicole Reyes,11,Grade 11 - St. Lorenzo (HUMSS),74.0,1,9,80.2,1,Peer Facilitators Wellness Circle,Low,Reading Novels & Webtoons
109238475005,Christian Bautista,12,Grade 12 - St. Thomas Aquinas (STEM),93.0,0,1,97.8,0,Supreme Secondary Learner Government (SSLG),High,Debate & Public Speaking`
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
    description: "Ingests standardized GAD-7 Anxiety (0–21), PHQ-9 Depression (0–27), stress level index (1–5), somatic burnout symptoms, anhedonia & withdrawal indicators, coping mechanism adaptiveness, emotional support levels, resilience index, and priority counselor clinical intake flags.",
    csvFileName: "SAPC_Mental_Health_Screenings_Template.csv",
    fullDatasetUrl: "/samples/sapc_500_mental_health_screenings.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "stress_level_1_to_5",
      "primary_stress_trigger",
      "burnout_somatic_symptoms",
      "gad7_anxiety_score",
      "anxiety_severity_level",
      "anxiety_behavioral_manifestation",
      "phq9_depression_score",
      "depression_severity_level",
      "anhedonia_and_withdrawal_flag",
      "emotional_support_feeling",
      "primary_coping_mechanism",
      "coping_adaptiveness",
      "resilience_score_1_to_5",
      "counselor_case_flag",
      "clinical_intake_recommendation"
    ],
    sampleData: `lrn,student_name,stress_level_1_to_5,primary_stress_trigger,burnout_somatic_symptoms,gad7_anxiety_score,anxiety_severity_level,anxiety_behavioral_manifestation,phq9_depression_score,depression_severity_level,anhedonia_and_withdrawal_flag,emotional_support_feeling,primary_coping_mechanism,coping_adaptiveness,resilience_score_1_to_5,counselor_case_flag,clinical_intake_recommendation
109238475001,Jerome Santos,4,Exam & Academic Performance Anxiety,Frequent Tension Headaches & Nausea,18,Severe,Social Withdrawal from Peer Groups,19,Moderately Severe,true,Isolated / Disconnected,Avoidance & Withdrawal (Isolating / Skipping Tasks),Maladaptive / Avoidant,1,true,Urgent 1-on-1 confidential counseling intake required. Implement academic stress mitigation.
109238475002,Maria Clara Reyes,3,Midterm Project Deadlines,Mild Headaches During Review,11,Moderate,Avoidance of Public Presentations,12,Moderate,false,Moderately Supported,Social Support (Talking with Friends/Family),Adaptive / Constructive,3,false,Enroll in Peer Wellness Circle & Midterm Stress Management Workshop. Regular homeroom check-in.
109238475003,Joshua Dimaculangan,5,Financial Insecurity & Tuition Delay Panic,Panic Episodes & Hyperventilation,20,Severe,Test Panic & Freezing During Exams,22,Severe,true,Completely Alone,Avoidance & Withdrawal (Isolating / Skipping Tasks),Maladaptive / Avoidant,1,true,Immediate counseling intervention; enroll student in structured study management and emotional resilience coaching.
109238475004,Samantha Nicole Reyes,3,Math Anxiety & Difficult Subject Fatigue,None,9,Mild,Procrastination on Difficult Modules,8,Mild,false,Moderately Supported,Creative & Artistic Expression (Music / Sketching),Adaptive / Constructive,3,false,Recommend school-life balance consultation and peer tutoring support for challenging subjects.
109238475005,Christian Bautista,1,None / Well Adjusted,None,2,Minimal,None,1,Minimal / None,false,Strongly Supported,Problem-Focused (Study Plans / Consultations),Adaptive / Constructive,5,false,Routine annual wellness check-in. Student demonstrates healthy emotional regulation and strong social support.`
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
    description: "Ingests monthly household income level, subjective financial stress index (1–5), 4Ps beneficiary status, breadwinner occupation, daily allowance adequacy, working student burden (hours/wk), unpaid tuition balance, overdue installment counts, promissory notes, and scholarship subsidy eligibility.",
    csvFileName: "SAPC_Financial_Assistance_Template.csv",
    fullDatasetUrl: "/samples/sapc_500_financial_records.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "monthly_household_income_php",
      "income_bracket",
      "is_4ps_beneficiary",
      "breadwinner_occupation",
      "financial_stress_level_1_to_5",
      "primary_financial_stressor",
      "daily_allowance_adequacy",
      "student_part_time_work_status",
      "voucher_subsidy_status",
      "unpaid_balance_php",
      "overdue_installments",
      "promissory_note_active",
      "alumni_grant_eligible",
      "financial_assistance_recommendation"
    ],
    sampleData: `lrn,student_name,monthly_household_income_php,income_bracket,is_4ps_beneficiary,breadwinner_occupation,financial_stress_level_1_to_5,primary_financial_stressor,daily_allowance_adequacy,student_part_time_work_status,voucher_subsidy_status,unpaid_balance_php,overdue_installments,promissory_note_active,alumni_grant_eligible,financial_assistance_recommendation
109238475001,Jerome Santos,12500,₱10,000 - ₱24,999 (Lower Middle),true,Tricycle / PUV Driver,5,Overdue Tuition & Exam Permit Insecurity,Inadequate / Skips Commute or Meals (<₱50/day),Working Student (15-25 hrs/wk - High Fatigue Burden),Non-Voucher / Private Payer,18500,3,true,true,Award SAPC Emergency Tuition Relief Grant and restructure remaining balance into manageable zero-interest installments.
109238475002,Maria Clara Reyes,22000,₱10,000 - ₱24,999 (Lower Middle),false,Service Industry / Fast Food Crew,3,Uniform & Textbook Expenses,Tight (₱50-₱80/day),None / Full-time Student,Partial Subsidy,4500,1,true,true,Provide flexible installment catch-up schedule aligned with guardian salary payout cycles.
109238475003,Joshua Dimaculangan,8500,Below ₱10,000 (Low Income),true,Construction Daily Laborer,5,Household Debt & Micro-loan Obligations,Inadequate / Skips Commute or Meals (<₱50/day),Working Student (15-25 hrs/wk - High Fatigue Burden),Alumni Grantee,22000,4,true,true,Endorse student for Alumni Educational Assistance Subsidy and provide subsidized daily meal coupons.
109238475004,Samantha Nicole Reyes,32000,₱25,000 - ₱49,999 (Middle),false,Private Sector Office Staff,3,Project & Special School Requirement Fees,Tight (₱50-₱80/day),None / Full-time Student,Full DepEd SHS Voucher,0,0,false,false,Recommend application for ESC tuition top-up grant and school supply material subsidy.
109238475005,Christian Bautista,65000,₱50,000+ (Upper Middle/High),false,Government Employee / Licensed Teacher,1,None / Stable Finances,Adequate (₱100+/day),None / Full-time Student,ESC Scholar,0,0,false,false,Financial profile in good standing. DepEd voucher / ESC scholarship active.`
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
    description: "Ingests 17 home environment predictors: birth order / eldest child burden, OFW parent distance, marital & single-parent status, 4Ps economic aid, living arrangement stability, caregiver relationship, income bracket, parental education, guardian responsiveness, PTA attendance, and domestic distress indicators.",
    csvFileName: "SAPC_Family_Social_Support_Template.csv",
    fullDatasetUrl: "/samples/sapc_500_family_social_support.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "birth_order",
      "is_eldest_child",
      "siblings_count",
      "ofw_parent_status",
      "parent_marital_status",
      "single_parent_status",
      "living_arrangement",
      "is_4ps_beneficiary",
      "primary_caregiver_relationship",
      "household_monthly_income_bracket",
      "parent_educational_attainment",
      "guardian_contact_rating",
      "parent_conference_attended",
      "domestic_distress_flag",
      "adviser_notes"
    ],
    sampleData: `lrn,student_name,birth_order,is_eldest_child,siblings_count,ofw_parent_status,parent_marital_status,single_parent_status,living_arrangement,is_4ps_beneficiary,primary_caregiver_relationship,household_monthly_income_bracket,parent_educational_attainment,guardian_contact_rating,parent_conference_attended,domestic_distress_flag,adviser_notes
109238475001,Jerome Santos,Eldest,true,5,Both Parents OFW,Married / Intact,false,With Grandparents,true,Grandmother,Below ₱10,000 (Low Income),High School,Unresponsive,false,true,Eldest child caring for 4 siblings while parents work overseas; high household burden
109238475002,Maria Clara Reyes,Middle,false,2,One Parent OFW,Separated / Annulled,true,With Mother Only,false,Mother,₱10,000 - ₱24,999 (Lower Middle),College Degree,Moderate,true,false,Single mother working irregular shifts; student assists with younger sibling
109238475003,Joshua Dimaculangan,Eldest,true,3,Both Parents OFW,Married / Intact,false,With Grandparents,true,Grandmother,Below ₱10,000 (Low Income),Elementary,Low,false,true,Lives with elderly grandmother; student shows acute stress due to financial and sibling obligations
109238475004,Samantha Nicole Reyes,Youngest,false,1,None,Separated / Annulled,true,With Mother Only,false,Mother,₱25,000 - ₱49,999 (Middle),College Degree,Moderate,true,false,Recent parental separation causing emotional distress; regular adviser check-in scheduled
109238475005,Christian Bautista,Only Child,false,0,None,Married / Intact,false,With Both Parents,false,Both Parents,₱50,000+ (Upper Middle/High),Postgraduate,High,true,false,Very supportive home environment; parents actively monitor academic milestones`
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
    description: "Ingests physical health status, chronic illness indicators (asthma, anemia, migraine), clinic visit frequency, medical absences, nutrition quality & meal patterns (affects cognitive function), sleep duration & quality (linked to academic performance), and daytime fatigue flags.",
    csvFileName: "SAPC_Clinic_Health_Records_Template.csv",
    fullDatasetUrl: "/samples/sapc_500_clinic_health_records.csv",
    requiredColumns: [
      "lrn",
      "student_name",
      "general_physical_health_status",
      "chronic_condition",
      "quarterly_clinic_visits",
      "medical_absences_count",
      "physical_activity_clearance",
      "bmi_category",
      "daily_meal_frequency",
      "nutrition_quality_score_1_to_5",
      "breakfast_consistency",
      "avg_sleep_hours_per_night",
      "sleep_quality_rating",
      "daytime_fatigue_or_somnolence",
      "visual_or_hearing_impairment",
      "clinic_nurse_remarks"
    ],
    sampleData: `lrn,student_name,general_physical_health_status,chronic_condition,quarterly_clinic_visits,medical_absences_count,physical_activity_clearance,bmi_category,daily_meal_frequency,nutrition_quality_score_1_to_5,breakfast_consistency,avg_sleep_hours_per_night,sleep_quality_rating,daytime_fatigue_or_somnolence,visual_or_hearing_impairment,clinic_nurse_remarks
109238475001,Jerome Santos,Fair,Bronchial Asthma,4,3,Restricted (PE Modified),Underweight / Malnourished,2 Meals (Skips Breakfast),2,Rarely / Skips Breakfast,4.8,Severely Deprived (<5 hrs),Frequent Daytime Drowsiness (Falls Asleep in Class),None,Recurrent asthma flare-ups and severe sleep deprivation; student skips breakfast and exhibits cognitive fatigue
109238475002,Maria Clara Reyes,Good,None,1,0,Cleared,Normal,3 Regular Meals + Snacks,4,Daily,7.5,Good / Restful,None,None,Annual physical and dental examination cleared; healthy endurance in PE activities
109238475003,Joshua Dimaculangan,Poor,Chronic Tension Headaches / Migraine,5,4,Restricted (PE Modified),Normal,2 Meals (Skips Breakfast),2,Rarely / Skips Breakfast,4.2,Severely Deprived (<5 hrs),Frequent Daytime Drowsiness (Falls Asleep in Class),None,Severe tension headaches triggered by chronic sleep deprivation and exam stress; advised clinic rest
109238475004,Samantha Nicole Reyes,Fair,Gastritis / Acid Reflux,3,2,Cleared,Underweight / Malnourished,2 Meals (Skips Breakfast),3,Frequent (3-4 days/wk),5.8,Moderate / Intermittent,Occasional Afternoon Slump,None,Gastritis complaints linked to skipped morning meals; nurse provided nutritional guidance
109238475005,Christian Bautista,Excellent,None,0,0,Cleared,Normal,3 Regular Meals + Snacks,5,Daily,8.2,Good / Restful,None,None,Exemplary physical wellness, active varsity clearance, and consistent 8-hour sleep routine`
  }
};
