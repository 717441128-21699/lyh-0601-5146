<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">待评分列表</h2>
    </div>

    <el-card class="mt-20 card-shadow">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索题目/提交人..."
          clearable
          style="width: 280px;"
          @change="loadData"
          @keyup.enter="loadData"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table :data="list" v-loading="loading" stripe class="mt-20">
        <el-table-column label="提交ID" prop="id" width="100" align="center">
          <template #default="{ row }">#{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="题目" prop="problem?.title" min-width="220">
          <template #default="{ row }">
            <span>{{ row.problem?.title || '-' }}</span>
            <el-tag size="small" class="ml-8" :type="getDifficultyType(row.problem?.difficulty)">
              {{ getDifficultyText(row.problem?.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交人" width="160">
          <template #default="{ row }">
            <div class="cell-content">
              <span class="title">{{ row.user?.realName || row.user?.username || '-' }}</span>
              <span class="sub">{{ row.user?.organization || '' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="竞赛" width="200">
          <template #default="{ row }">{{ row.contest?.title || '-' }}</template>
        </el-table-column>
        <el-table-column label="语言" prop="language" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.language }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" prop="submittedAt" width="180">
          <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="goToScore(row.id)">
              <el-icon><EditPen /></el-icon>去评分
            </el-button>
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
        :page-sizes="[10, 20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPendingList } from '@/api/judge'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const keyword = ref('')
const list = ref<any[]>([])

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function getDifficultyType(difficulty: string) {
  const map: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger', expert: 'danger' }
  return map[difficulty] || 'info'
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return map[difficulty] || '未知'
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    judging: 'primary',
    accepted: 'success',
    wrong_answer: 'danger',
    time_limit_exceeded: 'warning',
    memory_limit_exceeded: 'warning',
    runtime_error: 'danger',
    compile_error: 'info',
    cheating: 'danger'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待评分',
    judging: '评分中',
    accepted: '已通过',
    wrong_answer: '答案错误',
    time_limit_exceeded: '超时',
    memory_limit_exceeded: '内存超限',
    runtime_error: '运行时错误',
    compile_error: '编译错误',
    cheating: '作弊嫌疑'
  }
  return map[status] || '未知'
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    const res = await getPendingList(params)
    list.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
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

function goToScore(id: number) {
  router.push(`/judge/score/${id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cell-content {
  display: flex;
  flex-direction: column;

  .title {
    font-size: 14px;
    color: #303133;
  }

  .sub {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
}

.ml-8 {
  margin-left: 8px;
}
</style>
