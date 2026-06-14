import request, { type PageParams, type PageResult } from '@/utils/request'

export interface Certificate {
  id: number
  userId: number
  contestId: number
  type: 'winner' | 'participant' | 'achievement'
  title: string
  description?: string
  rank?: number
  score?: number
  certificateUrl?: string
  issuedAt: string
  contest?: {
    id: number
    title: string
  }
}

export function getMyCertificates(params?: PageParams) {
  return request<PageResult<Certificate>>({
    url: '/certificates/my',
    method: 'get',
    params
  })
}

export function getCertificateDetail(id: number) {
  return request<Certificate>({
    url: `/certificates/${id}`,
    method: 'get'
  })
}

export function downloadCertificate(id: number) {
  return request({
    url: `/certificates/${id}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

export function getContestCertificates(contestId: number, params?: PageParams) {
  return request<PageResult<Certificate>>({
    url: `/contests/${contestId}/certificates`,
    method: 'get',
    params
  })
}

export function generateCertificates(contestId: number) {
  return request({
    url: `/certificates/generate/${contestId}`,
    method: 'post'
  })
}
