<template>
  <div class="page-container">
    <el-page-header @back="goBack" content="提交评分" class="mb-20" />

    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :lg="16">
        <el-card class="card-shadow">
          <template #header>
            <div class="flex-between">
              <span class="card-title">提交代码</span>
              <div class="meta-info">
                <el-tag size="small" type="primary">{{ submission?.language }}</el-tag>
                <span class="ml-12 time">{{ formatTime(submission?.submittedAt) }}</span>
              </div>
            </div>
          </template>
          <div class="problem-info mb-16" v-if="submission">
            <div class="info-item">
              <span class="label">题目：</span>
              <span class="value">{{ submission.problem?.title || '-' }}</span>
              <el-tag size="small" class="ml-8" :type="getDifficultyType(submission.problem?.difficulty)">
                {{ getDifficultyText(submission.problem?.difficulty) }}
              </el-tag>
              <span v-if="submission.problem?.score" class="ml-8 score-label">
                满分: {{ submission.problem.score }}分
              </span>
            </div>
            <div class="info-item">
              <span class="label">提交人：</span>
              <span class="value">
                {{ submission.user?.realName || submission.user?.username || '-' }}
                <span v-if="submission.user?.organization" class="org">({{ submission.user.organization }})</span>
              </span>
            </div>
            <div class="info-item" v-if="submission.contest">
              <span class="label">竞赛：</span>
              <span class="value">{{ submission.contest.title }}</span>
            </div>
          </div>
          <pre class="code-display">{{ submission?.code || '无代码内容' }}</pre>
        </el-card>

        <el-card class="mt-20 card-shadow" v-if="otherScores.length > 0">
          <template #header>
            <span class="card-title">其他评委评分（{{ otherScores.length }}）</span>
          </template>
          <el-table :data="otherScores" size="default">
            <el-table-column label="评委" width="160">
              <template #default="{ row }">
                {{ row.judge?.realName || row.judge?.username || '未知' }}
              </template>
            </el-table-column>
            <el-table-column label="分数" width="100" align="center">
              <template #default="{ row }">
                <strong :class="getScoreClass(row.score)">{{ row.score }}分</strong>
              </template>
            </el-table-column>
            <el-table-column label="权重" width="100" align="center">
              <template #default="{ row }">
                {{ (row.weight || 1) * 100 }}%
              </template>
            </el-table-column>
            <el-table-column label="评语" prop="comment" />
            <el-table-column label="评分时间" width="160">
              <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="card-shadow sticky-card">
          <template #header>
            <span class="card-title">评分面板</span>
          </template>
          <div class="score-panel">
            <div class="score-display" :class="getScoreClass(scoreForm.score)">
              <span class="score-num">{{ scoreForm.score }}</span>
              <span class="score-unit">分</span>
            </div>

            <el-slider
              v-model="scoreForm.score"
              :min="0"
              :max="100"
              :step="1"
              show-stops
              show-tooltip
              class="mt-20"
            />

            <el-form label-width="70px" class="mt-20">
              <el-form-item label="精确分数">
                <el-input-number v-model="scoreForm.score" :min="0" :max="100" :step="0.5" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="权重">
                <el-input-number v-model="scoreForm.weight" :min="0" :max="1" :step="0.1" style="width: 100%;" />
                <div class="hint">权重范围 0-1，默认 1</div>
              </el-form-item>
              <el-form-item label="评语">
                <el-input
                  v-model="scoreForm.comment"
                  type="textarea"
                  :rows="5"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入评语（可选）"
                />
              </el-form-item>
            </el-form>

            <div class="quick-scores">
              <span class="qs-label">快捷评分：</span>
              <div class="qs-buttons">
                <el-button size="small" @click="quickScore(100)">100</el-button>
                <el-button size="small" @click="quickScore(80)">80</el-button>
                <el-button size="small" @click="quickScore(60)">60</el-button>
                <el-button size="small" @click="quickScore(40)">40</el-button>
                <el-button size="small" @click="quickScore(0)">0</el-button>
              </div>
            </div>

            <el-divider />

            <el-button
              type="primary"
              size="large"
              style="width: 100%;"
              :loading="submitting"
              :disabled="submitted"
              @click="handleSubmit"
            >
              <el-icon><Check /></el-icon>
              {{ submitted ? '已提交' : '提交打分' }}
            </el-button>

            <div v-if="submitted" class="submit-tip mt-16">
              <el-alert type="success" :closable="false" show-icon title="打分已提交成功！" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSubmissionDetail, submitScore } from '@/api/judge'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const submissionId = () => Number(route.params.id)

const loading = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const submission = ref<any>(null)
const otherScores = ref<any[]>([])

const scoreForm = reactive({
  score: 0,
  comment: '',
  weight: 1
})

function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

function getDifficultyType(difficulty: string) {
  const map: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger', expert: 'danger' }
  return map[difficulty] || 'info'
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return map[difficulty] || '未知'
}

function getScoreClass(score: number) {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'pass'
  return 'fail'
}

function quickScore(s: number) {
  scoreForm.score = s
}

async function loadData() {
  loading.value = true
  try {
    const data = await getSubmissionDetail(submissionId())
    submission.value = data.submission || data
    otherScores.value = data.otherScores || data.scores || []
    if (submission.value?.score !== undefined && submission.value.score !== null) {
      scoreForm.score = submission.value.score
    }
    if (data.judgeScores && data.judgeScores.length > 0) {
      const my = data.judgeScores[0]
      if (my) {
        scoreForm.score = my.score || 0
        scoreForm.comment = my.comment || ''
        scoreForm.weight = my.weight || 1
        submitted.value = true
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    await submitScore(submissionId(), {
      score: scoreForm.score,
      comment: scoreForm.comment,
      weight: scoreForm.weight
    })
    ElMessage.success('打分提交成功')
    submitted.value = true
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
  loadData()
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 16px;
  font-weight: 600;
}

.meta-info {
  display: flex;
  align-items: center;

  .time {
    font-size: 13px;
    color: #909399;
  }
}

.problem-info {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;

  .info-item {
    font-size: 14px;
    line-height: 2;

    .label {
      color: #909399;
    }

    .value {
      color: #303133;
      font-weight: 500;
    }

    .org {
      color: #606266;
      font-weight: normal;
      font-size: 13px;
    }

    .score-label {
      color: #E6A23C;
      font-weight: 500;
      font-size: 13px;
    }
  }
}

.code-display {
  margin: 0;
  padding: 20px;
  max-height: 500px;
  overflow: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}

.sticky-card {
  position: sticky;
  top: 20px;
}

.score-panel {
  .score-display {
    text-align: center;
    padding: 24px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);

    &.excellent {
      background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
      color: #fff;
    }
    &.good {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      color: #fff;
    }
    &.pass {
      background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
      color: #fff;
    }
    &.fail {
      background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
      color: #fff;
    }

    .score-num {
      font-size: 56px;
      font-weight: 700;
      line-height: 1;
    }

    .score-unit {
      font-size: 18px;
      margin-left: 4px;
    }
  }

  .hint {
    font-size: 12px;
    color: #c0c4cc;
    margin-top: 4px;
  }

  .quick-scores {
    margin-top: 8px;

    .qs-label {
      font-size: 13px;
      color: #606266;
      margin-bottom: 8px;
      display: block;
    }

    .qs-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

.submit-tip {
  text-align: center;
}

.mb-16 {
  margin-bottom: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.mt-20 {
  margin-top: 20px;
}

.ml-8 {
  margin-left: 8px;
}

.ml-12 {
  margin-left: 12px;
}
</style>
