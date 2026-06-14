import request from '@/utils/request'

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
}

export function getDashboardStats() {
  return request<DashboardStats>({
    url: '/reports/dashboard',
    method: 'get'
  })
}

export function getMonthlyReport(year: number, month: number) {
  return request<OperationReport>({
    url: `/reports/monthly/${year}/${month}`,
    method: 'get'
  })
}

export function getReportList(params?: {
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  return request<{
    list: OperationReport[]
    total: number
  }>({
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
  note?: string
  submittedAt: string
  user?: {
    id: number
    username: string
    nickname: string
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
  return request<{
    list: AntiCheatRecord[]
    total: number
  }>({
    url: '/anti-cheat',
    method: 'get',
    params
  })
}

export function reviewAntiCheat(id: number, data: {
  status: 'confirmed' | 'dismissed'
  note?: string
}) {
  return request<AntiCheatRecord>({
    url: `/anti-cheat/${id}/review`,
    method: 'post',
    data
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
