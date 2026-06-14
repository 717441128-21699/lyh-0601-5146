import request, { type PageParams, type PageResult } from '@/utils/request'

export interface OperationReport {
  id: number
  date: string
  totalUsers: number
  newUsers: number
  activeUsers: number
  totalContests: number
  ongoingContests: number
  totalSubmissions: number
  acceptedSubmissions: number
  averageScore: number
  createdAt: string
}

export interface DashboardStats {
  totalUsers: number
  totalContests: number
  totalSubmissions: number
  totalProblems: number
  newUsersToday: number
  submissionsToday: number
  ongoingContests: number
  pendingJudgements: number
  antiCheatAlertsThisMonth: number
  registeredContests: number
  totalScore: number
  acceptedProblems: number
  rating: number
}

export function getDashboardStats() {
  return request<DashboardStats>({
    url: '/reports/dashboard',
    method: 'get'
  })
}

export function getMonthlyReports(params?: { date?: string; contestId?: number; page?: number; pageSize?: number }) {
  return request<PageResult<OperationReport>>({
    url: '/reports/monthly',
    method: 'get',
    params
  })
}

export function getMonthlyReport(year: number, month: number) {
  const date = `${year}-${String(month).padStart(2, '0')}`
  return getMonthlyReports({ date })
}

export function generateReport(date: string) {
  return request({
    url: '/reports/generate',
    method: 'post',
    data: { date }
  })
}

export function getReportList(params?: {
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  return request<PageResult<OperationReport>>({
    url: '/reports',
    method: 'get',
    params
  })
}

export function getUserGrowthChart(startDate?: string, endDate?: string) {
  return request<{
    dates: string[]
    counts: number[]
  }>({
    url: '/reports/charts/user-growth',
    method: 'get',
    params: { startDate, endDate }
  })
}

export function getSubmissionChart(startDate?: string, endDate?: string) {
  return request<{
    dates: string[]
    total: number[]
    accepted: number[]
  }>({
    url: '/reports/charts/submissions',
    method: 'get',
    params: { startDate, endDate }
  })
}

export function getContestParticipationChart(contestId?: number) {
  return request<{
    contests: string[]
    participants: number[]
  }>({
    url: '/reports/charts/contest-participation',
    method: 'get',
    params: { contestId }
  })
}

export function exportReport(type: 'monthly' | 'custom', params?: any) {
  return request({
    url: `/reports/export/${type}`,
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export interface AntiCheatRecord {
  id: number
  submissionId: number
  userId: number
  contestId: number
  similarity: number
  similarToSubmissionId?: number
  similarToUserId?: number
  status: 'pending' | 'confirmed' | 'dismissed'
  evidence?: string
  reviewedBy?: number
  reviewedAt?: string
  reviewNote?: string
  submittedAt: string
  contest?: {
    id: number
    title: string
  }
  user?: {
    id: number
    username: string
    realName: string
  }
  submission?: {
    id: number
    code: string
    language: string
  }
}

export function getAntiCheatRecords(params?: {
  status?: string
  contestId?: number
  page?: number
  pageSize?: number
}) {
  return request<PageResult<AntiCheatRecord>>({
    url: '/anti-cheat/records',
    method: 'get',
    params
  })
}

export function reviewRecord(id: number, data: {
  status: 'confirmed' | 'dismissed'
  reviewNote?: string
}) {
  return request<AntiCheatRecord>({
    url: `/anti-cheat/records/${id}/review`,
    method: 'post',
    data
  })
}

export function getAntiCheatStats() {
  return request<{
    totalRecords: number
    pending: number
    confirmed: number
    dismissed: number
    thisMonth: number
  }>({
    url: '/anti-cheat/stats',
    method: 'get'
  })
}

export function getSystemConfig() {
  return request<{
    antiCheatThreshold: number
    maxSubmissionsPerMinute: number
    codeSimilarityThreshold: number
    allowMultipleSubmissions: boolean
    contestAutoStart: boolean
  }>({
    url: '/system/config',
    method: 'get'
  })
}

export function updateSystemConfig(data: {
  antiCheatThreshold?: number
  maxSubmissionsPerMinute?: number
  codeSimilarityThreshold?: number
  allowMultipleSubmissions?: boolean
  contestAutoStart?: boolean
}) {
  return request({
    url: '/system/config',
    method: 'put',
    data
  })
}
