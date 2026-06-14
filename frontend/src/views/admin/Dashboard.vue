<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">管理首页</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="竞赛总数"
          :value="stats.totalContests"
          icon="Trophy"
          color="#67C23A"
          icon-bg="rgba(103, 194, 58, 0.1)"
          sub-label="进行中"
          :sub-value="`${stats.ongoingContests}个`"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="用户总数"
          :value="stats.totalUsers"
          icon="User"
          color="#409EFF"
          icon-bg="rgba(64, 158, 255, 0.1)"
          sub-label="今日新增"
          :sub-value="`+${stats.newUsersToday}`"
          trend="up"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="提交总次数"
          :value="stats.totalSubmissions"
          icon="Document"
          color="#E6A23C"
          icon-bg="rgba(230, 162, 60, 0.1)"
          sub-label="今日提交"
          :sub-value="`${stats.submissionsToday}次`"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="本月反作弊告警"
          :value="stats.antiCheatAlertsThisMonth"
          icon="Warning"
          color="#F56C6C"
          icon-bg="rgba(245, 108, 108, 0.1)"
          sub-label="待处理"
          :sub-value="`${stats.pendingJudgements}条`"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="14">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">用户增长趋势</span>
          </template>
          <div ref="userGrowthChart" class="chart-container" style="height: 320px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">竞赛参与情况</span>
          </template>
          <div ref="contestChart" class="chart-container" style="height: 320px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="14">
        <el-card class="card-shadow">
          <template #header>
            <div class="flex-between">
              <span class="card-title">最近活动</span>
              <el-button text type="primary">查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in recentActivities"
              :key="index"
              :timestamp="activity.time"
              :type="activity.type"
              placement="top"
            >
              <el-card shadow="never" class="activity-card">
                <div class="activity-content">
                  <el-icon><component :is="activity.icon" /></el-icon>
                  <span>{{ activity.content }}</span>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card class="card-shadow">
          <template #header>
            <div class="flex-between">
              <span class="card-title">系统状态</span>
            </div>
          </template>
          <div class="system-status">
            <div class="status-item">
              <div class="status-info">
                <span class="status-label">评测服务</span>
                <span class="status-value running">运行正常</span>
              </div>
              <el-progress :percentage="95" :stroke-width="6" />
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-label">数据库</span>
                <span class="status-value running">运行正常</span>
              </div>
              <el-progress :percentage="88" :stroke-width="6" />
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-label">缓存服务</span>
                <span class="status-value running">运行正常</span>
              </div>
              <el-progress :percentage="92" :stroke-width="6" />
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-label">反作弊服务</span>
                <span class="status-value warning">待优化</span>
              </div>
              <el-progress :percentage="65" status="warning" :stroke-width="6" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import StatCard from '@/components/StatCard.vue'
import { getDashboardStats, getUserGrowthChart, getContestParticipationChart } from '@/api/report'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const stats = ref({
  totalUsers: 0,
  totalContests: 0,
  totalSubmissions: 0,
  antiCheatAlertsThisMonth: 0,
  newUsersToday: 0,
  submissionsToday: 0,
  ongoingContests: 0,
  pendingJudgements: 0
})

const userGrowthChart = ref<HTMLElement>()
const contestChart = ref<HTMLElement>()

const recentActivities = ref([
  { time: dayjs().subtract(5, 'minute').format('HH:mm:ss'), content: '用户 user001 提交了代码', type: 'primary', icon: 'Document' },
  { time: dayjs().subtract(15, 'minute').format('HH:mm:ss'), content: '新竞赛「2024春季算法赛」已创建', type: 'success', icon: 'Trophy' },
  { time: dayjs().subtract(1, 'hour').format('HH:mm:ss'), content: '检测到疑似作弊行为，请核查', type: 'warning', icon: 'Warning' },
  { time: dayjs().subtract(2, 'hour').format('HH:mm:ss'), content: '新用户注册 12 人', type: 'primary', icon: 'User' },
  { time: dayjs().subtract(3, 'hour').format('HH:mm:ss'), content: '月度报表已生成', type: 'success', icon: 'PieChart' }
])

async function loadStats() {
  try {
    const res = await getDashboardStats()
    stats.value = {
      totalUsers: res.totalUsers || 0,
      totalContests: res.totalContests || 0,
      totalSubmissions: res.totalSubmissions || 0,
      antiCheatAlertsThisMonth: res.antiCheatAlertsThisMonth || 0,
      newUsersToday: res.newUsersToday || 0,
      submissionsToday: res.submissionsToday || 0,
      ongoingContests: res.ongoingContests || 0,
      pendingJudgements: res.pendingJudgements || 0
    }
  } catch (error) {
  }
}

async function initCharts() {
  await nextTick()
  try {
    const [growthData, contestData] = await Promise.all([
      getUserGrowthChart(),
      getContestParticipationChart()
    ])

    if (userGrowthChart.value) {
      const chart = echarts.init(userGrowthChart.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: growthData.dates || ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
        },
        yAxis: { type: 'value' },
        series: [{
          name: '用户数',
          type: 'line',
          smooth: true,
          areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
          lineStyle: { color: '#409EFF', width: 3 },
          itemStyle: { color: '#409EFF' },
          data: growthData.counts || [120, 190, 320, 450, 580, 720, 890]
        }]
      })
    }

    if (contestChart.value) {
      const chart2 = echarts.init(contestChart.value)
      chart2.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' }
          },
          data: [
            { value: 1048, name: '已完成', itemStyle: { color: '#67C23A' } },
            { value: 735, name: '进行中', itemStyle: { color: '#409EFF' } },
            { value: 580, name: '即将开始', itemStyle: { color: '#E6A23C' } },
            { value: 484, name: '报名中', itemStyle: { color: '#909399' } }
          ]
        }]
      })
    }
  } catch (error) {
  }
}

onMounted(async () => {
  await loadStats()
  initCharts()
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  width: 100%;
}

.activity-card {
  border: none;
  padding: 8px 12px;
  background: #f5f7fa;

  .activity-content {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #606266;
  }
}

.system-status {
  .status-item + .status-item {
    margin-top: 20px;
  }

  .status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .status-label {
      font-size: 14px;
      color: #606266;
    }

    .status-value {
      font-size: 13px;
      font-weight: 500;

      &.running {
        color: #67C23A;
      }

      &.warning {
        color: #E6A23C;
      }
    }
  }
}
</style>
