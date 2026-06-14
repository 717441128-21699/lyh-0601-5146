import request, { type PageParams, type PageResult } from '@/utils/request'
import type { User, UpdateUserDto } from '@/types/user'

export function getUserList(params?: PageParams) {
  return request<PageResult<User>>({
    url: '/users',
    method: 'get',
    params
  })
}

export function getUserDetail(id: number) {
  return request<User>({
    url: `/users/${id}`,
    method: 'get'
  })
}

export function updateUser(id: number, data: UpdateUserDto) {
  return request<User>({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id: number) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

export function updateProfile(data: UpdateUserDto) {
  return request<User>({
    url: '/users/profile',
    method: 'put',
    data
  })
}

export function changePassword(oldPassword: string, newPassword: string) {
  return request({
    url: '/users/change-password',
    method: 'put',
    data: { oldPassword, newPassword }
  })
}

export function disableUser(id: number) {
  return request({
    url: `/users/${id}/disable`,
    method: 'post'
  })
}

export function enableUser(id: number) {
  return request({
    url: `/users/${id}/enable`,
    method: 'post'
  })
}
