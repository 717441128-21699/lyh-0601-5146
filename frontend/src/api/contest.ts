import request, { type PageParams, type PageResult } from '@/utils/request'
import type { Contest, CreateContestDto, UpdateContestDto, Registration } from '@/types/contest'

export function getContestList(params?: PageParams) {
  return request<PageResult<Contest>>({
    url: '/contests',
    method: 'get',
    params
  })
}

export function getContestDetail(id: number) {
  return request<Contest>({
    url: `/contests/${id}`,
    method: 'get'
  })
}

export function createContest(data: CreateContestDto) {
  return request<Contest>({
    url: '/contests',
    method: 'post',
    data
  })
}

export function updateContest(id: number, data: UpdateContestDto) {
  return request<Contest>({
    url: `/contests/${id}`,
    method: 'put',
    data
  })
}

export function deleteContest(id: number) {
  return request({
    url: `/contests/${id}`,
    method: 'delete'
  })
}

export function registerContest(contestId: number, groupId?: number) {
  return request<Registration>({
    url: `/registrations/contest/${contestId}`,
    method: 'post',
    data: { groupId }
  })
}

export function checkRegistration(contestId: number) {
  return request<{ isRegistered: boolean; registration: Registration | null }>({
    url: `/registrations/contest/${contestId}/check`,
    method: 'get'
  })
}

export function getRegistrationStatus(contestId: number) {
  return request({
    url: `/contests/${contestId}/registration-status`,
    method: 'get'
  })
}

export function cancelRegistration(contestId: number) {
  return request({
    url: `/contests/${contestId}/cancel`,
    method: 'post'
  })
}

export function getMyRegistrations(params?: PageParams) {
  return request<PageResult<Registration>>({
    url: '/registrations/my',
    method: 'get',
    params
  })
}

export function getContestRegistrations(contestId: number, params?: PageParams) {
  return request<PageResult<Registration>>({
    url: `/contests/${contestId}/registrations`,
    method: 'get',
    params
  })
}

export function getContestProblems(contestId: number) {
  return request({
    url: `/contests/${contestId}/problems`,
    method: 'get'
  })
}
