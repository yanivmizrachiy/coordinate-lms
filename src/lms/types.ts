export interface StudentProfile {
  uid: string;
  fullName: string;
  username: string;
  email?: string;
  className?: string;
  school?: string;
  createdAt: number;
  lastSeenAt: number;
}

export interface ActivityEvent {
  uid: string;
  pageNumber: number;
  type:
    | 'page_open'
    | 'answer_change'
    | 'answer_check'
    | 'page_submit'
    | 'page_leave'
    | 'heartbeat';
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
}
