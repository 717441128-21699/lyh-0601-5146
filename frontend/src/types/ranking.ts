export interface RankingItem {
  rank: number
  userId: number
  contestId: number
  groupId?: number
  totalScore: number
  solvedProblems: number
  penalty?: number
  lastSubmissionAt?: string
  user?: { username: string; realName: string; organization?: string }
}
