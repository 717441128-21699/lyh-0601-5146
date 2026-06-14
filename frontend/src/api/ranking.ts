import request, { type PageParams, type PageResult } from '@/utils/request'
import type { RankingItem } from '@/types/ranking'

export function getRankingList(params?: PageParams & { contestId?: number; groupId?: number }) {
  return request<PageResult<RankingItem>>({
    url: '/rankings',
    method: 'get',
    params
  })
}

export function getContestRanking(contestId: number, params?: PageParams & { groupId?: number }) {
  return request<PageResult<RankingItem>>({
    url: `/contests/${contestId}/rankings`,
    method: 'get',
    params
  })
}

export function getMyRanking(contestId: number) {
  return request<RankingItem>({
    url: `/contests/${contestId}/rankings/me`,
    method: 'get'
  })
}
