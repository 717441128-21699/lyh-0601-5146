import request, { type PageParams, type PageResult } from '@/utils/request'
import type { Problem, CreateProblemDto, UpdateProblemDto } from '@/types/problem'

export function getProblemList(params?: PageParams) {
  return request<PageResult<Problem>>({
    url: '/problems',
    method: 'get',
    params
  })
}

export function getProblemDetail(id: number) {
  return request<Problem>({
    url: `/problems/${id}`,
    method: 'get'
  })
}

export function createProblem(data: CreateProblemDto) {
  return request<Problem>({
    url: '/problems',
    method: 'post',
    data
  })
}

export function updateProblem(id: number, data: UpdateProblemDto) {
  return request<Problem>({
    url: `/problems/${id}`,
    method: 'put',
    data
  })
}

export function deleteProblem(id: number) {
  return request({
    url: `/problems/${id}`,
    method: 'delete'
  })
}

export function getContestProblemList(contestId: number, params?: PageParams) {
  return request<PageResult<Problem>>({
    url: `/contests/${contestId}/problems`,
    method: 'get',
    params
  })
}

export function addProblemToContest(contestId: number, problemId: number, orderIndex?: number) {
  return request({
    url: `/contests/${contestId}/problems`,
    method: 'post',
    data: { problemId, orderIndex }
  })
}

export function removeProblemFromContest(contestId: number, problemId: number) {
  return request({
    url: `/contests/${contestId}/problems/${problemId}`,
    method: 'delete'
  })
}
