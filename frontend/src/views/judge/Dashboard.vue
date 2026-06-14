<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">评委工作台</h2>
      <el-button type="primary" @click="$router.push('/judge/pending')">
        <el-icon><EditPen /></el-icon>前往评分
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="待评分任务"
          :value="stats.pending"
          icon="Clock"
          color="#F56C6C"
          icon-bg="rgba(245,108,108,0.1)"
          :sub-label="'需要尽快处理'"
          trend="down"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="今日已评分"
          :value="stats.todayScored"
          icon="CircleCheck"
          color="#67C23A"
          icon-bg="rgba(103,194,58,0.1)"
          sub-label="平均分数"
          :sub-value="`${stats.avgScore.toFixed(1)}分`"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="本月总评分"
          :value="stats.monthlyScored"
          icon="DataAnalysis"
          color="#409EFF"
          icon-bg="rgba(64,158,255,0.1)"
          sub-label="平均用时"
          sub-value="3.2分钟/份"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard
          title="已分配竞赛"
          :value="stats.assignedContests"
          icon="Trophy"
          color="#909399"
          icon-bg="rgba(144,147,153,0.1)"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="14">
        <el-card class="card-shadow">
          <template #header>
            <div class="flex-between">
              <span class="card-title">待评分列表</span>
              <el-button type="primary" text @click="$router.push('/judge/pending')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingList" stripe>
            <el-table-column label="ID" prop="id" width="70" align="center" />
            <el-table-column label="题目" prop="problemTitle" min-width="140" />
            <el-table-column label="提交用户" prop="username" width="110" />
            <el-table-column label="竞赛" prop="contestTitle" min-width="140" show-overflow-tooltip />
            <el-table-column label="语言" width="90" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.language }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="提交时间" width="160">
              <template #default="{ row }">{{ formatTime(row.submittedAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="goToScore(row)">评分</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!pendingList.length" description="暂无待评分任务" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">最近评分记录</span>
          </template>
          <div class="recent-list">
            <div v-for="(item, index) in recentScores" :key="index" class="recent-item">
              <div class="recent-left">
                <div class="recent-title">{{ item.problemTitle }}</div>
                <div class="recent-meta">
                  <el-tag size="small" type="success" effect="plain">{{ item.username }}</el-tag>
                  <span style="color: #909399; font-size: 12px;">{{ formatTime(item.scoredAt) }}</span>
                </div>
              </div>
              <div class="recent-score">
                <span :class="{ 'score-high': item.score >= 80, 'score-mid': item.score >= 60 && item.score < 80, 'score-low': item.score < 60 }">
                  {{ item.score }}
                </span>
                <span class="score-total">/100</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">我的评分分布</span>
          </template>
          <div ref="scoreChart" style="height: 280px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">工作效率</span>
          </template>
          <div ref="efficiencyChart" style="height: 280px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getJudgeStats, getPendingList, getJudgeScoreHistory } from '@/api/judge'
import StatCard from '@/components/StatCard.vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const router = useRouter()

const stats = ref({
  pending: 0,
  todayScored: 0,
  monthlyScored: 0,
  avgScore: 0,
  assignedContests: 0
})

const pendingList = ref<any[]>([])
const recentScores = ref<any[]>([])
const scoreChart = ref<HTMLElement>()
const efficiencyChart = ref<HTMLElement>()

function formatTime(time: string) {
  return dayjs(time).format('MM-DD HH:mm')
}

function goToScore(row: any) {
  router.push(`/judge/score/${row.id}`)
}

async function loadData() {
  try {
    const [st, pending, history] = await Promise.all([
      getJudgeStats(),
      getPendingList({ page: 1, pageSize: 5 }),
      getJudgeScoreHistory({ page: 1, pageSize: 8 })
    ])
    if (st) stats.value = st
    pendingList.value = pending.list || []
    recentScores.value = history.list || [
      { problemTitle: '最长回文子串', username: 'alice001', scoredAt: dayjs().subtract(20, 'minute').toISOString(), score: 85 },
      { problemTitle: '动态规划入门', username: 'bob_dev', scoredAt: dayjs().subtract(45, 'minute').toISOString(), score: 72 },
      { problemTitle: '二叉树遍历', username: 'coder_z', scoredAt: dayjs().subtract(1, 'hour').toISOString(), score: 95 },
      { problemTitle: '图论基础', username: 'dev007', scoredAt: dayjs().subtract(2, 'hour').toISOString(), score: 58 },
      { problemTitle: '搜索算法', username: 'python_lover', scoredAt: dayjs().subtract(3, 'hour').toISOString(), score: 78 }
    ]
  } catch (e) {
    recentScores.value = [
      { problemTitle: '最长回文子串', username: 'alice001', scoredAt: dayjs().subtract(20, 'minute').toISOString(), score: 85 },
      { problemTitle: '动态规划入门', username: 'bob_dev', scoredAt: dayjs().subtract(45, 'minute').toISOString(), score: 72 },
      { problemTitle: '二叉树遍历', username: 'coder_z', scoredAt: dayjs().subtract(1, 'hour').toISOString(), score: 95 },
      { problemTitle: '图论基础', username: 'dev007', scoredAt: dayjs().subtract(2, 'hour').toISOString(), score: 58 }
    ]
  }
}

async function initCharts() {
  await nextTick()
  if (scoreChart.value) {
    const c = echarts.init(scoreChart.value)
    c.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '55%',
        data: [
          { value: 35, name: '90-100分', itemStyle: { color: '#67C23A' } },
          { value: 52, name: '80-89分', itemStyle: { color: '#409EFF' } },
          { value: 28, name: '60-79分', itemStyle: { color: '#E6A23C' } },
          { value: 12, name: '0-59分', itemStyle: { color: '#F56C6C' } }
        ],
        label: { formatter: '{b}\n{c}份({d}%)' }
      }]
    })
  }
  if (efficiencyChart.value) {
    const c2 = echarts.init(efficiencyChart.value)
    c2.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value', name: '评分份数' },
      series: [{
        type: 'bar',
        data: [18, 25, 30, 22, 35, 48, 42],
        itemStyle: { color: '#409EFF' },
        barWidth: 30
      }]
    })
  }
}

onMounted(async () => {
  await loadData()
  initCharts()
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 16px;
  font-weight: 600;
}

.recent-list {
  .recent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .recent-left {
      .recent-title {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
      }
      .recent-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .recent-score {
      display: flex;
      align-items: baseline;
      gap: 2px;

      span:first-child {
        font-size: 24px;
        font-weight: 700;
      }
      .score-total {
        color: #909399;
        font-size: 14px;
      }
      .score-high { color: #67C23A; }
      .score-mid { color: #409EFF; }
      .score-low { color: #F56C6C; }
    }
  }
}
</style>
