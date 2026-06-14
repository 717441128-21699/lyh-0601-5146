<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">消息通知</h2>
      <div>
        <el-button type="primary" :loading="markingAll" @click="handleMarkAll" :disabled="unreadCount === 0">
          <el-icon><Check /></el-icon>全部标记已读
        </el-button>
      </div>
    </div>

    <el-row :gutter="0" class="mt-20">
      <el-col :xs="24" :sm="6" :md="5">
        <div class="sidebar card-shadow">
          <div
            v-for="tab in typeTabs"
            :key="tab.value"
            class="tab-item"
            :class="{ active: currentType === tab.value }"
            @click="currentType = tab.value; page = 1; loadData()"
          >
            <el-icon><component :is="tab.icon" /></el-icon>
            <span class="tab-label">{{ tab.label }}</span>
            <el-badge v-if="tab.value === '' ? unreadCount > 0 : getTypeUnreadCount(tab.value) > 0"
              :value="tab.value === '' ? unreadCount : getTypeUnreadCount(tab.value)"
              class="tab-badge"
              :max="99"
            />
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="18" :md="19">
        <el-card class="content-card card-shadow" v-loading="loading">
          <el-empty v-if="notifications.length === 0 && !loading" description="暂无消息" />
          <el-collapse v-if="notifications.length > 0" class="notification-list">
            <el-collapse-item
              v-for="item in notifications"
              :key="item.id"
              :name="item.id"
            >
              <template #title>
                <div class="notification-header" @click="handleItemClick(item)">
                  <div class="header-left">
                    <div class="type-icon" :class="item.type">
                      <el-icon><component :is="getTypeIcon(item.type)" /></el-icon>
                    </div>
                    <div class="text-content">
                      <div class="notification-title">
                        <span class="unread-dot" v-if="!item.isRead"></span>
                        {{ item.title }}
                      </div>
                      <div class="notification-summary">{{ truncate(item.content, 60) }}</div>
                    </div>
                  </div>
                  <div class="header-right">
                    <div class="notification-time">{{ formatRelativeTime(item.createdAt) }}</div>
                  </div>
                </div>
              </template>
              <div class="notification-detail">
                <div class="detail-body">{{ item.content }}</div>
                <div class="detail-actions" v-if="item.relatedId">
                  <el-button size="small" type="primary" link @click="handleAction(item)">
                    查看详情
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>

          <el-pagination
            v-if="total > 0"
            class="mt-20"
            background
            layout="total, prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            @current-change="handlePageChange"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getNotifications, markAsRead, markAllAsRead } from '@/api/notification'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const typeTabs = [
  { label: '全部消息', value: '', icon: 'Bell' },
  { label: '报名通知', value: 'registration', icon: 'Postcard' },
  { label: '成绩更新', value: 'score', icon: 'Medal' },
  { label: '反作弊', value: 'cheating', icon: 'Warning' },
  { label: '证书', value: 'certificate', icon: 'Tickets' },
  { label: '系统通知', value: 'system', icon: 'SetUp' }
]

const loading = ref(false)
const markingAll = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const currentType = ref('')
const notifications = ref<any[]>([])
const unreadCount = ref(0)

const activePanel = ref<number | null>(null)

function formatRelativeTime(time: string) {
  return dayjs(time).fromNow()
}

function truncate(text: string, len: number) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

function getTypeIcon(type: string) {
  const map: Record<string, string> = {
    registration: 'Postcard',
    score: 'Medal',
    cheating: 'Warning',
    certificate: 'Tickets',
    system: 'SetUp'
  }
  return map[type] || 'Bell'
}

function getTypeUnreadCount(type: string) {
  return notifications.value.filter(n => n.type === type && !n.isRead).length
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (currentType.value) params.type = currentType.value
    const res = await getNotifications(params)
    notifications.value = res.list || []
    total.value = res.total || 0
    unreadCount.value = res.unreadCount || res.list?.filter((n: any) => !n.isRead).length || 0
  } catch (error) {
  } finally {
    loading.value = false
  }
}

async function handleItemClick(item: any) {
  if (!item.isRead) {
    try {
      await markAsRead(item.id)
      item.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
    }
  }
}

async function handleMarkAll() {
  markingAll.value = true
  try {
    await markAllAsRead()
    ElMessage.success('已全部标记为已读')
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    markingAll.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  loadData()
}

function handleAction(item: any) {
}

watch(currentType, () => {
  page.value = 1
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.sidebar {
  background: #fff;
  border-radius: 8px;
  padding: 8px 0;
  min-height: 600px;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    position: relative;
    font-size: 14px;
    color: #606266;

    &:hover {
      background: #f5f7fa;
      color: #303133;
    }

    &.active {
      background: #ecf5ff;
      color: #409EFF;
      border-left-color: #409EFF;
      font-weight: 500;
    }

    .tab-badge {
      margin-left: auto;
    }
  }
}

.content-card {
  margin-left: 20px;
  min-height: 600px;
}

.notification-list {
  border: none;

  :deep(.el-collapse-item) {
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }
  }

  :deep(.el-collapse-item__header) {
    padding: 0;
    height: auto;
    line-height: normal;
    padding: 16px 0;
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 0 0 16px 52px;
  }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;

  .header-left {
    display: flex;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .type-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    color: #fff;

    &.registration {
      background: #409EFF;
    }
    &.score {
      background: #67C23A;
    }
    &.cheating {
      background: #F56C6C;
    }
    &.certificate {
      background: #E6A23C;
    }
    &.system {
      background: #909399;
    }
  }

  .text-content {
    flex: 1;
    min-width: 0;
  }

  .notification-title {
    font-size: 15px;
    color: #303133;
    font-weight: 500;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #F56C6C;
      flex-shrink: 0;
    }
  }

  .notification-summary {
    font-size: 13px;
    color: #909399;
    line-height: 1.5;
  }

  .header-right {
    flex-shrink: 0;
  }

  .notification-time {
    font-size: 12px;
    color: #c0c4cc;
  }
}

.notification-detail {
  .detail-body {
    font-size: 14px;
    color: #606266;
    line-height: 1.7;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 12px;
  }
}
</style>
