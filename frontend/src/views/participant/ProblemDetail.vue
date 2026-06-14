<template>
  <div class="page-container">
    <el-page-header @back="goBack" :content="problem?.title || '题目详情'" class="mb-20" />

    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :lg="14">
        <el-card class="card-shadow" v-if="problem">
          <div class="problem-header">
            <h2 class="problem-title">{{ problem.title }}</h2>
            <div class="problem-meta">
              <el-tag :type="getDifficultyType(problem.difficulty)" size="large">
                {{ getDifficultyText(problem.difficulty) }}
              </el-tag>
              <el-tag size="large">{{ getTypeText(problem.type) }}</el-tag>
              <span v-if="problem.points" class="points">分值: {{ problem.points }}</span>
              <span class="stats">
                <el-icon><User /></el-icon>
                通过: {{ problem.acceptedCount || 0 }} / 提交: {{ problem.submissionCount || 0 }}
              </span>
            </div>
          </div>

          <el-divider />

          <div class="problem-section">
            <h3 class="section-title">题目描述</h3>
            <div class="section-content" v-html="problem.description"></div>
          </div>

          <div class="problem-section" v-if="problem.inputDescription">
            <h3 class="section-title">输入格式</h3>
            <div class="section-content">{{ problem.inputDescription }}</div>
          </div>

          <div class="problem-section" v-if="problem.outputDescription">
            <h3 class="section-title">输出格式</h3>
            <div class="section-content">{{ problem.outputDescription }}</div>
          </div>

          <div class="problem-section" v-if="problem.sampleInput || problem.sampleOutput">
            <h3 class="section-title">样例</h3>
            <div class="sample-box">
              <div class="sample-item" v-if="problem.sampleInput">
                <div class="sample-label">输入</div>
                <pre class="sample-content">{{ problem.sampleInput }}</pre>
              </div>
              <div class="sample-item" v-if="problem.sampleOutput">
                <div class="sample-label">输出</div>
                <pre class="sample-content">{{ problem.sampleOutput }}</pre>
              </div>
            </div>
          </div>

          <div class="problem-section" v-if="problem.timeLimit || problem.memoryLimit">
            <h3 class="section-title">限制条件</h3>
            <div class="limits">
              <span v-if="problem.timeLimit">时间限制: {{ problem.timeLimit }}ms</span>
              <span v-if="problem.memoryLimit">内存限制: {{ problem.memoryLimit }}MB</span>
            </div>
          </div>

          <div class="problem-section" v-if="problem.hint">
            <h3 class="section-title">提示</h3>
            <div class="section-content">{{ problem.hint }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="10">
        <el-card class="card-shadow mb-20">
          <template #header>
            <div class="flex-between">
              <span class="card-title">代码提交</span>
              <el-button text type="primary" @click="showHistory = !showHistory">
                <el-icon><Clock /></el-icon>提交历史
              </el-button>
            </div>
          </template>
          <CodeEditor
            v-model="code"
            :submitting="submitting"
            @submit="handleSubmit"
          />
          <div class="submit-result mt-20" v-if="lastSubmission">
            <el-alert
              :title="getSubmissionStatus(lastSubmission.status)"
              :type="getResultType(lastSubmission.status)"
              show-icon
              :closable="false"
            >
              <div class="result-detail" v-if="lastSubmission.score !== undefined">
                得分: <strong>{{ lastSubmission.score }}/{{ lastSubmission.maxScore }}</strong>
                <span v-if="lastSubmission.runtime" class="ml-20">用时: {{ lastSubmission.runtime }}ms</span>
                <span v-if="lastSubmission.memory" class="ml-20">内存: {{ lastSubmission.memory }}MB</span>
              </div>
              <div v-if="lastSubmission.errorMessage" class="error-msg">
                {{ lastSubmission.errorMessage }}
              </div>
            </el-alert>
          </div>
        </el-card>

        <el-card class="card-shadow" v-if="showHistory">
          <template #header>
            <span class="card-title">最近提交</span>
          </template>
          <el-table :data="submissionHistory" size="small" stripe>
            <el-table-column label="时间" width="140">
              <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
            </el-table-column>
            <el-table-column label="语言" width="80" prop="language" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getResultType(row.status)" size="small">
                  {{ getSubmissionStatus(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="得分" width="70" align="center">
              <template #default="{ row }">{{ row.score ?? '-' }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProblemDetail } from '@/api/problem'
import { submitCode, getProblemSubmissions } from '@/api/submission'
import { ElMessage } from 'element-plus'
import CodeEditor from '@/components/CodeEditor.vue'
import type { Problem } from '@/types/problem'
import type { Submission } from '@/types/submission'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const problem = ref<Problem | null>(null)
const code = ref('')
const showHistory = ref(false)
const lastSubmission = ref<Submission | null>(null)
const submissionHistory = ref<Submission[]>([])

const problemId = computed(() => Number(route.params.id))
const contestId = computed(() => route.query.contestId ? Number(route.query.contestId) : undefined)

function getDifficultyType(difficulty: string) {
  const map: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger' }
  return map[difficulty] || 'info'
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
  return map[difficulty] || '未知'
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    programming: '编程题',
    subjective: '主观题',
    multiple_choice: '选择题'
  }
  return map[type] || '编程题'
}

function getResultType(status: string) {
  const map: Record<string, string> = {
    accepted: 'success',
    wrong_answer: 'error',
    time_limit_exceeded: 'warning',
    memory_limit_exceeded: 'warning',
    runtime_error: 'error',
    compilation_error: 'info',
    pending: 'warning',
    judging: 'info',
    system_error: 'error',
    partially_accepted: 'warning',
    pending_judge: 'warning'
  }
  return map[status] || 'info'
}

function getSubmissionStatus(status: string) {
  const map: Record<string, string> = {
    pending: '等待评测',
    judging: '评测中',
    accepted: '通过 ✅',
    wrong_answer: '答案错误 ❌',
    time_limit_exceeded: '超时 ⏰',
    memory_limit_exceeded: '内存超限',
    runtime_error: '运行时错误',
    compilation_error: '编译错误',
    system_error: '系统错误',
    partially_accepted: '部分通过',
    pending_judge: '等待评委评分'
  }
  return map[status] || status
}

function formatTime(time: string) {
  return dayjs(time).format('MM-DD HH:mm')
}

async function loadProblem() {
  loading.value = true
  try {
    problem.value = await getProblemDetail(problemId.value)
  } finally {
    loading.value = false
  }
}

async function loadHistory() {
  try {
    const res = await getProblemSubmissions(problemId.value, { pageSize: 10 })
    submissionHistory.value = res.list || []
  } catch (error) {
  }
}

async function handleSubmit(data: { code: string; language: string }) {
  submitting.value = true
  try {
    const res = await submitCode({
      problemId: problemId.value,
      contestId: contestId.value,
      code: data.code,
      language: data.language
    })
    lastSubmission.value = res
    ElMessage.success('提交成功！')
    if (res.status === 'pending' || res.status === 'judging') {
      setTimeout(() => {
        loadHistory()
      }, 2000)
    } else {
      loadHistory()
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  loadProblem()
  loadHistory()
})
</script>

<style lang="scss" scoped>
.problem-header {
  .problem-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px;
  }

  .problem-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .points {
      font-size: 14px;
      color: #E6A23C;
      font-weight: 500;
    }

    .stats {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #909399;
      margin-left: auto;
    }
  }
}

.problem-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px;
    padding-left: 10px;
    border-left: 3px solid #409EFF;
  }

  .section-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
  }
}

.sample-box {
  background: #f5f7fa;
  border-radius: 6px;
  overflow: hidden;

  .sample-item {
    & + .sample-item {
      border-top: 1px solid #ebeef5;
    }

    .sample-label {
      padding: 8px 12px;
      background: #e8eaed;
      font-size: 13px;
      font-weight: 600;
      color: #606266;
    }

    .sample-content {
      padding: 12px;
      margin: 0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.limits {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #606266;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.submit-result {
  .result-detail {
    margin-top: 8px;
    font-size: 14px;
  }

  .ml-20 {
    margin-left: 20px;
  }

  .error-msg {
    margin-top: 8px;
    font-size: 13px;
    font-family: 'Consolas', monospace;
    white-space: pre-wrap;
  }
}
</style>
