import type { User } from './user'

export enum ContestStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  ENDED = 'ended'
}

export enum ContestType {
  INDIVIDUAL = 'individual',
  TEAM = 'team'
}

export interface ContestGroup {
  id: number
  name: string
  description?: string
  contestId: number
  minScore?: number
  maxScore?: number
  createdAt: string
  updatedAt: string
}

export interface Contest {
  id: number
  title: string
  description: string
  coverImage?: string
  type: ContestType
  status: ContestStatus
  startTime: string
  endTime: string
  registrationStartTime: string
  registrationEndTime: string
  maxParticipants?: number
  groups: ContestGroup[]
  problemCount?: number
  participantCount?: number
  isRegistered?: boolean
  createdBy: number
  creator?: User
  createdAt: string
  updatedAt: string
}

export interface CreateContestDto {
  title: string
  description: string
  coverImage?: string
  type: ContestType
  startTime: string
  endTime: string
  registrationStartTime: string
  registrationEndTime: string
  maxParticipants?: number
  groups?: { name: string; description?: string }[]
}

export interface UpdateContestDto {
  title?: string
  description?: string
  coverImage?: string
  type?: ContestType
  status?: ContestStatus
  startTime?: string
  endTime?: string
  registrationStartTime?: string
  registrationEndTime?: string
  maxParticipants?: number
  groups?: { id?: number; name: string; description?: string }[]
}

export interface Registration {
  id: number
  userId: number
  contestId: number
  groupId?: number
  status: 'pending' | 'approved' | 'rejected'
  registeredAt: string
  user?: User
  contest?: Contest
}
