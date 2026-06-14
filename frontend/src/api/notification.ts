import request, { type PageParams, type PageResult } from '@/utils/request'
import type { Notification } from '@/types/notification'

export function getNotifications(params?: PageParams & { isRead?: boolean; type?: string }) {
  return request<PageResult<Notification>>({
    url: '/notifications',
    method: 'get',
    params
  })
}

export function getNotificationList(params?: PageParams & { isRead?: boolean; type?: string }) {
  return getNotifications(params)
}

export function getMyNotifications(params?: PageParams & { isRead?: boolean; type?: string }) {
  return getNotifications(params)
}

export function getUnreadCount() {
  return request<{ count: number }>({
    url: '/notifications/unread-count',
    method: 'get'
  })
}

export function markAsRead(id: number) {
  return request<Notification>({
    url: `/notifications/${id}/read`,
    method: 'patch'
  })
}

export function readNotification(id: number) {
  return markAsRead(id)
}

export function markAllAsRead() {
  return request({
    url: '/notifications/read-all',
    method: 'patch'
  })
}

export function readAllNotifications() {
  return markAllAsRead()
}

export function pushNotification(data: { userId: number; type: string; title: string; content: string; relatedId?: number; relatedType?: string }) {
  return request<Notification>({
    url: '/notifications/push',
    method: 'post',
    data
  })
}

export function createNotification(data: { userId: number; type: string; title: string; content: string; relatedId?: number; relatedType?: string }) {
  return pushNotification(data)
}

export function deleteNotification(id: number) {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  })
}
