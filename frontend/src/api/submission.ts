import request, { type PageParams, type PageResult } from '@/utils/request'
import type { Submission, SubmitCodeDto } from '@/types/submission'

export function submitCode(data: SubmitCodeDto) {
  return request<Submission>({
    url: '/submissions',
    method: 'post',
    data
  })
}

export function getSubmissionList(params?: PageParams) {
  return request<PageResult<Submission>>({
    url: '/submissions',
    method: 'get',
    params
  })
}

export function getMySubmissions(params?: PageParams) {
  return request<PageResult<Submission>>({
    url: '/submissions/my',
    method: 'get',
    params
  })
}

export function getSubmissionDetail(id: number) {
  return request<Submission>({
    url: `/submissions/${id}`,
    method: 'get'
  })
}

export function getContestSubmissions(contestId: number, params?: PageParams) {
  return request<PageResult<Submission>>({
    url: `/contests/${contestId}/submissions`,
    method: 'get',
    params
  })
}

export function getProblemSubmissions(problemId: number, params?: PageParams) {
  return request<PageResult<Submission>>({
    url: `/problems/${problemId}/submissions`,
    method: 'get',
    params
  })
}
