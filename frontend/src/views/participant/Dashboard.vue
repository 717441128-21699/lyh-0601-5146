<template>
  <div class="page-container">
    <div class="welcome-section card-shadow">
      <div class="welcome-content">
        <div>
          <h2 class="welcome-title">欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }} 👋</h2>
          <p class="welcome-desc">祝你在接下来的比赛中取得好成绩！</p>
        </div>
        <el-button type="primary" size="large" @click="goToContests">
          <el-icon><Trophy /></el-icon>浏览竞赛
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="我的竞赛"
          :value="stats.registeredContests"
          icon="Trophy"
          color="#409EFF"
          icon-bg="rgba(64, 158, 255, 0.1)"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="提交次数"
          :value="stats.totalSubmissions"
          icon="Document"
          color="#67C23A"
          icon-bg="rgba(103, 194, 58, 0.1)"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="通过题目"
          :value="stats.acceptedProblems"
          icon="CircleCheck"
          color="#E6A23C"
          icon-bg="rgba(230, 162, 60, 0.1)"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="获得证书"
          :value="stats.certificates"
          icon="Award"
          color="#F56C6C"
          icon-bg="rgba(245, 108, 108, 0.1)"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="16">
        <el-card class="card-shadow">
          <template #header>
            <div class="flex-between">
              <span class="card-title">我的竞赛</span>
              <el-button text type="primary" @click="goToContests">查看全部</el-button>
            </div>
          </template>
          <el-empty v-if="myContests.length === 0" description="暂无参加的竞赛" />
          <div v-else class="contest-list">
            <div v-for="contest in myContests" :key="contest.id" class="contest-item" @click="goToContestDetail(contest.id)">
              <el-tag :type="getStatusType(contest.status)" size="small">{{ getStatusText(contest.status) }}</el-tag>
              <div class="contest-info">
                <div class="contest-name">{{ contest.title }}</div>
                <div class="contest-time">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(contest.startTime) }} - {{ formatTime(contest.endTime) }}
                </div>
              </div>
              <el-button type="primary" size="small" link>进入</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card class="card-shadow">
          <template #header>
            <div class="flex-between">
              <span class="card-title">最近通知</span>
              <el-button text type="primary" @click="goToNotifications">查看全部</el-button>
            </div>
          </template>
          <el-empty v-if="notifications.length === 0" description="暂无通知" />
          <div v-else class="notification-list">
            <div
              v-for="item in notifications"
              :key="item.id"
              class="notification-item"
              :class="{ unread: !item.isRead }"
              @click="readNotification(item)"
            >
              <div class="notification-dot" v-if="!item.isRead"></div>
              <div class="notification-content">
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-time">{{ formatRelativeTime(item.createdAt) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24">
        <el-card class="card-shadow">
          <template #header>
            <div class="flex-between">
              <span class="card-title">最近提交</span>
              <el-button text type="primary" @click="goToSubmissions">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentSubmissions" stripe>
            <el-table-column label="题目" prop="problem?.title" />
            <el-table-column label="语言" prop="language" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.language }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="140">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">{{ getSubmissionStatus(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="得分" prop="score" width="100" align="center">
              <template #default="{ row }">
                <span v-if="row.score !== undefined">{{ row.score }}/{{ row.maxScore }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="提交时间" prop="submittedAt" width="180">
              <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMyRegistrations } from '@/api/contest'
import { getMySubmissions } from '@/api/submission'
import { getMyNotifications, readNotification as readNotifApi } from '@/api/notification'
import { getMyCertificates } from '@/api/certificate'
import StatCard from '@/components/StatCard.vue'
import type { Contest, ContestStatus } from '@/types/contest'
import type { Submission, SubmissionStatus } from '@/types/submission'
import type { Notification } from '@/types/notification'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { ElMessage } from 'element-plus'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const userStore = useUserStore()
const router = useRouter()

const stats = ref({
  registeredContests: 0,
  totalSubmissions: 0,
  acceptedProblems: 0,
  certificates: 0
})

const myContests = ref<any[]>([])
const notifications = ref<Notification[]>([])
const recentSubmissions = ref<Submission[]>([])

async function loadData() {
  try {
    const [registrations, submissions, notifs, certs] = await Promise.all([
      getMyRegistrations({ pageSize: 5 }),
      getMySubmissions({ pageSize: 5 }),
      getMyNotifications({ pageSize: 5 }),
      getMyCertificates({ pageSize: 100 })
    ])
    myContests.value = registrations.list?.map(r => r.contest)?.filter(Boolean) || []
    recentSubmissions.value = submissions.list || []
    notifications.value = notifs.list || []
    stats.value.registeredContests = registrations.total || 0
    stats.value.totalSubmissions = submissions.total || 0
    stats.value.acceptedProblems = submissions.list?.filter(s => s.status === 'accepted').length || 0
    stats.value.certificates = certs.total || 0
  } catch (error) {
  }
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    upcoming: 'warning',
    ongoing: 'success',
    ended: 'info'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return map[status] || '未知'
}

function getStatusTagType(status: string) {
  const map: Record<string, string> = {
    accepted: 'success',
    wrong_answer: 'danger',
    time_limit_exceeded: 'warning',
    runtime_error: 'danger',
    compilation_error: 'info',
    pending: 'warning',
    judging: 'primary',
    partial: 'warning',
    pending_judge: 'warning'
  }
  return map[status] || 'info'
}

function getSubmissionStatus(status: string) {
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
    pending_judge: '等待评委评分'
  }
  return map[status] || status
}

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function formatRelativeTime(time: string) {
  return dayjs(time).fromNow()
}

async function readNotification(item: Notification) {
  if (!item.isRead) {
    try {
      await readNotifApi(item.id)
      item.isRead = true
    } catch (error) {
    }
  }
}

function goToContests() {
  router.push('/contests')
}

function goToContestDetail(id: number) {
  router.push(`/contests/${id}`)
}

function goToSubmissions() {
  router.push('/submissions')
}

function goToNotifications() {
  router.push('/notifications')
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  color: #fff;

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px;
    color: #fff;
  }

  .welcome-desc {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.contest-list {
  .contest-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    & + .contest-item {
      border-top: 1px solid #ebeef5;
    }

    .contest-info {
      flex: 1;
      min-width: 0;

      .contest-name {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .contest-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.notification-list {
  .notification-item {
    position: relative;
    padding: 12px 12px 12px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.unread {
      background: #ecf5ff;
    }

    .notification-dot {
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #409EFF;
    }

    & + .notification-item {
      border-top: 1px solid #ebeef5;
    }

    .notification-content {
      .notification-title {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .notification-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
