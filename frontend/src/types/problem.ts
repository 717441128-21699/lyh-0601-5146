export type ProblemType = 'objective' | 'subjective'
export type ProblemDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface TestCase {
  input: string
  output: string
}

export interface Problem {
  id: number
  contestId: number
  groupId?: number
  title: string
  description: string
  inputDescription?: string
  outputDescription?: string
  sampleInput?: string
  sampleOutput?: string
  hint?: string
  type: ProblemType
  difficulty: ProblemDifficulty
  timeLimit: number
  memoryLimit: number
  score: number
  testCases?: TestCase[]
  createdBy: number
}

export interface CreateProblemDto {
  contestId: number
  groupId?: number
  title: string
  description: string
  inputDescription?: string
  outputDescription?: string
  sampleInput?: string
  sampleOutput?: string
  hint?: string
  type: ProblemType
  difficulty: ProblemDifficulty
  timeLimit: number
  memoryLimit: number
  score: number
  testCases?: TestCase[]
}

export interface UpdateProblemDto {
  title?: string
  description?: string
  inputDescription?: string
  outputDescription?: string
  sampleInput?: string
  sampleOutput?: string
  hint?: string
  type?: ProblemType
  difficulty?: ProblemDifficulty
  timeLimit?: number
  memoryLimit?: number
  score?: number
  testCases?: TestCase[]
}
