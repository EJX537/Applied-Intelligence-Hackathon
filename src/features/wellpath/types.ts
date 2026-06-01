// ── User ──────────────────────────────────────────────────────────

export interface WellPathUser {
  name: string
  email: string
  avatarInitial: string
  memberSince: string
}

// ── Daily score ───────────────────────────────────────────────────

export interface DailyScore {
  /** 0-100 overall health score */
  total: number
  /** 0-100 check-in completion percentage */
  completionRate: number
  completedSections: number
  totalSections: number
  /** Human-readable status line (e.g. "2 of 3 daily sections complete") */
  message: string
}

// ── Reward milestones ─────────────────────────────────────────────

export interface RewardMilestone {
  month: number
  amount: number
  earned: boolean
  /** Score at checkpoint (null if not yet reached) */
  score: number | null
  /** Completion rate at checkpoint (null if not yet reached) */
  completion: number | null
}

export interface RewardsPlan {
  currentMonth: number
  milestones: RewardMilestone[]
  thresholdScore: number
  thresholdCompletion: number
}

// ── Section (check-in item) ───────────────────────────────────────

export type SectionStatus = 'logged' | 'pending' | 'incomplete'

export type SectionAccent = 'sky' | 'amber' | 'violet' | 'emerald'

export interface SectionDef {
  id: string
  title: string
  subtitle: string
  weightLabel: string
  weightPercent: number
  accent: SectionAccent
  icon: string
  /** Hide the score number on the right side of the card */
  hideScore?: boolean
  /** Hide the status pill (Done/Upcoming/To do) */
  hideStatus?: boolean
}

export interface SectionData {
  /** Current status */
  status: SectionStatus
  /** Running score for this section (null if not started / pending) */
  score: number | null
  /** Human-readable detail line (e.g. "8,420 steps today") */
  detail: string
  /** Loading state for this section's data */
  loading?: boolean
  /** Error message if this section failed to load */
  error?: string
}

// ── Top-level dashboard payload ───────────────────────────────────

export interface WellPathDashboardData {
  user: WellPathUser
  dailyScore: DailyScore
  rewards: RewardsPlan
  /** Sections ordered by display priority */
  sections: { def: SectionDef; data: SectionData }[]
  lastUpdated: Date | null
}

// ── Hook return type ──────────────────────────────────────────────

export type WellPathDataState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'empty'; message: string }
  | { status: 'ready'; data: WellPathDashboardData }
