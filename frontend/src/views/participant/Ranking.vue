<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">排行榜</h2>
      <div class="filter-section">
        <el-select v-model="selectedContestId" placeholder="选择竞赛" style="width: 260px;" @change="loadData">
          <el-option
            v-for="c in contests"
            :key="c.id"
            :label="c.title"
            :value="c.id"
          />
        </el-select>
        <el-select v-model="selectedGroupId" placeholder="选择赛道" style="width: 180px;" @change="loadData" clearable>
          <el-option
            v-for="g in contestGroups"
            :key="g.id"
            :label="g.name"
            :value="g.id"
          />
        </el-select>
        <el-button type="primary" :loading="loadingRefresh" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新排名
        </el-button>
      </div>
    </div>

    <el-card class="mt-20 card-shadow">
      <template v-if="!selectedContestId">
        <el-empty description="请先选择一个竞赛查看排名" />
      </template>
      <template v-else>
        <el-table :data="rankingList" v-loading="loading" stripe height="600">
          <el-table-column label="排名" width="90" align="center" fixed="left">
            <template #default="{ row }">
              <span v-if="row.rank === 1" class="rank-badge gold">🥇 {{ row.rank }}</span>
              <span v-else-if="row.rank === 2" class="rank-badge silver">🥈 {{ row.rank }}</span>
              <span v-else-if="row.rank === 3" class="rank-badge bronze">🥉 {{ row.rank }}</span>
              <span v-else class="rank-badge">{{ row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" min-width="200">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="40" class="mr-12">
                  {{ (row.user?.realName || row.user?.username || 'U').charAt(0) }}
                </el-avatar>
                <div class="user-info">
                  <div class="username">
                    {{ row.user?.realName || row.user?.username }}
                    <el-tag size="small" type="primary" v-if="row.userId === currentUserId" class="ml-8">我</el-tag>
                  </div>
                  <div class="org" v-if="row.user?.organization">{{ row.user.organization }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="赛道" width="140" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.group" size="small" type="info">{{ row.group.name }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="总分" width="110" align="center" fixed="right">
            <template #default="{ row }">
              <strong class="total-score">{{ row.totalScore }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="通过题数" width="110" align="center">
            <template #default="{ row }">{{ row.solvedProblems || 0 }}</template>
          </el-table-column>
          <el-table-column label="罚时" width="120" align="center" v-if="contest?.type === 'individual'">
            <template #default="{ row }">
              <span v-if="row.penalty">{{ formatPenalty(row.penalty) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="最后提交" width="160" align="center">
            <template #default="{ row }">
              <span v-if="row.lastSubmissionAt">{{ formatTime(row.lastSubmissionAt) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="total > 0"
          class="mt-20"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          :page-sizes="[20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getContestList, getContestDetail } from '@/api/contest'
import { getContestRanking, refreshRanking } from '@/api/ranking'
import { useUserStore } from '@/stores/user'
import type { Contest } from '@/types/contest'
import type { RankingItem } from '@/types/ranking'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const route = useRoute()
const userStore = useUserStore()
const currentUserId = computed(() => userStore.userInfo?.id)

const loading = ref(false)
const loadingRefresh = ref(false)
const page = ref(1)
const pageSize = ref(50)
const total = ref(0)
const selectedContestId = ref<number | null>(null)
const selectedGroupId = ref<number | null>(null)
const contests = ref<any[]>([])
const contest = ref<Contest | null>(null)
const rankingList = ref<RankingItem[]>([])

const contestGroups = computed(() => contest.value?.groups || [])

function formatTime(time: string) {
  return dayjs(time).format('MM-DD HH:mm')
}

function formatPenalty(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function loadContests() {
  try {
    const res = await getContestList({ pageSize: 100, status: 'ongoing' })
    contests.value = res.list || []
    if (contests.value.length > 0 && !selectedContestId.value) {
      selectedContestId.value = contests.value[0].id
    }
    const cid = route.query.contestId ? Number(route.query.contestId) : null
    if (cid && contests.value.some(c => c.id === cid)) {
      selectedContestId.value = cid
    }
  } catch (error) {
  }
}

async function loadData() {
  if (!selectedContestId.value) return
  loading.value = true
  try {
    const [contestRes, rankRes] = await Promise.all([
      getContestDetail(selectedContestId.value),
      getContestRanking(selectedContestId.value, {
        page: page.value,
        pageSize: pageSize.value,
        groupId: selectedGroupId.value || undefined
      })
    ])
    contest.value = contestRes
    rankingList.value = rankRes.list || []
    total.value = rankRes.total || 0
  } finally {
    loading.value = false
  }
}

async function handleRefresh() {
  if (!selectedContestId.value) return
  loadingRefresh.value = true
  try {
    try {
      await refreshRanking(selectedContestId.value)
    } catch (e) {
    }
    await loadData()
    ElMessage.success('排名已刷新')
  } finally {
    loadingRefresh.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  loadData()
}

function handleSizeChange(ps: number) {
  pageSize.value = ps
  page.value = 1
  loadData()
}

watch(selectedContestId, () => {
  page.value = 1
  selectedGroupId.value = null
  loadData()
})

onMounted(async () => {
  await loadContests()
  if (selectedContestId.value) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.filter-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rank-badge {
  font-weight: 600;
  font-size: 14px;

  &.gold {
    color: #FFD700;
  }
  &.silver {
    color: #C0C0C0;
  }
  &.bronze {
    color: #CD7F32;
  }
}

.user-cell {
  display: flex;
  align-items: center;

  .user-info {
    .username {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .org {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
}

.total-score {
  font-size: 16px;
  color: #409EFF;
}

.mr-12 {
  margin-right: 12px;
}

.ml-8 {
  margin-left: 8px;
}
</style>
