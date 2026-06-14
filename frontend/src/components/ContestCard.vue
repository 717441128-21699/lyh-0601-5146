<template>
  <el-card class="contest-card card-shadow" :body-style="{ padding: 0 }" @click="handleClick">
    <div class="card-cover">
      <img v-if="contest.coverImage" :src="contest.coverImage" :alt="contest.title" />
      <div v-else class="cover-placeholder">
        <el-icon :size="48"><Trophy /></el-icon>
      </div>
      <el-tag :type="statusType" size="small" class="status-tag">{{ statusText }}</el-tag>
      <el-tag type="info" size="small" class="type-tag">{{ typeText }}</el-tag>
    </div>
    <div class="card-body">
      <div class="card-title" :title="contest.title">{{ contest.title }}</div>
      <div class="card-desc">{{ contest.description }}</div>
      <div class="card-meta">
        <div class="meta-item">
          <el-icon><User /></el-icon>
          <span>{{ contest.participantCount || 0 }}人参赛</span>
        </div>
        <div class="meta-item">
          <el-icon><Document /></el-icon>
          <span>{{ contest.problemCount || 0 }}道题</span>
        </div>
      </div>
      <div class="card-time">
        <el-icon><Clock /></el-icon>
        <span>{{ formatTime(contest.startTime) }} - {{ formatTime(contest.endTime) }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Contest } from '@/types/contest'
import { ContestStatus, ContestType } from '@/types/contest'
import dayjs from 'dayjs'

interface Props {
  contest: Contest
}

const props = defineProps<Props>()
const router = useRouter()

const statusText = computed(() => {
  const map: Record<string, string> = {
    [ContestStatus.UPCOMING]: '即将开始',
    [ContestStatus.ONGOING]: '进行中',
    [ContestStatus.ENDED]: '已结束'
  }
  return map[props.contest.status] || '未知'
})

const statusType = computed(() => {
  const map: Record<string, string> = {
    [ContestStatus.UPCOMING]: 'warning',
    [ContestStatus.ONGOING]: 'success',
    [ContestStatus.ENDED]: 'info'
  }
  return map[props.contest.status] || 'info'
})

const typeText = computed(() => {
  const map: Record<string, string> = {
    [ContestType.INDIVIDUAL]: '个人赛',
    [ContestType.TEAM]: '团队赛'
  }
  return map[props.contest.type] || '个人赛'
})

function formatTime(time: string) {
  return dayjs(time).format('MM-DD HH:mm')
}

function handleClick() {
  const prefix = router.currentRoute.value.path.startsWith('/admin') ? '/admin' : ''
  router.push(`${prefix}/contests/${props.contest.id}`)
}
</script>

<style lang="scss" scoped>
.contest-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-cover {
    position: relative;
    height: 140px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;

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

    .status-tag {
      position: absolute;
      top: 12px;
      left: 12px;
    }

    .type-tag {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  .card-body {
    padding: 16px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-desc {
      font-size: 13px;
      color: #606266;
      line-height: 1.5;
      height: 40px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 12px;
    }

    .card-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #909399;
      }
    }

    .card-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
