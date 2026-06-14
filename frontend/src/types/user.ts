export type UserRole = 'participant' | 'admin' | 'judge'

export interface User {
  id: number
  username: string
  email: string
  realName: string
  phone?: string
  avatar?: string
  organization?: string
  role: UserRole
  rating: number
  totalScore: number
  submissionCount: number
  status: 'active' | 'banned'
  createdAt: string
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
  realName: string
  role: UserRole
  phone?: string
  organization?: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface UpdateUserDto {
  realName?: string
  avatar?: string
  phone?: string
  organization?: string
  password?: string
}
