<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">我的提交</h2>
    </div>

    <el-card class="mt-20 card-shadow">
      <div class="filter-bar">
        <el-select v-model="contestFilter" placeholder="选择竞赛" clearable style="width: 220px;" @change="handleFilterChange">
          <el-option
            v-for="c in contests"
            :key="c.id"
            :label="c.title"
            :value="c.id"
          />
        </el-select>
        <el-select v-model="statusFilter" placeholder="提交状态" clearable style="width: 160px;" @change="handleFilterChange">
          <el-option label="通过" value="accepted" />
          <el-option label="答案错误" value="wrong_answer" />
          <el-option label="超时" value="time_limit_exceeded" />
          <el-option label="内存超限" value="memory_limit_exceeded" />
          <el-option label="运行时错误" value="runtime_error" />
          <el-option label="编译错误" value="compile_error" />
          <el-option label="等待评测" value="pending" />
          <el-option label="评测中" value="judging" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索题目..." clearable style="width: 200px;" @change="handleFilterChange" @keyup.enter="handleFilterChange">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table :data="list" v-loading="loading" stripe class="mt-20">
        <el-table-column label="提交ID" prop="id" width="100" align="center">
          <template #default="{ row }">#{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="题目" min-width="220">
          <template #default="{ row }">
            <el-link type="primary" @click="goToProblem(row)">
              {{ row.problem?.title || '-' }}
            </el-link>
            <el-tag size="small" class="ml-8" :type="getDifficultyType(row.problem?.difficulty)">
              {{ getDifficultyText(row.problem?.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="竞赛" width="200">
          <template #default="{ row }">
            <span v-if="row.contest?.title">{{ row.contest.title }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="语言" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.language }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="得分" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.score !== undefined" :class="getScoreClass(row.score)">{{ row.score }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="执行时间" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.executionTime !== undefined">{{ row.executionTime }}ms</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="内存" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.executionMemory !== undefined">{{ row.executionMemory }}MB</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" align="center">
          <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">
              查看详情
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
        :page-sizes="[20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="提交详情" width="700px">
      <div v-if="currentSubmission" class="detail-content">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="提交ID">{{ currentSubmission.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentSubmission.status)">{{ getStatusText(currentSubmission.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="题目">{{ currentSubmission.problem?.title }}</el-descriptions-item>
          <el-descriptions-item label="竞赛">{{ currentSubmission.contest?.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="语言">{{ currentSubmission.language }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatTime(currentSubmission.submittedAt) }}</el-descriptions-item>
          <el-descriptions-item label="得分" :span="2">
            <span v-if="currentSubmission.score !== undefined" class="score-big">{{ currentSubmission.score }}分</span>
            <span v-else>-</span>
            <span v-if="currentSubmission.testCasePassed !== undefined" class="ml-12">
              通过用例: {{ currentSubmission.testCasePassed }}/{{ currentSubmission.testCaseTotal }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">代码</el-divider>
        <pre class="code-display">{{ currentSubmission.code }}</pre>

        <el-divider content-position="left" v-if="currentSubmission.judgeLog">评测日志</el-divider>
        <pre class="judge-log" v-if="currentSubmission.judgeLog">{{ currentSubmission.judgeLog }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getMySubmissions } from '@/api/submission'
import { getMyRegistrations } from '@/api/contest'
import type { Submission, SubmissionStatus } from '@/types/submission'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const contests = ref<any[]>([])
const contestFilter = ref<number | null>(null)
const statusFilter = ref<SubmissionStatus | ''>('')
const keyword = ref('')
const list = ref<Submission[]>([])
const detailVisible = ref(false)
const currentSubmission = ref<Submission | null>(null)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
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
    accepted: 'success',
    wrong_answer: 'danger',
    time_limit_exceeded: 'warning',
    memory_limit_exceeded: 'warning',
    runtime_error: 'danger',
    compile_error: 'info',
    pending: 'warning',
    judging: 'primary',
    cheating: 'danger',
    system_error: 'danger'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '等待评测',
    judging: '评测中',
    accepted: '通过',
    wrong_answer: '答案错误',
    time_limit_exceeded: '超时',
    memory_limit_exceeded: '内存超限',
    runtime_error: '运行时错误',
    compile_error: '编译错误',
    cheating: '作弊嫌疑',
    system_error: '系统错误'
  }
  return map[status] || '未知'
}

function getScoreClass(score: number) {
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-pass'
  if (score > 0) return 'score-low'
  return ''
}

async function loadContests() {
  try {
    const res = await getMyRegistrations({ pageSize: 100 })
    contests.value = (res.list || []).map((r: any) => r.contest).filter(Boolean)
  } catch (e) {
  }
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (contestFilter.value) params.contestId = contestFilter.value
    if (statusFilter.value) params.status = statusFilter.value
    if (keyword.value) params.keyword = keyword.value
    const res = await getMySubmissions(params)
    list.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  page.value = 1
  loadData()
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

function goToProblem(row: Submission) {
  const url = row.contestId
    ? `/contests/${row.contestId}/problems/${row.problemId}`
    : `/problems/${row.problemId}`
  router.push(url)
}

function showDetail(row: Submission) {
  currentSubmission.value = row
  detailVisible.value = true
}

onMounted(async () => {
  await loadContests()
  loadData()
})
</script>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.ml-8 {
  margin-left: 8px;
}

.ml-12 {
  margin-left: 12px;
}

.score-good {
  color: #67C23A;
  font-weight: 600;
}

.score-pass {
  color: #409EFF;
  font-weight: 600;
}

.score-low {
  color: #E6A23C;
  font-weight: 600;
}

.detail-content {
  .score-big {
    font-size: 18px;
    font-weight: 600;
    color: #E6A23C;
  }

  .code-display,
  .judge-log {
    margin: 0;
    padding: 16px;
    max-height: 300px;
    overflow: auto;
    border-radius: 6px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .code-display {
    background: #1e1e1e;
    color: #d4d4d4;
  }

  .judge-log {
    background: #f5f7fa;
    color: #606266;
  }
}
</style>
