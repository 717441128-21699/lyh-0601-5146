import type { User } from './user'
import type { Problem } from './problem'
import type { Contest } from './contest'

export enum SubmissionStatus {
  PENDING = 'pending',
  JUDGING = 'judging',
  ACCEPTED = 'accepted',
  WRONG_ANSWER = 'wrong_answer',
  TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED = 'memory_limit_exceeded',
  RUNTIME_ERROR = 'runtime_error',
  COMPILATION_ERROR = 'compilation_error',
  SYSTEM_ERROR = 'system_error',
  PARTIALLY_ACCEPTED = 'partially_accepted',
  PENDING_JUDGE = 'pending_judge'
}

export interface JudgeScore {
  id: number
  submissionId: number
  judgeId: number
  score: number
  maxScore: number
  comment?: string
  judge?: User
  createdAt: string
}

export interface Submission {
  id: number
  userId: number
  problemId: number
  contestId?: number
  code: string
  language: string
  status: SubmissionStatus
  score?: number
  maxScore?: number
  runtime?: number
  memory?: number
  testCasesPassed?: number
  testCasesTotal?: number
  errorMessage?: string
  output?: string
  submittedAt: string
  user?: User
  problem?: Problem
  contest?: Contest
  judgeScores?: JudgeScore[]
}

export interface SubmitCodeDto {
  problemId: number
  contestId?: number
  code: string
  language: string
}

export interface JudgeSubmissionDto {
  submissionId: number
  score: number
  maxScore: number
  comment?: string
}
