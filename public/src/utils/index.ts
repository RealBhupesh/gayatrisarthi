export const storageKey = "Chhatra";
export const photoURLChhatraKey = "photoUrlChhatraKey";

export const streams = ["All", "Science", "Commerce", "Diploma", "Arts"];

export const institutes = [
  "Junior College",
  "School",
  "Higher Education Institute",
];

export const preparingForOptions = [
  "JEE",
  "NEET",
  "CAT",
  "UPSC",
  "GATE",
  "GRE",
  "MHTCET(PCM)",
  "MHTCET(PCB)",
  "MAH-B-BCA-BBA-BMS-BBM-CET",
];

export const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Management",
  "Financial Management",
  "Marketing Management",
  "Business Economics",
  "Accounting ",
];

export const examSubjectMap: Record<string, string[]> = {
  JEE: ["Mathematics", "Physics", "Chemistry"],
  NEET: ["Physics", "Chemistry", "Biology"],
  CAT: [
    "Management",
    "Financial Management",
    "Marketing Management",
    "Business Economics",
  ],
  UPSC: ["Management", "Business Economics", "Accounting"],
  GATE: ["Mathematics", "Physics", "Chemistry"],
  GRE: ["Mathematics", "Management", "Business Economics"],
  "MHTCET(PCM)": ["Mathematics", "Physics", "Chemistry"],
  "MHTCET(PCB)": ["Physics", "Chemistry", "Biology"],
  "MAH-B-BCA-BBA-BMS-BBM-CET": [
    "Reasoning (Verbal and Arithmetic)",
    "English language",
    "Computer basics",
    "General Knowledge and awareness",
  ],
};
