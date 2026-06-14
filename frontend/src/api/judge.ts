import request, { type PageParams, type PageResult } from '@/utils/request'
import type { Submission } from '@/types/submission'

export function getPendingList(params?: PageParams & { contestId?: number }) {
  return request<PageResult<Submission>>({
    url: '/judges/pending',
    method: 'get',
    params
  })
}

export function getPendingJudgements(params?: PageParams & { contestId?: number }) {
  return getPendingList(params)
}

export function submitScore(submissionId: number, data: { score: number; comment?: string; weight?: number }) {
  return request({
    url: `/judges/score/${submissionId}`,
    method: 'post',
    data
  })
}

export function judgeSubmission(submissionId: number, data: { score: number; comment?: string; passed?: boolean; weight?: number }) {
  return submitScore(submissionId, { score: data.score, comment: data.comment, weight: data.weight })
}

export function getSubmissionDetail(id: number) {
  return request<Submission>({
    url: `/judges/submissions/${id}`,
    method: 'get'
  })
}

export function getMyJudgeHistory(params?: PageParams) {
  return request<PageResult<any>>({
    url: '/judges/history',
    method: 'get',
    params
  })
}

export function getJudgeStats() {
  return request<{
    totalPending: number
    todayJudged: number
    totalJudged: number
    averageScore: number
  }>({
    url: '/judges/stats',
    method: 'get'
  })
}
