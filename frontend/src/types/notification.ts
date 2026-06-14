import type { User } from './user'

export enum NotificationType {
  SYSTEM = 'system',
  CONTEST = 'contest',
  SUBMISSION = 'submission',
  JUDGE = 'judge',
  CERTIFICATE = 'certificate'
}

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  relatedId?: number
  relatedType?: string
  senderId?: number
  sender?: User
  createdAt: string
  readAt?: string
}

export interface CreateNotificationDto {
  userId: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  relatedType?: string
  senderId?: number
}
