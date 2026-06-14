<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">排行榜</h2>
    </div>

    <el-card class="card-shadow mb-20" :body-style="{ padding: '16px 20px' }">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="竞赛">
          <el-select v-model="filterForm.contestId" placeholder="选择竞赛" clearable style="width: 260px" @change="loadRankings">
            <el-option
              v-for="c in contestList"
              :key="c.id"
              :label="c.title"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="组别">
          <el-select
            v-model="filterForm.groupId"
            placeholder="全部组别"
            clearable
            style="width: 180px"
            :disabled="!currentGroups.length"
            @change="loadRankings"
          >
            <el-option
              v-for="g in currentGroups"
              :key="g.id"
              :label="g.name"
              :value="g.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-empty v-if="!loading && rankings.length === 0" description="暂无排名数据" />

    <el-card v-else class="card-shadow">
      <el-table :data="rankings" stripe v-loading="loading">
        <el-table-column label="排名" width="100" align="center">
          <template #default="{ row }">
            <div class="rank-cell">
              <span v-if="row.rank === 1" class="medal gold">🥇</span>
              <span v-else-if="row.rank === 2" class="medal silver">🥈</span>
              <span v-else-if="row.rank === 3" class="medal bronze">🥉</span>
              <span v-else class="rank-num">{{ row.rank }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="180">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40">
                {{ row.user?.nickname?.charAt(0) || row.user?.username?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ row.user?.nickname || row.user?.username }}</div>
                <div class="user-school" v-if="row.user?.school">{{ row.user.school }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="通过题数" prop="solvedProblems" width="120" align="center">
          <template #default="{ row }">
            <span class="solved-count">
              {{ row.solvedProblems }}
              <span v-if="row.totalProblems">/{{ row.totalProblems }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="总分" prop="totalScore" width="120" align="center">
          <template #default="{ row }">
            <span class="total-score">
              {{ row.totalScore }}
              <span v-if="row.maxScore">/{{ row.maxScore }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="用时" width="140" align="center">
          <template #default="{ row }">
            {{ row.penalty ? formatPenalty(row.penalty) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="题目得分详情" min-width="300">
          <template #default="{ row }">
            <div class="problem-scores" v-if="row.problemScores?.length">
              <div
                v-for="(ps, idx) in row.problemScores"
                :key="ps.problemId"
                class="problem-score"
                :class="{ solved: ps.solved }"
                :title="`${String.fromCharCode(65 + idx)}题: ${ps.score}分，尝试${ps.attempts}次`"
              >
                <div class="ps-label">{{ String.fromCharCode(65 + idx) }}</div>
                <div class="ps-score">{{ ps.score }}</div>
              </div>
            </div>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="最后提交" width="180" align="center">
          <template #default="{ row }">
            {{ row.lastSubmissionAt ? formatTime(row.lastSubmissionAt) : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap mt-20" v-if="total > 0">
        <el-pagination
          v-model:current-page="filterForm.page"
          v-model:page-size="filterForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadRankings"
          @current-change="loadRankings"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { getRankingList } from '@/api/ranking'
import { getContestList } from '@/api/contest'
import type { RankingItem } from '@/types/ranking'
import type { Contest } from '@/types/contest'
import dayjs from 'dayjs'

const loading = ref(false)
const rankings = ref<RankingItem[]>([])
const total = ref(0)
const contestList = ref<Contest[]>([])

const filterForm = reactive({
  contestId: null as number | null,
  groupId: null as number | null,
  page: 1,
  pageSize: 50
})

const currentGroups = computed(() => {
  if (!filterForm.contestId) return []
  const contest = contestList.value.find(c => c.id === filterForm.contestId)
  return contest?.groups || []
})

function formatPenalty(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatTime(time: string) {
  return dayjs(time).format('MM-DD HH:mm')
}

async function loadContests() {
  try {
    const res = await getContestList({ pageSize: 100 })
    contestList.value = res.list || []
    if (contestList.value.length > 0) {
      filterForm.contestId = contestList.value[0].id
    }
  } catch (error) {
  }
}

async function loadRankings() {
  loading.value = true
  try {
    const res = await getRankingList({
      contestId: filterForm.contestId || undefined,
      groupId: filterForm.groupId || undefined,
      page: filterForm.page,
      pageSize: filterForm.pageSize
    })
    rankings.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadContests()
  loadRankings()
})
</script>

<style lang="scss" scoped>
.rank-cell {
  .medal {
    font-size: 24px;
  }

  .rank-num {
    display: inline-block;
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    border-radius: 50%;
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-info {
    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .user-school {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
}

.solved-count {
  font-size: 15px;
  font-weight: 600;
  color: #67C23A;
}

.total-score {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.problem-scores {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.problem-score {
  min-width: 44px;
  text-align: center;
  padding: 4px 6px;
  border-radius: 4px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;

  &.solved {
    background: #f0f9eb;
    border-color: #c2e7b0;

    .ps-score {
      color: #67C23A;
      font-weight: 600;
    }
  }

  .ps-label {
    font-size: 11px;
    color: #909399;
  }

  .ps-score {
    font-size: 13px;
    color: #303133;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
}
</style>
