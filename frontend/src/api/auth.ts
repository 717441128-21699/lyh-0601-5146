import request from '@/utils/request'
import type { LoginForm, RegisterForm, LoginResponse, User } from '@/types/user'

export function login(data: LoginForm) {
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function register(data: RegisterForm) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export function getCurrentUser() {
  return request<User>({
    url: '/auth/profile',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
