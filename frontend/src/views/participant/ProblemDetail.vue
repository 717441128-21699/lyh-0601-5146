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
              <span v-if="problem.score" class="points">分值: {{ problem.score }}</span>
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
          <div class="submit-form">
            <div class="language-selector mb-16">
              <span class="label mr-12">编程语言：</span>
              <el-select v-model="selectedLanguage" style="width: 180px;">
                <el-option label="C++" value="cpp" />
                <el-option label="Java" value="java" />
                <el-option label="Python" value="python" />
                <el-option label="JavaScript" value="javascript" />
              </el-select>
            </div>
            <textarea
              v-model="code"
              class="code-textarea"
              placeholder="请在此输入您的代码..."
              spellcheck="false"
            />
            <div class="submit-actions mt-16">
              <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
                <el-icon><Promotion /></el-icon>提交代码
              </el-button>
            </div>
          </div>
          <div class="submit-result mt-20" v-if="lastSubmission">
            <el-alert
              :title="getSubmissionStatus(lastSubmission.status)"
              :type="getResultType(lastSubmission.status)"
              show-icon
              :closable="false"
            >
              <div class="result-detail" v-if="lastSubmission.score !== undefined">
                得分: <strong>{{ lastSubmission.score }}分</strong>
                <span v-if="lastSubmission.executionTime" class="ml-20">用时: {{ lastSubmission.executionTime }}ms</span>
                <span v-if="lastSubmission.executionMemory" class="ml-20">内存: {{ lastSubmission.executionMemory }}MB</span>
                <span v-if="lastSubmission.testCasePassed !== undefined" class="ml-20">
                  通过用例: {{ lastSubmission.testCasePassed }}/{{ lastSubmission.testCaseTotal }}
                </span>
              </div>
              <div v-if="lastSubmission.judgeLog" class="error-msg">
                {{ lastSubmission.judgeLog }}
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
            <el-table-column label="语言" width="90" prop="language" />
            <el-table-column label="状态" width="120">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProblemDetail } from '@/api/problem'
import { submitCode, getSubmission, getProblemSubmissions } from '@/api/submission'
import { getContestRanking } from '@/api/ranking'
import { ElMessage, ElNotification } from 'element-plus'
import type { Problem } from '@/types/problem'
import type { Submission } from '@/types/submission'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const problem = ref<Problem | null>(null)
const code = ref('')
const selectedLanguage = ref<'cpp' | 'java' | 'python' | 'javascript'>('cpp')
const showHistory = ref(false)
const lastSubmission = ref<Submission | null>(null)
const submissionHistory = ref<Submission[]>([])
const pollTimer = ref<number | null>(null)

const problemId = computed(() => Number(route.params.id))
const contestId = computed(() => route.query.contestId ? Number(route.query.contestId) : undefined)

const codeTemplates: Record<string, string> = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  python: '# your code here\n',
  javascript: '// your code here\n'
}

function getDifficultyType(difficulty: string) {
  const map: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger', expert: 'danger' }
  return map[difficulty] || 'info'
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return map[difficulty] || '未知'
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    objective: '客观题',
    subjective: '主观题'
  }
  return map[type] || type
}

function getResultType(status: string) {
  const map: Record<string, string> = {
    accepted: 'success',
    wrong_answer: 'error',
    time_limit_exceeded: 'warning',
    memory_limit_exceeded: 'warning',
    runtime_error: 'error',
    compile_error: 'info',
    pending: 'warning',
    judging: 'info',
    system_error: 'error',
    cheating: 'error'
  }
  return map[status] || 'info'
}

function getSubmissionStatus(status: string) {
  const map: Record<string, string> = {
    pending: '等待评测',
    judging: '评测中...',
    accepted: '通过 ✅',
    wrong_answer: '答案错误 ❌',
    time_limit_exceeded: '超时 ⏰',
    memory_limit_exceeded: '内存超限',
    runtime_error: '运行时错误',
    compile_error: '编译错误',
    system_error: '系统错误',
    cheating: '作弊嫌疑'
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
    code.value = codeTemplates[selectedLanguage.value] || ''
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

function pollSubmissionStatus(submissionId: number) {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
  }
  pollTimer.value = window.setInterval(async () => {
    try {
      const result = await getSubmission(submissionId)
      lastSubmission.value = result
      if (result.status !== 'pending' && result.status !== 'judging') {
        if (pollTimer.value) {
          clearInterval(pollTimer.value)
          pollTimer.value = null
        }
        ElNotification({
          title: '评测完成',
          message: `您的提交已评测完成，状态：${getSubmissionStatus(result.status)}`,
          type: result.status === 'accepted' ? 'success' : 'warning',
          duration: 3000
        })
        loadHistory()
        if (contestId.value) {
          try {
            await getContestRanking(contestId.value, { pageSize: 1 })
          } catch (e) {}
        }
      }
    } catch (e) {
    }
  }, 3000)
}

async function handleSubmit() {
  if (!code.value.trim()) {
    ElMessage.warning('请先输入代码')
    return
  }
  submitting.value = true
  try {
    const res = await submitCode({
      problemId: problemId.value,
      contestId: contestId.value,
      code: code.value,
      language: selectedLanguage.value
    })
    lastSubmission.value = res
    ElMessage.success('提交成功！正在评测中...')
    if (res.status === 'pending' || res.status === 'judging') {
      pollSubmissionStatus(res.id)
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

onUnmounted(() => {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
  }
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

.submit-form {
  .language-selector {
    display: flex;
    align-items: center;
  }

  .label {
    font-size: 14px;
    color: #606266;
  }

  .code-textarea {
    width: 100%;
    min-height: 400px;
    padding: 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    outline: none;
    resize: vertical;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    background: #1e1e1e;
    color: #d4d4d4;
    tab-size: 4;

    &:focus {
      border-color: #409EFF;
    }
  }
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

.mb-16 {
  margin-bottom: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.mr-12 {
  margin-right: 12px;
}
</style>
