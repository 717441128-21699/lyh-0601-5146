import request, { type PageParams, type PageResult } from '@/utils/request'

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

export function getAntiCheatRecords(params?: PageParams & {
  status?: string
  contestId?: number
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
