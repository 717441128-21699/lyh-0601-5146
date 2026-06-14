export type ContestStatus = 'draft' | 'registering' | 'ongoing' | 'ended' | 'cancelled'
export type ContestType = 'individual' | 'team'
export type ContestDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface ContestGroup {
  id: number
  contestId: number
  name: string
  description?: string
  capacity: number
  currentCount: number
  minRating?: number
  maxRating?: number
}

export interface Contest {
  id: number
  title: string
  description: string
  status: ContestStatus
  type: ContestType
  difficulty: ContestDifficulty
  organizer: string
  coverImage?: string
  registrationStartTime: string
  registrationEndTime: string
  startTime: string
  endTime: string
  maxParticipants?: number
  antiCheatThreshold: number
  checkPointCount: number
  createdBy: number
  createdAt: string
  updatedAt: string
  groups: ContestGroup[]
  isRegistered?: boolean
  registrationInfo?: Registration
}

export interface Registration {
  id: number
  userId: number
  contestId: number
  groupId?: number
  ticketNumber?: string
  credentialCode?: string
  trackName?: string
  status: string
  finalScore?: number
  finalRank?: number
  registeredAt: string
  group?: ContestGroup
}

export interface CreateContestDto {
  title: string
  description: string
  type: ContestType
  difficulty: ContestDifficulty
  organizer: string
  registrationStartTime: string
  registrationEndTime: string
  startTime: string
  endTime: string
  maxParticipants?: number
  antiCheatThreshold: number
  checkPointCount: number
  groups: { name: string; description?: string; capacity: number; minRating?: number; maxRating?: number }[]
  coverImage?: string
}

export interface UpdateContestDto {
  title?: string
  description?: string
  type?: ContestType
  difficulty?: ContestDifficulty
  organizer?: string
  status?: ContestStatus
  registrationStartTime?: string
  registrationEndTime?: string
  startTime?: string
  endTime?: string
  maxParticipants?: number
  antiCheatThreshold?: number
  checkPointCount?: number
  groups?: { id?: number; name: string; description?: string; capacity: number; minRating?: number; maxRating?: number }[]
  coverImage?: string
}
