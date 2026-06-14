export enum UserRole {
  PARTICIPANT = 'participant',
  ADMIN = 'admin',
  JUDGE = 'judge'
}

export interface User {
  id: number
  username: string
  email: string
  nickname: string
  avatar?: string
  role: UserRole
  phone?: string
  school?: string
  grade?: string
  realName?: string
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface LoginForm {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  email: string
  nickname: string
  role: UserRole
  realName?: string
  school?: string
  phone?: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface UpdateUserDto {
  nickname?: string
  avatar?: string
  phone?: string
  school?: string
  realName?: string
  password?: string
}
