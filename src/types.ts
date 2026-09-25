/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'teacher' | 'expert';
export type LearningTrack = 'foundational' | 'advanced';
export type AIAssistancePolicy = 'minimal' | 'guided' | 'supported' | 'declared_ai_use';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  track?: LearningTrack;
  classId?: string;
}

export interface SurveyResponse {
  writingSelfEfficacy: number; // 1 to 5 average
  aiReliance: number;          // 1 to 5 average
  originalityAttitudes: number; // 1 to 5 average
  answers: Record<string, number>;
}

export interface PaperSection {
  id: string;
  title: string;
  description: string;
  foundationalScaffold: string;
  advancedScaffold: string;
  status: 'not_started' | 'planning' | 'drafting' | 'under_review' | 'needs_revision' | 'completed';
  content: string;
  wordCount: number;
  wordPredictionsAccepted: number;
  aiFeedbackRequests: number;
  revisionCount: number;
  pastedContentDetected: boolean;
  lastSavedAt: string;
}

export interface DraftVersion {
  id: string;
  sectionId: string;
  content: string;
  wordCount: number;
  timestamp: string;
  feedbackSummary?: string;
  processMetrics: {
    studentDrafting: 'HIGH' | 'MODERATE' | 'LOW';
    wordSuggestionsAccepted: 'HIGH' | 'MODERATE' | 'LOW';
    feedbackRequests: 'HIGH' | 'MODERATE' | 'LOW';
    directAIGeneration: 'NONE RECORDED' | 'MINIMAL DETECTED' | 'ALERT';
  };
}

export interface Paper {
  id: string;
  studentId: string;
  studentName?: string;
  studentGrade?: string;
  studentSection?: string;
  grade?: number | string;
  title: string;
  assignmentId: string;
  progress: number; // percentage 0-100
  sections: PaperSection[];
  draftHistory: DraftVersion[];
  preSurvey?: SurveyResponse;
  postSurvey?: SurveyResponse;
  track: LearningTrack;
  reflectionCompleted: boolean;
  reflectionText?: {
    planning: string;
    monitoring: string;
    reflection: string;
    evaluation: string;
    adaptation: string;
  };
  comments?: { id: string; sectionId: string; text: string; author: string; timestamp: string; highlightText?: string }[];
  synthesisMatrix?: { rowSourceId: string; columnTheme: string; active: boolean; note?: string }[];
}

export interface Source {
  id: string;
  author: string;
  title: string;
  publication: string;
  date: string;
  urlOrDoi: string;
  mainIdea: string;
  evidence: string;
  studentNotes: string;
  credibilityNotes: string;
  intendedSection: string;
  isAiSuggested?: boolean;
  verified: boolean;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  levels: {
    beginning: string;
    developing: string;
    proficient: string;
    advanced: string;
  };
}

export interface Rubric {
  id: string;
  assignmentId: string;
  criteria: RubricCriterion[];
}

export interface CompetencyMapping {
  id: string;
  competency: string;
  activity: string;
  scaffold: string;
  evidence: string;
  criterion: string;
  code?: string;
  name?: string;
  description?: string;
}

export interface ExpertValidation {
  id: string;
  expertName: string;
  date: string;
  ratings?: {
    curriculumAlignment: number;
    contentValidity: number;
    scaffoldingQuality: number;
    aiBehavior: number;
    suggestionQuality: number;
    usability: number;
    technicalFunctionality: number;
    originalityIndicator: number;
  };
  comments?: string;
  recommendations?: string;
  status?: 'pending' | 'under_review' | 'validated' | 'needs_revision';
  credentials?: string;
  institution?: string;
  competencyCode?: string;
  verdict?: 'verified' | 'needs_revision';
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  requiredSections: string[];
  trackSettings: {
    allowStudentTrackChange: boolean;
  };
  aiAssistancePolicy: AIAssistancePolicy;
}

export interface AppState {
  currentUser: User | null;
  papers: Paper[];
  sources: Source[];
  assignments: Assignment[];
  competencies: CompetencyMapping[];
  validations: ExpertValidation[];
  rubric: Rubric;
}
