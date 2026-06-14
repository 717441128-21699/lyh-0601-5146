<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">待评分列表</h2>
      <div>
        <el-select v-model="contestFilter" placeholder="竞赛筛选" style="width: 200px; margin-right: 12px;" clearable>
          <el-option v-for="c in contests" :key="c.id" :label="c.title" :value="c.id" />
        </el-select>
        <el-select v-model="difficultyFilter" placeholder="难度筛选" style="width: 140px; margin-right: 12px;" clearable>
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
      </div>
    </div>

    <DataTable
      :data="pendingList"
      :loading="loading"
      :total="total"
      :show-search="true"
      search-placeholder="搜索题目/用户名"
      @search="handleSearch"
      @page-change="handlePageChange"
    >
      <el-table-column label="ID" prop="id" width="70" align="center" />
      <el-table-column label="题目" min-width="160">
        <template #default="{ row }">
          <div>
            <div class="problem-title">{{ row.problemTitle }}</div>
            <div class="problem-meta">
              <el-tag size="small" :type="getDiffType(row.difficulty)">{{ getDiffText(row.difficulty) }}</el-tag>
              <span class="problem-points">满分 {{ row.maxScore }}分</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="提交用户" width="140">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="30" style="background-color: #409EFF; color: #fff; font-size: 12px;">
              {{ row.username?.charAt(0) }}
            </el-avatar>
            <span>{{ row.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="竞赛" prop="contestTitle" min-width="140" show-overflow-tooltip />
      <el-table-column label="语言" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ row.language?.toUpperCase() }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="代码长度" width="100" align="center">
        <template #default="{ row }">{{ formatCodeLength(row.codeLength) }}</template>
      </el-table-column>
      <el-table-column label="提交时间" width="170">
        <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
      </el-table-column>
      <el-table-column label="等待时长" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getWaitType(row.submittedAt)">{{ getWaitTime(row.submittedAt) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="goScore(row)">
            <el-icon><EditPen /></el-icon>评分
          </el-button>
        </template>
      </el-table-column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPendingList } from '@/api/judge'
import { getContestList } from '@/api/contest'
import DataTable from '@/components/DataTable.vue'
import dayjs from 'dayjs'
import type { Contest } from '@/types/contest'

const router = useRouter()
const loading = ref(false)
const pendingList = ref<any[]>([])
const contests = ref<Contest[]>([])
const total = ref(0)
const keyword = ref('')
const contestFilter = ref<number | undefined>()
const difficultyFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function formatCodeLength(len: number) {
  if (!len) return '-'
  if (len > 1024) return (len / 1024).toFixed(1) + ' KB'
  return len + ' B'
}

function getDiffType(d: string) {
  const m: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger' }
  return m[d] || 'info'
}

function getDiffText(d: string) {
  const m: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
  return m[d] || d
}

function getWaitTime(time: string) {
  const mins = dayjs().diff(dayjs(time), 'minute')
  if (mins < 60) return mins + '分钟'
  if (mins < 1440) return Math.floor(mins / 60) + '小时'
  return Math.floor(mins / 1440) + '天'
}

function getWaitType(time: string) {
  const mins = dayjs().diff(dayjs(time), 'minute')
  if (mins < 30) return 'success'
  if (mins < 120) return 'warning'
  return 'danger'
}

function goScore(row: any) {
  router.push(`/judge/score/${row.id}`)
}

async function loadContests() {
  try {
    const res = await getContestList({ page: 1, pageSize: 100 })
    contests.value = res.list || []
  } catch (e) {
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getPendingList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      contestId: contestFilter.value,
      difficulty: difficultyFilter.value || undefined
    })
    pendingList.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch(val: string) {
  keyword.value = val
  page.value = 1
  loadData()
}

function handlePageChange(p: number, ps: number) {
  page.value = p
  pageSize.value = ps
  loadData()
}

onMounted(() => {
  loadContests()
  loadData()
})
</script>

<style lang="scss" scoped>
.problem-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}
.problem-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  .problem-points {
    font-size: 12px;
    color: #909399;
  }
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
