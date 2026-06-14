<template>
  <div class="page-container">
    <el-page-header @back="goBack" :content="contest?.title || '竞赛详情'" class="mb-20" />

    <div v-loading="loading" v-if="contest">
      <el-card class="card-shadow mb-20">
        <div class="contest-header">
          <div class="cover">
            <img v-if="contest.coverImage" :src="contest.coverImage" />
            <div v-else class="cover-placeholder">
              <el-icon :size="64"><Trophy /></el-icon>
            </div>
          </div>
          <div class="contest-info">
            <div class="flex-between">
              <h2 class="contest-title">{{ contest.title }}</h2>
              <div class="tags">
                <el-tag :type="statusType" size="large">{{ statusText }}</el-tag>
                <el-tag type="info" size="large">{{ typeText }}</el-tag>
                <el-tag size="large">{{ difficultyText }}</el-tag>
              </div>
            </div>
            <p class="contest-desc">{{ contest.description }}</p>
            <div class="meta-grid">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>报名时间: {{ formatTime(contest.registrationStartTime) }} - {{ formatTime(contest.registrationEndTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>比赛时间: {{ formatTime(contest.startTime) }} - {{ formatTime(contest.endTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>主办方: {{ contest.organizer }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Document /></el-icon>
                <span>最大人数: {{ contest.maxParticipants || '不限' }}</span>
              </div>
            </div>
            <div class="action-area">
              <template v-if="!contest.isRegistered">
                <el-button
                  v-if="canRegister"
                  type="primary"
                  size="large"
                  :loading="registerLoading"
                  @click="handleRegister"
                >
                  <el-icon><EditPen /></el-icon>立即报名
                </el-button>
                <el-button v-else size="large" disabled>
                  {{ registrationClosed ? '报名已结束' : '请等待报名开始' }}
                </el-button>
              </template>
              <div v-else class="registered-info">
                <el-tag type="success" size="large">
                  <el-icon><CircleCheck /></el-icon>已报名
                </el-tag>
                <span v-if="contest.registrationInfo?.trackName" class="track-name">
                  赛道: {{ contest.registrationInfo.trackName }}
                </span>
                <span v-if="contest.registrationInfo?.credentialCode" class="credential-code">
                  参赛凭证: {{ contest.registrationInfo.credentialCode }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-tabs v-model="activeTab" class="contest-tabs">
        <el-tab-pane label="题目列表" name="problems">
          <el-card class="card-shadow">
            <el-table :data="problems" stripe v-loading="problemsLoading">
              <el-table-column label="序号" width="70" align="center">
                <template #default="{ $index }">{{ String.fromCharCode(65 + $index) }}</template>
              </el-table-column>
              <el-table-column label="题目名称" prop="title" min-width="200">
                <template #default="{ row }">
                  <el-link type="primary" @click="goToProblem(row.id)">{{ row.title }}</el-link>
                </template>
              </el-table-column>
              <el-table-column label="难度" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getDifficultyType(row.difficulty)">{{ getDifficultyText(row.difficulty) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="分值" prop="score" width="80" align="center" />
              <el-table-column label="通过/提交" width="120" align="center">
                <template #default="{ row }">
                  <span style="color: #67C23A">{{ row.acceptedCount || 0 }}</span>
                  <span style="color: #909399"> / </span>
                  <span>{{ row.submissionCount || 0 }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="实时排名" name="ranking">
          <div class="ranking-filter mb-20">
            <el-select v-model="selectedGroup" placeholder="全部组别" clearable style="width: 200px">
              <el-option
                v-for="group in contest.groups"
                :key="group.id"
                :label="group.name"
                :value="group.id"
              />
            </el-select>
          </div>
          <el-card class="card-shadow">
            <el-table :data="rankings" stripe v-loading="rankingLoading">
              <el-table-column label="排名" width="80" align="center">
                <template #default="{ row }">
                  <span v-if="row.rank <= 3" class="rank-medal">
                    {{ ['🥇', '🥈', '🥉'][row.rank - 1] }}
                  </span>
                  <span v-else>{{ row.rank }}</span>
                </template>
              </el-table-column>
              <el-table-column label="用户">
                <template #default="{ row }">
                  <div class="user-cell">
                    <el-avatar :size="32">
                      {{ row.user?.realName?.charAt(0) || row.user?.username?.charAt(0) }}
                    </el-avatar>
                    <span class="username">{{ row.user?.realName || row.user?.username }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="通过题数" prop="solvedProblems" width="100" align="center" />
              <el-table-column label="总分" prop="totalScore" width="100" align="center" />
              <el-table-column label="用时" width="140" align="center">
                <template #default="{ row }">{{ row.penalty ? formatPenalty(row.penalty) : '-' }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getContestDetail, getContestProblems, registerContest, checkRegistration } from '@/api/contest'
import { getContestRanking } from '@/api/ranking'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Contest, Registration } from '@/types/contest'
import type { Problem } from '@/types/problem'
import type { RankingItem } from '@/types/ranking'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const registerLoading = ref(false)
const problemsLoading = ref(false)
const rankingLoading = ref(false)
const contest = ref<Contest | null>(null)
const problems = ref<Problem[]>([])
const rankings = ref<RankingItem[]>([])
const activeTab = ref('problems')
const selectedGroup = ref<number | null>(null)

const contestId = computed(() => Number(route.params.id))

const statusText = computed(() => {
  if (!contest.value) return ''
  const map: Record<string, string> = { draft: '草稿', registering: '报名中', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }
  return map[contest.value.status] || '未知'
})

const statusType = computed(() => {
  if (!contest.value) return 'info'
  const map: Record<string, string> = { draft: 'info', registering: 'warning', ongoing: 'success', ended: 'info', cancelled: 'danger' }
  return map[contest.value.status] || 'info'
})

const typeText = computed(() => {
  if (!contest.value) return ''
  return contest.value.type === 'individual' ? '个人赛' : '团队赛'
})

const difficultyText = computed(() => {
  if (!contest.value) return ''
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return map[contest.value.difficulty] || '未知'
})

const canRegister = computed(() => {
  if (!contest.value) return false
  return contest.value.status === 'registering'
})

const registrationClosed = computed(() => {
  if (!contest.value) return true
  return contest.value.status === 'ended' || contest.value.status === 'cancelled'
})

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function formatPenalty(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function getDifficultyType(difficulty: string) {
  const map: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger', expert: 'danger' }
  return map[difficulty] || 'info'
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return map[difficulty] || '未知'
}

async function loadContest() {
  loading.value = true
  try {
    contest.value = await getContestDetail(contestId.value)
    try {
      const regResult = await checkRegistration(contestId.value)
      if (contest.value) {
        contest.value.isRegistered = regResult.isRegistered
        contest.value.registrationInfo = regResult.registration || undefined
      }
    } catch (e) {
    }
  } finally {
    loading.value = false
  }
}

async function loadProblems() {
  problemsLoading.value = true
  try {
    const res = await getContestProblems(contestId.value)
    problems.value = Array.isArray(res) ? res : res.list || []
  } finally {
    problemsLoading.value = false
  }
}

async function loadRankings() {
  rankingLoading.value = true
  try {
    const res = await getContestRanking(contestId.value, {
      groupId: selectedGroup.value || undefined,
      pageSize: 100
    })
    rankings.value = res.list || []
  } finally {
    rankingLoading.value = false
  }
}

async function handleRegister() {
  if (!contest.value) return
  try {
    await doRegister()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '报名失败')
    }
  }
}

async function doRegister(groupId?: number) {
  registerLoading.value = true
  try {
    const registration = await registerContest(contestId.value, groupId) as Registration
    await ElMessageBox.alert(
      `<p><strong>分配赛道:</strong> ${registration.group?.name || '-'}</p>
       <p><strong>参赛凭证:</strong> ${registration.credentialCode || '-'}</p>`,
      '报名成功！',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        type: 'success'
      }
    )
    if (contest.value) {
      contest.value.isRegistered = true
      contest.value.registrationInfo = registration
    }
  } finally {
    registerLoading.value = false
  }
}

function goBack() {
  router.back()
}

function goToProblem(problemId: number) {
  router.push(`/problems/${problemId}?contestId=${contestId.value}`)
}

onMounted(() => {
  loadContest()
  loadProblems()
  loadRankings()
})
</script>

<style lang="scss" scoped>
.contest-header {
  display: flex;
  gap: 24px;

  .cover {
    width: 240px;
    height: 160px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .contest-info {
    flex: 1;
    min-width: 0;

    .contest-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .tags {
      display: flex;
      gap: 8px;
    }

    .contest-desc {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin: 12px 0 20px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #606266;
      }
    }

    .registered-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .track-name,
      .credential-code {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.contest-tabs {
  :deep(.el-tabs__header) {
    margin: 0 0 20px;
  }
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .username {
    font-size: 14px;
    color: #303133;
  }
}

.rank-medal {
  font-size: 18px;
}

@media (max-width: 768px) {
  .contest-header {
    flex-direction: column;

    .cover {
      width: 100%;
    }
  }

  .meta-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
