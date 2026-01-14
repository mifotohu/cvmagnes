
export enum StyleType {
  PROFESSIONAL = 'Professzionális (hivatalos/tisztelettudó)',
  SOLUTION_ORIENTED = 'Megoldásközpontú (operatív/gyors)',
  INNOVATOR = 'Innovátor (AI/jövőorientált)',
  STORYTELLER = 'Storyteller (személyes út/narratív)',
  DATA_DRIVEN = 'Adatvezérelt (KPI/eredményfókuszú)',
  MINIMALIST = 'Minimalista (lényegre törő/tiszta)',
  CONCISE = 'Tömörség (extra rövid/direkt)'
}

export enum ToneType {
  INFORMAL = 'Tegező',
  FORMAL = 'Magázó',
  BUSINESS = 'Üzleties'
}

export interface AISkills {
  llm: number;
  prompting: number;
  visualAI: number;
  automation: number;
  analysis: number;
}

export interface FileData {
  base64: string;
  mimeType: string;
  fileName: string;
}

export interface ApplicationData {
  cvData: string;
  cvFile?: FileData;
  jdData: string;
  company: string;
  position: string;
  salary?: string;
  style: StyleType;
  tone: ToneType;
  aiSkills: AISkills;
}

export interface SkillMatch {
  label: string;
  score: number; // 0-100
}

export interface GenerationResult {
  subject: string;
  emailTemplate: string;
  coverLetter: string;
  salaryNote?: string;
  cvAnalysisReport?: string;
  skillAlignment: SkillMatch[];
}
