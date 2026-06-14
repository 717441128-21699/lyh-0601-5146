import request, { type PageParams, type PageResult } from '@/utils/request'
import type { Notification, CreateNotificationDto } from '@/types/notification'

export function getNotificationList(params?: PageParams & { isRead?: boolean }) {
  return request<PageResult<Notification>>({
    url: '/notifications',
    method: 'get',
    params
  })
}

export function getMyNotifications(params?: PageParams & { isRead?: boolean }) {
  return request<PageResult<Notification>>({
    url: '/notifications/my',
    method: 'get',
    params
  })
}

export function getUnreadCount() {
  return request<{ count: number }>({
    url: '/notifications/unread-count',
    method: 'get'
  })
}

export function readNotification(id: number) {
  return request<Notification>({
    url: `/notifications/${id}/read`,
    method: 'put'
  })
}

export function readAllNotifications() {
  return request({
    url: '/notifications/read-all',
    method: 'put'
  })
}

export function createNotification(data: CreateNotificationDto) {
  return request<Notification>({
    url: '/notifications',
    method: 'post',
    data
  })
}

export function deleteNotification(id: number) {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  })
}
