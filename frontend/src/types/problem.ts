export enum ProblemDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum ProblemType {
  PROGRAMMING = 'programming',
  SUBJECTIVE = 'subjective',
  MULTIPLE_CHOICE = 'multiple_choice'
}

export interface TestCase {
  input: string
  output: string
  isSample?: boolean
  points?: number
}

export interface Problem {
  id: number
  title: string
  description: string
  inputDescription?: string
  outputDescription?: string
  hint?: string
  difficulty: ProblemDifficulty
  type: ProblemType
  timeLimit?: number
  memoryLimit?: number
  points?: number
  contestId?: number
  orderIndex?: number
  languages?: string[]
  sampleInput?: string
  sampleOutput?: string
  testCases?: TestCase[]
  submissionCount?: number
  acceptedCount?: number
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateProblemDto {
  title: string
  description: string
  inputDescription?: string
  outputDescription?: string
  hint?: string
  difficulty: ProblemDifficulty
  type: ProblemType
  timeLimit?: number
  memoryLimit?: number
  points?: number
  contestId?: number
  orderIndex?: number
  languages?: string[]
  sampleInput?: string
  sampleOutput?: string
  testCases?: TestCase[]
  tags?: string[]
}

export interface UpdateProblemDto {
  title?: string
  description?: string
  inputDescription?: string
  outputDescription?: string
  hint?: string
  difficulty?: ProblemDifficulty
  type?: ProblemType
  timeLimit?: number
  memoryLimit?: number
  points?: number
  orderIndex?: number
  languages?: string[]
  sampleInput?: string
  sampleOutput?: string
  testCases?: TestCase[]
  tags?: string[]
}
