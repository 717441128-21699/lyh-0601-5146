<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">我的提交</h2>
    </div>

    <DataTable
      :data="submissions"
      :loading="loading"
      :total="total"
      :show-search="true"
      search-placeholder="搜索题目名称"
      @search="handleSearch"
      @page-change="handlePageChange"
    >
      <el-table-column label="提交时间" prop="submittedAt" width="180">
        <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
      </el-table-column>
      <el-table-column label="题目">
        <template #default="{ row }">
          <el-link type="primary" @click="goToProblem(row.problemId, row.contestId)">
            {{ row.problem?.title || `#${row.problemId}` }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="竞赛" width="200">
        <template #default="{ row }">
          <span v-if="row.contest">{{ row.contest.title }}</span>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>
      <el-table-column label="语言" width="100" prop="language">
        <template #default="{ row }">
          <el-tag size="small">{{ row.language }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="140">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="得分" width="100" align="center">
        <template #default="{ row }">
          <span v-if="row.score !== undefined" :class="{ 'score-green': row.score === row.maxScore }">
            {{ row.score }}/{{ row.maxScore }}
          </span>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>
      <el-table-column label="用时" width="100" align="center">
        <template #default="{ row }">
          <span v-if="row.runtime !== undefined">{{ row.runtime }}ms</span>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>
      <el-table-column label="内存" width="100" align="center">
        <template #default="{ row }">
          <span v-if="row.memory !== undefined">{{ row.memory }}MB</span>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="detailVisible" title="提交详情" width="800px">
      <div v-if="currentSubmission">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="提交时间">{{ formatTime(currentSubmission.submittedAt) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentSubmission.status)">
              {{ getStatusText(currentSubmission.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="题目">{{ currentSubmission.problem?.title }}</el-descriptions-item>
          <el-descriptions-item label="语言">{{ currentSubmission.language }}</el-descriptions-item>
          <el-descriptions-item label="得分">
            {{ currentSubmission.score !== undefined ? `${currentSubmission.score}/${currentSubmission.maxScore}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="用时/内存">
            {{ currentSubmission.runtime !== undefined ? `${currentSubmission.runtime}ms` : '-' }}
            /
            {{ currentSubmission.memory !== undefined ? `${currentSubmission.memory}MB` : '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 12px;">代码</h4>
        <div class="code-block">
          <pre>{{ currentSubmission.code }}</pre>
        </div>

        <h4 v-if="currentSubmission.errorMessage" style="margin: 20px 0 12px; color: #F56C6C;">错误信息</h4>
        <div v-if="currentSubmission.errorMessage" class="error-block">
          <pre>{{ currentSubmission.errorMessage }}</pre>
        </div>

        <h4 v-if="currentSubmission.judgeScores?.length" style="margin: 20px 0 12px;">评委评分</h4>
        <el-table v-if="currentSubmission.judgeScores?.length" :data="currentSubmission.judgeScores" size="small" border>
          <el-table-column label="评委" prop="judge.nickname" />
          <el-table-column label="得分">
            <template #default="{ row }">{{ row.score }}/{{ row.maxScore }}</template>
          </el-table-column>
          <el-table-column label="评语" prop="comment" />
          <el-table-column label="评分时间">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMySubmissions } from '@/api/submission'
import DataTable from '@/components/DataTable.vue'
import type { Submission } from '@/types/submission'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const submissions = ref<Submission[]>([])
const total = ref(0)
const detailVisible = ref(false)
const currentSubmission = ref<Submission | null>(null)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    accepted: 'success',
    wrong_answer: 'danger',
    time_limit_exceeded: 'warning',
    memory_limit_exceeded: 'warning',
    runtime_error: 'danger',
    compilation_error: 'info',
    pending: 'warning',
    judging: 'primary',
    system_error: 'danger',
    partially_accepted: 'warning',
    pending_judge: 'warning'
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
    compilation_error: '编译错误',
    system_error: '系统错误',
    partially_accepted: '部分通过',
    pending_judge: '等待评分'
  }
  return map[status] || status
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMySubmissions({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    submissions.value = res.list || []
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

function goToProblem(problemId: number, contestId?: number) {
  const query = contestId ? { contestId } : {}
  router.push({ path: `/problems/${problemId}`, query })
}

function showDetail(row: Submission) {
  currentSubmission.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.score-green {
  color: #67C23A;
  font-weight: 600;
}

.code-block {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 16px;
  max-height: 400px;
  overflow: auto;

  pre {
    margin: 0;
    color: #d4d4d4;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.error-block {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 12px;

  pre {
    margin: 0;
    color: #F56C6C;
    font-family: 'Consolas', monospace;
    font-size: 13px;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
