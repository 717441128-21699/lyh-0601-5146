import type { User } from './user'
import type { Contest } from './contest'

export interface RankingItem {
  id: number
  userId: number
  contestId: number
  groupId?: number
  rank: number
  totalScore: number
  maxScore?: number
  solvedProblems: number
  totalProblems?: number
  penalty?: number
  user?: User
  contest?: Contest
  lastSubmissionAt?: string
  problemScores?: {
    problemId: number
    score: number
    maxScore: number
    attempts: number
    solved: boolean
    solvedAt?: string
  }[]
}

export interface RankingQuery {
  contestId?: number
  groupId?: number
  page?: number
  pageSize?: number
}
