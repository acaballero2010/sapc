// Auto-generated 503 SAPC Junior High School Parent / Guardian Registry
export interface ParentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  linkedStudentName: string;
  linkedLRN: string;
  linkedLRNs?: string[];
  linkedStudentNames?: string[];
  section: string;
  gradeLevel: string;
  status: "Active" | "Pending Activation" | "Suspended";
  verifiedAt: string;
  sf9Access: boolean;
  attendanceAlerts: boolean;
  riskAlerts: boolean;
  initialPassword?: string;
}

export const SAPC_503_PARENTS: ParentRecord[] = [
  {
    "id": "PAR-001",
    "name": "Mrs. Elena Dimaculangan",
    "email": "parent@sapc.edu.ph",
    "phone": "+63 917 555 0192",
    "relationship": "Mother",
    "linkedStudentName": "Joshua Dimaculangan",
    "linkedLRN": "109238475612",
    "linkedLRNs": [
      "109238475612"
    ],
    "linkedStudentNames": [
      "Joshua Dimaculangan"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P5612!"
  },
  {
    "id": "PAR-002",
    "name": "Mr. Roberto Dela Cruz",
    "email": "parent.109238475613@parent.sapc.edu.ph",
    "phone": "+63 918 333 4444",
    "relationship": "Father",
    "linkedStudentName": "Angelica Dela Cruz",
    "linkedLRN": "109238475613",
    "linkedLRNs": [
      "109238475613"
    ],
    "linkedStudentNames": [
      "Angelica Dela Cruz"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P5613!"
  },
  {
    "id": "PAR-003",
    "name": "Mrs. Carmela Reyes",
    "email": "parent.109238475614@parent.sapc.edu.ph",
    "phone": "+63 919 444 5555",
    "relationship": "Mother",
    "linkedStudentName": "Mark Anthony Reyes",
    "linkedLRN": "109238475614",
    "linkedLRNs": [
      "109238475614"
    ],
    "linkedStudentNames": [
      "Mark Anthony Reyes"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P5614!"
  },
  {
    "id": "PAR-004",
    "name": "Mr. Ferdinand Bautista",
    "email": "parent.109238470001@parent.sapc.edu.ph",
    "phone": "+63 918 697 338",
    "relationship": "Father",
    "linkedStudentName": "Erika Bautista",
    "linkedLRN": "109238470001",
    "linkedLRNs": [
      "109238470001"
    ],
    "linkedStudentNames": [
      "Erika Bautista"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0001!"
  },
  {
    "id": "PAR-005",
    "name": "Mrs. Carmela Garcia",
    "email": "parent.109238470002@parent.sapc.edu.ph",
    "phone": "+63 918 698 675",
    "relationship": "Mother",
    "linkedStudentName": "Althea Garcia",
    "linkedLRN": "109238470002",
    "linkedLRNs": [
      "109238470002"
    ],
    "linkedStudentNames": [
      "Althea Garcia"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0002!"
  },
  {
    "id": "PAR-006",
    "name": "Mr. Carlos Padilla",
    "email": "parent.109238470003@parent.sapc.edu.ph",
    "phone": "+63 918 700 012",
    "relationship": "Father",
    "linkedStudentName": "Angela Padilla",
    "linkedLRN": "109238470003",
    "linkedLRNs": [
      "109238470003"
    ],
    "linkedStudentNames": [
      "Angela Padilla"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0003!"
  },
  {
    "id": "PAR-007",
    "name": "Mrs. Rosalinda Salazar",
    "email": "parent.109238470004@parent.sapc.edu.ph",
    "phone": "+63 918 701 349",
    "relationship": "Mother",
    "linkedStudentName": "Angelica Salazar",
    "linkedLRN": "109238470004",
    "linkedLRNs": [
      "109238470004"
    ],
    "linkedStudentNames": [
      "Angelica Salazar"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0004!"
  },
  {
    "id": "PAR-008",
    "name": "Mr. Danilo De Leon",
    "email": "parent.109238470005@parent.sapc.edu.ph",
    "phone": "+63 918 702 686",
    "relationship": "Father",
    "linkedStudentName": "Chloe De Leon",
    "linkedLRN": "109238470005",
    "linkedLRNs": [
      "109238470005"
    ],
    "linkedStudentNames": [
      "Chloe De Leon"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0005!"
  },
  {
    "id": "PAR-009",
    "name": "Mrs. Josephine San Jose",
    "email": "parent.109238470006@parent.sapc.edu.ph",
    "phone": "+63 918 704 023",
    "relationship": "Mother",
    "linkedStudentName": "Luis San Jose",
    "linkedLRN": "109238470006",
    "linkedLRNs": [
      "109238470006"
    ],
    "linkedStudentNames": [
      "Luis San Jose"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0006!"
  },
  {
    "id": "PAR-010",
    "name": "Mr. Reynaldo Tolentino",
    "email": "parent.109238470007@parent.sapc.edu.ph",
    "phone": "+63 918 705 360",
    "relationship": "Father",
    "linkedStudentName": "Patricia Tolentino",
    "linkedLRN": "109238470007",
    "linkedLRNs": [
      "109238470007"
    ],
    "linkedStudentNames": [
      "Patricia Tolentino"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0007!"
  },
  {
    "id": "PAR-011",
    "name": "Mrs. Remedios Mercado",
    "email": "parent.109238470008@parent.sapc.edu.ph",
    "phone": "+63 918 706 697",
    "relationship": "Mother",
    "linkedStudentName": "Mariel Mercado",
    "linkedLRN": "109238470008",
    "linkedLRNs": [
      "109238470008"
    ],
    "linkedStudentNames": [
      "Mariel Mercado"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0008!"
  },
  {
    "id": "PAR-012",
    "name": "Mr. Renato Santos",
    "email": "parent.109238470009@parent.sapc.edu.ph",
    "phone": "+63 918 708 034",
    "relationship": "Father",
    "linkedStudentName": "Chloe Santos",
    "linkedLRN": "109238470009",
    "linkedLRNs": [
      "109238470009"
    ],
    "linkedStudentNames": [
      "Chloe Santos"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0009!"
  },
  {
    "id": "PAR-013",
    "name": "Mrs. Flordeliza Domingo",
    "email": "parent.109238470010@parent.sapc.edu.ph",
    "phone": "+63 918 709 371",
    "relationship": "Mother",
    "linkedStudentName": "Patricia Domingo",
    "linkedLRN": "109238470010",
    "linkedLRNs": [
      "109238470010"
    ],
    "linkedStudentNames": [
      "Patricia Domingo"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0010!"
  },
  {
    "id": "PAR-014",
    "name": "Mr. Rodolfo Castillo",
    "email": "parent.109238470011@parent.sapc.edu.ph",
    "phone": "+63 918 710 708",
    "relationship": "Father",
    "linkedStudentName": "Joshua Castillo",
    "linkedLRN": "109238470011",
    "linkedLRNs": [
      "109238470011"
    ],
    "linkedStudentNames": [
      "Joshua Castillo"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0011!"
  },
  {
    "id": "PAR-015",
    "name": "Mrs. Cynthia De Leon",
    "email": "parent.109238470012@parent.sapc.edu.ph",
    "phone": "+63 918 712 045",
    "relationship": "Mother",
    "linkedStudentName": "Faith De Leon",
    "linkedLRN": "109238470012",
    "linkedLRNs": [
      "109238470012"
    ],
    "linkedStudentNames": [
      "Faith De Leon"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0012!"
  },
  {
    "id": "PAR-016",
    "name": "Mr. Nestor Corpuz",
    "email": "parent.109238470013@parent.sapc.edu.ph",
    "phone": "+63 918 713 382",
    "relationship": "Father",
    "linkedStudentName": "Patricia Corpuz",
    "linkedLRN": "109238470013",
    "linkedLRNs": [
      "109238470013"
    ],
    "linkedStudentNames": [
      "Patricia Corpuz"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0013!"
  },
  {
    "id": "PAR-017",
    "name": "Mrs. Shirley Castro",
    "email": "parent.109238470014@parent.sapc.edu.ph",
    "phone": "+63 918 714 719",
    "relationship": "Mother",
    "linkedStudentName": "Camille Castro",
    "linkedLRN": "109238470014",
    "linkedLRNs": [
      "109238470014"
    ],
    "linkedStudentNames": [
      "Camille Castro"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0014!"
  },
  {
    "id": "PAR-018",
    "name": "Mr. Jaime Flores",
    "email": "parent.109238470015@parent.sapc.edu.ph",
    "phone": "+63 918 716 056",
    "relationship": "Father",
    "linkedStudentName": "Kyle Flores",
    "linkedLRN": "109238470015",
    "linkedLRNs": [
      "109238470015"
    ],
    "linkedStudentNames": [
      "Kyle Flores"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0015!"
  },
  {
    "id": "PAR-019",
    "name": "Mrs. Jennifer Dela Cruz",
    "email": "parent.109238470016@parent.sapc.edu.ph",
    "phone": "+63 918 717 393",
    "relationship": "Mother",
    "linkedStudentName": "Mariel Dela Cruz",
    "linkedLRN": "109238470016",
    "linkedLRNs": [
      "109238470016"
    ],
    "linkedStudentNames": [
      "Mariel Dela Cruz"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0016!"
  },
  {
    "id": "PAR-020",
    "name": "Mr. Cesar Navarro",
    "email": "parent.109238470017@parent.sapc.edu.ph",
    "phone": "+63 918 718 730",
    "relationship": "Father",
    "linkedStudentName": "Erika Navarro",
    "linkedLRN": "109238470017",
    "linkedLRNs": [
      "109238470017"
    ],
    "linkedStudentNames": [
      "Erika Navarro"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0017!"
  },
  {
    "id": "PAR-021",
    "name": "Mrs. Grace Manalo",
    "email": "parent.109238470018@parent.sapc.edu.ph",
    "phone": "+63 918 720 067",
    "relationship": "Mother",
    "linkedStudentName": "Joy Manalo",
    "linkedLRN": "109238470018",
    "linkedLRNs": [
      "109238470018"
    ],
    "linkedStudentNames": [
      "Joy Manalo"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0018!"
  },
  {
    "id": "PAR-022",
    "name": "Mr. Arnel Torres",
    "email": "parent.109238470019@parent.sapc.edu.ph",
    "phone": "+63 918 721 404",
    "relationship": "Father",
    "linkedStudentName": "Tristan Torres",
    "linkedLRN": "109238470019",
    "linkedLRNs": [
      "109238470019"
    ],
    "linkedStudentNames": [
      "Tristan Torres"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0019!"
  },
  {
    "id": "PAR-023",
    "name": "Mrs. Gina Cruz",
    "email": "parent.109238470020@parent.sapc.edu.ph",
    "phone": "+63 918 722 741",
    "relationship": "Mother",
    "linkedStudentName": "Francis Cruz",
    "linkedLRN": "109238470020",
    "linkedLRNs": [
      "109238470020"
    ],
    "linkedStudentNames": [
      "Francis Cruz"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0020!"
  },
  {
    "id": "PAR-024",
    "name": "Mr. Roberto Valdez",
    "email": "parent.109238470021@parent.sapc.edu.ph",
    "phone": "+63 918 724 078",
    "relationship": "Father",
    "linkedStudentName": "Therese Valdez",
    "linkedLRN": "109238470021",
    "linkedLRNs": [
      "109238470021"
    ],
    "linkedStudentNames": [
      "Therese Valdez"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0021!"
  },
  {
    "id": "PAR-025",
    "name": "Mrs. Teresa Navarro",
    "email": "parent.109238470022@parent.sapc.edu.ph",
    "phone": "+63 918 725 415",
    "relationship": "Mother",
    "linkedStudentName": "Lance Navarro",
    "linkedLRN": "109238470022",
    "linkedLRNs": [
      "109238470022"
    ],
    "linkedStudentNames": [
      "Lance Navarro"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0022!"
  },
  {
    "id": "PAR-026",
    "name": "Mr. Edgardo Reyes",
    "email": "parent.109238470023@parent.sapc.edu.ph",
    "phone": "+63 918 726 752",
    "relationship": "Father",
    "linkedStudentName": "Jasmine Reyes",
    "linkedLRN": "109238470023",
    "linkedLRNs": [
      "109238470023"
    ],
    "linkedStudentNames": [
      "Jasmine Reyes"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0023!"
  },
  {
    "id": "PAR-027",
    "name": "Mrs. Corazon Morales",
    "email": "parent.109238470024@parent.sapc.edu.ph",
    "phone": "+63 918 728 089",
    "relationship": "Mother",
    "linkedStudentName": "John Carlo Morales",
    "linkedLRN": "109238470024",
    "linkedLRNs": [
      "109238470024"
    ],
    "linkedStudentNames": [
      "John Carlo Morales"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0024!"
  },
  {
    "id": "PAR-028",
    "name": "Mr. Rolando Aquino",
    "email": "parent.109238470025@parent.sapc.edu.ph",
    "phone": "+63 918 729 426",
    "relationship": "Father",
    "linkedStudentName": "Angelica Aquino",
    "linkedLRN": "109238470025",
    "linkedLRNs": [
      "109238470025"
    ],
    "linkedStudentNames": [
      "Angelica Aquino"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0025!"
  },
  {
    "id": "PAR-029",
    "name": "Mrs. Rowena Valdez",
    "email": "parent.109238470026@parent.sapc.edu.ph",
    "phone": "+63 918 730 763",
    "relationship": "Mother",
    "linkedStudentName": "John Carlo Valdez",
    "linkedLRN": "109238470026",
    "linkedLRNs": [
      "109238470026"
    ],
    "linkedStudentNames": [
      "John Carlo Valdez"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0026!"
  },
  {
    "id": "PAR-030",
    "name": "Mr. Ramon Aquino",
    "email": "parent.109238470027@parent.sapc.edu.ph",
    "phone": "+63 918 732 100",
    "relationship": "Father",
    "linkedStudentName": "Hannah Aquino",
    "linkedLRN": "109238470027",
    "linkedLRNs": [
      "109238470027"
    ],
    "linkedStudentNames": [
      "Hannah Aquino"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0027!"
  },
  {
    "id": "PAR-031",
    "name": "Mrs. Lorna Cruz",
    "email": "parent.109238470028@parent.sapc.edu.ph",
    "phone": "+63 918 733 437",
    "relationship": "Mother",
    "linkedStudentName": "Nicole Cruz",
    "linkedLRN": "109238470028",
    "linkedLRNs": [
      "109238470028"
    ],
    "linkedStudentNames": [
      "Nicole Cruz"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0028!"
  },
  {
    "id": "PAR-032",
    "name": "Mr. Antonio Flores",
    "email": "parent.109238470029@parent.sapc.edu.ph",
    "phone": "+63 918 734 774",
    "relationship": "Father",
    "linkedStudentName": "Bianca Flores",
    "linkedLRN": "109238470029",
    "linkedLRNs": [
      "109238470029"
    ],
    "linkedStudentNames": [
      "Bianca Flores"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0029!"
  },
  {
    "id": "PAR-033",
    "name": "Mrs. Mary Ann Reyes",
    "email": "parent.109238470030@parent.sapc.edu.ph",
    "phone": "+63 918 736 111",
    "relationship": "Mother",
    "linkedStudentName": "Nathan Reyes",
    "linkedLRN": "109238470030",
    "linkedLRNs": [
      "109238470030"
    ],
    "linkedStudentNames": [
      "Nathan Reyes"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0030!"
  },
  {
    "id": "PAR-034",
    "name": "Mr. Eduardo Alcantara",
    "email": "parent.109238470031@parent.sapc.edu.ph",
    "phone": "+63 918 737 448",
    "relationship": "Father",
    "linkedStudentName": "Francis Alcantara",
    "linkedLRN": "109238470031",
    "linkedLRNs": [
      "109238470031"
    ],
    "linkedStudentNames": [
      "Francis Alcantara"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0031!"
  },
  {
    "id": "PAR-035",
    "name": "Mrs. Jocelyn Gonzales",
    "email": "parent.109238470032@parent.sapc.edu.ph",
    "phone": "+63 918 738 785",
    "relationship": "Mother",
    "linkedStudentName": "Lance Gonzales",
    "linkedLRN": "109238470032",
    "linkedLRNs": [
      "109238470032"
    ],
    "linkedStudentNames": [
      "Lance Gonzales"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0032!"
  },
  {
    "id": "PAR-036",
    "name": "Mr. Wilfredo Flores",
    "email": "parent.109238470033@parent.sapc.edu.ph",
    "phone": "+63 918 740 122",
    "relationship": "Father",
    "linkedStudentName": "Gabriel Flores",
    "linkedLRN": "109238470033",
    "linkedLRNs": [
      "109238470033"
    ],
    "linkedStudentNames": [
      "Gabriel Flores"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0033!"
  },
  {
    "id": "PAR-037",
    "name": "Mrs. Elizabeth Dela Cruz",
    "email": "parent.109238470034@parent.sapc.edu.ph",
    "phone": "+63 918 741 459",
    "relationship": "Mother",
    "linkedStudentName": "Bernadette Dela Cruz",
    "linkedLRN": "109238470034",
    "linkedLRNs": [
      "109238470034"
    ],
    "linkedStudentNames": [
      "Bernadette Dela Cruz"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0034!"
  },
  {
    "id": "PAR-038",
    "name": "Mr. Victor Navarro",
    "email": "parent.109238470035@parent.sapc.edu.ph",
    "phone": "+63 918 742 796",
    "relationship": "Father",
    "linkedStudentName": "Chloe Navarro",
    "linkedLRN": "109238470035",
    "linkedLRNs": [
      "109238470035"
    ],
    "linkedStudentNames": [
      "Chloe Navarro"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0035!"
  },
  {
    "id": "PAR-039",
    "name": "Mrs. Imelda Aquino",
    "email": "parent.109238470036@parent.sapc.edu.ph",
    "phone": "+63 918 744 133",
    "relationship": "Mother",
    "linkedStudentName": "Maria Clara Aquino",
    "linkedLRN": "109238470036",
    "linkedLRNs": [
      "109238470036"
    ],
    "linkedStudentNames": [
      "Maria Clara Aquino"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0036!"
  },
  {
    "id": "PAR-040",
    "name": "Mr. Gabriel Pascual",
    "email": "parent.109238470037@parent.sapc.edu.ph",
    "phone": "+63 918 745 470",
    "relationship": "Father",
    "linkedStudentName": "Bernadette Pascual",
    "linkedLRN": "109238470037",
    "linkedLRNs": [
      "109238470037"
    ],
    "linkedStudentNames": [
      "Bernadette Pascual"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0037!"
  },
  {
    "id": "PAR-041",
    "name": "Mrs. Bernadette Alcantara",
    "email": "parent.109238470038@parent.sapc.edu.ph",
    "phone": "+63 918 746 807",
    "relationship": "Mother",
    "linkedStudentName": "Therese Alcantara",
    "linkedLRN": "109238470038",
    "linkedLRNs": [
      "109238470038"
    ],
    "linkedStudentNames": [
      "Therese Alcantara"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0038!"
  },
  {
    "id": "PAR-042",
    "name": "Mr. Manuel De Leon",
    "email": "parent.109238470039@parent.sapc.edu.ph",
    "phone": "+63 918 748 144",
    "relationship": "Father",
    "linkedStudentName": "Vanessa De Leon",
    "linkedLRN": "109238470039",
    "linkedLRNs": [
      "109238470039"
    ],
    "linkedStudentNames": [
      "Vanessa De Leon"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0039!"
  },
  {
    "id": "PAR-043",
    "name": "Mrs. Cristina Mercado",
    "email": "parent.109238470040@parent.sapc.edu.ph",
    "phone": "+63 918 749 481",
    "relationship": "Mother",
    "linkedStudentName": "Hannah Mercado",
    "linkedLRN": "109238470040",
    "linkedLRNs": [
      "109238470040"
    ],
    "linkedStudentNames": [
      "Hannah Mercado"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0040!"
  },
  {
    "id": "PAR-044",
    "name": "Mr. Mario Cruz",
    "email": "parent.109238470041@parent.sapc.edu.ph",
    "phone": "+63 918 750 818",
    "relationship": "Father",
    "linkedStudentName": "Angelo Cruz",
    "linkedLRN": "109238470041",
    "linkedLRNs": [
      "109238470041"
    ],
    "linkedStudentNames": [
      "Angelo Cruz"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0041!"
  },
  {
    "id": "PAR-045",
    "name": "Mrs. Lourdes Morales",
    "email": "parent.109238470042@parent.sapc.edu.ph",
    "phone": "+63 918 752 155",
    "relationship": "Mother",
    "linkedStudentName": "Joaquin Morales",
    "linkedLRN": "109238470042",
    "linkedLRNs": [
      "109238470042"
    ],
    "linkedStudentNames": [
      "Joaquin Morales"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0042!"
  },
  {
    "id": "PAR-046",
    "name": "Mr. Gerardo Dela Cruz",
    "email": "parent.109238470043@parent.sapc.edu.ph",
    "phone": "+63 918 753 492",
    "relationship": "Father",
    "linkedStudentName": "Andrea Dela Cruz",
    "linkedLRN": "109238470043",
    "linkedLRNs": [
      "109238470043"
    ],
    "linkedStudentNames": [
      "Andrea Dela Cruz"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0043!"
  },
  {
    "id": "PAR-047",
    "name": "Mrs. Elena Mercado",
    "email": "parent.109238470044@parent.sapc.edu.ph",
    "phone": "+63 918 754 829",
    "relationship": "Mother",
    "linkedStudentName": "Patricia Mercado",
    "linkedLRN": "109238470044",
    "linkedLRNs": [
      "109238470044"
    ],
    "linkedStudentNames": [
      "Patricia Mercado"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0044!"
  },
  {
    "id": "PAR-048",
    "name": "Mr. Ernesto Reyes",
    "email": "parent.109238470045@parent.sapc.edu.ph",
    "phone": "+63 918 756 166",
    "relationship": "Father",
    "linkedStudentName": "Gabriel Reyes",
    "linkedLRN": "109238470045",
    "linkedLRNs": [
      "109238470045"
    ],
    "linkedStudentNames": [
      "Gabriel Reyes"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0045!"
  },
  {
    "id": "PAR-049",
    "name": "Mrs. Maricel Padilla",
    "email": "parent.109238470046@parent.sapc.edu.ph",
    "phone": "+63 918 757 503",
    "relationship": "Mother",
    "linkedStudentName": "Jasmine Padilla",
    "linkedLRN": "109238470046",
    "linkedLRNs": [
      "109238470046"
    ],
    "linkedStudentNames": [
      "Jasmine Padilla"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0046!"
  },
  {
    "id": "PAR-050",
    "name": "Mr. Ferdinand Pascual",
    "email": "parent.109238470047@parent.sapc.edu.ph",
    "phone": "+63 918 758 840",
    "relationship": "Father",
    "linkedStudentName": "Mariel Pascual",
    "linkedLRN": "109238470047",
    "linkedLRNs": [
      "109238470047"
    ],
    "linkedStudentNames": [
      "Mariel Pascual"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0047!"
  },
  {
    "id": "PAR-051",
    "name": "Mrs. Carmela Domingo",
    "email": "parent.109238470048@parent.sapc.edu.ph",
    "phone": "+63 918 760 177",
    "relationship": "Mother",
    "linkedStudentName": "Jose Domingo",
    "linkedLRN": "109238470048",
    "linkedLRNs": [
      "109238470048"
    ],
    "linkedStudentNames": [
      "Jose Domingo"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0048!"
  },
  {
    "id": "PAR-052",
    "name": "Mr. Carlos Dizon",
    "email": "parent.109238470049@parent.sapc.edu.ph",
    "phone": "+63 918 761 514",
    "relationship": "Father",
    "linkedStudentName": "Chloe Dizon",
    "linkedLRN": "109238470049",
    "linkedLRNs": [
      "109238470049"
    ],
    "linkedStudentNames": [
      "Chloe Dizon"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0049!"
  },
  {
    "id": "PAR-053",
    "name": "Mrs. Rosalinda Bautista",
    "email": "parent.109238470050@parent.sapc.edu.ph",
    "phone": "+63 918 762 851",
    "relationship": "Mother",
    "linkedStudentName": "Kathryn Bautista",
    "linkedLRN": "109238470050",
    "linkedLRNs": [
      "109238470050"
    ],
    "linkedStudentNames": [
      "Kathryn Bautista"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0050!"
  },
  {
    "id": "PAR-054",
    "name": "Mr. Danilo Manalo",
    "email": "parent.109238470051@parent.sapc.edu.ph",
    "phone": "+63 918 764 188",
    "relationship": "Father",
    "linkedStudentName": "Christian Manalo",
    "linkedLRN": "109238470051",
    "linkedLRNs": [
      "109238470051"
    ],
    "linkedStudentNames": [
      "Christian Manalo"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0051!"
  },
  {
    "id": "PAR-055",
    "name": "Mrs. Josephine Villanueva",
    "email": "parent.109238470052@parent.sapc.edu.ph",
    "phone": "+63 918 765 525",
    "relationship": "Mother",
    "linkedStudentName": "Jerome Villanueva",
    "linkedLRN": "109238470052",
    "linkedLRNs": [
      "109238470052"
    ],
    "linkedStudentNames": [
      "Jerome Villanueva"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0052!"
  },
  {
    "id": "PAR-056",
    "name": "Mr. Reynaldo Valdez",
    "email": "parent.109238470053@parent.sapc.edu.ph",
    "phone": "+63 918 766 862",
    "relationship": "Father",
    "linkedStudentName": "Karl Valdez",
    "linkedLRN": "109238470053",
    "linkedLRNs": [
      "109238470053"
    ],
    "linkedStudentNames": [
      "Karl Valdez"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0053!"
  },
  {
    "id": "PAR-057",
    "name": "Mrs. Remedios Dela Cruz",
    "email": "parent.109238470054@parent.sapc.edu.ph",
    "phone": "+63 918 768 199",
    "relationship": "Mother",
    "linkedStudentName": "Ethan Dela Cruz",
    "linkedLRN": "109238470054",
    "linkedLRNs": [
      "109238470054"
    ],
    "linkedStudentNames": [
      "Ethan Dela Cruz"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0054!"
  },
  {
    "id": "PAR-058",
    "name": "Mr. Renato Tolentino",
    "email": "parent.109238470055@parent.sapc.edu.ph",
    "phone": "+63 918 769 536",
    "relationship": "Father",
    "linkedStudentName": "Rochelle Tolentino",
    "linkedLRN": "109238470055",
    "linkedLRNs": [
      "109238470055"
    ],
    "linkedStudentNames": [
      "Rochelle Tolentino"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0055!"
  },
  {
    "id": "PAR-059",
    "name": "Mrs. Flordeliza Mercado",
    "email": "parent.109238470056@parent.sapc.edu.ph",
    "phone": "+63 918 770 873",
    "relationship": "Mother",
    "linkedStudentName": "Chloe Mercado",
    "linkedLRN": "109238470056",
    "linkedLRNs": [
      "109238470056"
    ],
    "linkedStudentNames": [
      "Chloe Mercado"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0056!"
  },
  {
    "id": "PAR-060",
    "name": "Mr. Rodolfo De Leon",
    "email": "parent.109238470057@parent.sapc.edu.ph",
    "phone": "+63 918 772 210",
    "relationship": "Father",
    "linkedStudentName": "Cecilia De Leon",
    "linkedLRN": "109238470057",
    "linkedLRNs": [
      "109238470057"
    ],
    "linkedStudentNames": [
      "Cecilia De Leon"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0057!"
  },
  {
    "id": "PAR-061",
    "name": "Mrs. Cynthia Pascual",
    "email": "parent.109238470058@parent.sapc.edu.ph",
    "phone": "+63 918 773 547",
    "relationship": "Mother",
    "linkedStudentName": "Simon Pascual",
    "linkedLRN": "109238470058",
    "linkedLRNs": [
      "109238470058"
    ],
    "linkedStudentNames": [
      "Simon Pascual"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0058!"
  },
  {
    "id": "PAR-062",
    "name": "Mr. Nestor Torres",
    "email": "parent.109238470059@parent.sapc.edu.ph",
    "phone": "+63 918 774 884",
    "relationship": "Father",
    "linkedStudentName": "Mark Torres",
    "linkedLRN": "109238470059",
    "linkedLRNs": [
      "109238470059"
    ],
    "linkedStudentNames": [
      "Mark Torres"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0059!"
  },
  {
    "id": "PAR-063",
    "name": "Mrs. Shirley Domingo",
    "email": "parent.109238470060@parent.sapc.edu.ph",
    "phone": "+63 918 776 221",
    "relationship": "Mother",
    "linkedStudentName": "Rochelle Domingo",
    "linkedLRN": "109238470060",
    "linkedLRNs": [
      "109238470060"
    ],
    "linkedStudentNames": [
      "Rochelle Domingo"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0060!"
  },
  {
    "id": "PAR-064",
    "name": "Mr. Jaime Tolentino",
    "email": "parent.109238470061@parent.sapc.edu.ph",
    "phone": "+63 918 777 558",
    "relationship": "Father",
    "linkedStudentName": "Mariel Tolentino",
    "linkedLRN": "109238470061",
    "linkedLRNs": [
      "109238470061"
    ],
    "linkedStudentNames": [
      "Mariel Tolentino"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0061!"
  },
  {
    "id": "PAR-065",
    "name": "Mrs. Jennifer Ocampo",
    "email": "parent.109238470062@parent.sapc.edu.ph",
    "phone": "+63 918 778 895",
    "relationship": "Mother",
    "linkedStudentName": "Andrea Ocampo",
    "linkedLRN": "109238470062",
    "linkedLRNs": [
      "109238470062"
    ],
    "linkedStudentNames": [
      "Andrea Ocampo"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0062!"
  },
  {
    "id": "PAR-066",
    "name": "Mr. Cesar Santiago",
    "email": "parent.109238470063@parent.sapc.edu.ph",
    "phone": "+63 918 780 232",
    "relationship": "Father",
    "linkedStudentName": "Justin Santiago",
    "linkedLRN": "109238470063",
    "linkedLRNs": [
      "109238470063"
    ],
    "linkedStudentNames": [
      "Justin Santiago"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0063!"
  },
  {
    "id": "PAR-067",
    "name": "Mrs. Grace Villanueva",
    "email": "parent.109238470064@parent.sapc.edu.ph",
    "phone": "+63 918 781 569",
    "relationship": "Mother",
    "linkedStudentName": "Paolo Villanueva",
    "linkedLRN": "109238470064",
    "linkedLRNs": [
      "109238470064"
    ],
    "linkedStudentNames": [
      "Paolo Villanueva"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0064!"
  },
  {
    "id": "PAR-068",
    "name": "Mr. Arnel Alcantara",
    "email": "parent.109238470065@parent.sapc.edu.ph",
    "phone": "+63 918 782 906",
    "relationship": "Father",
    "linkedStudentName": "Diego Alcantara",
    "linkedLRN": "109238470065",
    "linkedLRNs": [
      "109238470065"
    ],
    "linkedStudentNames": [
      "Diego Alcantara"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0065!"
  },
  {
    "id": "PAR-069",
    "name": "Mrs. Gina Flores",
    "email": "parent.109238470066@parent.sapc.edu.ph",
    "phone": "+63 918 784 243",
    "relationship": "Mother",
    "linkedStudentName": "Angelo Flores",
    "linkedLRN": "109238470066",
    "linkedLRNs": [
      "109238470066"
    ],
    "linkedStudentNames": [
      "Angelo Flores"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0066!"
  },
  {
    "id": "PAR-070",
    "name": "Mr. Roberto Navarro",
    "email": "parent.109238470067@parent.sapc.edu.ph",
    "phone": "+63 918 785 580",
    "relationship": "Father",
    "linkedStudentName": "Joaquin Navarro",
    "linkedLRN": "109238470067",
    "linkedLRNs": [
      "109238470067"
    ],
    "linkedStudentNames": [
      "Joaquin Navarro"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0067!"
  },
  {
    "id": "PAR-071",
    "name": "Mrs. Teresa Villanueva",
    "email": "parent.109238470068@parent.sapc.edu.ph",
    "phone": "+63 918 786 917",
    "relationship": "Mother",
    "linkedStudentName": "Benedict Villanueva",
    "linkedLRN": "109238470068",
    "linkedLRNs": [
      "109238470068"
    ],
    "linkedStudentNames": [
      "Benedict Villanueva"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0068!"
  },
  {
    "id": "PAR-072",
    "name": "Mr. Edgardo San Jose",
    "email": "parent.109238470069@parent.sapc.edu.ph",
    "phone": "+63 918 788 254",
    "relationship": "Father",
    "linkedStudentName": "Andrea San Jose",
    "linkedLRN": "109238470069",
    "linkedLRNs": [
      "109238470069"
    ],
    "linkedStudentNames": [
      "Andrea San Jose"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0069!"
  },
  {
    "id": "PAR-073",
    "name": "Mrs. Corazon Ramos",
    "email": "parent.109238470070@parent.sapc.edu.ph",
    "phone": "+63 918 789 591",
    "relationship": "Mother",
    "linkedStudentName": "Erika Ramos",
    "linkedLRN": "109238470070",
    "linkedLRNs": [
      "109238470070"
    ],
    "linkedStudentNames": [
      "Erika Ramos"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0070!"
  },
  {
    "id": "PAR-074",
    "name": "Mr. Rolando Pascual",
    "email": "parent.109238470071@parent.sapc.edu.ph",
    "phone": "+63 918 790 928",
    "relationship": "Father",
    "linkedStudentName": "Angelo Pascual",
    "linkedLRN": "109238470071",
    "linkedLRNs": [
      "109238470071"
    ],
    "linkedStudentNames": [
      "Angelo Pascual"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0071!"
  },
  {
    "id": "PAR-075",
    "name": "Mrs. Rowena Garcia",
    "email": "parent.109238470072@parent.sapc.edu.ph",
    "phone": "+63 918 792 265",
    "relationship": "Mother",
    "linkedStudentName": "Lance Garcia",
    "linkedLRN": "109238470072",
    "linkedLRNs": [
      "109238470072"
    ],
    "linkedStudentNames": [
      "Lance Garcia"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0072!"
  },
  {
    "id": "PAR-076",
    "name": "Mr. Ramon Manalo",
    "email": "parent.109238470073@parent.sapc.edu.ph",
    "phone": "+63 918 793 602",
    "relationship": "Father",
    "linkedStudentName": "Anthony Manalo",
    "linkedLRN": "109238470073",
    "linkedLRNs": [
      "109238470073"
    ],
    "linkedStudentNames": [
      "Anthony Manalo"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0073!"
  },
  {
    "id": "PAR-077",
    "name": "Mrs. Lorna Bautista",
    "email": "parent.109238470074@parent.sapc.edu.ph",
    "phone": "+63 918 794 939",
    "relationship": "Mother",
    "linkedStudentName": "Matthew Bautista",
    "linkedLRN": "109238470074",
    "linkedLRNs": [
      "109238470074"
    ],
    "linkedStudentNames": [
      "Matthew Bautista"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0074!"
  },
  {
    "id": "PAR-078",
    "name": "Mr. Antonio Cruz",
    "email": "parent.109238470075@parent.sapc.edu.ph",
    "phone": "+63 918 796 276",
    "relationship": "Father",
    "linkedStudentName": "Erika Cruz",
    "linkedLRN": "109238470075",
    "linkedLRNs": [
      "109238470075"
    ],
    "linkedStudentNames": [
      "Erika Cruz"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0075!"
  },
  {
    "id": "PAR-079",
    "name": "Mrs. Mary Ann Soriano",
    "email": "parent.109238470076@parent.sapc.edu.ph",
    "phone": "+63 918 797 613",
    "relationship": "Mother",
    "linkedStudentName": "Liza Soriano",
    "linkedLRN": "109238470076",
    "linkedLRNs": [
      "109238470076"
    ],
    "linkedStudentNames": [
      "Liza Soriano"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0076!"
  },
  {
    "id": "PAR-080",
    "name": "Mr. Eduardo Castro",
    "email": "parent.109238470077@parent.sapc.edu.ph",
    "phone": "+63 918 798 950",
    "relationship": "Father",
    "linkedStudentName": "Therese Castro",
    "linkedLRN": "109238470077",
    "linkedLRNs": [
      "109238470077"
    ],
    "linkedStudentNames": [
      "Therese Castro"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0077!"
  },
  {
    "id": "PAR-081",
    "name": "Mrs. Jocelyn Gonzales",
    "email": "parent.109238470078@parent.sapc.edu.ph",
    "phone": "+63 918 800 287",
    "relationship": "Mother",
    "linkedStudentName": "Anthony Gonzales",
    "linkedLRN": "109238470078",
    "linkedLRNs": [
      "109238470078"
    ],
    "linkedStudentNames": [
      "Anthony Gonzales"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0078!"
  },
  {
    "id": "PAR-082",
    "name": "Mr. Wilfredo Corpuz",
    "email": "parent.109238470079@parent.sapc.edu.ph",
    "phone": "+63 918 801 624",
    "relationship": "Father",
    "linkedStudentName": "Joy Corpuz",
    "linkedLRN": "109238470079",
    "linkedLRNs": [
      "109238470079"
    ],
    "linkedStudentNames": [
      "Joy Corpuz"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0079!"
  },
  {
    "id": "PAR-083",
    "name": "Mrs. Elizabeth Salazar",
    "email": "parent.109238470080@parent.sapc.edu.ph",
    "phone": "+63 918 802 961",
    "relationship": "Mother",
    "linkedStudentName": "Daniel Salazar",
    "linkedLRN": "109238470080",
    "linkedLRNs": [
      "109238470080"
    ],
    "linkedStudentNames": [
      "Daniel Salazar"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0080!"
  },
  {
    "id": "PAR-084",
    "name": "Mr. Victor Castro",
    "email": "parent.109238470081@parent.sapc.edu.ph",
    "phone": "+63 918 804 298",
    "relationship": "Father",
    "linkedStudentName": "Simon Castro",
    "linkedLRN": "109238470081",
    "linkedLRNs": [
      "109238470081"
    ],
    "linkedStudentNames": [
      "Simon Castro"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0081!"
  },
  {
    "id": "PAR-085",
    "name": "Mrs. Imelda Lim",
    "email": "parent.109238470082@parent.sapc.edu.ph",
    "phone": "+63 918 805 635",
    "relationship": "Mother",
    "linkedStudentName": "Adrian Lim",
    "linkedLRN": "109238470082",
    "linkedLRNs": [
      "109238470082"
    ],
    "linkedStudentNames": [
      "Adrian Lim"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0082!"
  },
  {
    "id": "PAR-086",
    "name": "Mr. Gabriel Gonzales",
    "email": "parent.109238470083@parent.sapc.edu.ph",
    "phone": "+63 918 806 972",
    "relationship": "Father",
    "linkedStudentName": "Andrea Gonzales",
    "linkedLRN": "109238470083",
    "linkedLRNs": [
      "109238470083"
    ],
    "linkedStudentNames": [
      "Andrea Gonzales"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0083!"
  },
  {
    "id": "PAR-087",
    "name": "Mrs. Bernadette San Jose",
    "email": "parent.109238470084@parent.sapc.edu.ph",
    "phone": "+63 918 808 309",
    "relationship": "Mother",
    "linkedStudentName": "Trisha San Jose",
    "linkedLRN": "109238470084",
    "linkedLRNs": [
      "109238470084"
    ],
    "linkedStudentNames": [
      "Trisha San Jose"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0084!"
  },
  {
    "id": "PAR-088",
    "name": "Mr. Manuel Ocampo",
    "email": "parent.109238470085@parent.sapc.edu.ph",
    "phone": "+63 918 809 646",
    "relationship": "Father",
    "linkedStudentName": "Cecilia Ocampo",
    "linkedLRN": "109238470085",
    "linkedLRNs": [
      "109238470085"
    ],
    "linkedStudentNames": [
      "Cecilia Ocampo"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0085!"
  },
  {
    "id": "PAR-089",
    "name": "Mrs. Cristina Dimaculangan",
    "email": "parent.109238470086@parent.sapc.edu.ph",
    "phone": "+63 918 810 983",
    "relationship": "Mother",
    "linkedStudentName": "Sebastian Dimaculangan",
    "linkedLRN": "109238470086",
    "linkedLRNs": [
      "109238470086"
    ],
    "linkedStudentNames": [
      "Sebastian Dimaculangan"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0086!"
  },
  {
    "id": "PAR-090",
    "name": "Mr. Mario Ocampo",
    "email": "parent.109238470087@parent.sapc.edu.ph",
    "phone": "+63 918 812 320",
    "relationship": "Father",
    "linkedStudentName": "Mariel Ocampo",
    "linkedLRN": "109238470087",
    "linkedLRNs": [
      "109238470087"
    ],
    "linkedStudentNames": [
      "Mariel Ocampo"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0087!"
  },
  {
    "id": "PAR-091",
    "name": "Mrs. Lourdes Alcantara",
    "email": "parent.109238470088@parent.sapc.edu.ph",
    "phone": "+63 918 813 657",
    "relationship": "Mother",
    "linkedStudentName": "Lorenzo Alcantara",
    "linkedLRN": "109238470088",
    "linkedLRNs": [
      "109238470088"
    ],
    "linkedStudentNames": [
      "Lorenzo Alcantara"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0088!"
  },
  {
    "id": "PAR-092",
    "name": "Mr. Gerardo Ramos",
    "email": "parent.109238470089@parent.sapc.edu.ph",
    "phone": "+63 918 814 994",
    "relationship": "Father",
    "linkedStudentName": "Simon Ramos",
    "linkedLRN": "109238470089",
    "linkedLRNs": [
      "109238470089"
    ],
    "linkedStudentNames": [
      "Simon Ramos"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0089!"
  },
  {
    "id": "PAR-093",
    "name": "Mrs. Elena Cruz",
    "email": "parent.109238470090@parent.sapc.edu.ph",
    "phone": "+63 918 816 331",
    "relationship": "Mother",
    "linkedStudentName": "Rita Cruz",
    "linkedLRN": "109238470090",
    "linkedLRNs": [
      "109238470090"
    ],
    "linkedStudentNames": [
      "Rita Cruz"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0090!"
  },
  {
    "id": "PAR-094",
    "name": "Mr. Ernesto Lim",
    "email": "parent.109238470091@parent.sapc.edu.ph",
    "phone": "+63 918 817 668",
    "relationship": "Father",
    "linkedStudentName": "Cedric Lim",
    "linkedLRN": "109238470091",
    "linkedLRNs": [
      "109238470091"
    ],
    "linkedStudentNames": [
      "Cedric Lim"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0091!"
  },
  {
    "id": "PAR-095",
    "name": "Mrs. Maricel De Leon",
    "email": "parent.109238470092@parent.sapc.edu.ph",
    "phone": "+63 918 819 005",
    "relationship": "Mother",
    "linkedStudentName": "Gabriel De Leon",
    "linkedLRN": "109238470092",
    "linkedLRNs": [
      "109238470092"
    ],
    "linkedStudentNames": [
      "Gabriel De Leon"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0092!"
  },
  {
    "id": "PAR-096",
    "name": "Mr. Ferdinand Domingo",
    "email": "parent.109238470093@parent.sapc.edu.ph",
    "phone": "+63 918 820 342",
    "relationship": "Father",
    "linkedStudentName": "Liza Domingo",
    "linkedLRN": "109238470093",
    "linkedLRNs": [
      "109238470093"
    ],
    "linkedStudentNames": [
      "Liza Domingo"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0093!"
  },
  {
    "id": "PAR-097",
    "name": "Mrs. Carmela Mercado",
    "email": "parent.109238470094@parent.sapc.edu.ph",
    "phone": "+63 918 821 679",
    "relationship": "Mother",
    "linkedStudentName": "Justin Mercado",
    "linkedLRN": "109238470094",
    "linkedLRNs": [
      "109238470094"
    ],
    "linkedStudentNames": [
      "Justin Mercado"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0094!"
  },
  {
    "id": "PAR-098",
    "name": "Mr. Carlos Morales",
    "email": "parent.109238470095@parent.sapc.edu.ph",
    "phone": "+63 918 823 016",
    "relationship": "Father",
    "linkedStudentName": "Angelo Morales",
    "linkedLRN": "109238470095",
    "linkedLRNs": [
      "109238470095"
    ],
    "linkedStudentNames": [
      "Angelo Morales"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0095!"
  },
  {
    "id": "PAR-099",
    "name": "Mrs. Rosalinda Padilla",
    "email": "parent.109238470096@parent.sapc.edu.ph",
    "phone": "+63 918 824 353",
    "relationship": "Mother",
    "linkedStudentName": "Jerome Padilla",
    "linkedLRN": "109238470096",
    "linkedLRNs": [
      "109238470096"
    ],
    "linkedStudentNames": [
      "Jerome Padilla"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0096!"
  },
  {
    "id": "PAR-100",
    "name": "Mr. Danilo Salazar",
    "email": "parent.109238470097@parent.sapc.edu.ph",
    "phone": "+63 918 825 690",
    "relationship": "Father",
    "linkedStudentName": "Joshua Salazar",
    "linkedLRN": "109238470097",
    "linkedLRNs": [
      "109238470097"
    ],
    "linkedStudentNames": [
      "Joshua Salazar"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0097!"
  },
  {
    "id": "PAR-101",
    "name": "Mrs. Josephine Soriano",
    "email": "parent.109238470098@parent.sapc.edu.ph",
    "phone": "+63 918 827 027",
    "relationship": "Mother",
    "linkedStudentName": "Sofia Soriano",
    "linkedLRN": "109238470098",
    "linkedLRNs": [
      "109238470098"
    ],
    "linkedStudentNames": [
      "Sofia Soriano"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0098!"
  },
  {
    "id": "PAR-102",
    "name": "Mr. Reynaldo Aquino",
    "email": "parent.109238470099@parent.sapc.edu.ph",
    "phone": "+63 918 828 364",
    "relationship": "Father",
    "linkedStudentName": "Liza Aquino",
    "linkedLRN": "109238470099",
    "linkedLRNs": [
      "109238470099"
    ],
    "linkedStudentNames": [
      "Liza Aquino"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0099!"
  },
  {
    "id": "PAR-103",
    "name": "Mrs. Remedios Aquino",
    "email": "parent.109238470100@parent.sapc.edu.ph",
    "phone": "+63 918 829 701",
    "relationship": "Mother",
    "linkedStudentName": "Justin Aquino",
    "linkedLRN": "109238470100",
    "linkedLRNs": [
      "109238470100"
    ],
    "linkedStudentNames": [
      "Justin Aquino"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0100!"
  },
  {
    "id": "PAR-104",
    "name": "Mr. Renato Aquino",
    "email": "parent.109238470101@parent.sapc.edu.ph",
    "phone": "+63 918 831 038",
    "relationship": "Father",
    "linkedStudentName": "Sebastian Aquino",
    "linkedLRN": "109238470101",
    "linkedLRNs": [
      "109238470101"
    ],
    "linkedStudentNames": [
      "Sebastian Aquino"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0101!"
  },
  {
    "id": "PAR-105",
    "name": "Mrs. Flordeliza Soriano",
    "email": "parent.109238470102@parent.sapc.edu.ph",
    "phone": "+63 918 832 375",
    "relationship": "Mother",
    "linkedStudentName": "Lucas Soriano",
    "linkedLRN": "109238470102",
    "linkedLRNs": [
      "109238470102"
    ],
    "linkedStudentNames": [
      "Lucas Soriano"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0102!"
  },
  {
    "id": "PAR-106",
    "name": "Mr. Rodolfo Dimaculangan",
    "email": "parent.109238470103@parent.sapc.edu.ph",
    "phone": "+63 918 833 712",
    "relationship": "Father",
    "linkedStudentName": "Luis Dimaculangan",
    "linkedLRN": "109238470103",
    "linkedLRNs": [
      "109238470103"
    ],
    "linkedStudentNames": [
      "Luis Dimaculangan"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0103!"
  },
  {
    "id": "PAR-107",
    "name": "Mrs. Cynthia Reyes",
    "email": "parent.109238470104@parent.sapc.edu.ph",
    "phone": "+63 918 835 049",
    "relationship": "Mother",
    "linkedStudentName": "Emman Reyes",
    "linkedLRN": "109238470104",
    "linkedLRNs": [
      "109238470104"
    ],
    "linkedStudentNames": [
      "Emman Reyes"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0104!"
  },
  {
    "id": "PAR-108",
    "name": "Mr. Nestor Santos",
    "email": "parent.109238470105@parent.sapc.edu.ph",
    "phone": "+63 918 836 386",
    "relationship": "Father",
    "linkedStudentName": "Kathleen Santos",
    "linkedLRN": "109238470105",
    "linkedLRNs": [
      "109238470105"
    ],
    "linkedStudentNames": [
      "Kathleen Santos"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0105!"
  },
  {
    "id": "PAR-109",
    "name": "Mrs. Shirley San Jose",
    "email": "parent.109238470106@parent.sapc.edu.ph",
    "phone": "+63 918 837 723",
    "relationship": "Mother",
    "linkedStudentName": "Angela San Jose",
    "linkedLRN": "109238470106",
    "linkedLRNs": [
      "109238470106"
    ],
    "linkedStudentNames": [
      "Angela San Jose"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0106!"
  },
  {
    "id": "PAR-110",
    "name": "Mr. Jaime Castillo",
    "email": "parent.109238470107@parent.sapc.edu.ph",
    "phone": "+63 918 839 060",
    "relationship": "Father",
    "linkedStudentName": "Clare Castillo",
    "linkedLRN": "109238470107",
    "linkedLRNs": [
      "109238470107"
    ],
    "linkedStudentNames": [
      "Clare Castillo"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0107!"
  },
  {
    "id": "PAR-111",
    "name": "Mrs. Jennifer Rivera",
    "email": "parent.109238470108@parent.sapc.edu.ph",
    "phone": "+63 918 840 397",
    "relationship": "Mother",
    "linkedStudentName": "Princess Mae Rivera",
    "linkedLRN": "109238470108",
    "linkedLRNs": [
      "109238470108"
    ],
    "linkedStudentNames": [
      "Princess Mae Rivera"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0108!"
  },
  {
    "id": "PAR-112",
    "name": "Mr. Cesar Villanueva",
    "email": "parent.109238470109@parent.sapc.edu.ph",
    "phone": "+63 918 841 734",
    "relationship": "Father",
    "linkedStudentName": "Dominic Villanueva",
    "linkedLRN": "109238470109",
    "linkedLRNs": [
      "109238470109"
    ],
    "linkedStudentNames": [
      "Dominic Villanueva"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0109!"
  },
  {
    "id": "PAR-113",
    "name": "Mrs. Grace Alcantara",
    "email": "parent.109238470110@parent.sapc.edu.ph",
    "phone": "+63 918 843 071",
    "relationship": "Mother",
    "linkedStudentName": "Angelo Alcantara",
    "linkedLRN": "109238470110",
    "linkedLRNs": [
      "109238470110"
    ],
    "linkedStudentNames": [
      "Angelo Alcantara"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0110!"
  },
  {
    "id": "PAR-114",
    "name": "Mr. Arnel De Leon",
    "email": "parent.109238470111@parent.sapc.edu.ph",
    "phone": "+63 918 844 408",
    "relationship": "Father",
    "linkedStudentName": "John Carlo De Leon",
    "linkedLRN": "109238470111",
    "linkedLRNs": [
      "109238470111"
    ],
    "linkedStudentNames": [
      "John Carlo De Leon"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0111!"
  },
  {
    "id": "PAR-115",
    "name": "Mrs. Gina Torres",
    "email": "parent.109238470112@parent.sapc.edu.ph",
    "phone": "+63 918 845 745",
    "relationship": "Mother",
    "linkedStudentName": "Cedric Torres",
    "linkedLRN": "109238470112",
    "linkedLRNs": [
      "109238470112"
    ],
    "linkedStudentNames": [
      "Cedric Torres"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0112!"
  },
  {
    "id": "PAR-116",
    "name": "Mr. Roberto Santiago",
    "email": "parent.109238470113@parent.sapc.edu.ph",
    "phone": "+63 918 847 082",
    "relationship": "Father",
    "linkedStudentName": "Faith Santiago",
    "linkedLRN": "109238470113",
    "linkedLRNs": [
      "109238470113"
    ],
    "linkedStudentNames": [
      "Faith Santiago"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0113!"
  },
  {
    "id": "PAR-117",
    "name": "Mrs. Teresa Dela Cruz",
    "email": "parent.109238470114@parent.sapc.edu.ph",
    "phone": "+63 918 848 419",
    "relationship": "Mother",
    "linkedStudentName": "Martin Dela Cruz",
    "linkedLRN": "109238470114",
    "linkedLRNs": [
      "109238470114"
    ],
    "linkedStudentNames": [
      "Martin Dela Cruz"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0114!"
  },
  {
    "id": "PAR-118",
    "name": "Mr. Edgardo Pascual",
    "email": "parent.109238470115@parent.sapc.edu.ph",
    "phone": "+63 918 849 756",
    "relationship": "Father",
    "linkedStudentName": "Andrea Pascual",
    "linkedLRN": "109238470115",
    "linkedLRNs": [
      "109238470115"
    ],
    "linkedStudentNames": [
      "Andrea Pascual"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0115!"
  },
  {
    "id": "PAR-119",
    "name": "Mrs. Corazon Flores",
    "email": "parent.109238470116@parent.sapc.edu.ph",
    "phone": "+63 918 851 093",
    "relationship": "Mother",
    "linkedStudentName": "Benedict Flores",
    "linkedLRN": "109238470116",
    "linkedLRNs": [
      "109238470116"
    ],
    "linkedStudentNames": [
      "Benedict Flores"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0116!"
  },
  {
    "id": "PAR-120",
    "name": "Mr. Rolando Soriano",
    "email": "parent.109238470117@parent.sapc.edu.ph",
    "phone": "+63 918 852 430",
    "relationship": "Father",
    "linkedStudentName": "Carlos Soriano",
    "linkedLRN": "109238470117",
    "linkedLRNs": [
      "109238470117"
    ],
    "linkedStudentNames": [
      "Carlos Soriano"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0117!"
  },
  {
    "id": "PAR-121",
    "name": "Mrs. Rowena Dizon",
    "email": "parent.109238470118@parent.sapc.edu.ph",
    "phone": "+63 918 853 767",
    "relationship": "Mother",
    "linkedStudentName": "Vanessa Dizon",
    "linkedLRN": "109238470118",
    "linkedLRNs": [
      "109238470118"
    ],
    "linkedStudentNames": [
      "Vanessa Dizon"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0118!"
  },
  {
    "id": "PAR-122",
    "name": "Mr. Ramon Villanueva",
    "email": "parent.109238470119@parent.sapc.edu.ph",
    "phone": "+63 918 855 104",
    "relationship": "Father",
    "linkedStudentName": "Kathryn Villanueva",
    "linkedLRN": "109238470119",
    "linkedLRNs": [
      "109238470119"
    ],
    "linkedStudentNames": [
      "Kathryn Villanueva"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0119!"
  },
  {
    "id": "PAR-123",
    "name": "Mrs. Lorna Lim",
    "email": "parent.109238470120@parent.sapc.edu.ph",
    "phone": "+63 918 856 441",
    "relationship": "Mother",
    "linkedStudentName": "Karl Lim",
    "linkedLRN": "109238470120",
    "linkedLRNs": [
      "109238470120"
    ],
    "linkedStudentNames": [
      "Karl Lim"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0120!"
  },
  {
    "id": "PAR-124",
    "name": "Mr. Antonio De Leon",
    "email": "parent.109238470121@parent.sapc.edu.ph",
    "phone": "+63 918 857 778",
    "relationship": "Father",
    "linkedStudentName": "Adrian De Leon",
    "linkedLRN": "109238470121",
    "linkedLRNs": [
      "109238470121"
    ],
    "linkedStudentNames": [
      "Adrian De Leon"
    ],
    "section": "Grade 7 - St. Bernadette",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0121!"
  },
  {
    "id": "PAR-125",
    "name": "Mrs. Mary Ann Gonzales",
    "email": "parent.109238470122@parent.sapc.edu.ph",
    "phone": "+63 918 859 115",
    "relationship": "Mother",
    "linkedStudentName": "Christian Gonzales",
    "linkedLRN": "109238470122",
    "linkedLRNs": [
      "109238470122"
    ],
    "linkedStudentNames": [
      "Christian Gonzales"
    ],
    "section": "Grade 7 - St. Anthony",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0122!"
  },
  {
    "id": "PAR-126",
    "name": "Mr. Eduardo Castillo",
    "email": "parent.109238470123@parent.sapc.edu.ph",
    "phone": "+63 918 860 452",
    "relationship": "Father",
    "linkedStudentName": "Samantha Nicole Castillo",
    "linkedLRN": "109238470123",
    "linkedLRNs": [
      "109238470123"
    ],
    "linkedStudentNames": [
      "Samantha Nicole Castillo"
    ],
    "section": "Grade 7 - St. Therese",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0123!"
  },
  {
    "id": "PAR-127",
    "name": "Mrs. Jocelyn Mercado",
    "email": "parent.109238470124@parent.sapc.edu.ph",
    "phone": "+63 918 861 789",
    "relationship": "Mother",
    "linkedStudentName": "Rochelle Mercado",
    "linkedLRN": "109238470124",
    "linkedLRNs": [
      "109238470124"
    ],
    "linkedStudentNames": [
      "Rochelle Mercado"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0124!"
  },
  {
    "id": "PAR-128",
    "name": "Mr. Wilfredo Villanueva",
    "email": "parent.109238470125@parent.sapc.edu.ph",
    "phone": "+63 918 863 126",
    "relationship": "Father",
    "linkedStudentName": "Lance Villanueva",
    "linkedLRN": "109238470125",
    "linkedLRNs": [
      "109238470125"
    ],
    "linkedStudentNames": [
      "Lance Villanueva"
    ],
    "section": "Grade 7 - St. Francis",
    "gradeLevel": "Grade 7",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0125!"
  },
  {
    "id": "PAR-129",
    "name": "Mrs. Elizabeth San Jose",
    "email": "parent.109238470126@parent.sapc.edu.ph",
    "phone": "+63 918 864 463",
    "relationship": "Mother",
    "linkedStudentName": "Justin San Jose",
    "linkedLRN": "109238470126",
    "linkedLRNs": [
      "109238470126"
    ],
    "linkedStudentNames": [
      "Justin San Jose"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0126!"
  },
  {
    "id": "PAR-130",
    "name": "Mr. Victor Bautista",
    "email": "parent.109238470127@parent.sapc.edu.ph",
    "phone": "+63 918 865 800",
    "relationship": "Father",
    "linkedStudentName": "Cedric Bautista",
    "linkedLRN": "109238470127",
    "linkedLRNs": [
      "109238470127"
    ],
    "linkedStudentNames": [
      "Cedric Bautista"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0127!"
  },
  {
    "id": "PAR-131",
    "name": "Mrs. Imelda Manalo",
    "email": "parent.109238470128@parent.sapc.edu.ph",
    "phone": "+63 918 867 137",
    "relationship": "Mother",
    "linkedStudentName": "Maria Clara Manalo",
    "linkedLRN": "109238470128",
    "linkedLRNs": [
      "109238470128"
    ],
    "linkedStudentNames": [
      "Maria Clara Manalo"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0128!"
  },
  {
    "id": "PAR-132",
    "name": "Mr. Gabriel Dizon",
    "email": "parent.109238470129@parent.sapc.edu.ph",
    "phone": "+63 918 868 474",
    "relationship": "Father",
    "linkedStudentName": "Vanessa Dizon",
    "linkedLRN": "109238470129",
    "linkedLRNs": [
      "109238470129"
    ],
    "linkedStudentNames": [
      "Vanessa Dizon"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0129!"
  },
  {
    "id": "PAR-133",
    "name": "Mrs. Bernadette Morales",
    "email": "parent.109238470130@parent.sapc.edu.ph",
    "phone": "+63 918 869 811",
    "relationship": "Mother",
    "linkedStudentName": "Tristan Morales",
    "linkedLRN": "109238470130",
    "linkedLRNs": [
      "109238470130"
    ],
    "linkedStudentNames": [
      "Tristan Morales"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0130!"
  },
  {
    "id": "PAR-134",
    "name": "Mr. Manuel Dimaculangan",
    "email": "parent.109238470131@parent.sapc.edu.ph",
    "phone": "+63 918 871 148",
    "relationship": "Father",
    "linkedStudentName": "Daniel Dimaculangan",
    "linkedLRN": "109238470131",
    "linkedLRNs": [
      "109238470131"
    ],
    "linkedStudentNames": [
      "Daniel Dimaculangan"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0131!"
  },
  {
    "id": "PAR-135",
    "name": "Mrs. Cristina Santiago",
    "email": "parent.109238470132@parent.sapc.edu.ph",
    "phone": "+63 918 872 485",
    "relationship": "Mother",
    "linkedStudentName": "Therese Santiago",
    "linkedLRN": "109238470132",
    "linkedLRNs": [
      "109238470132"
    ],
    "linkedStudentNames": [
      "Therese Santiago"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0132!"
  },
  {
    "id": "PAR-136",
    "name": "Mr. Mario Rivera",
    "email": "parent.109238470133@parent.sapc.edu.ph",
    "phone": "+63 918 873 822",
    "relationship": "Father",
    "linkedStudentName": "Anthony Rivera",
    "linkedLRN": "109238470133",
    "linkedLRNs": [
      "109238470133"
    ],
    "linkedStudentNames": [
      "Anthony Rivera"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0133!"
  },
  {
    "id": "PAR-137",
    "name": "Mrs. Lourdes Valdez",
    "email": "parent.109238470134@parent.sapc.edu.ph",
    "phone": "+63 918 875 159",
    "relationship": "Mother",
    "linkedStudentName": "Matthew Valdez",
    "linkedLRN": "109238470134",
    "linkedLRNs": [
      "109238470134"
    ],
    "linkedStudentNames": [
      "Matthew Valdez"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0134!"
  },
  {
    "id": "PAR-138",
    "name": "Mr. Gerardo Mendoza",
    "email": "parent.109238470135@parent.sapc.edu.ph",
    "phone": "+63 918 876 496",
    "relationship": "Father",
    "linkedStudentName": "Angela Mendoza",
    "linkedLRN": "109238470135",
    "linkedLRNs": [
      "109238470135"
    ],
    "linkedStudentNames": [
      "Angela Mendoza"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0135!"
  },
  {
    "id": "PAR-139",
    "name": "Mrs. Elena Cruz",
    "email": "parent.109238470136@parent.sapc.edu.ph",
    "phone": "+63 918 877 833",
    "relationship": "Mother",
    "linkedStudentName": "Anthony Cruz",
    "linkedLRN": "109238470136",
    "linkedLRNs": [
      "109238470136"
    ],
    "linkedStudentNames": [
      "Anthony Cruz"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0136!"
  },
  {
    "id": "PAR-140",
    "name": "Mr. Ernesto Manalo",
    "email": "parent.109238470137@parent.sapc.edu.ph",
    "phone": "+63 918 879 170",
    "relationship": "Father",
    "linkedStudentName": "Camille Manalo",
    "linkedLRN": "109238470137",
    "linkedLRNs": [
      "109238470137"
    ],
    "linkedStudentNames": [
      "Camille Manalo"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0137!"
  },
  {
    "id": "PAR-141",
    "name": "Mrs. Maricel Gonzales",
    "email": "parent.109238470138@parent.sapc.edu.ph",
    "phone": "+63 918 880 507",
    "relationship": "Mother",
    "linkedStudentName": "Elijah Gonzales",
    "linkedLRN": "109238470138",
    "linkedLRNs": [
      "109238470138"
    ],
    "linkedStudentNames": [
      "Elijah Gonzales"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0138!"
  },
  {
    "id": "PAR-142",
    "name": "Mr. Ferdinand Dizon",
    "email": "parent.109238470139@parent.sapc.edu.ph",
    "phone": "+63 918 881 844",
    "relationship": "Father",
    "linkedStudentName": "Bianca Dizon",
    "linkedLRN": "109238470139",
    "linkedLRNs": [
      "109238470139"
    ],
    "linkedStudentNames": [
      "Bianca Dizon"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0139!"
  },
  {
    "id": "PAR-143",
    "name": "Mrs. Carmela Manalo",
    "email": "parent.109238470140@parent.sapc.edu.ph",
    "phone": "+63 918 883 181",
    "relationship": "Mother",
    "linkedStudentName": "Therese Manalo",
    "linkedLRN": "109238470140",
    "linkedLRNs": [
      "109238470140"
    ],
    "linkedStudentNames": [
      "Therese Manalo"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0140!"
  },
  {
    "id": "PAR-144",
    "name": "Mr. Carlos San Jose",
    "email": "parent.109238470141@parent.sapc.edu.ph",
    "phone": "+63 918 884 518",
    "relationship": "Father",
    "linkedStudentName": "Simon San Jose",
    "linkedLRN": "109238470141",
    "linkedLRNs": [
      "109238470141"
    ],
    "linkedStudentNames": [
      "Simon San Jose"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0141!"
  },
  {
    "id": "PAR-145",
    "name": "Mrs. Rosalinda Torres",
    "email": "parent.109238470142@parent.sapc.edu.ph",
    "phone": "+63 918 885 855",
    "relationship": "Mother",
    "linkedStudentName": "Patricia Torres",
    "linkedLRN": "109238470142",
    "linkedLRNs": [
      "109238470142"
    ],
    "linkedStudentNames": [
      "Patricia Torres"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0142!"
  },
  {
    "id": "PAR-146",
    "name": "Mr. Danilo Aquino",
    "email": "parent.109238470143@parent.sapc.edu.ph",
    "phone": "+63 918 887 192",
    "relationship": "Father",
    "linkedStudentName": "Anthony Aquino",
    "linkedLRN": "109238470143",
    "linkedLRNs": [
      "109238470143"
    ],
    "linkedStudentNames": [
      "Anthony Aquino"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0143!"
  },
  {
    "id": "PAR-147",
    "name": "Mrs. Josephine Castro",
    "email": "parent.109238470144@parent.sapc.edu.ph",
    "phone": "+63 918 888 529",
    "relationship": "Mother",
    "linkedStudentName": "Clare Castro",
    "linkedLRN": "109238470144",
    "linkedLRNs": [
      "109238470144"
    ],
    "linkedStudentNames": [
      "Clare Castro"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0144!"
  },
  {
    "id": "PAR-148",
    "name": "Mr. Reynaldo Castillo",
    "email": "parent.109238470145@parent.sapc.edu.ph",
    "phone": "+63 918 889 866",
    "relationship": "Father",
    "linkedStudentName": "Samantha Nicole Castillo",
    "linkedLRN": "109238470145",
    "linkedLRNs": [
      "109238470145"
    ],
    "linkedStudentNames": [
      "Samantha Nicole Castillo"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0145!"
  },
  {
    "id": "PAR-149",
    "name": "Mrs. Remedios Torres",
    "email": "parent.109238470146@parent.sapc.edu.ph",
    "phone": "+63 918 891 203",
    "relationship": "Mother",
    "linkedStudentName": "Sebastian Torres",
    "linkedLRN": "109238470146",
    "linkedLRNs": [
      "109238470146"
    ],
    "linkedStudentNames": [
      "Sebastian Torres"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0146!"
  },
  {
    "id": "PAR-150",
    "name": "Mr. Renato Ocampo",
    "email": "parent.109238470147@parent.sapc.edu.ph",
    "phone": "+63 918 892 540",
    "relationship": "Father",
    "linkedStudentName": "Vincent Ocampo",
    "linkedLRN": "109238470147",
    "linkedLRNs": [
      "109238470147"
    ],
    "linkedStudentNames": [
      "Vincent Ocampo"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0147!"
  },
  {
    "id": "PAR-151",
    "name": "Mrs. Flordeliza San Jose",
    "email": "parent.109238470148@parent.sapc.edu.ph",
    "phone": "+63 918 893 877",
    "relationship": "Mother",
    "linkedStudentName": "Rochelle San Jose",
    "linkedLRN": "109238470148",
    "linkedLRNs": [
      "109238470148"
    ],
    "linkedStudentNames": [
      "Rochelle San Jose"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0148!"
  },
  {
    "id": "PAR-152",
    "name": "Mr. Rodolfo De Leon",
    "email": "parent.109238470149@parent.sapc.edu.ph",
    "phone": "+63 918 895 214",
    "relationship": "Father",
    "linkedStudentName": "Patricia De Leon",
    "linkedLRN": "109238470149",
    "linkedLRNs": [
      "109238470149"
    ],
    "linkedStudentNames": [
      "Patricia De Leon"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0149!"
  },
  {
    "id": "PAR-153",
    "name": "Mrs. Cynthia Flores",
    "email": "parent.109238470150@parent.sapc.edu.ph",
    "phone": "+63 918 896 551",
    "relationship": "Mother",
    "linkedStudentName": "Joshua Flores",
    "linkedLRN": "109238470150",
    "linkedLRNs": [
      "109238470150"
    ],
    "linkedStudentNames": [
      "Joshua Flores"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0150!"
  },
  {
    "id": "PAR-154",
    "name": "Mr. Nestor De Leon",
    "email": "parent.109238470151@parent.sapc.edu.ph",
    "phone": "+63 918 897 888",
    "relationship": "Father",
    "linkedStudentName": "Sofia De Leon",
    "linkedLRN": "109238470151",
    "linkedLRNs": [
      "109238470151"
    ],
    "linkedStudentNames": [
      "Sofia De Leon"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0151!"
  },
  {
    "id": "PAR-155",
    "name": "Mrs. Shirley De Leon",
    "email": "parent.109238470152@parent.sapc.edu.ph",
    "phone": "+63 918 899 225",
    "relationship": "Mother",
    "linkedStudentName": "Bea De Leon",
    "linkedLRN": "109238470152",
    "linkedLRNs": [
      "109238470152"
    ],
    "linkedStudentNames": [
      "Bea De Leon"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0152!"
  },
  {
    "id": "PAR-156",
    "name": "Mr. Jaime Alcantara",
    "email": "parent.109238470153@parent.sapc.edu.ph",
    "phone": "+63 918 900 562",
    "relationship": "Father",
    "linkedStudentName": "Justin Alcantara",
    "linkedLRN": "109238470153",
    "linkedLRNs": [
      "109238470153"
    ],
    "linkedStudentNames": [
      "Justin Alcantara"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0153!"
  },
  {
    "id": "PAR-157",
    "name": "Mrs. Jennifer Soriano",
    "email": "parent.109238470154@parent.sapc.edu.ph",
    "phone": "+63 918 901 899",
    "relationship": "Mother",
    "linkedStudentName": "Kathleen Soriano",
    "linkedLRN": "109238470154",
    "linkedLRNs": [
      "109238470154"
    ],
    "linkedStudentNames": [
      "Kathleen Soriano"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0154!"
  },
  {
    "id": "PAR-158",
    "name": "Mr. Cesar Gonzales",
    "email": "parent.109238470155@parent.sapc.edu.ph",
    "phone": "+63 918 903 236",
    "relationship": "Father",
    "linkedStudentName": "Cedric Gonzales",
    "linkedLRN": "109238470155",
    "linkedLRNs": [
      "109238470155"
    ],
    "linkedStudentNames": [
      "Cedric Gonzales"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0155!"
  },
  {
    "id": "PAR-159",
    "name": "Mrs. Grace Dimaculangan",
    "email": "parent.109238470156@parent.sapc.edu.ph",
    "phone": "+63 918 904 573",
    "relationship": "Mother",
    "linkedStudentName": "Sebastian Dimaculangan",
    "linkedLRN": "109238470156",
    "linkedLRNs": [
      "109238470156"
    ],
    "linkedStudentNames": [
      "Sebastian Dimaculangan"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0156!"
  },
  {
    "id": "PAR-160",
    "name": "Mr. Arnel Domingo",
    "email": "parent.109238470157@parent.sapc.edu.ph",
    "phone": "+63 918 905 910",
    "relationship": "Father",
    "linkedStudentName": "Lucas Domingo",
    "linkedLRN": "109238470157",
    "linkedLRNs": [
      "109238470157"
    ],
    "linkedStudentNames": [
      "Lucas Domingo"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0157!"
  },
  {
    "id": "PAR-161",
    "name": "Mrs. Gina Cruz",
    "email": "parent.109238470158@parent.sapc.edu.ph",
    "phone": "+63 918 907 247",
    "relationship": "Mother",
    "linkedStudentName": "Matthew Cruz",
    "linkedLRN": "109238470158",
    "linkedLRNs": [
      "109238470158"
    ],
    "linkedStudentNames": [
      "Matthew Cruz"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0158!"
  },
  {
    "id": "PAR-162",
    "name": "Mr. Roberto Castro",
    "email": "parent.109238470159@parent.sapc.edu.ph",
    "phone": "+63 918 908 584",
    "relationship": "Father",
    "linkedStudentName": "Dominic Castro",
    "linkedLRN": "109238470159",
    "linkedLRNs": [
      "109238470159"
    ],
    "linkedStudentNames": [
      "Dominic Castro"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0159!"
  },
  {
    "id": "PAR-163",
    "name": "Mrs. Teresa Lim",
    "email": "parent.109238470160@parent.sapc.edu.ph",
    "phone": "+63 918 909 921",
    "relationship": "Mother",
    "linkedStudentName": "Camille Lim",
    "linkedLRN": "109238470160",
    "linkedLRNs": [
      "109238470160"
    ],
    "linkedStudentNames": [
      "Camille Lim"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0160!"
  },
  {
    "id": "PAR-164",
    "name": "Mr. Edgardo Tolentino",
    "email": "parent.109238470161@parent.sapc.edu.ph",
    "phone": "+63 918 911 258",
    "relationship": "Father",
    "linkedStudentName": "Diego Tolentino",
    "linkedLRN": "109238470161",
    "linkedLRNs": [
      "109238470161"
    ],
    "linkedStudentNames": [
      "Diego Tolentino"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0161!"
  },
  {
    "id": "PAR-165",
    "name": "Mrs. Corazon Cruz",
    "email": "parent.109238470162@parent.sapc.edu.ph",
    "phone": "+63 918 912 595",
    "relationship": "Mother",
    "linkedStudentName": "Matthew Cruz",
    "linkedLRN": "109238470162",
    "linkedLRNs": [
      "109238470162"
    ],
    "linkedStudentNames": [
      "Matthew Cruz"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0162!"
  },
  {
    "id": "PAR-166",
    "name": "Mr. Rolando Torres",
    "email": "parent.109238470163@parent.sapc.edu.ph",
    "phone": "+63 918 913 932",
    "relationship": "Father",
    "linkedStudentName": "Chloe Torres",
    "linkedLRN": "109238470163",
    "linkedLRNs": [
      "109238470163"
    ],
    "linkedStudentNames": [
      "Chloe Torres"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0163!"
  },
  {
    "id": "PAR-167",
    "name": "Mrs. Rowena Manalo",
    "email": "parent.109238470164@parent.sapc.edu.ph",
    "phone": "+63 918 915 269",
    "relationship": "Mother",
    "linkedStudentName": "Daniel Manalo",
    "linkedLRN": "109238470164",
    "linkedLRNs": [
      "109238470164"
    ],
    "linkedStudentNames": [
      "Daniel Manalo"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0164!"
  },
  {
    "id": "PAR-168",
    "name": "Mr. Ramon Tolentino",
    "email": "parent.109238470165@parent.sapc.edu.ph",
    "phone": "+63 918 916 606",
    "relationship": "Father",
    "linkedStudentName": "Matthew Tolentino",
    "linkedLRN": "109238470165",
    "linkedLRNs": [
      "109238470165"
    ],
    "linkedStudentNames": [
      "Matthew Tolentino"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0165!"
  },
  {
    "id": "PAR-169",
    "name": "Mrs. Lorna Lim",
    "email": "parent.109238470166@parent.sapc.edu.ph",
    "phone": "+63 918 917 943",
    "relationship": "Mother",
    "linkedStudentName": "Diego Lim",
    "linkedLRN": "109238470166",
    "linkedLRNs": [
      "109238470166"
    ],
    "linkedStudentNames": [
      "Diego Lim"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0166!"
  },
  {
    "id": "PAR-170",
    "name": "Mr. Antonio Ramos",
    "email": "parent.109238470167@parent.sapc.edu.ph",
    "phone": "+63 918 919 280",
    "relationship": "Father",
    "linkedStudentName": "Adrian Ramos",
    "linkedLRN": "109238470167",
    "linkedLRNs": [
      "109238470167"
    ],
    "linkedStudentNames": [
      "Adrian Ramos"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0167!"
  },
  {
    "id": "PAR-171",
    "name": "Mrs. Mary Ann Corpuz",
    "email": "parent.109238470168@parent.sapc.edu.ph",
    "phone": "+63 918 920 617",
    "relationship": "Mother",
    "linkedStudentName": "Rochelle Corpuz",
    "linkedLRN": "109238470168",
    "linkedLRNs": [
      "109238470168"
    ],
    "linkedStudentNames": [
      "Rochelle Corpuz"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0168!"
  },
  {
    "id": "PAR-172",
    "name": "Mr. Eduardo Villanueva",
    "email": "parent.109238470169@parent.sapc.edu.ph",
    "phone": "+63 918 921 954",
    "relationship": "Father",
    "linkedStudentName": "Samantha Nicole Villanueva",
    "linkedLRN": "109238470169",
    "linkedLRNs": [
      "109238470169"
    ],
    "linkedStudentNames": [
      "Samantha Nicole Villanueva"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0169!"
  },
  {
    "id": "PAR-173",
    "name": "Mrs. Jocelyn Dela Cruz",
    "email": "parent.109238470170@parent.sapc.edu.ph",
    "phone": "+63 918 923 291",
    "relationship": "Mother",
    "linkedStudentName": "Martin Dela Cruz",
    "linkedLRN": "109238470170",
    "linkedLRNs": [
      "109238470170"
    ],
    "linkedStudentNames": [
      "Martin Dela Cruz"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0170!"
  },
  {
    "id": "PAR-174",
    "name": "Mr. Wilfredo Padilla",
    "email": "parent.109238470171@parent.sapc.edu.ph",
    "phone": "+63 918 924 628",
    "relationship": "Father",
    "linkedStudentName": "Trisha Padilla",
    "linkedLRN": "109238470171",
    "linkedLRNs": [
      "109238470171"
    ],
    "linkedStudentNames": [
      "Trisha Padilla"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0171!"
  },
  {
    "id": "PAR-175",
    "name": "Mrs. Elizabeth Castillo",
    "email": "parent.109238470172@parent.sapc.edu.ph",
    "phone": "+63 918 925 965",
    "relationship": "Mother",
    "linkedStudentName": "Miguel Castillo",
    "linkedLRN": "109238470172",
    "linkedLRNs": [
      "109238470172"
    ],
    "linkedStudentNames": [
      "Miguel Castillo"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0172!"
  },
  {
    "id": "PAR-176",
    "name": "Mr. Victor Reyes",
    "email": "parent.109238470173@parent.sapc.edu.ph",
    "phone": "+63 918 927 302",
    "relationship": "Father",
    "linkedStudentName": "Jose Reyes",
    "linkedLRN": "109238470173",
    "linkedLRNs": [
      "109238470173"
    ],
    "linkedStudentNames": [
      "Jose Reyes"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0173!"
  },
  {
    "id": "PAR-177",
    "name": "Mrs. Imelda Ramos",
    "email": "parent.109238470174@parent.sapc.edu.ph",
    "phone": "+63 918 928 639",
    "relationship": "Mother",
    "linkedStudentName": "Lorenzo Ramos",
    "linkedLRN": "109238470174",
    "linkedLRNs": [
      "109238470174"
    ],
    "linkedStudentNames": [
      "Lorenzo Ramos"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0174!"
  },
  {
    "id": "PAR-178",
    "name": "Mr. Gabriel Domingo",
    "email": "parent.109238470175@parent.sapc.edu.ph",
    "phone": "+63 918 929 976",
    "relationship": "Father",
    "linkedStudentName": "Matthew Domingo",
    "linkedLRN": "109238470175",
    "linkedLRNs": [
      "109238470175"
    ],
    "linkedStudentNames": [
      "Matthew Domingo"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0175!"
  },
  {
    "id": "PAR-179",
    "name": "Mrs. Bernadette Cruz",
    "email": "parent.109238470176@parent.sapc.edu.ph",
    "phone": "+63 918 931 313",
    "relationship": "Mother",
    "linkedStudentName": "Jasmine Cruz",
    "linkedLRN": "109238470176",
    "linkedLRNs": [
      "109238470176"
    ],
    "linkedStudentNames": [
      "Jasmine Cruz"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0176!"
  },
  {
    "id": "PAR-180",
    "name": "Mr. Manuel Ocampo",
    "email": "parent.109238470177@parent.sapc.edu.ph",
    "phone": "+63 918 932 650",
    "relationship": "Father",
    "linkedStudentName": "Angelica Ocampo",
    "linkedLRN": "109238470177",
    "linkedLRNs": [
      "109238470177"
    ],
    "linkedStudentNames": [
      "Angelica Ocampo"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0177!"
  },
  {
    "id": "PAR-181",
    "name": "Mrs. Cristina Mendoza",
    "email": "parent.109238470178@parent.sapc.edu.ph",
    "phone": "+63 918 933 987",
    "relationship": "Mother",
    "linkedStudentName": "Janine Mendoza",
    "linkedLRN": "109238470178",
    "linkedLRNs": [
      "109238470178"
    ],
    "linkedStudentNames": [
      "Janine Mendoza"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0178!"
  },
  {
    "id": "PAR-182",
    "name": "Mr. Mario Reyes",
    "email": "parent.109238470179@parent.sapc.edu.ph",
    "phone": "+63 918 935 324",
    "relationship": "Father",
    "linkedStudentName": "Clarisse Reyes",
    "linkedLRN": "109238470179",
    "linkedLRNs": [
      "109238470179"
    ],
    "linkedStudentNames": [
      "Clarisse Reyes"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0179!"
  },
  {
    "id": "PAR-183",
    "name": "Mrs. Lourdes Garcia",
    "email": "parent.109238470180@parent.sapc.edu.ph",
    "phone": "+63 918 936 661",
    "relationship": "Mother",
    "linkedStudentName": "Adrian Garcia",
    "linkedLRN": "109238470180",
    "linkedLRNs": [
      "109238470180"
    ],
    "linkedStudentNames": [
      "Adrian Garcia"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0180!"
  },
  {
    "id": "PAR-184",
    "name": "Mr. Gerardo De Leon",
    "email": "parent.109238470181@parent.sapc.edu.ph",
    "phone": "+63 918 937 998",
    "relationship": "Father",
    "linkedStudentName": "Patricia De Leon",
    "linkedLRN": "109238470181",
    "linkedLRNs": [
      "109238470181"
    ],
    "linkedStudentNames": [
      "Patricia De Leon"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0181!"
  },
  {
    "id": "PAR-185",
    "name": "Mrs. Elena Castro",
    "email": "parent.109238470182@parent.sapc.edu.ph",
    "phone": "+63 918 939 335",
    "relationship": "Mother",
    "linkedStudentName": "Kathryn Castro",
    "linkedLRN": "109238470182",
    "linkedLRNs": [
      "109238470182"
    ],
    "linkedStudentNames": [
      "Kathryn Castro"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0182!"
  },
  {
    "id": "PAR-186",
    "name": "Mr. Ernesto Tolentino",
    "email": "parent.109238470183@parent.sapc.edu.ph",
    "phone": "+63 918 940 672",
    "relationship": "Father",
    "linkedStudentName": "Kathryn Tolentino",
    "linkedLRN": "109238470183",
    "linkedLRNs": [
      "109238470183"
    ],
    "linkedStudentNames": [
      "Kathryn Tolentino"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0183!"
  },
  {
    "id": "PAR-187",
    "name": "Mrs. Maricel Ramos",
    "email": "parent.109238470184@parent.sapc.edu.ph",
    "phone": "+63 918 942 009",
    "relationship": "Mother",
    "linkedStudentName": "Justin Ramos",
    "linkedLRN": "109238470184",
    "linkedLRNs": [
      "109238470184"
    ],
    "linkedStudentNames": [
      "Justin Ramos"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0184!"
  },
  {
    "id": "PAR-188",
    "name": "Mr. Ferdinand Mendoza",
    "email": "parent.109238470185@parent.sapc.edu.ph",
    "phone": "+63 918 943 346",
    "relationship": "Father",
    "linkedStudentName": "Cecilia Mendoza",
    "linkedLRN": "109238470185",
    "linkedLRNs": [
      "109238470185"
    ],
    "linkedStudentNames": [
      "Cecilia Mendoza"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0185!"
  },
  {
    "id": "PAR-189",
    "name": "Mrs. Carmela Santos",
    "email": "parent.109238470186@parent.sapc.edu.ph",
    "phone": "+63 918 944 683",
    "relationship": "Mother",
    "linkedStudentName": "Lorenzo Santos",
    "linkedLRN": "109238470186",
    "linkedLRNs": [
      "109238470186"
    ],
    "linkedStudentNames": [
      "Lorenzo Santos"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0186!"
  },
  {
    "id": "PAR-190",
    "name": "Mr. Carlos Dela Cruz",
    "email": "parent.109238470187@parent.sapc.edu.ph",
    "phone": "+63 918 946 020",
    "relationship": "Father",
    "linkedStudentName": "Camille Dela Cruz",
    "linkedLRN": "109238470187",
    "linkedLRNs": [
      "109238470187"
    ],
    "linkedStudentNames": [
      "Camille Dela Cruz"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0187!"
  },
  {
    "id": "PAR-191",
    "name": "Mrs. Rosalinda Lim",
    "email": "parent.109238470188@parent.sapc.edu.ph",
    "phone": "+63 918 947 357",
    "relationship": "Mother",
    "linkedStudentName": "Francis Lim",
    "linkedLRN": "109238470188",
    "linkedLRNs": [
      "109238470188"
    ],
    "linkedStudentNames": [
      "Francis Lim"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0188!"
  },
  {
    "id": "PAR-192",
    "name": "Mr. Danilo Garcia",
    "email": "parent.109238470189@parent.sapc.edu.ph",
    "phone": "+63 918 948 694",
    "relationship": "Father",
    "linkedStudentName": "Lance Garcia",
    "linkedLRN": "109238470189",
    "linkedLRNs": [
      "109238470189"
    ],
    "linkedStudentNames": [
      "Lance Garcia"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0189!"
  },
  {
    "id": "PAR-193",
    "name": "Mrs. Josephine Torres",
    "email": "parent.109238470190@parent.sapc.edu.ph",
    "phone": "+63 918 950 031",
    "relationship": "Mother",
    "linkedStudentName": "Paolo Torres",
    "linkedLRN": "109238470190",
    "linkedLRNs": [
      "109238470190"
    ],
    "linkedStudentNames": [
      "Paolo Torres"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0190!"
  },
  {
    "id": "PAR-194",
    "name": "Mr. Reynaldo Navarro",
    "email": "parent.109238470191@parent.sapc.edu.ph",
    "phone": "+63 918 951 368",
    "relationship": "Father",
    "linkedStudentName": "Angela Navarro",
    "linkedLRN": "109238470191",
    "linkedLRNs": [
      "109238470191"
    ],
    "linkedStudentNames": [
      "Angela Navarro"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0191!"
  },
  {
    "id": "PAR-195",
    "name": "Mrs. Remedios Mendoza",
    "email": "parent.109238470192@parent.sapc.edu.ph",
    "phone": "+63 918 952 705",
    "relationship": "Mother",
    "linkedStudentName": "Andrea Mendoza",
    "linkedLRN": "109238470192",
    "linkedLRNs": [
      "109238470192"
    ],
    "linkedStudentNames": [
      "Andrea Mendoza"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0192!"
  },
  {
    "id": "PAR-196",
    "name": "Mr. Renato Manalo",
    "email": "parent.109238470193@parent.sapc.edu.ph",
    "phone": "+63 918 954 042",
    "relationship": "Father",
    "linkedStudentName": "Grace Manalo",
    "linkedLRN": "109238470193",
    "linkedLRNs": [
      "109238470193"
    ],
    "linkedStudentNames": [
      "Grace Manalo"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0193!"
  },
  {
    "id": "PAR-197",
    "name": "Mrs. Flordeliza Santos",
    "email": "parent.109238470194@parent.sapc.edu.ph",
    "phone": "+63 918 955 379",
    "relationship": "Mother",
    "linkedStudentName": "Camille Santos",
    "linkedLRN": "109238470194",
    "linkedLRNs": [
      "109238470194"
    ],
    "linkedStudentNames": [
      "Camille Santos"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0194!"
  },
  {
    "id": "PAR-198",
    "name": "Mr. Rodolfo Corpuz",
    "email": "parent.109238470195@parent.sapc.edu.ph",
    "phone": "+63 918 956 716",
    "relationship": "Father",
    "linkedStudentName": "Rafael Corpuz",
    "linkedLRN": "109238470195",
    "linkedLRNs": [
      "109238470195"
    ],
    "linkedStudentNames": [
      "Rafael Corpuz"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0195!"
  },
  {
    "id": "PAR-199",
    "name": "Mrs. Cynthia Soriano",
    "email": "parent.109238470196@parent.sapc.edu.ph",
    "phone": "+63 918 958 053",
    "relationship": "Mother",
    "linkedStudentName": "Angelica Soriano",
    "linkedLRN": "109238470196",
    "linkedLRNs": [
      "109238470196"
    ],
    "linkedStudentNames": [
      "Angelica Soriano"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0196!"
  },
  {
    "id": "PAR-200",
    "name": "Mr. Nestor Cruz",
    "email": "parent.109238470197@parent.sapc.edu.ph",
    "phone": "+63 918 959 390",
    "relationship": "Father",
    "linkedStudentName": "Andrea Cruz",
    "linkedLRN": "109238470197",
    "linkedLRNs": [
      "109238470197"
    ],
    "linkedStudentNames": [
      "Andrea Cruz"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0197!"
  },
  {
    "id": "PAR-201",
    "name": "Mrs. Shirley Padilla",
    "email": "parent.109238470198@parent.sapc.edu.ph",
    "phone": "+63 918 960 727",
    "relationship": "Mother",
    "linkedStudentName": "Joy Padilla",
    "linkedLRN": "109238470198",
    "linkedLRNs": [
      "109238470198"
    ],
    "linkedStudentNames": [
      "Joy Padilla"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0198!"
  },
  {
    "id": "PAR-202",
    "name": "Mr. Jaime De Leon",
    "email": "parent.109238470199@parent.sapc.edu.ph",
    "phone": "+63 918 962 064",
    "relationship": "Father",
    "linkedStudentName": "Clarisse De Leon",
    "linkedLRN": "109238470199",
    "linkedLRNs": [
      "109238470199"
    ],
    "linkedStudentNames": [
      "Clarisse De Leon"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0199!"
  },
  {
    "id": "PAR-203",
    "name": "Mrs. Jennifer Reyes",
    "email": "parent.109238470200@parent.sapc.edu.ph",
    "phone": "+63 918 963 401",
    "relationship": "Mother",
    "linkedStudentName": "Lorenzo Reyes",
    "linkedLRN": "109238470200",
    "linkedLRNs": [
      "109238470200"
    ],
    "linkedStudentNames": [
      "Lorenzo Reyes"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0200!"
  },
  {
    "id": "PAR-204",
    "name": "Mr. Cesar Soriano",
    "email": "parent.109238470201@parent.sapc.edu.ph",
    "phone": "+63 918 964 738",
    "relationship": "Father",
    "linkedStudentName": "Therese Soriano",
    "linkedLRN": "109238470201",
    "linkedLRNs": [
      "109238470201"
    ],
    "linkedStudentNames": [
      "Therese Soriano"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0201!"
  },
  {
    "id": "PAR-205",
    "name": "Mrs. Grace Padilla",
    "email": "parent.109238470202@parent.sapc.edu.ph",
    "phone": "+63 918 966 075",
    "relationship": "Mother",
    "linkedStudentName": "Jerome Padilla",
    "linkedLRN": "109238470202",
    "linkedLRNs": [
      "109238470202"
    ],
    "linkedStudentNames": [
      "Jerome Padilla"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0202!"
  },
  {
    "id": "PAR-206",
    "name": "Mr. Arnel Santos",
    "email": "parent.109238470203@parent.sapc.edu.ph",
    "phone": "+63 918 967 412",
    "relationship": "Father",
    "linkedStudentName": "Carlos Santos",
    "linkedLRN": "109238470203",
    "linkedLRNs": [
      "109238470203"
    ],
    "linkedStudentNames": [
      "Carlos Santos"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0203!"
  },
  {
    "id": "PAR-207",
    "name": "Mrs. Gina Flores",
    "email": "parent.109238470204@parent.sapc.edu.ph",
    "phone": "+63 918 968 749",
    "relationship": "Mother",
    "linkedStudentName": "Adrian Flores",
    "linkedLRN": "109238470204",
    "linkedLRNs": [
      "109238470204"
    ],
    "linkedStudentNames": [
      "Adrian Flores"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0204!"
  },
  {
    "id": "PAR-208",
    "name": "Mr. Roberto Valdez",
    "email": "parent.109238470205@parent.sapc.edu.ph",
    "phone": "+63 918 970 086",
    "relationship": "Father",
    "linkedStudentName": "Lance Valdez",
    "linkedLRN": "109238470205",
    "linkedLRNs": [
      "109238470205"
    ],
    "linkedStudentNames": [
      "Lance Valdez"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0205!"
  },
  {
    "id": "PAR-209",
    "name": "Mrs. Teresa Torres",
    "email": "parent.109238470206@parent.sapc.edu.ph",
    "phone": "+63 918 971 423",
    "relationship": "Mother",
    "linkedStudentName": "Bianca Torres",
    "linkedLRN": "109238470206",
    "linkedLRNs": [
      "109238470206"
    ],
    "linkedStudentNames": [
      "Bianca Torres"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0206!"
  },
  {
    "id": "PAR-210",
    "name": "Mr. Edgardo Bautista",
    "email": "parent.109238470207@parent.sapc.edu.ph",
    "phone": "+63 918 972 760",
    "relationship": "Father",
    "linkedStudentName": "Anthony Bautista",
    "linkedLRN": "109238470207",
    "linkedLRNs": [
      "109238470207"
    ],
    "linkedStudentNames": [
      "Anthony Bautista"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0207!"
  },
  {
    "id": "PAR-211",
    "name": "Mrs. Corazon Aquino",
    "email": "parent.109238470208@parent.sapc.edu.ph",
    "phone": "+63 918 974 097",
    "relationship": "Mother",
    "linkedStudentName": "Anthony Aquino",
    "linkedLRN": "109238470208",
    "linkedLRNs": [
      "109238470208"
    ],
    "linkedStudentNames": [
      "Anthony Aquino"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0208!"
  },
  {
    "id": "PAR-212",
    "name": "Mr. Rolando Manalo",
    "email": "parent.109238470209@parent.sapc.edu.ph",
    "phone": "+63 918 975 434",
    "relationship": "Father",
    "linkedStudentName": "Elijah Manalo",
    "linkedLRN": "109238470209",
    "linkedLRNs": [
      "109238470209"
    ],
    "linkedStudentNames": [
      "Elijah Manalo"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0209!"
  },
  {
    "id": "PAR-213",
    "name": "Mrs. Rowena Navarro",
    "email": "parent.109238470210@parent.sapc.edu.ph",
    "phone": "+63 918 976 771",
    "relationship": "Mother",
    "linkedStudentName": "Therese Navarro",
    "linkedLRN": "109238470210",
    "linkedLRNs": [
      "109238470210"
    ],
    "linkedStudentNames": [
      "Therese Navarro"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0210!"
  },
  {
    "id": "PAR-214",
    "name": "Mr. Ramon Villanueva",
    "email": "parent.109238470211@parent.sapc.edu.ph",
    "phone": "+63 918 978 108",
    "relationship": "Father",
    "linkedStudentName": "Tristan Villanueva",
    "linkedLRN": "109238470211",
    "linkedLRNs": [
      "109238470211"
    ],
    "linkedStudentNames": [
      "Tristan Villanueva"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0211!"
  },
  {
    "id": "PAR-215",
    "name": "Mrs. Lorna Padilla",
    "email": "parent.109238470212@parent.sapc.edu.ph",
    "phone": "+63 918 979 445",
    "relationship": "Mother",
    "linkedStudentName": "Angelica Padilla",
    "linkedLRN": "109238470212",
    "linkedLRNs": [
      "109238470212"
    ],
    "linkedStudentNames": [
      "Angelica Padilla"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0212!"
  },
  {
    "id": "PAR-216",
    "name": "Mr. Antonio Bautista",
    "email": "parent.109238470213@parent.sapc.edu.ph",
    "phone": "+63 918 980 782",
    "relationship": "Father",
    "linkedStudentName": "Angelo Bautista",
    "linkedLRN": "109238470213",
    "linkedLRNs": [
      "109238470213"
    ],
    "linkedStudentNames": [
      "Angelo Bautista"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0213!"
  },
  {
    "id": "PAR-217",
    "name": "Mrs. Mary Ann Aquino",
    "email": "parent.109238470214@parent.sapc.edu.ph",
    "phone": "+63 918 982 119",
    "relationship": "Mother",
    "linkedStudentName": "Lorenzo Aquino",
    "linkedLRN": "109238470214",
    "linkedLRNs": [
      "109238470214"
    ],
    "linkedStudentNames": [
      "Lorenzo Aquino"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0214!"
  },
  {
    "id": "PAR-218",
    "name": "Mr. Eduardo Pascual",
    "email": "parent.109238470215@parent.sapc.edu.ph",
    "phone": "+63 918 983 456",
    "relationship": "Father",
    "linkedStudentName": "Grace Pascual",
    "linkedLRN": "109238470215",
    "linkedLRNs": [
      "109238470215"
    ],
    "linkedStudentNames": [
      "Grace Pascual"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0215!"
  },
  {
    "id": "PAR-219",
    "name": "Mrs. Jocelyn Cruz",
    "email": "parent.109238470216@parent.sapc.edu.ph",
    "phone": "+63 918 984 793",
    "relationship": "Mother",
    "linkedStudentName": "Miguel Cruz",
    "linkedLRN": "109238470216",
    "linkedLRNs": [
      "109238470216"
    ],
    "linkedStudentNames": [
      "Miguel Cruz"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0216!"
  },
  {
    "id": "PAR-220",
    "name": "Mr. Wilfredo Santiago",
    "email": "parent.109238470217@parent.sapc.edu.ph",
    "phone": "+63 918 986 130",
    "relationship": "Father",
    "linkedStudentName": "Karl Santiago",
    "linkedLRN": "109238470217",
    "linkedLRNs": [
      "109238470217"
    ],
    "linkedStudentNames": [
      "Karl Santiago"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0217!"
  },
  {
    "id": "PAR-221",
    "name": "Mrs. Elizabeth Padilla",
    "email": "parent.109238470218@parent.sapc.edu.ph",
    "phone": "+63 918 987 467",
    "relationship": "Mother",
    "linkedStudentName": "Joshua Padilla",
    "linkedLRN": "109238470218",
    "linkedLRNs": [
      "109238470218"
    ],
    "linkedStudentNames": [
      "Joshua Padilla"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0218!"
  },
  {
    "id": "PAR-222",
    "name": "Mr. Victor Villanueva",
    "email": "parent.109238470219@parent.sapc.edu.ph",
    "phone": "+63 918 988 804",
    "relationship": "Father",
    "linkedStudentName": "Rafael Villanueva",
    "linkedLRN": "109238470219",
    "linkedLRNs": [
      "109238470219"
    ],
    "linkedStudentNames": [
      "Rafael Villanueva"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0219!"
  },
  {
    "id": "PAR-223",
    "name": "Mrs. Imelda Domingo",
    "email": "parent.109238470220@parent.sapc.edu.ph",
    "phone": "+63 918 990 141",
    "relationship": "Mother",
    "linkedStudentName": "Camille Domingo",
    "linkedLRN": "109238470220",
    "linkedLRNs": [
      "109238470220"
    ],
    "linkedStudentNames": [
      "Camille Domingo"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0220!"
  },
  {
    "id": "PAR-224",
    "name": "Mr. Gabriel Dimaculangan",
    "email": "parent.109238470221@parent.sapc.edu.ph",
    "phone": "+63 918 991 478",
    "relationship": "Father",
    "linkedStudentName": "Erika Dimaculangan",
    "linkedLRN": "109238470221",
    "linkedLRNs": [
      "109238470221"
    ],
    "linkedStudentNames": [
      "Erika Dimaculangan"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0221!"
  },
  {
    "id": "PAR-225",
    "name": "Mrs. Bernadette Ocampo",
    "email": "parent.109238470222@parent.sapc.edu.ph",
    "phone": "+63 918 992 815",
    "relationship": "Mother",
    "linkedStudentName": "Matthew Ocampo",
    "linkedLRN": "109238470222",
    "linkedLRNs": [
      "109238470222"
    ],
    "linkedStudentNames": [
      "Matthew Ocampo"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0222!"
  },
  {
    "id": "PAR-226",
    "name": "Mr. Manuel Rivera",
    "email": "parent.109238470223@parent.sapc.edu.ph",
    "phone": "+63 918 994 152",
    "relationship": "Father",
    "linkedStudentName": "Alyssa Rivera",
    "linkedLRN": "109238470223",
    "linkedLRNs": [
      "109238470223"
    ],
    "linkedStudentNames": [
      "Alyssa Rivera"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0223!"
  },
  {
    "id": "PAR-227",
    "name": "Mrs. Cristina Villanueva",
    "email": "parent.109238470224@parent.sapc.edu.ph",
    "phone": "+63 918 995 489",
    "relationship": "Mother",
    "linkedStudentName": "Sebastian Villanueva",
    "linkedLRN": "109238470224",
    "linkedLRNs": [
      "109238470224"
    ],
    "linkedStudentNames": [
      "Sebastian Villanueva"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0224!"
  },
  {
    "id": "PAR-228",
    "name": "Mr. Mario Mercado",
    "email": "parent.109238470225@parent.sapc.edu.ph",
    "phone": "+63 918 996 826",
    "relationship": "Father",
    "linkedStudentName": "Cecilia Mercado",
    "linkedLRN": "109238470225",
    "linkedLRNs": [
      "109238470225"
    ],
    "linkedStudentNames": [
      "Cecilia Mercado"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0225!"
  },
  {
    "id": "PAR-229",
    "name": "Mrs. Lourdes Reyes",
    "email": "parent.109238470226@parent.sapc.edu.ph",
    "phone": "+63 918 998 163",
    "relationship": "Mother",
    "linkedStudentName": "Jerome Reyes",
    "linkedLRN": "109238470226",
    "linkedLRNs": [
      "109238470226"
    ],
    "linkedStudentNames": [
      "Jerome Reyes"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0226!"
  },
  {
    "id": "PAR-230",
    "name": "Mr. Gerardo Ocampo",
    "email": "parent.109238470227@parent.sapc.edu.ph",
    "phone": "+63 918 999 500",
    "relationship": "Father",
    "linkedStudentName": "Francis Ocampo",
    "linkedLRN": "109238470227",
    "linkedLRNs": [
      "109238470227"
    ],
    "linkedStudentNames": [
      "Francis Ocampo"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0227!"
  },
  {
    "id": "PAR-231",
    "name": "Mrs. Elena Santiago",
    "email": "parent.109238470228@parent.sapc.edu.ph",
    "phone": "+63 919 000 837",
    "relationship": "Mother",
    "linkedStudentName": "Joshua Santiago",
    "linkedLRN": "109238470228",
    "linkedLRNs": [
      "109238470228"
    ],
    "linkedStudentNames": [
      "Joshua Santiago"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0228!"
  },
  {
    "id": "PAR-232",
    "name": "Mr. Ernesto Mendoza",
    "email": "parent.109238470229@parent.sapc.edu.ph",
    "phone": "+63 919 002 174",
    "relationship": "Father",
    "linkedStudentName": "Mark Mendoza",
    "linkedLRN": "109238470229",
    "linkedLRNs": [
      "109238470229"
    ],
    "linkedStudentNames": [
      "Mark Mendoza"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0229!"
  },
  {
    "id": "PAR-233",
    "name": "Mrs. Maricel Navarro",
    "email": "parent.109238470230@parent.sapc.edu.ph",
    "phone": "+63 919 003 511",
    "relationship": "Mother",
    "linkedStudentName": "Chloe Navarro",
    "linkedLRN": "109238470230",
    "linkedLRNs": [
      "109238470230"
    ],
    "linkedStudentNames": [
      "Chloe Navarro"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0230!"
  },
  {
    "id": "PAR-234",
    "name": "Mr. Ferdinand Navarro",
    "email": "parent.109238470231@parent.sapc.edu.ph",
    "phone": "+63 919 004 848",
    "relationship": "Father",
    "linkedStudentName": "Faith Navarro",
    "linkedLRN": "109238470231",
    "linkedLRNs": [
      "109238470231"
    ],
    "linkedStudentNames": [
      "Faith Navarro"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0231!"
  },
  {
    "id": "PAR-235",
    "name": "Mrs. Carmela Torres",
    "email": "parent.109238470232@parent.sapc.edu.ph",
    "phone": "+63 919 006 185",
    "relationship": "Mother",
    "linkedStudentName": "Nathan Torres",
    "linkedLRN": "109238470232",
    "linkedLRNs": [
      "109238470232"
    ],
    "linkedStudentNames": [
      "Nathan Torres"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0232!"
  },
  {
    "id": "PAR-236",
    "name": "Mr. Carlos Ramos",
    "email": "parent.109238470233@parent.sapc.edu.ph",
    "phone": "+63 919 007 522",
    "relationship": "Father",
    "linkedStudentName": "Andrea Ramos",
    "linkedLRN": "109238470233",
    "linkedLRNs": [
      "109238470233"
    ],
    "linkedStudentNames": [
      "Andrea Ramos"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0233!"
  },
  {
    "id": "PAR-237",
    "name": "Mrs. Rosalinda Lim",
    "email": "parent.109238470234@parent.sapc.edu.ph",
    "phone": "+63 919 008 859",
    "relationship": "Mother",
    "linkedStudentName": "Elijah Lim",
    "linkedLRN": "109238470234",
    "linkedLRNs": [
      "109238470234"
    ],
    "linkedStudentNames": [
      "Elijah Lim"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0234!"
  },
  {
    "id": "PAR-238",
    "name": "Mr. Danilo Rivera",
    "email": "parent.109238470235@parent.sapc.edu.ph",
    "phone": "+63 919 010 196",
    "relationship": "Father",
    "linkedStudentName": "Andrea Rivera",
    "linkedLRN": "109238470235",
    "linkedLRNs": [
      "109238470235"
    ],
    "linkedStudentNames": [
      "Andrea Rivera"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0235!"
  },
  {
    "id": "PAR-239",
    "name": "Mrs. Josephine Rivera",
    "email": "parent.109238470236@parent.sapc.edu.ph",
    "phone": "+63 919 011 533",
    "relationship": "Mother",
    "linkedStudentName": "Mariel Rivera",
    "linkedLRN": "109238470236",
    "linkedLRNs": [
      "109238470236"
    ],
    "linkedStudentNames": [
      "Mariel Rivera"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0236!"
  },
  {
    "id": "PAR-240",
    "name": "Mr. Reynaldo Santiago",
    "email": "parent.109238470237@parent.sapc.edu.ph",
    "phone": "+63 919 012 870",
    "relationship": "Father",
    "linkedStudentName": "Vincent Santiago",
    "linkedLRN": "109238470237",
    "linkedLRNs": [
      "109238470237"
    ],
    "linkedStudentNames": [
      "Vincent Santiago"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0237!"
  },
  {
    "id": "PAR-241",
    "name": "Mrs. Remedios Pascual",
    "email": "parent.109238470238@parent.sapc.edu.ph",
    "phone": "+63 919 014 207",
    "relationship": "Mother",
    "linkedStudentName": "Diego Pascual",
    "linkedLRN": "109238470238",
    "linkedLRNs": [
      "109238470238"
    ],
    "linkedStudentNames": [
      "Diego Pascual"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0238!"
  },
  {
    "id": "PAR-242",
    "name": "Mr. Renato Rivera",
    "email": "parent.109238470239@parent.sapc.edu.ph",
    "phone": "+63 919 015 544",
    "relationship": "Father",
    "linkedStudentName": "Benedict Rivera",
    "linkedLRN": "109238470239",
    "linkedLRNs": [
      "109238470239"
    ],
    "linkedStudentNames": [
      "Benedict Rivera"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0239!"
  },
  {
    "id": "PAR-243",
    "name": "Mrs. Flordeliza Domingo",
    "email": "parent.109238470240@parent.sapc.edu.ph",
    "phone": "+63 919 016 881",
    "relationship": "Mother",
    "linkedStudentName": "Janine Domingo",
    "linkedLRN": "109238470240",
    "linkedLRNs": [
      "109238470240"
    ],
    "linkedStudentNames": [
      "Janine Domingo"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0240!"
  },
  {
    "id": "PAR-244",
    "name": "Mr. Rodolfo Padilla",
    "email": "parent.109238470241@parent.sapc.edu.ph",
    "phone": "+63 919 018 218",
    "relationship": "Father",
    "linkedStudentName": "Benedict Padilla",
    "linkedLRN": "109238470241",
    "linkedLRNs": [
      "109238470241"
    ],
    "linkedStudentNames": [
      "Benedict Padilla"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0241!"
  },
  {
    "id": "PAR-245",
    "name": "Mrs. Cynthia Salazar",
    "email": "parent.109238470242@parent.sapc.edu.ph",
    "phone": "+63 919 019 555",
    "relationship": "Mother",
    "linkedStudentName": "Joy Salazar",
    "linkedLRN": "109238470242",
    "linkedLRNs": [
      "109238470242"
    ],
    "linkedStudentNames": [
      "Joy Salazar"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0242!"
  },
  {
    "id": "PAR-246",
    "name": "Mr. Nestor Bautista",
    "email": "parent.109238470243@parent.sapc.edu.ph",
    "phone": "+63 919 020 892",
    "relationship": "Father",
    "linkedStudentName": "Francis Bautista",
    "linkedLRN": "109238470243",
    "linkedLRNs": [
      "109238470243"
    ],
    "linkedStudentNames": [
      "Francis Bautista"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0243!"
  },
  {
    "id": "PAR-247",
    "name": "Mrs. Shirley Ramos",
    "email": "parent.109238470244@parent.sapc.edu.ph",
    "phone": "+63 919 022 229",
    "relationship": "Mother",
    "linkedStudentName": "Emman Ramos",
    "linkedLRN": "109238470244",
    "linkedLRNs": [
      "109238470244"
    ],
    "linkedStudentNames": [
      "Emman Ramos"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0244!"
  },
  {
    "id": "PAR-248",
    "name": "Mr. Jaime Corpuz",
    "email": "parent.109238470245@parent.sapc.edu.ph",
    "phone": "+63 919 023 566",
    "relationship": "Father",
    "linkedStudentName": "Cedric Corpuz",
    "linkedLRN": "109238470245",
    "linkedLRNs": [
      "109238470245"
    ],
    "linkedStudentNames": [
      "Cedric Corpuz"
    ],
    "section": "Grade 8 - St. Benedict",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0245!"
  },
  {
    "id": "PAR-249",
    "name": "Mrs. Jennifer Garcia",
    "email": "parent.109238470246@parent.sapc.edu.ph",
    "phone": "+63 919 024 903",
    "relationship": "Mother",
    "linkedStudentName": "Simon Garcia",
    "linkedLRN": "109238470246",
    "linkedLRNs": [
      "109238470246"
    ],
    "linkedStudentNames": [
      "Simon Garcia"
    ],
    "section": "Grade 8 - St. Dominic",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0246!"
  },
  {
    "id": "PAR-250",
    "name": "Mr. Cesar Padilla",
    "email": "parent.109238470247@parent.sapc.edu.ph",
    "phone": "+63 919 026 240",
    "relationship": "Father",
    "linkedStudentName": "Justin Padilla",
    "linkedLRN": "109238470247",
    "linkedLRNs": [
      "109238470247"
    ],
    "linkedStudentNames": [
      "Justin Padilla"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0247!"
  },
  {
    "id": "PAR-251",
    "name": "Mrs. Grace Dela Cruz",
    "email": "parent.109238470248@parent.sapc.edu.ph",
    "phone": "+63 919 027 577",
    "relationship": "Mother",
    "linkedStudentName": "John Carlo Dela Cruz",
    "linkedLRN": "109238470248",
    "linkedLRNs": [
      "109238470248"
    ],
    "linkedStudentNames": [
      "John Carlo Dela Cruz"
    ],
    "section": "Grade 8 - St. Clare",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0248!"
  },
  {
    "id": "PAR-252",
    "name": "Mr. Arnel Santiago",
    "email": "parent.109238470249@parent.sapc.edu.ph",
    "phone": "+63 919 028 914",
    "relationship": "Father",
    "linkedStudentName": "Alyssa Santiago",
    "linkedLRN": "109238470249",
    "linkedLRNs": [
      "109238470249"
    ],
    "linkedStudentNames": [
      "Alyssa Santiago"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0249!"
  },
  {
    "id": "PAR-253",
    "name": "Mrs. Gina Soriano",
    "email": "parent.109238470250@parent.sapc.edu.ph",
    "phone": "+63 919 030 251",
    "relationship": "Mother",
    "linkedStudentName": "Chloe Soriano",
    "linkedLRN": "109238470250",
    "linkedLRNs": [
      "109238470250"
    ],
    "linkedStudentNames": [
      "Chloe Soriano"
    ],
    "section": "Grade 8 - St. Rita",
    "gradeLevel": "Grade 8",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0250!"
  },
  {
    "id": "PAR-254",
    "name": "Mr. Roberto Ramos",
    "email": "parent.109238470251@parent.sapc.edu.ph",
    "phone": "+63 919 031 588",
    "relationship": "Father",
    "linkedStudentName": "Mariel Ramos",
    "linkedLRN": "109238470251",
    "linkedLRNs": [
      "109238470251"
    ],
    "linkedStudentNames": [
      "Mariel Ramos"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0251!"
  },
  {
    "id": "PAR-255",
    "name": "Mrs. Teresa Castillo",
    "email": "parent.109238470252@parent.sapc.edu.ph",
    "phone": "+63 919 032 925",
    "relationship": "Mother",
    "linkedStudentName": "Karl Castillo",
    "linkedLRN": "109238470252",
    "linkedLRNs": [
      "109238470252"
    ],
    "linkedStudentNames": [
      "Karl Castillo"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0252!"
  },
  {
    "id": "PAR-256",
    "name": "Mr. Edgardo Aquino",
    "email": "parent.109238470253@parent.sapc.edu.ph",
    "phone": "+63 919 034 262",
    "relationship": "Father",
    "linkedStudentName": "Justin Aquino",
    "linkedLRN": "109238470253",
    "linkedLRNs": [
      "109238470253"
    ],
    "linkedStudentNames": [
      "Justin Aquino"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0253!"
  },
  {
    "id": "PAR-257",
    "name": "Mrs. Corazon Castillo",
    "email": "parent.109238470254@parent.sapc.edu.ph",
    "phone": "+63 919 035 599",
    "relationship": "Mother",
    "linkedStudentName": "Alyssa Castillo",
    "linkedLRN": "109238470254",
    "linkedLRNs": [
      "109238470254"
    ],
    "linkedStudentNames": [
      "Alyssa Castillo"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0254!"
  },
  {
    "id": "PAR-258",
    "name": "Mr. Rolando Tolentino",
    "email": "parent.109238470255@parent.sapc.edu.ph",
    "phone": "+63 919 036 936",
    "relationship": "Father",
    "linkedStudentName": "Elijah Tolentino",
    "linkedLRN": "109238470255",
    "linkedLRNs": [
      "109238470255"
    ],
    "linkedStudentNames": [
      "Elijah Tolentino"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0255!"
  },
  {
    "id": "PAR-259",
    "name": "Mrs. Rowena Santiago",
    "email": "parent.109238470256@parent.sapc.edu.ph",
    "phone": "+63 919 038 273",
    "relationship": "Mother",
    "linkedStudentName": "Martin Santiago",
    "linkedLRN": "109238470256",
    "linkedLRNs": [
      "109238470256"
    ],
    "linkedStudentNames": [
      "Martin Santiago"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0256!"
  },
  {
    "id": "PAR-260",
    "name": "Mr. Ramon De Leon",
    "email": "parent.109238470257@parent.sapc.edu.ph",
    "phone": "+63 919 039 610",
    "relationship": "Father",
    "linkedStudentName": "Andrea De Leon",
    "linkedLRN": "109238470257",
    "linkedLRNs": [
      "109238470257"
    ],
    "linkedStudentNames": [
      "Andrea De Leon"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0257!"
  },
  {
    "id": "PAR-261",
    "name": "Mrs. Lorna Dimaculangan",
    "email": "parent.109238470258@parent.sapc.edu.ph",
    "phone": "+63 919 040 947",
    "relationship": "Mother",
    "linkedStudentName": "Justin Dimaculangan",
    "linkedLRN": "109238470258",
    "linkedLRNs": [
      "109238470258"
    ],
    "linkedStudentNames": [
      "Justin Dimaculangan"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0258!"
  },
  {
    "id": "PAR-262",
    "name": "Mr. Antonio Castro",
    "email": "parent.109238470259@parent.sapc.edu.ph",
    "phone": "+63 919 042 284",
    "relationship": "Father",
    "linkedStudentName": "Christian Castro",
    "linkedLRN": "109238470259",
    "linkedLRNs": [
      "109238470259"
    ],
    "linkedStudentNames": [
      "Christian Castro"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0259!"
  },
  {
    "id": "PAR-263",
    "name": "Mrs. Mary Ann Soriano",
    "email": "parent.109238470260@parent.sapc.edu.ph",
    "phone": "+63 919 043 621",
    "relationship": "Mother",
    "linkedStudentName": "Alyssa Soriano",
    "linkedLRN": "109238470260",
    "linkedLRNs": [
      "109238470260"
    ],
    "linkedStudentNames": [
      "Alyssa Soriano"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0260!"
  },
  {
    "id": "PAR-264",
    "name": "Mr. Eduardo Villanueva",
    "email": "parent.109238470261@parent.sapc.edu.ph",
    "phone": "+63 919 044 958",
    "relationship": "Father",
    "linkedStudentName": "Princess Mae Villanueva",
    "linkedLRN": "109238470261",
    "linkedLRNs": [
      "109238470261"
    ],
    "linkedStudentNames": [
      "Princess Mae Villanueva"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0261!"
  },
  {
    "id": "PAR-265",
    "name": "Mrs. Jocelyn Flores",
    "email": "parent.109238470262@parent.sapc.edu.ph",
    "phone": "+63 919 046 295",
    "relationship": "Mother",
    "linkedStudentName": "Benedict Flores",
    "linkedLRN": "109238470262",
    "linkedLRNs": [
      "109238470262"
    ],
    "linkedStudentNames": [
      "Benedict Flores"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0262!"
  },
  {
    "id": "PAR-266",
    "name": "Mr. Wilfredo Flores",
    "email": "parent.109238470263@parent.sapc.edu.ph",
    "phone": "+63 919 047 632",
    "relationship": "Father",
    "linkedStudentName": "Jerome Flores",
    "linkedLRN": "109238470263",
    "linkedLRNs": [
      "109238470263"
    ],
    "linkedStudentNames": [
      "Jerome Flores"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0263!"
  },
  {
    "id": "PAR-267",
    "name": "Mrs. Elizabeth Gonzales",
    "email": "parent.109238470264@parent.sapc.edu.ph",
    "phone": "+63 919 048 969",
    "relationship": "Mother",
    "linkedStudentName": "Jasmine Gonzales",
    "linkedLRN": "109238470264",
    "linkedLRNs": [
      "109238470264"
    ],
    "linkedStudentNames": [
      "Jasmine Gonzales"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0264!"
  },
  {
    "id": "PAR-268",
    "name": "Mr. Victor Garcia",
    "email": "parent.109238470265@parent.sapc.edu.ph",
    "phone": "+63 919 050 306",
    "relationship": "Father",
    "linkedStudentName": "Liza Garcia",
    "linkedLRN": "109238470265",
    "linkedLRNs": [
      "109238470265"
    ],
    "linkedStudentNames": [
      "Liza Garcia"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0265!"
  },
  {
    "id": "PAR-269",
    "name": "Mrs. Imelda Navarro",
    "email": "parent.109238470266@parent.sapc.edu.ph",
    "phone": "+63 919 051 643",
    "relationship": "Mother",
    "linkedStudentName": "Christian Navarro",
    "linkedLRN": "109238470266",
    "linkedLRNs": [
      "109238470266"
    ],
    "linkedStudentNames": [
      "Christian Navarro"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0266!"
  },
  {
    "id": "PAR-270",
    "name": "Mr. Gabriel Mendoza",
    "email": "parent.109238470267@parent.sapc.edu.ph",
    "phone": "+63 919 052 980",
    "relationship": "Father",
    "linkedStudentName": "Paolo Mendoza",
    "linkedLRN": "109238470267",
    "linkedLRNs": [
      "109238470267"
    ],
    "linkedStudentNames": [
      "Paolo Mendoza"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0267!"
  },
  {
    "id": "PAR-271",
    "name": "Mrs. Bernadette San Jose",
    "email": "parent.109238470268@parent.sapc.edu.ph",
    "phone": "+63 919 054 317",
    "relationship": "Mother",
    "linkedStudentName": "Joshua San Jose",
    "linkedLRN": "109238470268",
    "linkedLRNs": [
      "109238470268"
    ],
    "linkedStudentNames": [
      "Joshua San Jose"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0268!"
  },
  {
    "id": "PAR-272",
    "name": "Mr. Manuel Mendoza",
    "email": "parent.109238470269@parent.sapc.edu.ph",
    "phone": "+63 919 055 654",
    "relationship": "Father",
    "linkedStudentName": "Anthony Mendoza",
    "linkedLRN": "109238470269",
    "linkedLRNs": [
      "109238470269"
    ],
    "linkedStudentNames": [
      "Anthony Mendoza"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0269!"
  },
  {
    "id": "PAR-273",
    "name": "Mrs. Cristina Mendoza",
    "email": "parent.109238470270@parent.sapc.edu.ph",
    "phone": "+63 919 056 991",
    "relationship": "Mother",
    "linkedStudentName": "Vanessa Mendoza",
    "linkedLRN": "109238470270",
    "linkedLRNs": [
      "109238470270"
    ],
    "linkedStudentNames": [
      "Vanessa Mendoza"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0270!"
  },
  {
    "id": "PAR-274",
    "name": "Mr. Mario De Leon",
    "email": "parent.109238470271@parent.sapc.edu.ph",
    "phone": "+63 919 058 328",
    "relationship": "Father",
    "linkedStudentName": "Bernadette De Leon",
    "linkedLRN": "109238470271",
    "linkedLRNs": [
      "109238470271"
    ],
    "linkedStudentNames": [
      "Bernadette De Leon"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0271!"
  },
  {
    "id": "PAR-275",
    "name": "Mrs. Lourdes Bautista",
    "email": "parent.109238470272@parent.sapc.edu.ph",
    "phone": "+63 919 059 665",
    "relationship": "Mother",
    "linkedStudentName": "Cecilia Bautista",
    "linkedLRN": "109238470272",
    "linkedLRNs": [
      "109238470272"
    ],
    "linkedStudentNames": [
      "Cecilia Bautista"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0272!"
  },
  {
    "id": "PAR-276",
    "name": "Mr. Gerardo Rivera",
    "email": "parent.109238470273@parent.sapc.edu.ph",
    "phone": "+63 919 061 002",
    "relationship": "Father",
    "linkedStudentName": "Nicole Rivera",
    "linkedLRN": "109238470273",
    "linkedLRNs": [
      "109238470273"
    ],
    "linkedStudentNames": [
      "Nicole Rivera"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0273!"
  },
  {
    "id": "PAR-277",
    "name": "Mrs. Elena Domingo",
    "email": "parent.109238470274@parent.sapc.edu.ph",
    "phone": "+63 919 062 339",
    "relationship": "Mother",
    "linkedStudentName": "Joaquin Domingo",
    "linkedLRN": "109238470274",
    "linkedLRNs": [
      "109238470274"
    ],
    "linkedStudentNames": [
      "Joaquin Domingo"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0274!"
  },
  {
    "id": "PAR-278",
    "name": "Mr. Ernesto Corpuz",
    "email": "parent.109238470275@parent.sapc.edu.ph",
    "phone": "+63 919 063 676",
    "relationship": "Father",
    "linkedStudentName": "Kathleen Corpuz",
    "linkedLRN": "109238470275",
    "linkedLRNs": [
      "109238470275"
    ],
    "linkedStudentNames": [
      "Kathleen Corpuz"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0275!"
  },
  {
    "id": "PAR-279",
    "name": "Mrs. Maricel Flores",
    "email": "parent.109238470276@parent.sapc.edu.ph",
    "phone": "+63 919 065 013",
    "relationship": "Mother",
    "linkedStudentName": "Benedict Flores",
    "linkedLRN": "109238470276",
    "linkedLRNs": [
      "109238470276"
    ],
    "linkedStudentNames": [
      "Benedict Flores"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0276!"
  },
  {
    "id": "PAR-280",
    "name": "Mr. Ferdinand Castro",
    "email": "parent.109238470277@parent.sapc.edu.ph",
    "phone": "+63 919 066 350",
    "relationship": "Father",
    "linkedStudentName": "Nicole Castro",
    "linkedLRN": "109238470277",
    "linkedLRNs": [
      "109238470277"
    ],
    "linkedStudentNames": [
      "Nicole Castro"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0277!"
  },
  {
    "id": "PAR-281",
    "name": "Mrs. Carmela Garcia",
    "email": "parent.109238470278@parent.sapc.edu.ph",
    "phone": "+63 919 067 687",
    "relationship": "Mother",
    "linkedStudentName": "Karl Garcia",
    "linkedLRN": "109238470278",
    "linkedLRNs": [
      "109238470278"
    ],
    "linkedStudentNames": [
      "Karl Garcia"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0278!"
  },
  {
    "id": "PAR-282",
    "name": "Mr. Carlos Cruz",
    "email": "parent.109238470279@parent.sapc.edu.ph",
    "phone": "+63 919 069 024",
    "relationship": "Father",
    "linkedStudentName": "Chloe Cruz",
    "linkedLRN": "109238470279",
    "linkedLRNs": [
      "109238470279"
    ],
    "linkedStudentNames": [
      "Chloe Cruz"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0279!"
  },
  {
    "id": "PAR-283",
    "name": "Mrs. Rosalinda Corpuz",
    "email": "parent.109238470280@parent.sapc.edu.ph",
    "phone": "+63 919 070 361",
    "relationship": "Mother",
    "linkedStudentName": "Timothy Corpuz",
    "linkedLRN": "109238470280",
    "linkedLRNs": [
      "109238470280"
    ],
    "linkedStudentNames": [
      "Timothy Corpuz"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0280!"
  },
  {
    "id": "PAR-284",
    "name": "Mr. Danilo San Jose",
    "email": "parent.109238470281@parent.sapc.edu.ph",
    "phone": "+63 919 071 698",
    "relationship": "Father",
    "linkedStudentName": "Grace San Jose",
    "linkedLRN": "109238470281",
    "linkedLRNs": [
      "109238470281"
    ],
    "linkedStudentNames": [
      "Grace San Jose"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0281!"
  },
  {
    "id": "PAR-285",
    "name": "Mrs. Josephine Tolentino",
    "email": "parent.109238470282@parent.sapc.edu.ph",
    "phone": "+63 919 073 035",
    "relationship": "Mother",
    "linkedStudentName": "Patricia Tolentino",
    "linkedLRN": "109238470282",
    "linkedLRNs": [
      "109238470282"
    ],
    "linkedStudentNames": [
      "Patricia Tolentino"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0282!"
  },
  {
    "id": "PAR-286",
    "name": "Mr. Reynaldo Lim",
    "email": "parent.109238470283@parent.sapc.edu.ph",
    "phone": "+63 919 074 372",
    "relationship": "Father",
    "linkedStudentName": "Jasmine Lim",
    "linkedLRN": "109238470283",
    "linkedLRNs": [
      "109238470283"
    ],
    "linkedStudentNames": [
      "Jasmine Lim"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0283!"
  },
  {
    "id": "PAR-287",
    "name": "Mrs. Remedios Tolentino",
    "email": "parent.109238470284@parent.sapc.edu.ph",
    "phone": "+63 919 075 709",
    "relationship": "Mother",
    "linkedStudentName": "Grace Tolentino",
    "linkedLRN": "109238470284",
    "linkedLRNs": [
      "109238470284"
    ],
    "linkedStudentNames": [
      "Grace Tolentino"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0284!"
  },
  {
    "id": "PAR-288",
    "name": "Mr. Renato Salazar",
    "email": "parent.109238470285@parent.sapc.edu.ph",
    "phone": "+63 919 077 046",
    "relationship": "Father",
    "linkedStudentName": "Alyssa Salazar",
    "linkedLRN": "109238470285",
    "linkedLRNs": [
      "109238470285"
    ],
    "linkedStudentNames": [
      "Alyssa Salazar"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0285!"
  },
  {
    "id": "PAR-289",
    "name": "Mrs. Flordeliza Aquino",
    "email": "parent.109238470286@parent.sapc.edu.ph",
    "phone": "+63 919 078 383",
    "relationship": "Mother",
    "linkedStudentName": "Maria Clara Aquino",
    "linkedLRN": "109238470286",
    "linkedLRNs": [
      "109238470286"
    ],
    "linkedStudentNames": [
      "Maria Clara Aquino"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0286!"
  },
  {
    "id": "PAR-290",
    "name": "Mr. Rodolfo Castillo",
    "email": "parent.109238470287@parent.sapc.edu.ph",
    "phone": "+63 919 079 720",
    "relationship": "Father",
    "linkedStudentName": "Carlos Castillo",
    "linkedLRN": "109238470287",
    "linkedLRNs": [
      "109238470287"
    ],
    "linkedStudentNames": [
      "Carlos Castillo"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0287!"
  },
  {
    "id": "PAR-291",
    "name": "Mrs. Cynthia Manalo",
    "email": "parent.109238470288@parent.sapc.edu.ph",
    "phone": "+63 919 081 057",
    "relationship": "Mother",
    "linkedStudentName": "Maria Clara Manalo",
    "linkedLRN": "109238470288",
    "linkedLRNs": [
      "109238470288"
    ],
    "linkedStudentNames": [
      "Maria Clara Manalo"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0288!"
  },
  {
    "id": "PAR-292",
    "name": "Mr. Nestor Bautista",
    "email": "parent.109238470289@parent.sapc.edu.ph",
    "phone": "+63 919 082 394",
    "relationship": "Father",
    "linkedStudentName": "Jasmine Bautista",
    "linkedLRN": "109238470289",
    "linkedLRNs": [
      "109238470289"
    ],
    "linkedStudentNames": [
      "Jasmine Bautista"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0289!"
  },
  {
    "id": "PAR-293",
    "name": "Mrs. Shirley Alcantara",
    "email": "parent.109238470290@parent.sapc.edu.ph",
    "phone": "+63 919 083 731",
    "relationship": "Mother",
    "linkedStudentName": "Nicole Alcantara",
    "linkedLRN": "109238470290",
    "linkedLRNs": [
      "109238470290"
    ],
    "linkedStudentNames": [
      "Nicole Alcantara"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0290!"
  },
  {
    "id": "PAR-294",
    "name": "Mr. Jaime Santiago",
    "email": "parent.109238470291@parent.sapc.edu.ph",
    "phone": "+63 919 085 068",
    "relationship": "Father",
    "linkedStudentName": "Mark Santiago",
    "linkedLRN": "109238470291",
    "linkedLRNs": [
      "109238470291"
    ],
    "linkedStudentNames": [
      "Mark Santiago"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0291!"
  },
  {
    "id": "PAR-295",
    "name": "Mrs. Jennifer Lim",
    "email": "parent.109238470292@parent.sapc.edu.ph",
    "phone": "+63 919 086 405",
    "relationship": "Mother",
    "linkedStudentName": "Mark Lim",
    "linkedLRN": "109238470292",
    "linkedLRNs": [
      "109238470292"
    ],
    "linkedStudentNames": [
      "Mark Lim"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0292!"
  },
  {
    "id": "PAR-296",
    "name": "Mr. Cesar Mendoza",
    "email": "parent.109238470293@parent.sapc.edu.ph",
    "phone": "+63 919 087 742",
    "relationship": "Father",
    "linkedStudentName": "Clare Mendoza",
    "linkedLRN": "109238470293",
    "linkedLRNs": [
      "109238470293"
    ],
    "linkedStudentNames": [
      "Clare Mendoza"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0293!"
  },
  {
    "id": "PAR-297",
    "name": "Mrs. Grace Flores",
    "email": "parent.109238470294@parent.sapc.edu.ph",
    "phone": "+63 919 089 079",
    "relationship": "Mother",
    "linkedStudentName": "Bea Flores",
    "linkedLRN": "109238470294",
    "linkedLRNs": [
      "109238470294"
    ],
    "linkedStudentNames": [
      "Bea Flores"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0294!"
  },
  {
    "id": "PAR-298",
    "name": "Mr. Arnel Torres",
    "email": "parent.109238470295@parent.sapc.edu.ph",
    "phone": "+63 919 090 416",
    "relationship": "Father",
    "linkedStudentName": "Cedric Torres",
    "linkedLRN": "109238470295",
    "linkedLRNs": [
      "109238470295"
    ],
    "linkedStudentNames": [
      "Cedric Torres"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0295!"
  },
  {
    "id": "PAR-299",
    "name": "Mrs. Gina Corpuz",
    "email": "parent.109238470296@parent.sapc.edu.ph",
    "phone": "+63 919 091 753",
    "relationship": "Mother",
    "linkedStudentName": "Chloe Corpuz",
    "linkedLRN": "109238470296",
    "linkedLRNs": [
      "109238470296"
    ],
    "linkedStudentNames": [
      "Chloe Corpuz"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0296!"
  },
  {
    "id": "PAR-300",
    "name": "Mr. Roberto Morales",
    "email": "parent.109238470297@parent.sapc.edu.ph",
    "phone": "+63 919 093 090",
    "relationship": "Father",
    "linkedStudentName": "Sofia Morales",
    "linkedLRN": "109238470297",
    "linkedLRNs": [
      "109238470297"
    ],
    "linkedStudentNames": [
      "Sofia Morales"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0297!"
  },
  {
    "id": "PAR-301",
    "name": "Mrs. Teresa Tolentino",
    "email": "parent.109238470298@parent.sapc.edu.ph",
    "phone": "+63 919 094 427",
    "relationship": "Mother",
    "linkedStudentName": "Vincent Tolentino",
    "linkedLRN": "109238470298",
    "linkedLRNs": [
      "109238470298"
    ],
    "linkedStudentNames": [
      "Vincent Tolentino"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0298!"
  },
  {
    "id": "PAR-302",
    "name": "Mr. Edgardo Ocampo",
    "email": "parent.109238470299@parent.sapc.edu.ph",
    "phone": "+63 919 095 764",
    "relationship": "Father",
    "linkedStudentName": "Jasmine Ocampo",
    "linkedLRN": "109238470299",
    "linkedLRNs": [
      "109238470299"
    ],
    "linkedStudentNames": [
      "Jasmine Ocampo"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0299!"
  },
  {
    "id": "PAR-303",
    "name": "Mrs. Corazon Castro",
    "email": "parent.109238470300@parent.sapc.edu.ph",
    "phone": "+63 919 097 101",
    "relationship": "Mother",
    "linkedStudentName": "Lorenzo Castro",
    "linkedLRN": "109238470300",
    "linkedLRNs": [
      "109238470300"
    ],
    "linkedStudentNames": [
      "Lorenzo Castro"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0300!"
  },
  {
    "id": "PAR-304",
    "name": "Mr. Rolando Flores",
    "email": "parent.109238470301@parent.sapc.edu.ph",
    "phone": "+63 919 098 438",
    "relationship": "Father",
    "linkedStudentName": "Therese Flores",
    "linkedLRN": "109238470301",
    "linkedLRNs": [
      "109238470301"
    ],
    "linkedStudentNames": [
      "Therese Flores"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0301!"
  },
  {
    "id": "PAR-305",
    "name": "Mrs. Rowena Santiago",
    "email": "parent.109238470302@parent.sapc.edu.ph",
    "phone": "+63 919 099 775",
    "relationship": "Mother",
    "linkedStudentName": "Samantha Nicole Santiago",
    "linkedLRN": "109238470302",
    "linkedLRNs": [
      "109238470302"
    ],
    "linkedStudentNames": [
      "Samantha Nicole Santiago"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0302!"
  },
  {
    "id": "PAR-306",
    "name": "Mr. Ramon Aquino",
    "email": "parent.109238470303@parent.sapc.edu.ph",
    "phone": "+63 919 101 112",
    "relationship": "Father",
    "linkedStudentName": "Angelo Aquino",
    "linkedLRN": "109238470303",
    "linkedLRNs": [
      "109238470303"
    ],
    "linkedStudentNames": [
      "Angelo Aquino"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0303!"
  },
  {
    "id": "PAR-307",
    "name": "Mrs. Lorna Gonzales",
    "email": "parent.109238470304@parent.sapc.edu.ph",
    "phone": "+63 919 102 449",
    "relationship": "Mother",
    "linkedStudentName": "Dominic Gonzales",
    "linkedLRN": "109238470304",
    "linkedLRNs": [
      "109238470304"
    ],
    "linkedStudentNames": [
      "Dominic Gonzales"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0304!"
  },
  {
    "id": "PAR-308",
    "name": "Mr. Antonio Santiago",
    "email": "parent.109238470305@parent.sapc.edu.ph",
    "phone": "+63 919 103 786",
    "relationship": "Father",
    "linkedStudentName": "Trisha Santiago",
    "linkedLRN": "109238470305",
    "linkedLRNs": [
      "109238470305"
    ],
    "linkedStudentNames": [
      "Trisha Santiago"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0305!"
  },
  {
    "id": "PAR-309",
    "name": "Mrs. Mary Ann Alcantara",
    "email": "parent.109238470306@parent.sapc.edu.ph",
    "phone": "+63 919 105 123",
    "relationship": "Mother",
    "linkedStudentName": "Bea Alcantara",
    "linkedLRN": "109238470306",
    "linkedLRNs": [
      "109238470306"
    ],
    "linkedStudentNames": [
      "Bea Alcantara"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0306!"
  },
  {
    "id": "PAR-310",
    "name": "Mr. Eduardo Padilla",
    "email": "parent.109238470307@parent.sapc.edu.ph",
    "phone": "+63 919 106 460",
    "relationship": "Father",
    "linkedStudentName": "Joshua Padilla",
    "linkedLRN": "109238470307",
    "linkedLRNs": [
      "109238470307"
    ],
    "linkedStudentNames": [
      "Joshua Padilla"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0307!"
  },
  {
    "id": "PAR-311",
    "name": "Mrs. Jocelyn Pascual",
    "email": "parent.109238470308@parent.sapc.edu.ph",
    "phone": "+63 919 107 797",
    "relationship": "Mother",
    "linkedStudentName": "Patricia Pascual",
    "linkedLRN": "109238470308",
    "linkedLRNs": [
      "109238470308"
    ],
    "linkedStudentNames": [
      "Patricia Pascual"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0308!"
  },
  {
    "id": "PAR-312",
    "name": "Mr. Wilfredo Mercado",
    "email": "parent.109238470309@parent.sapc.edu.ph",
    "phone": "+63 919 109 134",
    "relationship": "Father",
    "linkedStudentName": "Princess Mae Mercado",
    "linkedLRN": "109238470309",
    "linkedLRNs": [
      "109238470309"
    ],
    "linkedStudentNames": [
      "Princess Mae Mercado"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0309!"
  },
  {
    "id": "PAR-313",
    "name": "Mrs. Elizabeth Rivera",
    "email": "parent.109238470310@parent.sapc.edu.ph",
    "phone": "+63 919 110 471",
    "relationship": "Mother",
    "linkedStudentName": "Clarisse Rivera",
    "linkedLRN": "109238470310",
    "linkedLRNs": [
      "109238470310"
    ],
    "linkedStudentNames": [
      "Clarisse Rivera"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0310!"
  },
  {
    "id": "PAR-314",
    "name": "Mr. Victor Salazar",
    "email": "parent.109238470311@parent.sapc.edu.ph",
    "phone": "+63 919 111 808",
    "relationship": "Father",
    "linkedStudentName": "Lorenzo Salazar",
    "linkedLRN": "109238470311",
    "linkedLRNs": [
      "109238470311"
    ],
    "linkedStudentNames": [
      "Lorenzo Salazar"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0311!"
  },
  {
    "id": "PAR-315",
    "name": "Mrs. Imelda Alcantara",
    "email": "parent.109238470312@parent.sapc.edu.ph",
    "phone": "+63 919 113 145",
    "relationship": "Mother",
    "linkedStudentName": "Vincent Alcantara",
    "linkedLRN": "109238470312",
    "linkedLRNs": [
      "109238470312"
    ],
    "linkedStudentNames": [
      "Vincent Alcantara"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0312!"
  },
  {
    "id": "PAR-316",
    "name": "Mr. Gabriel Tolentino",
    "email": "parent.109238470313@parent.sapc.edu.ph",
    "phone": "+63 919 114 482",
    "relationship": "Father",
    "linkedStudentName": "Patricia Tolentino",
    "linkedLRN": "109238470313",
    "linkedLRNs": [
      "109238470313"
    ],
    "linkedStudentNames": [
      "Patricia Tolentino"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0313!"
  },
  {
    "id": "PAR-317",
    "name": "Mrs. Bernadette Aquino",
    "email": "parent.109238470314@parent.sapc.edu.ph",
    "phone": "+63 919 115 819",
    "relationship": "Mother",
    "linkedStudentName": "Daniel Aquino",
    "linkedLRN": "109238470314",
    "linkedLRNs": [
      "109238470314"
    ],
    "linkedStudentNames": [
      "Daniel Aquino"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0314!"
  },
  {
    "id": "PAR-318",
    "name": "Mr. Manuel Flores",
    "email": "parent.109238470315@parent.sapc.edu.ph",
    "phone": "+63 919 117 156",
    "relationship": "Father",
    "linkedStudentName": "Faith Flores",
    "linkedLRN": "109238470315",
    "linkedLRNs": [
      "109238470315"
    ],
    "linkedStudentNames": [
      "Faith Flores"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0315!"
  },
  {
    "id": "PAR-319",
    "name": "Mrs. Cristina Dela Cruz",
    "email": "parent.109238470316@parent.sapc.edu.ph",
    "phone": "+63 919 118 493",
    "relationship": "Mother",
    "linkedStudentName": "Dominic Dela Cruz",
    "linkedLRN": "109238470316",
    "linkedLRNs": [
      "109238470316"
    ],
    "linkedStudentNames": [
      "Dominic Dela Cruz"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0316!"
  },
  {
    "id": "PAR-320",
    "name": "Mr. Mario Bautista",
    "email": "parent.109238470317@parent.sapc.edu.ph",
    "phone": "+63 919 119 830",
    "relationship": "Father",
    "linkedStudentName": "Kyle Bautista",
    "linkedLRN": "109238470317",
    "linkedLRNs": [
      "109238470317"
    ],
    "linkedStudentNames": [
      "Kyle Bautista"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0317!"
  },
  {
    "id": "PAR-321",
    "name": "Mrs. Lourdes Lim",
    "email": "parent.109238470318@parent.sapc.edu.ph",
    "phone": "+63 919 121 167",
    "relationship": "Mother",
    "linkedStudentName": "Elijah Lim",
    "linkedLRN": "109238470318",
    "linkedLRNs": [
      "109238470318"
    ],
    "linkedStudentNames": [
      "Elijah Lim"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0318!"
  },
  {
    "id": "PAR-322",
    "name": "Mr. Gerardo Aquino",
    "email": "parent.109238470319@parent.sapc.edu.ph",
    "phone": "+63 919 122 504",
    "relationship": "Father",
    "linkedStudentName": "Clare Aquino",
    "linkedLRN": "109238470319",
    "linkedLRNs": [
      "109238470319"
    ],
    "linkedStudentNames": [
      "Clare Aquino"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0319!"
  },
  {
    "id": "PAR-323",
    "name": "Mrs. Elena Castillo",
    "email": "parent.109238470320@parent.sapc.edu.ph",
    "phone": "+63 919 123 841",
    "relationship": "Mother",
    "linkedStudentName": "Althea Castillo",
    "linkedLRN": "109238470320",
    "linkedLRNs": [
      "109238470320"
    ],
    "linkedStudentNames": [
      "Althea Castillo"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0320!"
  },
  {
    "id": "PAR-324",
    "name": "Mr. Ernesto Castillo",
    "email": "parent.109238470321@parent.sapc.edu.ph",
    "phone": "+63 919 125 178",
    "relationship": "Father",
    "linkedStudentName": "Cedric Castillo",
    "linkedLRN": "109238470321",
    "linkedLRNs": [
      "109238470321"
    ],
    "linkedStudentNames": [
      "Cedric Castillo"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0321!"
  },
  {
    "id": "PAR-325",
    "name": "Mrs. Maricel Santos",
    "email": "parent.109238470322@parent.sapc.edu.ph",
    "phone": "+63 919 126 515",
    "relationship": "Mother",
    "linkedStudentName": "Faith Santos",
    "linkedLRN": "109238470322",
    "linkedLRNs": [
      "109238470322"
    ],
    "linkedStudentNames": [
      "Faith Santos"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0322!"
  },
  {
    "id": "PAR-326",
    "name": "Mr. Ferdinand Dela Cruz",
    "email": "parent.109238470323@parent.sapc.edu.ph",
    "phone": "+63 919 127 852",
    "relationship": "Father",
    "linkedStudentName": "Matthew Dela Cruz",
    "linkedLRN": "109238470323",
    "linkedLRNs": [
      "109238470323"
    ],
    "linkedStudentNames": [
      "Matthew Dela Cruz"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0323!"
  },
  {
    "id": "PAR-327",
    "name": "Mrs. Carmela Torres",
    "email": "parent.109238470324@parent.sapc.edu.ph",
    "phone": "+63 919 129 189",
    "relationship": "Mother",
    "linkedStudentName": "Ethan Torres",
    "linkedLRN": "109238470324",
    "linkedLRNs": [
      "109238470324"
    ],
    "linkedStudentNames": [
      "Ethan Torres"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0324!"
  },
  {
    "id": "PAR-328",
    "name": "Mr. Carlos Soriano",
    "email": "parent.109238470325@parent.sapc.edu.ph",
    "phone": "+63 919 130 526",
    "relationship": "Father",
    "linkedStudentName": "Lance Soriano",
    "linkedLRN": "109238470325",
    "linkedLRNs": [
      "109238470325"
    ],
    "linkedStudentNames": [
      "Lance Soriano"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0325!"
  },
  {
    "id": "PAR-329",
    "name": "Mrs. Rosalinda Corpuz",
    "email": "parent.109238470326@parent.sapc.edu.ph",
    "phone": "+63 919 131 863",
    "relationship": "Mother",
    "linkedStudentName": "Benedict Corpuz",
    "linkedLRN": "109238470326",
    "linkedLRNs": [
      "109238470326"
    ],
    "linkedStudentNames": [
      "Benedict Corpuz"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0326!"
  },
  {
    "id": "PAR-330",
    "name": "Mr. Danilo Mercado",
    "email": "parent.109238470327@parent.sapc.edu.ph",
    "phone": "+63 919 133 200",
    "relationship": "Father",
    "linkedStudentName": "Bea Mercado",
    "linkedLRN": "109238470327",
    "linkedLRNs": [
      "109238470327"
    ],
    "linkedStudentNames": [
      "Bea Mercado"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0327!"
  },
  {
    "id": "PAR-331",
    "name": "Mrs. Josephine Garcia",
    "email": "parent.109238470328@parent.sapc.edu.ph",
    "phone": "+63 919 134 537",
    "relationship": "Mother",
    "linkedStudentName": "Andrea Garcia",
    "linkedLRN": "109238470328",
    "linkedLRNs": [
      "109238470328"
    ],
    "linkedStudentNames": [
      "Andrea Garcia"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0328!"
  },
  {
    "id": "PAR-332",
    "name": "Mr. Reynaldo Villanueva",
    "email": "parent.109238470329@parent.sapc.edu.ph",
    "phone": "+63 919 135 874",
    "relationship": "Father",
    "linkedStudentName": "Janine Villanueva",
    "linkedLRN": "109238470329",
    "linkedLRNs": [
      "109238470329"
    ],
    "linkedStudentNames": [
      "Janine Villanueva"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0329!"
  },
  {
    "id": "PAR-333",
    "name": "Mrs. Remedios Castillo",
    "email": "parent.109238470330@parent.sapc.edu.ph",
    "phone": "+63 919 137 211",
    "relationship": "Mother",
    "linkedStudentName": "Therese Castillo",
    "linkedLRN": "109238470330",
    "linkedLRNs": [
      "109238470330"
    ],
    "linkedStudentNames": [
      "Therese Castillo"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0330!"
  },
  {
    "id": "PAR-334",
    "name": "Mr. Renato Torres",
    "email": "parent.109238470331@parent.sapc.edu.ph",
    "phone": "+63 919 138 548",
    "relationship": "Father",
    "linkedStudentName": "Ethan Torres",
    "linkedLRN": "109238470331",
    "linkedLRNs": [
      "109238470331"
    ],
    "linkedStudentNames": [
      "Ethan Torres"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0331!"
  },
  {
    "id": "PAR-335",
    "name": "Mrs. Flordeliza Garcia",
    "email": "parent.109238470332@parent.sapc.edu.ph",
    "phone": "+63 919 139 885",
    "relationship": "Mother",
    "linkedStudentName": "Trisha Garcia",
    "linkedLRN": "109238470332",
    "linkedLRNs": [
      "109238470332"
    ],
    "linkedStudentNames": [
      "Trisha Garcia"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0332!"
  },
  {
    "id": "PAR-336",
    "name": "Mr. Rodolfo Reyes",
    "email": "parent.109238470333@parent.sapc.edu.ph",
    "phone": "+63 919 141 222",
    "relationship": "Father",
    "linkedStudentName": "Adrian Reyes",
    "linkedLRN": "109238470333",
    "linkedLRNs": [
      "109238470333"
    ],
    "linkedStudentNames": [
      "Adrian Reyes"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0333!"
  },
  {
    "id": "PAR-337",
    "name": "Mrs. Cynthia Navarro",
    "email": "parent.109238470334@parent.sapc.edu.ph",
    "phone": "+63 919 142 559",
    "relationship": "Mother",
    "linkedStudentName": "Joy Navarro",
    "linkedLRN": "109238470334",
    "linkedLRNs": [
      "109238470334"
    ],
    "linkedStudentNames": [
      "Joy Navarro"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0334!"
  },
  {
    "id": "PAR-338",
    "name": "Mr. Nestor Mendoza",
    "email": "parent.109238470335@parent.sapc.edu.ph",
    "phone": "+63 919 143 896",
    "relationship": "Father",
    "linkedStudentName": "Angelo Mendoza",
    "linkedLRN": "109238470335",
    "linkedLRNs": [
      "109238470335"
    ],
    "linkedStudentNames": [
      "Angelo Mendoza"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0335!"
  },
  {
    "id": "PAR-339",
    "name": "Mrs. Shirley Alcantara",
    "email": "parent.109238470336@parent.sapc.edu.ph",
    "phone": "+63 919 145 233",
    "relationship": "Mother",
    "linkedStudentName": "Angelo Alcantara",
    "linkedLRN": "109238470336",
    "linkedLRNs": [
      "109238470336"
    ],
    "linkedStudentNames": [
      "Angelo Alcantara"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0336!"
  },
  {
    "id": "PAR-340",
    "name": "Mr. Jaime Mercado",
    "email": "parent.109238470337@parent.sapc.edu.ph",
    "phone": "+63 919 146 570",
    "relationship": "Father",
    "linkedStudentName": "Clarisse Mercado",
    "linkedLRN": "109238470337",
    "linkedLRNs": [
      "109238470337"
    ],
    "linkedStudentNames": [
      "Clarisse Mercado"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0337!"
  },
  {
    "id": "PAR-341",
    "name": "Mrs. Jennifer Soriano",
    "email": "parent.109238470338@parent.sapc.edu.ph",
    "phone": "+63 919 147 907",
    "relationship": "Mother",
    "linkedStudentName": "Andrea Soriano",
    "linkedLRN": "109238470338",
    "linkedLRNs": [
      "109238470338"
    ],
    "linkedStudentNames": [
      "Andrea Soriano"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0338!"
  },
  {
    "id": "PAR-342",
    "name": "Mr. Cesar Reyes",
    "email": "parent.109238470339@parent.sapc.edu.ph",
    "phone": "+63 919 149 244",
    "relationship": "Father",
    "linkedStudentName": "Camille Reyes",
    "linkedLRN": "109238470339",
    "linkedLRNs": [
      "109238470339"
    ],
    "linkedStudentNames": [
      "Camille Reyes"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0339!"
  },
  {
    "id": "PAR-343",
    "name": "Mrs. Grace Alcantara",
    "email": "parent.109238470340@parent.sapc.edu.ph",
    "phone": "+63 919 150 581",
    "relationship": "Mother",
    "linkedStudentName": "Bernadette Alcantara",
    "linkedLRN": "109238470340",
    "linkedLRNs": [
      "109238470340"
    ],
    "linkedStudentNames": [
      "Bernadette Alcantara"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0340!"
  },
  {
    "id": "PAR-344",
    "name": "Mr. Arnel Dimaculangan",
    "email": "parent.109238470341@parent.sapc.edu.ph",
    "phone": "+63 919 151 918",
    "relationship": "Father",
    "linkedStudentName": "John Carlo Dimaculangan",
    "linkedLRN": "109238470341",
    "linkedLRNs": [
      "109238470341"
    ],
    "linkedStudentNames": [
      "John Carlo Dimaculangan"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0341!"
  },
  {
    "id": "PAR-345",
    "name": "Mrs. Gina Mendoza",
    "email": "parent.109238470342@parent.sapc.edu.ph",
    "phone": "+63 919 153 255",
    "relationship": "Mother",
    "linkedStudentName": "Joy Mendoza",
    "linkedLRN": "109238470342",
    "linkedLRNs": [
      "109238470342"
    ],
    "linkedStudentNames": [
      "Joy Mendoza"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0342!"
  },
  {
    "id": "PAR-346",
    "name": "Mr. Roberto Ramos",
    "email": "parent.109238470343@parent.sapc.edu.ph",
    "phone": "+63 919 154 592",
    "relationship": "Father",
    "linkedStudentName": "Matthew Ramos",
    "linkedLRN": "109238470343",
    "linkedLRNs": [
      "109238470343"
    ],
    "linkedStudentNames": [
      "Matthew Ramos"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0343!"
  },
  {
    "id": "PAR-347",
    "name": "Mrs. Teresa Santiago",
    "email": "parent.109238470344@parent.sapc.edu.ph",
    "phone": "+63 919 155 929",
    "relationship": "Mother",
    "linkedStudentName": "Alyssa Santiago",
    "linkedLRN": "109238470344",
    "linkedLRNs": [
      "109238470344"
    ],
    "linkedStudentNames": [
      "Alyssa Santiago"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0344!"
  },
  {
    "id": "PAR-348",
    "name": "Mr. Edgardo Manalo",
    "email": "parent.109238470345@parent.sapc.edu.ph",
    "phone": "+63 919 157 266",
    "relationship": "Father",
    "linkedStudentName": "Nathan Manalo",
    "linkedLRN": "109238470345",
    "linkedLRNs": [
      "109238470345"
    ],
    "linkedStudentNames": [
      "Nathan Manalo"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0345!"
  },
  {
    "id": "PAR-349",
    "name": "Mrs. Corazon Alcantara",
    "email": "parent.109238470346@parent.sapc.edu.ph",
    "phone": "+63 919 158 603",
    "relationship": "Mother",
    "linkedStudentName": "Jose Alcantara",
    "linkedLRN": "109238470346",
    "linkedLRNs": [
      "109238470346"
    ],
    "linkedStudentNames": [
      "Jose Alcantara"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0346!"
  },
  {
    "id": "PAR-350",
    "name": "Mr. Rolando Santos",
    "email": "parent.109238470347@parent.sapc.edu.ph",
    "phone": "+63 919 159 940",
    "relationship": "Father",
    "linkedStudentName": "Martin Santos",
    "linkedLRN": "109238470347",
    "linkedLRNs": [
      "109238470347"
    ],
    "linkedStudentNames": [
      "Martin Santos"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0347!"
  },
  {
    "id": "PAR-351",
    "name": "Mrs. Rowena Mercado",
    "email": "parent.109238470348@parent.sapc.edu.ph",
    "phone": "+63 919 161 277",
    "relationship": "Mother",
    "linkedStudentName": "Lorenzo Mercado",
    "linkedLRN": "109238470348",
    "linkedLRNs": [
      "109238470348"
    ],
    "linkedStudentNames": [
      "Lorenzo Mercado"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0348!"
  },
  {
    "id": "PAR-352",
    "name": "Mr. Ramon Dimaculangan",
    "email": "parent.109238470349@parent.sapc.edu.ph",
    "phone": "+63 919 162 614",
    "relationship": "Father",
    "linkedStudentName": "Gabriel Dimaculangan",
    "linkedLRN": "109238470349",
    "linkedLRNs": [
      "109238470349"
    ],
    "linkedStudentNames": [
      "Gabriel Dimaculangan"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0349!"
  },
  {
    "id": "PAR-353",
    "name": "Mrs. Lorna Pascual",
    "email": "parent.109238470350@parent.sapc.edu.ph",
    "phone": "+63 919 163 951",
    "relationship": "Mother",
    "linkedStudentName": "Simon Pascual",
    "linkedLRN": "109238470350",
    "linkedLRNs": [
      "109238470350"
    ],
    "linkedStudentNames": [
      "Simon Pascual"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0350!"
  },
  {
    "id": "PAR-354",
    "name": "Mr. Antonio Gonzales",
    "email": "parent.109238470351@parent.sapc.edu.ph",
    "phone": "+63 919 165 288",
    "relationship": "Father",
    "linkedStudentName": "Clarisse Gonzales",
    "linkedLRN": "109238470351",
    "linkedLRNs": [
      "109238470351"
    ],
    "linkedStudentNames": [
      "Clarisse Gonzales"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0351!"
  },
  {
    "id": "PAR-355",
    "name": "Mrs. Mary Ann Garcia",
    "email": "parent.109238470352@parent.sapc.edu.ph",
    "phone": "+63 919 166 625",
    "relationship": "Mother",
    "linkedStudentName": "Rochelle Garcia",
    "linkedLRN": "109238470352",
    "linkedLRNs": [
      "109238470352"
    ],
    "linkedStudentNames": [
      "Rochelle Garcia"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0352!"
  },
  {
    "id": "PAR-356",
    "name": "Mr. Eduardo Tolentino",
    "email": "parent.109238470353@parent.sapc.edu.ph",
    "phone": "+63 919 167 962",
    "relationship": "Father",
    "linkedStudentName": "Emman Tolentino",
    "linkedLRN": "109238470353",
    "linkedLRNs": [
      "109238470353"
    ],
    "linkedStudentNames": [
      "Emman Tolentino"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0353!"
  },
  {
    "id": "PAR-357",
    "name": "Mrs. Jocelyn Gonzales",
    "email": "parent.109238470354@parent.sapc.edu.ph",
    "phone": "+63 919 169 299",
    "relationship": "Mother",
    "linkedStudentName": "Camille Gonzales",
    "linkedLRN": "109238470354",
    "linkedLRNs": [
      "109238470354"
    ],
    "linkedStudentNames": [
      "Camille Gonzales"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0354!"
  },
  {
    "id": "PAR-358",
    "name": "Mr. Wilfredo Tolentino",
    "email": "parent.109238470355@parent.sapc.edu.ph",
    "phone": "+63 919 170 636",
    "relationship": "Father",
    "linkedStudentName": "Bernadette Tolentino",
    "linkedLRN": "109238470355",
    "linkedLRNs": [
      "109238470355"
    ],
    "linkedStudentNames": [
      "Bernadette Tolentino"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0355!"
  },
  {
    "id": "PAR-359",
    "name": "Mrs. Elizabeth Dela Cruz",
    "email": "parent.109238470356@parent.sapc.edu.ph",
    "phone": "+63 919 171 973",
    "relationship": "Mother",
    "linkedStudentName": "Jasmine Dela Cruz",
    "linkedLRN": "109238470356",
    "linkedLRNs": [
      "109238470356"
    ],
    "linkedStudentNames": [
      "Jasmine Dela Cruz"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0356!"
  },
  {
    "id": "PAR-360",
    "name": "Mr. Victor Dela Cruz",
    "email": "parent.109238470357@parent.sapc.edu.ph",
    "phone": "+63 919 173 310",
    "relationship": "Father",
    "linkedStudentName": "Jose Dela Cruz",
    "linkedLRN": "109238470357",
    "linkedLRNs": [
      "109238470357"
    ],
    "linkedStudentNames": [
      "Jose Dela Cruz"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0357!"
  },
  {
    "id": "PAR-361",
    "name": "Mrs. Imelda Morales",
    "email": "parent.109238470358@parent.sapc.edu.ph",
    "phone": "+63 919 174 647",
    "relationship": "Mother",
    "linkedStudentName": "Kathleen Morales",
    "linkedLRN": "109238470358",
    "linkedLRNs": [
      "109238470358"
    ],
    "linkedStudentNames": [
      "Kathleen Morales"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0358!"
  },
  {
    "id": "PAR-362",
    "name": "Mr. Gabriel Ramos",
    "email": "parent.109238470359@parent.sapc.edu.ph",
    "phone": "+63 919 175 984",
    "relationship": "Father",
    "linkedStudentName": "Kathleen Ramos",
    "linkedLRN": "109238470359",
    "linkedLRNs": [
      "109238470359"
    ],
    "linkedStudentNames": [
      "Kathleen Ramos"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0359!"
  },
  {
    "id": "PAR-363",
    "name": "Mrs. Bernadette Dela Cruz",
    "email": "parent.109238470360@parent.sapc.edu.ph",
    "phone": "+63 919 177 321",
    "relationship": "Mother",
    "linkedStudentName": "Timothy Dela Cruz",
    "linkedLRN": "109238470360",
    "linkedLRNs": [
      "109238470360"
    ],
    "linkedStudentNames": [
      "Timothy Dela Cruz"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0360!"
  },
  {
    "id": "PAR-364",
    "name": "Mr. Manuel Manalo",
    "email": "parent.109238470361@parent.sapc.edu.ph",
    "phone": "+63 919 178 658",
    "relationship": "Father",
    "linkedStudentName": "Simon Manalo",
    "linkedLRN": "109238470361",
    "linkedLRNs": [
      "109238470361"
    ],
    "linkedStudentNames": [
      "Simon Manalo"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0361!"
  },
  {
    "id": "PAR-365",
    "name": "Mrs. Cristina Santos",
    "email": "parent.109238470362@parent.sapc.edu.ph",
    "phone": "+63 919 179 995",
    "relationship": "Mother",
    "linkedStudentName": "Adrian Santos",
    "linkedLRN": "109238470362",
    "linkedLRNs": [
      "109238470362"
    ],
    "linkedStudentNames": [
      "Adrian Santos"
    ],
    "section": "Grade 9 - St. Martin de Porres",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0362!"
  },
  {
    "id": "PAR-366",
    "name": "Mr. Mario Lim",
    "email": "parent.109238470363@parent.sapc.edu.ph",
    "phone": "+63 919 181 332",
    "relationship": "Father",
    "linkedStudentName": "Francis Lim",
    "linkedLRN": "109238470363",
    "linkedLRNs": [
      "109238470363"
    ],
    "linkedStudentNames": [
      "Francis Lim"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0363!"
  },
  {
    "id": "PAR-367",
    "name": "Mrs. Lourdes Soriano",
    "email": "parent.109238470364@parent.sapc.edu.ph",
    "phone": "+63 919 182 669",
    "relationship": "Mother",
    "linkedStudentName": "Chloe Soriano",
    "linkedLRN": "109238470364",
    "linkedLRNs": [
      "109238470364"
    ],
    "linkedStudentNames": [
      "Chloe Soriano"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0364!"
  },
  {
    "id": "PAR-368",
    "name": "Mr. Gerardo Villanueva",
    "email": "parent.109238470365@parent.sapc.edu.ph",
    "phone": "+63 919 184 006",
    "relationship": "Father",
    "linkedStudentName": "Kyle Villanueva",
    "linkedLRN": "109238470365",
    "linkedLRNs": [
      "109238470365"
    ],
    "linkedStudentNames": [
      "Kyle Villanueva"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0365!"
  },
  {
    "id": "PAR-369",
    "name": "Mrs. Elena Salazar",
    "email": "parent.109238470366@parent.sapc.edu.ph",
    "phone": "+63 919 185 343",
    "relationship": "Mother",
    "linkedStudentName": "Francis Salazar",
    "linkedLRN": "109238470366",
    "linkedLRNs": [
      "109238470366"
    ],
    "linkedStudentNames": [
      "Francis Salazar"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0366!"
  },
  {
    "id": "PAR-370",
    "name": "Mr. Ernesto Mendoza",
    "email": "parent.109238470367@parent.sapc.edu.ph",
    "phone": "+63 919 186 680",
    "relationship": "Father",
    "linkedStudentName": "Daniel Mendoza",
    "linkedLRN": "109238470367",
    "linkedLRNs": [
      "109238470367"
    ],
    "linkedStudentNames": [
      "Daniel Mendoza"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0367!"
  },
  {
    "id": "PAR-371",
    "name": "Mrs. Maricel Lim",
    "email": "parent.109238470368@parent.sapc.edu.ph",
    "phone": "+63 919 188 017",
    "relationship": "Mother",
    "linkedStudentName": "Justin Lim",
    "linkedLRN": "109238470368",
    "linkedLRNs": [
      "109238470368"
    ],
    "linkedStudentNames": [
      "Justin Lim"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0368!"
  },
  {
    "id": "PAR-372",
    "name": "Mr. Ferdinand Alcantara",
    "email": "parent.109238470369@parent.sapc.edu.ph",
    "phone": "+63 919 189 354",
    "relationship": "Father",
    "linkedStudentName": "Martin Alcantara",
    "linkedLRN": "109238470369",
    "linkedLRNs": [
      "109238470369"
    ],
    "linkedStudentNames": [
      "Martin Alcantara"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0369!"
  },
  {
    "id": "PAR-373",
    "name": "Mrs. Carmela Mendoza",
    "email": "parent.109238470370@parent.sapc.edu.ph",
    "phone": "+63 919 190 691",
    "relationship": "Mother",
    "linkedStudentName": "Ethan Mendoza",
    "linkedLRN": "109238470370",
    "linkedLRNs": [
      "109238470370"
    ],
    "linkedStudentNames": [
      "Ethan Mendoza"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0370!"
  },
  {
    "id": "PAR-374",
    "name": "Mr. Carlos Mercado",
    "email": "parent.109238470371@parent.sapc.edu.ph",
    "phone": "+63 919 192 028",
    "relationship": "Father",
    "linkedStudentName": "Trisha Mercado",
    "linkedLRN": "109238470371",
    "linkedLRNs": [
      "109238470371"
    ],
    "linkedStudentNames": [
      "Trisha Mercado"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0371!"
  },
  {
    "id": "PAR-375",
    "name": "Mrs. Rosalinda Santiago",
    "email": "parent.109238470372@parent.sapc.edu.ph",
    "phone": "+63 919 193 365",
    "relationship": "Mother",
    "linkedStudentName": "Bernadette Santiago",
    "linkedLRN": "109238470372",
    "linkedLRNs": [
      "109238470372"
    ],
    "linkedStudentNames": [
      "Bernadette Santiago"
    ],
    "section": "Grade 9 - St. Lorenzo Ruiz",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0372!"
  },
  {
    "id": "PAR-376",
    "name": "Mr. Danilo Dela Cruz",
    "email": "parent.109238470373@parent.sapc.edu.ph",
    "phone": "+63 919 194 702",
    "relationship": "Father",
    "linkedStudentName": "Simon Dela Cruz",
    "linkedLRN": "109238470373",
    "linkedLRNs": [
      "109238470373"
    ],
    "linkedStudentNames": [
      "Simon Dela Cruz"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0373!"
  },
  {
    "id": "PAR-377",
    "name": "Mrs. Josephine Pascual",
    "email": "parent.109238470374@parent.sapc.edu.ph",
    "phone": "+63 919 196 039",
    "relationship": "Mother",
    "linkedStudentName": "Mark Pascual",
    "linkedLRN": "109238470374",
    "linkedLRNs": [
      "109238470374"
    ],
    "linkedStudentNames": [
      "Mark Pascual"
    ],
    "section": "Grade 9 - St. Pedro Calungsod",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0374!"
  },
  {
    "id": "PAR-378",
    "name": "Mr. Reynaldo Mendoza",
    "email": "parent.109238470375@parent.sapc.edu.ph",
    "phone": "+63 919 197 376",
    "relationship": "Father",
    "linkedStudentName": "Nicole Mendoza",
    "linkedLRN": "109238470375",
    "linkedLRNs": [
      "109238470375"
    ],
    "linkedStudentNames": [
      "Nicole Mendoza"
    ],
    "section": "Grade 9 - St. Cecilia",
    "gradeLevel": "Grade 9",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0375!"
  },
  {
    "id": "PAR-379",
    "name": "Mrs. Remedios Castillo",
    "email": "parent.109238470376@parent.sapc.edu.ph",
    "phone": "+63 919 198 713",
    "relationship": "Mother",
    "linkedStudentName": "Liza Castillo",
    "linkedLRN": "109238470376",
    "linkedLRNs": [
      "109238470376"
    ],
    "linkedStudentNames": [
      "Liza Castillo"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0376!"
  },
  {
    "id": "PAR-380",
    "name": "Mr. Renato Lim",
    "email": "parent.109238470377@parent.sapc.edu.ph",
    "phone": "+63 919 200 050",
    "relationship": "Father",
    "linkedStudentName": "Cecilia Lim",
    "linkedLRN": "109238470377",
    "linkedLRNs": [
      "109238470377"
    ],
    "linkedStudentNames": [
      "Cecilia Lim"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0377!"
  },
  {
    "id": "PAR-381",
    "name": "Mrs. Flordeliza Gonzales",
    "email": "parent.109238470378@parent.sapc.edu.ph",
    "phone": "+63 919 201 387",
    "relationship": "Mother",
    "linkedStudentName": "Cedric Gonzales",
    "linkedLRN": "109238470378",
    "linkedLRNs": [
      "109238470378"
    ],
    "linkedStudentNames": [
      "Cedric Gonzales"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0378!"
  },
  {
    "id": "PAR-382",
    "name": "Mr. Rodolfo Lim",
    "email": "parent.109238470379@parent.sapc.edu.ph",
    "phone": "+63 919 202 724",
    "relationship": "Father",
    "linkedStudentName": "Bea Lim",
    "linkedLRN": "109238470379",
    "linkedLRNs": [
      "109238470379"
    ],
    "linkedStudentNames": [
      "Bea Lim"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0379!"
  },
  {
    "id": "PAR-383",
    "name": "Mrs. Cynthia Corpuz",
    "email": "parent.109238470380@parent.sapc.edu.ph",
    "phone": "+63 919 204 061",
    "relationship": "Mother",
    "linkedStudentName": "Christian Corpuz",
    "linkedLRN": "109238470380",
    "linkedLRNs": [
      "109238470380"
    ],
    "linkedStudentNames": [
      "Christian Corpuz"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0380!"
  },
  {
    "id": "PAR-384",
    "name": "Mr. Nestor Castro",
    "email": "parent.109238470381@parent.sapc.edu.ph",
    "phone": "+63 919 205 398",
    "relationship": "Father",
    "linkedStudentName": "Angelo Castro",
    "linkedLRN": "109238470381",
    "linkedLRNs": [
      "109238470381"
    ],
    "linkedStudentNames": [
      "Angelo Castro"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0381!"
  },
  {
    "id": "PAR-385",
    "name": "Mrs. Shirley Villanueva",
    "email": "parent.109238470382@parent.sapc.edu.ph",
    "phone": "+63 919 206 735",
    "relationship": "Mother",
    "linkedStudentName": "Andrea Villanueva",
    "linkedLRN": "109238470382",
    "linkedLRNs": [
      "109238470382"
    ],
    "linkedStudentNames": [
      "Andrea Villanueva"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0382!"
  },
  {
    "id": "PAR-386",
    "name": "Mr. Jaime Torres",
    "email": "parent.109238470383@parent.sapc.edu.ph",
    "phone": "+63 919 208 072",
    "relationship": "Father",
    "linkedStudentName": "Ethan Torres",
    "linkedLRN": "109238470383",
    "linkedLRNs": [
      "109238470383"
    ],
    "linkedStudentNames": [
      "Ethan Torres"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0383!"
  },
  {
    "id": "PAR-387",
    "name": "Mrs. Jennifer Alcantara",
    "email": "parent.109238470384@parent.sapc.edu.ph",
    "phone": "+63 919 209 409",
    "relationship": "Mother",
    "linkedStudentName": "Erika Alcantara",
    "linkedLRN": "109238470384",
    "linkedLRNs": [
      "109238470384"
    ],
    "linkedStudentNames": [
      "Erika Alcantara"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0384!"
  },
  {
    "id": "PAR-388",
    "name": "Mr. Cesar Villanueva",
    "email": "parent.109238470385@parent.sapc.edu.ph",
    "phone": "+63 919 210 746",
    "relationship": "Father",
    "linkedStudentName": "Lance Villanueva",
    "linkedLRN": "109238470385",
    "linkedLRNs": [
      "109238470385"
    ],
    "linkedStudentNames": [
      "Lance Villanueva"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0385!"
  },
  {
    "id": "PAR-389",
    "name": "Mrs. Grace Valdez",
    "email": "parent.109238470386@parent.sapc.edu.ph",
    "phone": "+63 919 212 083",
    "relationship": "Mother",
    "linkedStudentName": "Angelo Valdez",
    "linkedLRN": "109238470386",
    "linkedLRNs": [
      "109238470386"
    ],
    "linkedStudentNames": [
      "Angelo Valdez"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0386!"
  },
  {
    "id": "PAR-390",
    "name": "Mr. Arnel Castro",
    "email": "parent.109238470387@parent.sapc.edu.ph",
    "phone": "+63 919 213 420",
    "relationship": "Father",
    "linkedStudentName": "Jerome Castro",
    "linkedLRN": "109238470387",
    "linkedLRNs": [
      "109238470387"
    ],
    "linkedStudentNames": [
      "Jerome Castro"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0387!"
  },
  {
    "id": "PAR-391",
    "name": "Mrs. Gina Dela Cruz",
    "email": "parent.109238470388@parent.sapc.edu.ph",
    "phone": "+63 919 214 757",
    "relationship": "Mother",
    "linkedStudentName": "Simon Dela Cruz",
    "linkedLRN": "109238470388",
    "linkedLRNs": [
      "109238470388"
    ],
    "linkedStudentNames": [
      "Simon Dela Cruz"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0388!"
  },
  {
    "id": "PAR-392",
    "name": "Mr. Roberto Lim",
    "email": "parent.109238470389@parent.sapc.edu.ph",
    "phone": "+63 919 216 094",
    "relationship": "Father",
    "linkedStudentName": "Benedict Lim",
    "linkedLRN": "109238470389",
    "linkedLRNs": [
      "109238470389"
    ],
    "linkedStudentNames": [
      "Benedict Lim"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0389!"
  },
  {
    "id": "PAR-393",
    "name": "Mrs. Teresa Mendoza",
    "email": "parent.109238470390@parent.sapc.edu.ph",
    "phone": "+63 919 217 431",
    "relationship": "Mother",
    "linkedStudentName": "Martin Mendoza",
    "linkedLRN": "109238470390",
    "linkedLRNs": [
      "109238470390"
    ],
    "linkedStudentNames": [
      "Martin Mendoza"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0390!"
  },
  {
    "id": "PAR-394",
    "name": "Mr. Edgardo Padilla",
    "email": "parent.109238470391@parent.sapc.edu.ph",
    "phone": "+63 919 218 768",
    "relationship": "Father",
    "linkedStudentName": "Anthony Padilla",
    "linkedLRN": "109238470391",
    "linkedLRNs": [
      "109238470391"
    ],
    "linkedStudentNames": [
      "Anthony Padilla"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0391!"
  },
  {
    "id": "PAR-395",
    "name": "Mrs. Corazon Cruz",
    "email": "parent.109238470392@parent.sapc.edu.ph",
    "phone": "+63 919 220 105",
    "relationship": "Mother",
    "linkedStudentName": "Elijah Cruz",
    "linkedLRN": "109238470392",
    "linkedLRNs": [
      "109238470392"
    ],
    "linkedStudentNames": [
      "Elijah Cruz"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0392!"
  },
  {
    "id": "PAR-396",
    "name": "Mr. Rolando Ramos",
    "email": "parent.109238470393@parent.sapc.edu.ph",
    "phone": "+63 919 221 442",
    "relationship": "Father",
    "linkedStudentName": "Bea Ramos",
    "linkedLRN": "109238470393",
    "linkedLRNs": [
      "109238470393"
    ],
    "linkedStudentNames": [
      "Bea Ramos"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0393!"
  },
  {
    "id": "PAR-397",
    "name": "Mrs. Rowena Santos",
    "email": "parent.109238470394@parent.sapc.edu.ph",
    "phone": "+63 919 222 779",
    "relationship": "Mother",
    "linkedStudentName": "Princess Mae Santos",
    "linkedLRN": "109238470394",
    "linkedLRNs": [
      "109238470394"
    ],
    "linkedStudentNames": [
      "Princess Mae Santos"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0394!"
  },
  {
    "id": "PAR-398",
    "name": "Mr. Ramon Castro",
    "email": "parent.109238470395@parent.sapc.edu.ph",
    "phone": "+63 919 224 116",
    "relationship": "Father",
    "linkedStudentName": "Dominic Castro",
    "linkedLRN": "109238470395",
    "linkedLRNs": [
      "109238470395"
    ],
    "linkedStudentNames": [
      "Dominic Castro"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0395!"
  },
  {
    "id": "PAR-399",
    "name": "Mrs. Lorna Mercado",
    "email": "parent.109238470396@parent.sapc.edu.ph",
    "phone": "+63 919 225 453",
    "relationship": "Mother",
    "linkedStudentName": "Clarisse Mercado",
    "linkedLRN": "109238470396",
    "linkedLRNs": [
      "109238470396"
    ],
    "linkedStudentNames": [
      "Clarisse Mercado"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0396!"
  },
  {
    "id": "PAR-400",
    "name": "Mr. Antonio Bautista",
    "email": "parent.109238470397@parent.sapc.edu.ph",
    "phone": "+63 919 226 790",
    "relationship": "Father",
    "linkedStudentName": "Justin Bautista",
    "linkedLRN": "109238470397",
    "linkedLRNs": [
      "109238470397"
    ],
    "linkedStudentNames": [
      "Justin Bautista"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0397!"
  },
  {
    "id": "PAR-401",
    "name": "Mrs. Mary Ann Santos",
    "email": "parent.109238470398@parent.sapc.edu.ph",
    "phone": "+63 919 228 127",
    "relationship": "Mother",
    "linkedStudentName": "Jose Santos",
    "linkedLRN": "109238470398",
    "linkedLRNs": [
      "109238470398"
    ],
    "linkedStudentNames": [
      "Jose Santos"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0398!"
  },
  {
    "id": "PAR-402",
    "name": "Mr. Eduardo Lim",
    "email": "parent.109238470399@parent.sapc.edu.ph",
    "phone": "+63 919 229 464",
    "relationship": "Father",
    "linkedStudentName": "Gabriel Lim",
    "linkedLRN": "109238470399",
    "linkedLRNs": [
      "109238470399"
    ],
    "linkedStudentNames": [
      "Gabriel Lim"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0399!"
  },
  {
    "id": "PAR-403",
    "name": "Mrs. Jocelyn Ramos",
    "email": "parent.109238470400@parent.sapc.edu.ph",
    "phone": "+63 919 230 801",
    "relationship": "Mother",
    "linkedStudentName": "Jose Ramos",
    "linkedLRN": "109238470400",
    "linkedLRNs": [
      "109238470400"
    ],
    "linkedStudentNames": [
      "Jose Ramos"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0400!"
  },
  {
    "id": "PAR-404",
    "name": "Mr. Wilfredo Bautista",
    "email": "parent.109238470401@parent.sapc.edu.ph",
    "phone": "+63 919 232 138",
    "relationship": "Father",
    "linkedStudentName": "Karl Bautista",
    "linkedLRN": "109238470401",
    "linkedLRNs": [
      "109238470401"
    ],
    "linkedStudentNames": [
      "Karl Bautista"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0401!"
  },
  {
    "id": "PAR-405",
    "name": "Mrs. Elizabeth Padilla",
    "email": "parent.109238470402@parent.sapc.edu.ph",
    "phone": "+63 919 233 475",
    "relationship": "Mother",
    "linkedStudentName": "Timothy Padilla",
    "linkedLRN": "109238470402",
    "linkedLRNs": [
      "109238470402"
    ],
    "linkedStudentNames": [
      "Timothy Padilla"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0402!"
  },
  {
    "id": "PAR-406",
    "name": "Mr. Victor Bautista",
    "email": "parent.109238470403@parent.sapc.edu.ph",
    "phone": "+63 919 234 812",
    "relationship": "Father",
    "linkedStudentName": "Ethan Bautista",
    "linkedLRN": "109238470403",
    "linkedLRNs": [
      "109238470403"
    ],
    "linkedStudentNames": [
      "Ethan Bautista"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0403!"
  },
  {
    "id": "PAR-407",
    "name": "Mrs. Imelda Aquino",
    "email": "parent.109238470404@parent.sapc.edu.ph",
    "phone": "+63 919 236 149",
    "relationship": "Mother",
    "linkedStudentName": "Adrian Aquino",
    "linkedLRN": "109238470404",
    "linkedLRNs": [
      "109238470404"
    ],
    "linkedStudentNames": [
      "Adrian Aquino"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0404!"
  },
  {
    "id": "PAR-408",
    "name": "Mr. Gabriel Bautista",
    "email": "parent.109238470405@parent.sapc.edu.ph",
    "phone": "+63 919 237 486",
    "relationship": "Father",
    "linkedStudentName": "Jerome Bautista",
    "linkedLRN": "109238470405",
    "linkedLRNs": [
      "109238470405"
    ],
    "linkedStudentNames": [
      "Jerome Bautista"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0405!"
  },
  {
    "id": "PAR-409",
    "name": "Mrs. Bernadette Torres",
    "email": "parent.109238470406@parent.sapc.edu.ph",
    "phone": "+63 919 238 823",
    "relationship": "Mother",
    "linkedStudentName": "Jerome Torres",
    "linkedLRN": "109238470406",
    "linkedLRNs": [
      "109238470406"
    ],
    "linkedStudentNames": [
      "Jerome Torres"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0406!"
  },
  {
    "id": "PAR-410",
    "name": "Mr. Manuel De Leon",
    "email": "parent.109238470407@parent.sapc.edu.ph",
    "phone": "+63 919 240 160",
    "relationship": "Father",
    "linkedStudentName": "Cecilia De Leon",
    "linkedLRN": "109238470407",
    "linkedLRNs": [
      "109238470407"
    ],
    "linkedStudentNames": [
      "Cecilia De Leon"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0407!"
  },
  {
    "id": "PAR-411",
    "name": "Mrs. Cristina Gonzales",
    "email": "parent.109238470408@parent.sapc.edu.ph",
    "phone": "+63 919 241 497",
    "relationship": "Mother",
    "linkedStudentName": "Clarisse Gonzales",
    "linkedLRN": "109238470408",
    "linkedLRNs": [
      "109238470408"
    ],
    "linkedStudentNames": [
      "Clarisse Gonzales"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0408!"
  },
  {
    "id": "PAR-412",
    "name": "Mr. Mario Domingo",
    "email": "parent.109238470409@parent.sapc.edu.ph",
    "phone": "+63 919 242 834",
    "relationship": "Father",
    "linkedStudentName": "John Carlo Domingo",
    "linkedLRN": "109238470409",
    "linkedLRNs": [
      "109238470409"
    ],
    "linkedStudentNames": [
      "John Carlo Domingo"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0409!"
  },
  {
    "id": "PAR-413",
    "name": "Mrs. Lourdes Navarro",
    "email": "parent.109238470410@parent.sapc.edu.ph",
    "phone": "+63 919 244 171",
    "relationship": "Mother",
    "linkedStudentName": "Ethan Navarro",
    "linkedLRN": "109238470410",
    "linkedLRNs": [
      "109238470410"
    ],
    "linkedStudentNames": [
      "Ethan Navarro"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0410!"
  },
  {
    "id": "PAR-414",
    "name": "Mr. Gerardo Torres",
    "email": "parent.109238470411@parent.sapc.edu.ph",
    "phone": "+63 919 245 508",
    "relationship": "Father",
    "linkedStudentName": "Lance Torres",
    "linkedLRN": "109238470411",
    "linkedLRNs": [
      "109238470411"
    ],
    "linkedStudentNames": [
      "Lance Torres"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0411!"
  },
  {
    "id": "PAR-415",
    "name": "Mrs. Elena Domingo",
    "email": "parent.109238470412@parent.sapc.edu.ph",
    "phone": "+63 919 246 845",
    "relationship": "Mother",
    "linkedStudentName": "Matthew Domingo",
    "linkedLRN": "109238470412",
    "linkedLRNs": [
      "109238470412"
    ],
    "linkedStudentNames": [
      "Matthew Domingo"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0412!"
  },
  {
    "id": "PAR-416",
    "name": "Mr. Ernesto Reyes",
    "email": "parent.109238470413@parent.sapc.edu.ph",
    "phone": "+63 919 248 182",
    "relationship": "Father",
    "linkedStudentName": "Emman Reyes",
    "linkedLRN": "109238470413",
    "linkedLRNs": [
      "109238470413"
    ],
    "linkedStudentNames": [
      "Emman Reyes"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0413!"
  },
  {
    "id": "PAR-417",
    "name": "Mrs. Maricel Cruz",
    "email": "parent.109238470414@parent.sapc.edu.ph",
    "phone": "+63 919 249 519",
    "relationship": "Mother",
    "linkedStudentName": "Nathan Cruz",
    "linkedLRN": "109238470414",
    "linkedLRNs": [
      "109238470414"
    ],
    "linkedStudentNames": [
      "Nathan Cruz"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0414!"
  },
  {
    "id": "PAR-418",
    "name": "Mr. Ferdinand Morales",
    "email": "parent.109238470415@parent.sapc.edu.ph",
    "phone": "+63 919 250 856",
    "relationship": "Father",
    "linkedStudentName": "Kathryn Morales",
    "linkedLRN": "109238470415",
    "linkedLRNs": [
      "109238470415"
    ],
    "linkedStudentNames": [
      "Kathryn Morales"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0415!"
  },
  {
    "id": "PAR-419",
    "name": "Mrs. Carmela Morales",
    "email": "parent.109238470416@parent.sapc.edu.ph",
    "phone": "+63 919 252 193",
    "relationship": "Mother",
    "linkedStudentName": "Alyssa Morales",
    "linkedLRN": "109238470416",
    "linkedLRNs": [
      "109238470416"
    ],
    "linkedStudentNames": [
      "Alyssa Morales"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0416!"
  },
  {
    "id": "PAR-420",
    "name": "Mr. Carlos Santos",
    "email": "parent.109238470417@parent.sapc.edu.ph",
    "phone": "+63 919 253 530",
    "relationship": "Father",
    "linkedStudentName": "Nicole Santos",
    "linkedLRN": "109238470417",
    "linkedLRNs": [
      "109238470417"
    ],
    "linkedStudentNames": [
      "Nicole Santos"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0417!"
  },
  {
    "id": "PAR-421",
    "name": "Mrs. Rosalinda Ocampo",
    "email": "parent.109238470418@parent.sapc.edu.ph",
    "phone": "+63 919 254 867",
    "relationship": "Mother",
    "linkedStudentName": "Rita Ocampo",
    "linkedLRN": "109238470418",
    "linkedLRNs": [
      "109238470418"
    ],
    "linkedStudentNames": [
      "Rita Ocampo"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0418!"
  },
  {
    "id": "PAR-422",
    "name": "Mr. Danilo Aquino",
    "email": "parent.109238470419@parent.sapc.edu.ph",
    "phone": "+63 919 256 204",
    "relationship": "Father",
    "linkedStudentName": "Andrea Aquino",
    "linkedLRN": "109238470419",
    "linkedLRNs": [
      "109238470419"
    ],
    "linkedStudentNames": [
      "Andrea Aquino"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0419!"
  },
  {
    "id": "PAR-423",
    "name": "Mrs. Josephine Rivera",
    "email": "parent.109238470420@parent.sapc.edu.ph",
    "phone": "+63 919 257 541",
    "relationship": "Mother",
    "linkedStudentName": "Karl Rivera",
    "linkedLRN": "109238470420",
    "linkedLRNs": [
      "109238470420"
    ],
    "linkedStudentNames": [
      "Karl Rivera"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0420!"
  },
  {
    "id": "PAR-424",
    "name": "Mr. Reynaldo Rivera",
    "email": "parent.109238470421@parent.sapc.edu.ph",
    "phone": "+63 919 258 878",
    "relationship": "Father",
    "linkedStudentName": "Simon Rivera",
    "linkedLRN": "109238470421",
    "linkedLRNs": [
      "109238470421"
    ],
    "linkedStudentNames": [
      "Simon Rivera"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0421!"
  },
  {
    "id": "PAR-425",
    "name": "Mrs. Remedios Lim",
    "email": "parent.109238470422@parent.sapc.edu.ph",
    "phone": "+63 919 260 215",
    "relationship": "Mother",
    "linkedStudentName": "Princess Mae Lim",
    "linkedLRN": "109238470422",
    "linkedLRNs": [
      "109238470422"
    ],
    "linkedStudentNames": [
      "Princess Mae Lim"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0422!"
  },
  {
    "id": "PAR-426",
    "name": "Mr. Renato San Jose",
    "email": "parent.109238470423@parent.sapc.edu.ph",
    "phone": "+63 919 261 552",
    "relationship": "Father",
    "linkedStudentName": "Joy San Jose",
    "linkedLRN": "109238470423",
    "linkedLRNs": [
      "109238470423"
    ],
    "linkedStudentNames": [
      "Joy San Jose"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0423!"
  },
  {
    "id": "PAR-427",
    "name": "Mrs. Flordeliza Castillo",
    "email": "parent.109238470424@parent.sapc.edu.ph",
    "phone": "+63 919 262 889",
    "relationship": "Mother",
    "linkedStudentName": "Patricia Castillo",
    "linkedLRN": "109238470424",
    "linkedLRNs": [
      "109238470424"
    ],
    "linkedStudentNames": [
      "Patricia Castillo"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0424!"
  },
  {
    "id": "PAR-428",
    "name": "Mr. Rodolfo Ramos",
    "email": "parent.109238470425@parent.sapc.edu.ph",
    "phone": "+63 919 264 226",
    "relationship": "Father",
    "linkedStudentName": "Bernadette Ramos",
    "linkedLRN": "109238470425",
    "linkedLRNs": [
      "109238470425"
    ],
    "linkedStudentNames": [
      "Bernadette Ramos"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0425!"
  },
  {
    "id": "PAR-429",
    "name": "Mrs. Cynthia Dela Cruz",
    "email": "parent.109238470426@parent.sapc.edu.ph",
    "phone": "+63 919 265 563",
    "relationship": "Mother",
    "linkedStudentName": "Princess Mae Dela Cruz",
    "linkedLRN": "109238470426",
    "linkedLRNs": [
      "109238470426"
    ],
    "linkedStudentNames": [
      "Princess Mae Dela Cruz"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0426!"
  },
  {
    "id": "PAR-430",
    "name": "Mr. Nestor Ramos",
    "email": "parent.109238470427@parent.sapc.edu.ph",
    "phone": "+63 919 266 900",
    "relationship": "Father",
    "linkedStudentName": "Kyle Ramos",
    "linkedLRN": "109238470427",
    "linkedLRNs": [
      "109238470427"
    ],
    "linkedStudentNames": [
      "Kyle Ramos"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0427!"
  },
  {
    "id": "PAR-431",
    "name": "Mrs. Shirley Cruz",
    "email": "parent.109238470428@parent.sapc.edu.ph",
    "phone": "+63 919 268 237",
    "relationship": "Mother",
    "linkedStudentName": "Patricia Cruz",
    "linkedLRN": "109238470428",
    "linkedLRNs": [
      "109238470428"
    ],
    "linkedStudentNames": [
      "Patricia Cruz"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0428!"
  },
  {
    "id": "PAR-432",
    "name": "Mr. Jaime Flores",
    "email": "parent.109238470429@parent.sapc.edu.ph",
    "phone": "+63 919 269 574",
    "relationship": "Father",
    "linkedStudentName": "Christian Flores",
    "linkedLRN": "109238470429",
    "linkedLRNs": [
      "109238470429"
    ],
    "linkedStudentNames": [
      "Christian Flores"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0429!"
  },
  {
    "id": "PAR-433",
    "name": "Mrs. Jennifer Garcia",
    "email": "parent.109238470430@parent.sapc.edu.ph",
    "phone": "+63 919 270 911",
    "relationship": "Mother",
    "linkedStudentName": "Rafael Garcia",
    "linkedLRN": "109238470430",
    "linkedLRNs": [
      "109238470430"
    ],
    "linkedStudentNames": [
      "Rafael Garcia"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0430!"
  },
  {
    "id": "PAR-434",
    "name": "Mr. Cesar Aquino",
    "email": "parent.109238470431@parent.sapc.edu.ph",
    "phone": "+63 919 272 248",
    "relationship": "Father",
    "linkedStudentName": "Carlos Aquino",
    "linkedLRN": "109238470431",
    "linkedLRNs": [
      "109238470431"
    ],
    "linkedStudentNames": [
      "Carlos Aquino"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0431!"
  },
  {
    "id": "PAR-435",
    "name": "Mrs. Grace Castillo",
    "email": "parent.109238470432@parent.sapc.edu.ph",
    "phone": "+63 919 273 585",
    "relationship": "Mother",
    "linkedStudentName": "Clare Castillo",
    "linkedLRN": "109238470432",
    "linkedLRNs": [
      "109238470432"
    ],
    "linkedStudentNames": [
      "Clare Castillo"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0432!"
  },
  {
    "id": "PAR-436",
    "name": "Mr. Arnel Gonzales",
    "email": "parent.109238470433@parent.sapc.edu.ph",
    "phone": "+63 919 274 922",
    "relationship": "Father",
    "linkedStudentName": "Maria Clara Gonzales",
    "linkedLRN": "109238470433",
    "linkedLRNs": [
      "109238470433"
    ],
    "linkedStudentNames": [
      "Maria Clara Gonzales"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0433!"
  },
  {
    "id": "PAR-437",
    "name": "Mrs. Gina Navarro",
    "email": "parent.109238470434@parent.sapc.edu.ph",
    "phone": "+63 919 276 259",
    "relationship": "Mother",
    "linkedStudentName": "Bea Navarro",
    "linkedLRN": "109238470434",
    "linkedLRNs": [
      "109238470434"
    ],
    "linkedStudentNames": [
      "Bea Navarro"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0434!"
  },
  {
    "id": "PAR-438",
    "name": "Mr. Roberto Villanueva",
    "email": "parent.109238470435@parent.sapc.edu.ph",
    "phone": "+63 919 277 596",
    "relationship": "Father",
    "linkedStudentName": "Dominic Villanueva",
    "linkedLRN": "109238470435",
    "linkedLRNs": [
      "109238470435"
    ],
    "linkedStudentNames": [
      "Dominic Villanueva"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0435!"
  },
  {
    "id": "PAR-439",
    "name": "Mrs. Teresa Garcia",
    "email": "parent.109238470436@parent.sapc.edu.ph",
    "phone": "+63 919 278 933",
    "relationship": "Mother",
    "linkedStudentName": "Mariel Garcia",
    "linkedLRN": "109238470436",
    "linkedLRNs": [
      "109238470436"
    ],
    "linkedStudentNames": [
      "Mariel Garcia"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0436!"
  },
  {
    "id": "PAR-440",
    "name": "Mr. Edgardo San Jose",
    "email": "parent.109238470437@parent.sapc.edu.ph",
    "phone": "+63 919 280 270",
    "relationship": "Father",
    "linkedStudentName": "Gabriel San Jose",
    "linkedLRN": "109238470437",
    "linkedLRNs": [
      "109238470437"
    ],
    "linkedStudentNames": [
      "Gabriel San Jose"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0437!"
  },
  {
    "id": "PAR-441",
    "name": "Mrs. Corazon San Jose",
    "email": "parent.109238470438@parent.sapc.edu.ph",
    "phone": "+63 919 281 607",
    "relationship": "Mother",
    "linkedStudentName": "Nicole San Jose",
    "linkedLRN": "109238470438",
    "linkedLRNs": [
      "109238470438"
    ],
    "linkedStudentNames": [
      "Nicole San Jose"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0438!"
  },
  {
    "id": "PAR-442",
    "name": "Mr. Rolando Tolentino",
    "email": "parent.109238470439@parent.sapc.edu.ph",
    "phone": "+63 919 282 944",
    "relationship": "Father",
    "linkedStudentName": "Elijah Tolentino",
    "linkedLRN": "109238470439",
    "linkedLRNs": [
      "109238470439"
    ],
    "linkedStudentNames": [
      "Elijah Tolentino"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0439!"
  },
  {
    "id": "PAR-443",
    "name": "Mrs. Rowena Bautista",
    "email": "parent.109238470440@parent.sapc.edu.ph",
    "phone": "+63 919 284 281",
    "relationship": "Mother",
    "linkedStudentName": "Martin Bautista",
    "linkedLRN": "109238470440",
    "linkedLRNs": [
      "109238470440"
    ],
    "linkedStudentNames": [
      "Martin Bautista"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0440!"
  },
  {
    "id": "PAR-444",
    "name": "Mr. Ramon Villanueva",
    "email": "parent.109238470441@parent.sapc.edu.ph",
    "phone": "+63 919 285 618",
    "relationship": "Father",
    "linkedStudentName": "Patricia Villanueva",
    "linkedLRN": "109238470441",
    "linkedLRNs": [
      "109238470441"
    ],
    "linkedStudentNames": [
      "Patricia Villanueva"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0441!"
  },
  {
    "id": "PAR-445",
    "name": "Mrs. Lorna Pascual",
    "email": "parent.109238470442@parent.sapc.edu.ph",
    "phone": "+63 919 286 955",
    "relationship": "Mother",
    "linkedStudentName": "Rochelle Pascual",
    "linkedLRN": "109238470442",
    "linkedLRNs": [
      "109238470442"
    ],
    "linkedStudentNames": [
      "Rochelle Pascual"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0442!"
  },
  {
    "id": "PAR-446",
    "name": "Mr. Antonio Lim",
    "email": "parent.109238470443@parent.sapc.edu.ph",
    "phone": "+63 919 288 292",
    "relationship": "Father",
    "linkedStudentName": "Benedict Lim",
    "linkedLRN": "109238470443",
    "linkedLRNs": [
      "109238470443"
    ],
    "linkedStudentNames": [
      "Benedict Lim"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0443!"
  },
  {
    "id": "PAR-447",
    "name": "Mrs. Mary Ann Valdez",
    "email": "parent.109238470444@parent.sapc.edu.ph",
    "phone": "+63 919 289 629",
    "relationship": "Mother",
    "linkedStudentName": "Martin Valdez",
    "linkedLRN": "109238470444",
    "linkedLRNs": [
      "109238470444"
    ],
    "linkedStudentNames": [
      "Martin Valdez"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0444!"
  },
  {
    "id": "PAR-448",
    "name": "Mr. Eduardo Dela Cruz",
    "email": "parent.109238470445@parent.sapc.edu.ph",
    "phone": "+63 919 290 966",
    "relationship": "Father",
    "linkedStudentName": "Timothy Dela Cruz",
    "linkedLRN": "109238470445",
    "linkedLRNs": [
      "109238470445"
    ],
    "linkedStudentNames": [
      "Timothy Dela Cruz"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0445!"
  },
  {
    "id": "PAR-449",
    "name": "Mrs. Jocelyn Aquino",
    "email": "parent.109238470446@parent.sapc.edu.ph",
    "phone": "+63 919 292 303",
    "relationship": "Mother",
    "linkedStudentName": "Dominic Aquino",
    "linkedLRN": "109238470446",
    "linkedLRNs": [
      "109238470446"
    ],
    "linkedStudentNames": [
      "Dominic Aquino"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0446!"
  },
  {
    "id": "PAR-450",
    "name": "Mr. Wilfredo Navarro",
    "email": "parent.109238470447@parent.sapc.edu.ph",
    "phone": "+63 919 293 640",
    "relationship": "Father",
    "linkedStudentName": "Lorenzo Navarro",
    "linkedLRN": "109238470447",
    "linkedLRNs": [
      "109238470447"
    ],
    "linkedStudentNames": [
      "Lorenzo Navarro"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0447!"
  },
  {
    "id": "PAR-451",
    "name": "Mrs. Elizabeth Santiago",
    "email": "parent.109238470448@parent.sapc.edu.ph",
    "phone": "+63 919 294 977",
    "relationship": "Mother",
    "linkedStudentName": "Bernadette Santiago",
    "linkedLRN": "109238470448",
    "linkedLRNs": [
      "109238470448"
    ],
    "linkedStudentNames": [
      "Bernadette Santiago"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0448!"
  },
  {
    "id": "PAR-452",
    "name": "Mr. Victor Dizon",
    "email": "parent.109238470449@parent.sapc.edu.ph",
    "phone": "+63 919 296 314",
    "relationship": "Father",
    "linkedStudentName": "John Carlo Dizon",
    "linkedLRN": "109238470449",
    "linkedLRNs": [
      "109238470449"
    ],
    "linkedStudentNames": [
      "John Carlo Dizon"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0449!"
  },
  {
    "id": "PAR-453",
    "name": "Mrs. Imelda Navarro",
    "email": "parent.109238470450@parent.sapc.edu.ph",
    "phone": "+63 919 297 651",
    "relationship": "Mother",
    "linkedStudentName": "Angela Navarro",
    "linkedLRN": "109238470450",
    "linkedLRNs": [
      "109238470450"
    ],
    "linkedStudentNames": [
      "Angela Navarro"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0450!"
  },
  {
    "id": "PAR-454",
    "name": "Mr. Gabriel Castillo",
    "email": "parent.109238470451@parent.sapc.edu.ph",
    "phone": "+63 919 298 988",
    "relationship": "Father",
    "linkedStudentName": "Alyssa Castillo",
    "linkedLRN": "109238470451",
    "linkedLRNs": [
      "109238470451"
    ],
    "linkedStudentNames": [
      "Alyssa Castillo"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0451!"
  },
  {
    "id": "PAR-455",
    "name": "Mrs. Bernadette Ramos",
    "email": "parent.109238470452@parent.sapc.edu.ph",
    "phone": "+63 919 300 325",
    "relationship": "Mother",
    "linkedStudentName": "Rochelle Ramos",
    "linkedLRN": "109238470452",
    "linkedLRNs": [
      "109238470452"
    ],
    "linkedStudentNames": [
      "Rochelle Ramos"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0452!"
  },
  {
    "id": "PAR-456",
    "name": "Mr. Manuel Morales",
    "email": "parent.109238470453@parent.sapc.edu.ph",
    "phone": "+63 919 301 662",
    "relationship": "Father",
    "linkedStudentName": "Angela Morales",
    "linkedLRN": "109238470453",
    "linkedLRNs": [
      "109238470453"
    ],
    "linkedStudentNames": [
      "Angela Morales"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0453!"
  },
  {
    "id": "PAR-457",
    "name": "Mrs. Cristina Santos",
    "email": "parent.109238470454@parent.sapc.edu.ph",
    "phone": "+63 919 302 999",
    "relationship": "Mother",
    "linkedStudentName": "Bernadette Santos",
    "linkedLRN": "109238470454",
    "linkedLRNs": [
      "109238470454"
    ],
    "linkedStudentNames": [
      "Bernadette Santos"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0454!"
  },
  {
    "id": "PAR-458",
    "name": "Mr. Mario De Leon",
    "email": "parent.109238470455@parent.sapc.edu.ph",
    "phone": "+63 919 304 336",
    "relationship": "Father",
    "linkedStudentName": "Sebastian De Leon",
    "linkedLRN": "109238470455",
    "linkedLRNs": [
      "109238470455"
    ],
    "linkedStudentNames": [
      "Sebastian De Leon"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0455!"
  },
  {
    "id": "PAR-459",
    "name": "Mrs. Lourdes Mercado",
    "email": "parent.109238470456@parent.sapc.edu.ph",
    "phone": "+63 919 305 673",
    "relationship": "Mother",
    "linkedStudentName": "Camille Mercado",
    "linkedLRN": "109238470456",
    "linkedLRNs": [
      "109238470456"
    ],
    "linkedStudentNames": [
      "Camille Mercado"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0456!"
  },
  {
    "id": "PAR-460",
    "name": "Mr. Gerardo Aquino",
    "email": "parent.109238470457@parent.sapc.edu.ph",
    "phone": "+63 919 307 010",
    "relationship": "Father",
    "linkedStudentName": "Bernadette Aquino",
    "linkedLRN": "109238470457",
    "linkedLRNs": [
      "109238470457"
    ],
    "linkedStudentNames": [
      "Bernadette Aquino"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0457!"
  },
  {
    "id": "PAR-461",
    "name": "Mrs. Elena Navarro",
    "email": "parent.109238470458@parent.sapc.edu.ph",
    "phone": "+63 919 308 347",
    "relationship": "Mother",
    "linkedStudentName": "Diego Navarro",
    "linkedLRN": "109238470458",
    "linkedLRNs": [
      "109238470458"
    ],
    "linkedStudentNames": [
      "Diego Navarro"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0458!"
  },
  {
    "id": "PAR-462",
    "name": "Mr. Ernesto Castro",
    "email": "parent.109238470459@parent.sapc.edu.ph",
    "phone": "+63 919 309 684",
    "relationship": "Father",
    "linkedStudentName": "Kyle Castro",
    "linkedLRN": "109238470459",
    "linkedLRNs": [
      "109238470459"
    ],
    "linkedStudentNames": [
      "Kyle Castro"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0459!"
  },
  {
    "id": "PAR-463",
    "name": "Mrs. Maricel Dizon",
    "email": "parent.109238470460@parent.sapc.edu.ph",
    "phone": "+63 919 311 021",
    "relationship": "Mother",
    "linkedStudentName": "Carlos Dizon",
    "linkedLRN": "109238470460",
    "linkedLRNs": [
      "109238470460"
    ],
    "linkedStudentNames": [
      "Carlos Dizon"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0460!"
  },
  {
    "id": "PAR-464",
    "name": "Mr. Ferdinand Dimaculangan",
    "email": "parent.109238470461@parent.sapc.edu.ph",
    "phone": "+63 919 312 358",
    "relationship": "Father",
    "linkedStudentName": "Gabriel Dimaculangan",
    "linkedLRN": "109238470461",
    "linkedLRNs": [
      "109238470461"
    ],
    "linkedStudentNames": [
      "Gabriel Dimaculangan"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0461!"
  },
  {
    "id": "PAR-465",
    "name": "Mrs. Carmela Corpuz",
    "email": "parent.109238470462@parent.sapc.edu.ph",
    "phone": "+63 919 313 695",
    "relationship": "Mother",
    "linkedStudentName": "Kyle Corpuz",
    "linkedLRN": "109238470462",
    "linkedLRNs": [
      "109238470462"
    ],
    "linkedStudentNames": [
      "Kyle Corpuz"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0462!"
  },
  {
    "id": "PAR-466",
    "name": "Mr. Carlos Manalo",
    "email": "parent.109238470463@parent.sapc.edu.ph",
    "phone": "+63 919 315 032",
    "relationship": "Father",
    "linkedStudentName": "Therese Manalo",
    "linkedLRN": "109238470463",
    "linkedLRNs": [
      "109238470463"
    ],
    "linkedStudentNames": [
      "Therese Manalo"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0463!"
  },
  {
    "id": "PAR-467",
    "name": "Mrs. Rosalinda Reyes",
    "email": "parent.109238470464@parent.sapc.edu.ph",
    "phone": "+63 919 316 369",
    "relationship": "Mother",
    "linkedStudentName": "Jose Reyes",
    "linkedLRN": "109238470464",
    "linkedLRNs": [
      "109238470464"
    ],
    "linkedStudentNames": [
      "Jose Reyes"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0464!"
  },
  {
    "id": "PAR-468",
    "name": "Mr. Danilo Navarro",
    "email": "parent.109238470465@parent.sapc.edu.ph",
    "phone": "+63 919 317 706",
    "relationship": "Father",
    "linkedStudentName": "Jasmine Navarro",
    "linkedLRN": "109238470465",
    "linkedLRNs": [
      "109238470465"
    ],
    "linkedStudentNames": [
      "Jasmine Navarro"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0465!"
  },
  {
    "id": "PAR-469",
    "name": "Mrs. Josephine Garcia",
    "email": "parent.109238470466@parent.sapc.edu.ph",
    "phone": "+63 919 319 043",
    "relationship": "Mother",
    "linkedStudentName": "Mark Garcia",
    "linkedLRN": "109238470466",
    "linkedLRNs": [
      "109238470466"
    ],
    "linkedStudentNames": [
      "Mark Garcia"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0466!"
  },
  {
    "id": "PAR-470",
    "name": "Mr. Reynaldo Padilla",
    "email": "parent.109238470467@parent.sapc.edu.ph",
    "phone": "+63 919 320 380",
    "relationship": "Father",
    "linkedStudentName": "Kathryn Padilla",
    "linkedLRN": "109238470467",
    "linkedLRNs": [
      "109238470467"
    ],
    "linkedStudentNames": [
      "Kathryn Padilla"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0467!"
  },
  {
    "id": "PAR-471",
    "name": "Mrs. Remedios Salazar",
    "email": "parent.109238470468@parent.sapc.edu.ph",
    "phone": "+63 919 321 717",
    "relationship": "Mother",
    "linkedStudentName": "Miguel Salazar",
    "linkedLRN": "109238470468",
    "linkedLRNs": [
      "109238470468"
    ],
    "linkedStudentNames": [
      "Miguel Salazar"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0468!"
  },
  {
    "id": "PAR-472",
    "name": "Mr. Renato Valdez",
    "email": "parent.109238470469@parent.sapc.edu.ph",
    "phone": "+63 919 323 054",
    "relationship": "Father",
    "linkedStudentName": "Sebastian Valdez",
    "linkedLRN": "109238470469",
    "linkedLRNs": [
      "109238470469"
    ],
    "linkedStudentNames": [
      "Sebastian Valdez"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0469!"
  },
  {
    "id": "PAR-473",
    "name": "Mrs. Flordeliza Ocampo",
    "email": "parent.109238470470@parent.sapc.edu.ph",
    "phone": "+63 919 324 391",
    "relationship": "Mother",
    "linkedStudentName": "Rita Ocampo",
    "linkedLRN": "109238470470",
    "linkedLRNs": [
      "109238470470"
    ],
    "linkedStudentNames": [
      "Rita Ocampo"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0470!"
  },
  {
    "id": "PAR-474",
    "name": "Mr. Rodolfo Castillo",
    "email": "parent.109238470471@parent.sapc.edu.ph",
    "phone": "+63 919 325 728",
    "relationship": "Father",
    "linkedStudentName": "Angela Castillo",
    "linkedLRN": "109238470471",
    "linkedLRNs": [
      "109238470471"
    ],
    "linkedStudentNames": [
      "Angela Castillo"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0471!"
  },
  {
    "id": "PAR-475",
    "name": "Mrs. Cynthia Mercado",
    "email": "parent.109238470472@parent.sapc.edu.ph",
    "phone": "+63 919 327 065",
    "relationship": "Mother",
    "linkedStudentName": "Paolo Mercado",
    "linkedLRN": "109238470472",
    "linkedLRNs": [
      "109238470472"
    ],
    "linkedStudentNames": [
      "Paolo Mercado"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0472!"
  },
  {
    "id": "PAR-476",
    "name": "Mr. Nestor Aquino",
    "email": "parent.109238470473@parent.sapc.edu.ph",
    "phone": "+63 919 328 402",
    "relationship": "Father",
    "linkedStudentName": "Hannah Aquino",
    "linkedLRN": "109238470473",
    "linkedLRNs": [
      "109238470473"
    ],
    "linkedStudentNames": [
      "Hannah Aquino"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0473!"
  },
  {
    "id": "PAR-477",
    "name": "Mrs. Shirley San Jose",
    "email": "parent.109238470474@parent.sapc.edu.ph",
    "phone": "+63 919 329 739",
    "relationship": "Mother",
    "linkedStudentName": "Francis San Jose",
    "linkedLRN": "109238470474",
    "linkedLRNs": [
      "109238470474"
    ],
    "linkedStudentNames": [
      "Francis San Jose"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0474!"
  },
  {
    "id": "PAR-478",
    "name": "Mr. Jaime Aquino",
    "email": "parent.109238470475@parent.sapc.edu.ph",
    "phone": "+63 919 331 076",
    "relationship": "Father",
    "linkedStudentName": "Clare Aquino",
    "linkedLRN": "109238470475",
    "linkedLRNs": [
      "109238470475"
    ],
    "linkedStudentNames": [
      "Clare Aquino"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0475!"
  },
  {
    "id": "PAR-479",
    "name": "Mrs. Jennifer Pascual",
    "email": "parent.109238470476@parent.sapc.edu.ph",
    "phone": "+63 919 332 413",
    "relationship": "Mother",
    "linkedStudentName": "Justin Pascual",
    "linkedLRN": "109238470476",
    "linkedLRNs": [
      "109238470476"
    ],
    "linkedStudentNames": [
      "Justin Pascual"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0476!"
  },
  {
    "id": "PAR-480",
    "name": "Mr. Cesar Manalo",
    "email": "parent.109238470477@parent.sapc.edu.ph",
    "phone": "+63 919 333 750",
    "relationship": "Father",
    "linkedStudentName": "Angelo Manalo",
    "linkedLRN": "109238470477",
    "linkedLRNs": [
      "109238470477"
    ],
    "linkedStudentNames": [
      "Angelo Manalo"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0477!"
  },
  {
    "id": "PAR-481",
    "name": "Mrs. Grace Morales",
    "email": "parent.109238470478@parent.sapc.edu.ph",
    "phone": "+63 919 335 087",
    "relationship": "Mother",
    "linkedStudentName": "Nathan Morales",
    "linkedLRN": "109238470478",
    "linkedLRNs": [
      "109238470478"
    ],
    "linkedStudentNames": [
      "Nathan Morales"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0478!"
  },
  {
    "id": "PAR-482",
    "name": "Mr. Arnel Navarro",
    "email": "parent.109238470479@parent.sapc.edu.ph",
    "phone": "+63 919 336 424",
    "relationship": "Father",
    "linkedStudentName": "Rita Navarro",
    "linkedLRN": "109238470479",
    "linkedLRNs": [
      "109238470479"
    ],
    "linkedStudentNames": [
      "Rita Navarro"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0479!"
  },
  {
    "id": "PAR-483",
    "name": "Mrs. Gina Santos",
    "email": "parent.109238470480@parent.sapc.edu.ph",
    "phone": "+63 919 337 761",
    "relationship": "Mother",
    "linkedStudentName": "Cecilia Santos",
    "linkedLRN": "109238470480",
    "linkedLRNs": [
      "109238470480"
    ],
    "linkedStudentNames": [
      "Cecilia Santos"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0480!"
  },
  {
    "id": "PAR-484",
    "name": "Mr. Roberto Salazar",
    "email": "parent.109238470481@parent.sapc.edu.ph",
    "phone": "+63 919 339 098",
    "relationship": "Father",
    "linkedStudentName": "Clarisse Salazar",
    "linkedLRN": "109238470481",
    "linkedLRNs": [
      "109238470481"
    ],
    "linkedStudentNames": [
      "Clarisse Salazar"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0481!"
  },
  {
    "id": "PAR-485",
    "name": "Mrs. Teresa Dimaculangan",
    "email": "parent.109238470482@parent.sapc.edu.ph",
    "phone": "+63 919 340 435",
    "relationship": "Mother",
    "linkedStudentName": "Kathleen Dimaculangan",
    "linkedLRN": "109238470482",
    "linkedLRNs": [
      "109238470482"
    ],
    "linkedStudentNames": [
      "Kathleen Dimaculangan"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0482!"
  },
  {
    "id": "PAR-486",
    "name": "Mr. Edgardo Ocampo",
    "email": "parent.109238470483@parent.sapc.edu.ph",
    "phone": "+63 919 341 772",
    "relationship": "Father",
    "linkedStudentName": "Christian Ocampo",
    "linkedLRN": "109238470483",
    "linkedLRNs": [
      "109238470483"
    ],
    "linkedStudentNames": [
      "Christian Ocampo"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0483!"
  },
  {
    "id": "PAR-487",
    "name": "Mrs. Corazon Dimaculangan",
    "email": "parent.109238470484@parent.sapc.edu.ph",
    "phone": "+63 919 343 109",
    "relationship": "Mother",
    "linkedStudentName": "Janine Dimaculangan",
    "linkedLRN": "109238470484",
    "linkedLRNs": [
      "109238470484"
    ],
    "linkedStudentNames": [
      "Janine Dimaculangan"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0484!"
  },
  {
    "id": "PAR-488",
    "name": "Mr. Rolando Navarro",
    "email": "parent.109238470485@parent.sapc.edu.ph",
    "phone": "+63 919 344 446",
    "relationship": "Father",
    "linkedStudentName": "Ethan Navarro",
    "linkedLRN": "109238470485",
    "linkedLRNs": [
      "109238470485"
    ],
    "linkedStudentNames": [
      "Ethan Navarro"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0485!"
  },
  {
    "id": "PAR-489",
    "name": "Mrs. Rowena Pascual",
    "email": "parent.109238470486@parent.sapc.edu.ph",
    "phone": "+63 919 345 783",
    "relationship": "Mother",
    "linkedStudentName": "Ethan Pascual",
    "linkedLRN": "109238470486",
    "linkedLRNs": [
      "109238470486"
    ],
    "linkedStudentNames": [
      "Ethan Pascual"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0486!"
  },
  {
    "id": "PAR-490",
    "name": "Mr. Ramon Bautista",
    "email": "parent.109238470487@parent.sapc.edu.ph",
    "phone": "+63 919 347 120",
    "relationship": "Father",
    "linkedStudentName": "Rafael Bautista",
    "linkedLRN": "109238470487",
    "linkedLRNs": [
      "109238470487"
    ],
    "linkedStudentNames": [
      "Rafael Bautista"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0487!"
  },
  {
    "id": "PAR-491",
    "name": "Mrs. Lorna Padilla",
    "email": "parent.109238470488@parent.sapc.edu.ph",
    "phone": "+63 919 348 457",
    "relationship": "Mother",
    "linkedStudentName": "Camille Padilla",
    "linkedLRN": "109238470488",
    "linkedLRNs": [
      "109238470488"
    ],
    "linkedStudentNames": [
      "Camille Padilla"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0488!"
  },
  {
    "id": "PAR-492",
    "name": "Mr. Antonio Lim",
    "email": "parent.109238470489@parent.sapc.edu.ph",
    "phone": "+63 919 349 794",
    "relationship": "Father",
    "linkedStudentName": "Maria Clara Lim",
    "linkedLRN": "109238470489",
    "linkedLRNs": [
      "109238470489"
    ],
    "linkedStudentNames": [
      "Maria Clara Lim"
    ],
    "section": "Grade 10 - St. Vincent de Paul",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0489!"
  },
  {
    "id": "PAR-493",
    "name": "Mrs. Mary Ann Mercado",
    "email": "parent.109238470490@parent.sapc.edu.ph",
    "phone": "+63 919 351 131",
    "relationship": "Mother",
    "linkedStudentName": "Paolo Mercado",
    "linkedLRN": "109238470490",
    "linkedLRNs": [
      "109238470490"
    ],
    "linkedStudentNames": [
      "Paolo Mercado"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0490!"
  },
  {
    "id": "PAR-494",
    "name": "Mr. Eduardo Mendoza",
    "email": "parent.109238470491@parent.sapc.edu.ph",
    "phone": "+63 919 352 468",
    "relationship": "Father",
    "linkedStudentName": "Anthony Mendoza",
    "linkedLRN": "109238470491",
    "linkedLRNs": [
      "109238470491"
    ],
    "linkedStudentNames": [
      "Anthony Mendoza"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0491!"
  },
  {
    "id": "PAR-495",
    "name": "Mrs. Jocelyn San Jose",
    "email": "parent.109238470492@parent.sapc.edu.ph",
    "phone": "+63 919 353 805",
    "relationship": "Mother",
    "linkedStudentName": "Hannah San Jose",
    "linkedLRN": "109238470492",
    "linkedLRNs": [
      "109238470492"
    ],
    "linkedStudentNames": [
      "Hannah San Jose"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0492!"
  },
  {
    "id": "PAR-496",
    "name": "Mr. Wilfredo Lim",
    "email": "parent.109238470493@parent.sapc.edu.ph",
    "phone": "+63 919 355 142",
    "relationship": "Father",
    "linkedStudentName": "Joshua Lim",
    "linkedLRN": "109238470493",
    "linkedLRNs": [
      "109238470493"
    ],
    "linkedStudentNames": [
      "Joshua Lim"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0493!"
  },
  {
    "id": "PAR-497",
    "name": "Mrs. Elizabeth Soriano",
    "email": "parent.109238470494@parent.sapc.edu.ph",
    "phone": "+63 919 356 479",
    "relationship": "Mother",
    "linkedStudentName": "Ethan Soriano",
    "linkedLRN": "109238470494",
    "linkedLRNs": [
      "109238470494"
    ],
    "linkedStudentNames": [
      "Ethan Soriano"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0494!"
  },
  {
    "id": "PAR-498",
    "name": "Mr. Victor Ramos",
    "email": "parent.109238470495@parent.sapc.edu.ph",
    "phone": "+63 919 357 816",
    "relationship": "Father",
    "linkedStudentName": "Karl Ramos",
    "linkedLRN": "109238470495",
    "linkedLRNs": [
      "109238470495"
    ],
    "linkedStudentNames": [
      "Karl Ramos"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0495!"
  },
  {
    "id": "PAR-499",
    "name": "Mrs. Imelda Tolentino",
    "email": "parent.109238470496@parent.sapc.edu.ph",
    "phone": "+63 919 359 153",
    "relationship": "Mother",
    "linkedStudentName": "Jerome Tolentino",
    "linkedLRN": "109238470496",
    "linkedLRNs": [
      "109238470496"
    ],
    "linkedStudentNames": [
      "Jerome Tolentino"
    ],
    "section": "Grade 10 - St. Ignatius",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0496!"
  },
  {
    "id": "PAR-500",
    "name": "Mr. Gabriel Rivera",
    "email": "parent.109238470497@parent.sapc.edu.ph",
    "phone": "+63 919 360 490",
    "relationship": "Father",
    "linkedStudentName": "Therese Rivera",
    "linkedLRN": "109238470497",
    "linkedLRNs": [
      "109238470497"
    ],
    "linkedStudentNames": [
      "Therese Rivera"
    ],
    "section": "Grade 10 - St. Augustine",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0497!"
  },
  {
    "id": "PAR-501",
    "name": "Mrs. Bernadette Dimaculangan",
    "email": "parent.109238470498@parent.sapc.edu.ph",
    "phone": "+63 919 361 827",
    "relationship": "Mother",
    "linkedStudentName": "Hannah Dimaculangan",
    "linkedLRN": "109238470498",
    "linkedLRNs": [
      "109238470498"
    ],
    "linkedStudentNames": [
      "Hannah Dimaculangan"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0498!"
  },
  {
    "id": "PAR-502",
    "name": "Mr. Manuel Dela Cruz",
    "email": "parent.109238470499@parent.sapc.edu.ph",
    "phone": "+63 919 363 164",
    "relationship": "Father",
    "linkedStudentName": "Benedict Dela Cruz",
    "linkedLRN": "109238470499",
    "linkedLRNs": [
      "109238470499"
    ],
    "linkedStudentNames": [
      "Benedict Dela Cruz"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0499!"
  },
  {
    "id": "PAR-503",
    "name": "Mrs. Cristina Garcia",
    "email": "parent.109238470500@parent.sapc.edu.ph",
    "phone": "+63 919 364 501",
    "relationship": "Mother",
    "linkedStudentName": "Ethan Garcia",
    "linkedLRN": "109238470500",
    "linkedLRNs": [
      "109238470500"
    ],
    "linkedStudentNames": [
      "Ethan Garcia"
    ],
    "section": "Grade 10 - St. Thomas Aquinas",
    "gradeLevel": "Grade 10",
    "status": "Active",
    "verifiedAt": "2026-08-15",
    "sf9Access": true,
    "attendanceAlerts": true,
    "riskAlerts": true,
    "initialPassword": "SAPC@P0500!"
  }
];
