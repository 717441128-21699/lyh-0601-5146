import request, { type PageParams, type PageResult } from '@/utils/request'
import type { Submission, JudgeSubmissionDto, JudgeScore } from '@/types/submission'

export function getPendingJudgements(params?: PageParams) {
  return request<PageResult<Submission>>({
    url: '/judges/pending',
    method: 'get',
    params
  })
}

export function getMyJudgeHistory(params?: PageParams) {
  return request<PageResult<JudgeScore>>({
    url: '/judges/history',
    method: 'get',
    params
  })
}

export function judgeSubmission(data: JudgeSubmissionDto) {
  return request<JudgeScore>({
    url: '/judges/score',
    method: 'post',
    data
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
