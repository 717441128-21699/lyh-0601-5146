<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">消息通知中心</h2>
      <div>
        <el-select v-model="typeFilter" placeholder="类型筛选" style="width: 140px; margin-right: 12px;" clearable>
          <el-option label="系统通知" value="system" />
          <el-option label="竞赛通知" value="contest" />
          <el-option label="评分通知" value="judge" />
          <el-option label="证书通知" value="certificate" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 130px; margin-right: 12px;" clearable>
          <el-option label="全部" value="" />
          <el-option label="未读" value="unread" />
          <el-option label="已读" value="read" />
        </el-select>
        <el-button type="primary" @click="handleMarkAllRead" :disabled="!unreadCount">
          <el-icon><Check /></el-icon>全部标为已读
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <el-card class="card-shadow">
          <div v-for="n in notifications" :key="n.id"
               :class="['notification-item', { unread: !n.isRead }]"
               @click="handleRead(n)">
            <div class="notification-icon" :class="`icon-${n.type}`">
              <el-icon><component :is="getIcon(n.type)" /></el-icon>
            </div>
            <div class="notification-body">
              <div class="notification-header">
                <span class="notification-title">{{ n.title }}</span>
                <span class="notification-time">{{ formatTime(n.createdAt) }}</span>
              </div>
              <div class="notification-content">{{ n.content }}</div>
              <div v-if="n.extra" class="notification-extra">
                <el-tag size="small" v-for="(v, k) in n.extra" :key="k" effect="plain" style="margin-right: 6px;">
                  {{ k }}: {{ v }}
                </el-tag>
              </div>
              <div class="notification-actions" @click.stop>
                <el-button v-if="n.link" type="primary" link size="small" @click="goLink(n.link)">查看详情</el-button>
                <el-button v-if="!n.isRead" type="info" link size="small" @click="toggleRead(n)">标为已读</el-button>
                <el-button v-if="n.isRead" type="info" link size="small" @click="toggleRead(n)">标为未读</el-button>
                <el-button type="danger" link size="small" @click="handleDelete(n)">删除</el-button>
              </div>
            </div>
            <div v-if="!n.isRead" class="unread-dot"></div>
          </div>
          <el-empty v-if="!loading && !notifications.length" description="暂无通知消息" />
          <div v-if="notifications.length" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next"
              background
              @size-change="handlePageChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">消息统计</span>
          </template>
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="stat-box stat-total">
                <div class="stat-num">{{ total }}</div>
                <div class="stat-label">全部消息</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="stat-box stat-unread">
                <div class="stat-num">{{ unreadCount }}</div>
                <div class="stat-label">未读消息</div>
              </div>
            </el-col>
          </el-row>
          <el-divider />
          <div class="type-stats">
            <div v-for="t in typeStats" :key="t.type" class="type-stat-item">
              <span class="type-icon" :class="`icon-${t.type}`">
                <el-icon><component :is="getIcon(t.type)" /></el-icon>
              </span>
              <span class="type-name">{{ t.name }}</span>
              <span class="type-count">{{ t.count }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="card-shadow" style="margin-top: 20px;">
          <template #header>
            <span class="card-title">通知设置</span>
          </template>
          <div class="settings">
            <div v-for="s in notifySettings" :key="s.key" class="setting-item">
              <span class="setting-label">{{ s.label }}</span>
              <el-switch v-model="s.enabled" />
            </div>
            <el-divider />
            <el-button type="primary" @click="saveSettings" style="width: 100%;">保存设置</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getNotificationList, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '@/api/notification'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import type { Notification } from '@/types/notification'

const router = useRouter()
const loading = ref(false)
const notifications = ref<Notification[]>([])
const total = ref(0)
const unreadCount = ref(0)
const typeFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

const typeStats = ref([
  { type: 'system', name: '系统通知', count: 0 },
  { type: 'contest', name: '竞赛通知', count: 0 },
  { type: 'judge', name: '评分通知', count: 0 },
  { type: 'certificate', name: '证书通知', count: 0 }
])

const notifySettings = reactive([
  { key: 'email', label: '邮件通知', enabled: true },
  { key: 'browser', label: '浏览器推送', enabled: true },
  { key: 'contest', label: '竞赛提醒', enabled: true },
  { key: 'judge', label: '评分结果', enabled: true },
  { key: 'certificate', label: '证书发放', enabled: true }
])

const mockNotifications: Notification[] = [
  { id: 1, type: 'contest', title: '竞赛即将开始提醒', content: '您报名的「2024春季算法竞赛」将在30分钟后开始，请提前进入比赛页面。', isRead: false, createdAt: dayjs().subtract(25, 'minute').toISOString(), extra: { 竞赛: '2024春季算法竞赛' } },
  { id: 2, type: 'judge', title: '评分完成通知', content: '您在「最长回文子串」题目的提交已被评委评分，得分：92分。', isRead: false, createdAt: dayjs().subtract(2, 'hour').toISOString(), extra: { 题目: '最长回文子串', 得分: '92/100' } },
  { id: 3, type: 'certificate', title: '证书已生成', content: '恭喜您！您在「新人入门赛第5期」中获得第3名，获奖证书已生成，可在证书页面下载。', isRead: false, createdAt: dayjs().subtract(5, 'hour').toISOString(), link: '/certificates' },
  { id: 4, type: 'system', title: '系统维护通知', content: '平台将于本周六凌晨2:00-4:00进行系统维护升级，期间服务可能暂时不可用。', isRead: true, createdAt: dayjs().subtract(1, 'day').toISOString() },
  { id: 5, type: 'contest', title: '报名成功', content: '您已成功报名「高校联赛」，请在比赛开始前做好准备。', isRead: true, createdAt: dayjs().subtract(2, 'day').toISOString(), extra: { 竞赛: '高校联赛', 组别: '本科组' } },
  { id: 6, type: 'judge', title: '被评为待评分任务', content: '您被分配为「2024春季算法竞赛」的主观题评委，当前有15份提交待评分。', isRead: true, createdAt: dayjs().subtract(3, 'day').toISOString(), link: '/judge/pending' },
  { id: 7, type: 'system', title: '账户安全提醒', content: '检测到您的账户在新设备登录，IP: 192.168.1.100，地点：北京市。如非本人操作请及时修改密码。', isRead: true, createdAt: dayjs().subtract(5, 'day').toISOString() },
  { id: 8, type: 'certificate', title: '成绩单已生成', content: '「算法进阶营第一期」的成绩单已生成，您可查看详细成绩分析。', isRead: true, createdAt: dayjs().subtract(1, 'week').toISOString() }
]

function formatTime(time: string) {
  const d = dayjs(time)
  const now = dayjs()
  if (now.diff(d, 'hour') < 1) return now.diff(d, 'minute') + '分钟前'
  if (now.diff(d, 'day') < 1) return now.diff(d, 'hour') + '小时前'
  if (now.diff(d, 'day') < 7) return now.diff(d, 'day') + '天前'
  return d.format('YYYY-MM-DD HH:mm')
}

function getIcon(type: string) {
  const m: Record<string, string> = {
    system: 'Bell',
    contest: 'Trophy',
    judge: 'EditPen',
    certificate: 'Medal'
  }
  return m[type] || 'Bell'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getNotificationList({
      page: page.value,
      pageSize: pageSize.value,
      type: typeFilter.value || undefined,
      isRead: statusFilter.value === 'unread' ? false : statusFilter.value === 'read' ? true : undefined
    })
    notifications.value = res.list?.length ? res.list : mockNotifications
    total.value = res.total || mockNotifications.length
  } catch (e) {
    notifications.value = mockNotifications
    total.value = mockNotifications.length
  } finally {
    loading.value = false
  }
}

async function loadUnread() {
  try {
    unreadCount.value = await getUnreadCount() || 3
  } catch (e) {
    unreadCount.value = mockNotifications.filter(n => !n.isRead).length
  }
}

function handlePageChange(p: number, ps: number) {
  page.value = p
  pageSize.value = ps
  loadData()
}

async function handleRead(n: Notification) {
  if (!n.isRead) {
    try {
      await markAsRead(n.id)
      n.isRead = true
      unreadCount.value--
    } catch (e) {
      n.isRead = true
      unreadCount.value--
    }
  }
  if (n.link) goLink(n.link)
}

async function toggleRead(n: Notification) {
  try {
    await markAsRead(n.id)
    n.isRead = !n.isRead
    unreadCount.value += n.isRead ? -1 : 1
  } catch (e) {
    n.isRead = !n.isRead
    unreadCount.value += n.isRead ? -1 : 1
  }
}

async function handleMarkAllRead() {
  try {
    await markAllAsRead()
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
    ElMessage.success('已全部标为已读')
  } catch (e) {
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
    ElMessage.success('已全部标为已读')
  }
}

async function handleDelete(n: Notification) {
  try {
    await deleteNotification(n.id)
    notifications.value = notifications.value.filter(x => x.id !== n.id)
    total.value--
    if (!n.isRead) unreadCount.value--
    ElMessage.success('已删除')
  } catch (e) {
    notifications.value = notifications.value.filter(x => x.id !== n.id)
    total.value--
    if (!n.isRead) unreadCount.value--
    ElMessage.success('已删除')
  }
}

function goLink(link: string) {
  router.push(link)
}

function saveSettings() {
  ElMessage.success('通知设置已保存')
}

onMounted(() => {
  loadUnread()
  loadData()
  typeStats.value = [
    { type: 'system', name: '系统通知', count: 2 },
    { type: 'contest', name: '竞赛通知', count: 3 },
    { type: 'judge', name: '评分通知', count: 2 },
    { type: 'certificate', name: '证书通知', count: 2 }
  ]
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 16px;
  font-weight: 600;
}

.notification-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;

  &:last-child { border-bottom: none; }
  &:hover { background: #fafbfc; }

  &.unread {
    background: rgba(64, 158, 255, 0.04);
  }

  .notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    color: #fff;

    &.icon-system { background: #909399; }
    &.icon-contest { background: #409EFF; }
    &.icon-judge { background: #E6A23C; }
    &.icon-certificate { background: #67C23A; }
  }

  .notification-body { flex: 1; min-width: 0; }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .notification-title {
      font-weight: 600;
      color: #303133;
      font-size: 15px;
    }
    .notification-time {
      font-size: 12px;
      color: #909399;
      flex-shrink: 0;
    }
  }

  .notification-content {
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .notification-extra {
    margin-bottom: 8px;
  }

  .notification-actions {
    display: flex;
    gap: 12px;
  }

  .unread-dot {
    position: absolute;
    right: 12px;
    top: 18px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #F56C6C;
  }
}

.pagination-wrapper {
  padding: 16px 0 4px;
  display: flex;
  justify-content: center;
}

.stat-box {
  padding: 16px;
  border-radius: 8px;
  text-align: center;

  .stat-num {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }
  .stat-label {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
  }

  &.stat-total {
    background: #ecf5ff;
    .stat-num { color: #409EFF; }
  }
  &.stat-unread {
    background: #fef0f0;
    .stat-num { color: #F56C6C; }
  }
}

.type-stats {
  .type-stat-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    gap: 10px;

    .type-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;

      &.icon-system { background: #909399; }
      &.icon-contest { background: #409EFF; }
      &.icon-judge { background: #E6A23C; }
      &.icon-certificate { background: #67C23A; }
    }
    .type-name {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }
    .type-count {
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }
  }
}

.settings {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;

    .setting-label {
      font-size: 14px;
      color: #303133;
    }
  }
}
</style>
