<template>
  <el-card class="stat-card card-shadow" :body-style="{ padding: '20px' }">
    <div class="stat-content">
      <div class="stat-info">
        <div class="stat-label">{{ title }}</div>
        <div class="stat-value" :style="{ color: color }">{{ formattedValue }}</div>
        <div class="stat-footer" v-if="subLabel || subValue">
          <span class="sub-label">{{ subLabel }}</span>
          <span class="sub-value" :class="trendClass">{{ subValue }}</span>
        </div>
      </div>
      <div class="stat-icon" :style="{ background: iconBg, color: color }">
        <el-icon :size="32">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  icon?: string
  color?: string
  iconBg?: string
  subLabel?: string
  subValue?: string
  trend?: 'up' | 'down' | 'none'
  prefix?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'DataLine',
  color: '#409EFF',
  iconBg: 'rgba(64, 158, 255, 0.1)',
  trend: 'none'
})

const formattedValue = computed(() => {
  const val = typeof props.value === 'number' ? props.value.toLocaleString() : props.value
  return `${props.prefix || ''}${val}${props.suffix || ''}`
})

const trendClass = computed(() => ({
  'trend-up': props.trend === 'up',
  'trend-down': props.trend === 'down'
}))
</script>

<style lang="scss" scoped>
.stat-card {
  border: none;
  border-radius: 8px;

  .stat-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-info {
    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .sub-label {
        color: #909399;
      }

      .trend-up {
        color: #67C23A;
      }

      .trend-down {
        color: #F56C6C;
      }
    }
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
