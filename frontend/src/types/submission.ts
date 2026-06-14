export type ProgrammingLanguage = 'cpp' | 'java' | 'python' | 'javascript'
export type SubmissionStatus = 'pending' | 'judging' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compile_error' | 'cheating'

export interface JudgeScore {
  id: number
  submissionId: number
  judgeId: number
  score: number
  comment?: string
  weight?: number
  judge?: {
    id: number
    username: string
    realName: string
  }
  createdAt: string
}

export interface Submission {
  id: number
  userId: number
  contestId: number
  problemId: number
  language: ProgrammingLanguage
  code: string
  status: SubmissionStatus
  score: number
  executionTime?: number
  executionMemory?: number
  testCasePassed?: number
  testCaseTotal?: number
  judgeLog?: string
  submittedAt: string
  judgedAt?: string
  user?: { username: string; realName: string }
  problem?: { title: string }
  judgeScores?: JudgeScore[]
}

export interface SubmitCodeDto {
  problemId: number
  contestId?: number
  language: ProgrammingLanguage
  code: string
}
