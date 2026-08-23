export type StudentRole = 'student' | 'admin';

export interface StudentProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  className?: string;
  school?: string;
  role?: StudentRole;
  createdAt: number;
  lastSeenAt: number;
}

export interface LmsSession {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  role: StudentRole;
  createdAt: number;
}

export interface QuestionProgress {
  answer: string;
  attempts: number;
  correct: boolean;
  locked: boolean;
}

export interface PageDraft {
  uid: string;
  pageNumber: number;
  startedAt: number;
  updatedAt: number;
  activeSeconds: number;
  questions: Record<string, QuestionProgress>;
  submitted: boolean;
  score?: number;
  maxAttemptCount?: number;
}

export interface ActivityEvent {
  id?: string;
  uid: string;
  pageNumber: number;
  type:
    | 'page_open'
    | 'answer_change'
    | 'answer_check'
    | 'page_submit'
    | 'page_leave'
    | 'heartbeat'
    | 'registration'
    | 'login';
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface PageResult {
  uid: string;
  pageNumber: number;
  score: number;
  startedAt: number;
  submittedAt: number;
  activeSeconds: number;
  attempts: Record<string, number>;
  answers: Record<string, string>;
  bestScore?: number;
  latestScore?: number;
  maxAttemptCount?: number;
  submissionId?: string;
}

export interface SyncErrorRecord {
  uid: string;
  pageNumber: number;
  operation: 'draft' | 'result' | 'activity' | 'guest-transfer' | 'dashboard';
  createdAt: number;
  message: string;
}

export interface PersistenceOutcome {
  localSaved: boolean;
  central: 'saved' | 'failed' | 'not-required';
  error?: string;
}

export type AnswerKey = Record<string, string[]>;

export interface DashboardStudent {
  profile: StudentProfile;
  results: PageResult[];
  drafts: PageDraft[];
  activity: ActivityEvent[];
  syncErrors: SyncErrorRecord[];
}

export interface DashboardSnapshot {
  students: DashboardStudent[];
  generatedAt: number;
  source: 'firebase' | 'local';
  syncErrors: SyncErrorRecord[];
}
