<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">运营报表中心</h2>
      <div>
        <el-date-picker
          v-model="monthRange"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          style="width: 280px; margin-right: 12px;"
          value-format="YYYY-MM"
        />
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>导出报表
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="12" :md="6">
        <StatCard title="活跃用户数" :value="monthData.activeUsers" icon="User" color="#409EFF" icon-bg="rgba(64,158,255,0.1)" sub-label="环比" :sub-value="`+12.5%" trend="up" />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard title="新增用户数" :value="monthData.newUsers" icon="UserFilled" color="#67C23A" icon-bg="rgba(103,194,58,0.1)" sub-label="环比" :sub-value="`+8.2%" trend="up" />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard title="举办竞赛" :value="monthData.contests" icon="Trophy" color="#E6A23C" icon-bg="rgba(230,162,60,0.1)" sub-label="环比" :sub-value="`2个" />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard title="提交次数" :value="monthData.submissions" icon="Document" color="#909399" icon-bg="rgba(144,147,153,0.1)" sub-label="通过率" sub-value="68.3%" />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">月度用户活跃度</span>
          </template>
          <div ref="activityChart" class="chart" style="height: 320px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">题目提交分布</span>
          </template>
          <div ref="submissionChart" class="chart" style="height: 320px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="16">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">竞赛排行榜</span>
          </template>
          <el-table :data="topContests" stripe>
            <el-table-column label="排名" width="80" align="center">
              <template #default="{ $index }">
                <el-tag v-if="$index < 3" :type="['danger', 'warning', 'success'][$index]" effect="dark">{{ $index + 1 }}</el-tag>
                <span v-else>{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="竞赛名称" prop="title" min-width="180" />
            <el-table-column label="参赛人数" prop="participants" width="120" align="center" />
            <el-table-column label="提交次数" prop="submissions" width="120" align="center" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ row.status === 'ongoing' ? '进行中' : '已完成' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">用户角色分布</span>
          </template>
          <div ref="roleChart" class="chart" style="height: 320px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">月度报表详情</span>
          </template>
          <el-table :data="monthlyReports" stripe border>
            <el-table-column label="月份" prop="month" width="120" align="center" />
            <el-table-column label="活跃用户" prop="activeUsers" align="center" />
            <el-table-column label="新增用户" prop="newUsers" align="center" />
            <el-table-column label="举办竞赛" prop="contests" align="center" />
            <el-table-column label="提交总数" prop="submissions" align="center" />
            <el-table-column label="通过率" align="center">
              <template #default="{ row }">
                <el-progress :percentage="row.passRate * 100" :stroke-width="6" style="width: 120px;" />
              </template>
            </el-table-column>
            <el-table-column label="新增证书" prop="certificates" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { getMonthlyReport, getChartData } from '@/api/report'
import StatCard from '@/components/StatCard.vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const monthRange = ref([dayjs().subtract(2, 'month').format('YYYY-MM'),
  dayjs().format('YYYY-MM')
])

const activityChart = ref<HTMLElement>()
const submissionChart = ref<HTMLElement>()
const roleChart = ref<HTMLElement>()

const monthData = ref({
  activeUsers: 0,
  newUsers: 0,
  contests: 0,
  submissions: 0
})

const topContests = ref([
  { title: '2024春季算法竞赛', participants: 356, submissions: 8924, status: 'ended' },
  { title: '大学生编程挑战赛', participants: 289, submissions: 6534, status: 'ended' },
  { title: '新人入门赛第5期', participants: 245, submissions: 3421, status: 'ongoing' },
  { title: '算法进阶营第一期', participants: 178, submissions: 2389, status: 'ended' },
  { title: '高校联赛', participants: 156, submissions: 1872, status: 'ended' }
])

const monthlyReports = ref([
  { month: '2024-07', activeUsers: 1256, newUsers: 234, contests: 8, submissions: 45632, passRate: 0.683, certificates: 456 },
  { month: '2024-06', activeUsers: 1189, newUsers: 198, contests: 6, submissions: 38456, passRate: 0.652, certificates: 389 },
  { month: '2024-05', activeUsers: 1023, newUsers: 267, contests: 7, submissions: 32145, passRate: 0.621, certificates: 412 },
  { month: '2024-04', activeUsers: 986, newUsers: 156, contests: 5, submissions: 28934, passRate: 0.598, certificates: 298 },
  { month: '2024-03', activeUsers: 876, newUsers: 189, contests: 6, submissions: 24567, passRate: 0.612, certificates: 345 }
])

async function initCharts() {
  await nextTick()
  try {
    const chartData = await getChartData({ start: monthRange.value[0], end: monthRange.value[1] })
  } catch (e) {
  }

  if (activityChart.value) {
    const c1 = echarts.init(activityChart.value)
    c1.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['日活', '新增'], right: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['第1周', '第2周', '第3周', '第4周'] },
      yAxis: { type: 'value' },
      series: [
        { name: '日活', type: 'line', smooth: true, data: [820, 932, 1101, 1234, itemStyle: { color: '#409EFF' } },
        { name: '新增', type: 'line', smooth: true, data: [120, 132, 101, 234, itemStyle: { color: '#67C23A' } }
      ]
    })
  }

  if (submissionChart.value) {
    const c2 = echarts.init(submissionChart.value)
    c2.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['C++', 'Java', 'Python', 'Go', 'JavaScript', 'Rust'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          { value: 45235, itemStyle: { color: '#409EFF' } },
          { value: 38456, itemStyle: { color: '#67C23A' } },
          { value: 52341, itemStyle: { color: '#E6A23C' } },
          { value: 12453, itemStyle: { color: '#F56C6C' } },
          { value: 28456, itemStyle: { color: '#909399' } },
          { value: 8765, itemStyle: { color: '#9b59b6' } }
        ]
      }]
    })
  }

  if (roleChart.value) {
    const c3 = echarts.init(roleChart.value)
    c3.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: '60%',
        data: [
          { value: 2356, name: '参赛者', itemStyle: { color: '#67C23A' } },
          { value: 89, name: '评委', itemStyle: { color: '#E6A23C' } },
          { value: 15, name: '管理员', itemStyle: { color: '#F56C6C' } }
        ],
        label: { formatter: '{b}\n{d}%' }
      }]
    })
  }
}

async function loadMonthData() {
  try {
    const res = await getMonthlyReport({ month: monthRange.value[1] })
    if (res) monthData.value = res
  } catch (e) {
    monthData.value = { activeUsers: 1256, newUsers: 234, contests: 8, submissions: 45632 }
  }
}

function handleExport() {
  ElMessage.info('报表导出中...')
}

onMounted(async () => {
  await loadMonthData()
  initCharts()
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 16px;
  font-weight: 600;
}

.chart {
  width: 100%;
}
</style>
