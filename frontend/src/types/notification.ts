export type NotificationType = 'registration' | 'score' | 'cheating' | 'certificate' | 'system'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  relatedType?: string
  isRead: boolean
  createdAt: string
}

export interface CreateNotificationDto {
  userId: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  relatedType?: string
}
