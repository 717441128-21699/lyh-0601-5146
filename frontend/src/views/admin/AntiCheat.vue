<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">反作弊检测</h2>
      <div class="header-actions">
        <el-select v-model="riskFilter" placeholder="风险等级" style="width: 140px; margin-right: 12px;">
          <el-option label="全部" value="" />
          <el-option label="高风险" value="high" />
          <el-option label="中风险" value="medium" />
          <el-option label="低风险" value="low" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="处理状态" style="width: 140px;">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="已复核" value="reviewed" />
          <el-option label="已忽略" value="ignored" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :xs="12" :md="6">
        <StatCard title="本月检测数" :value="stats.totalDetections" icon="View" color="#409EFF" icon-bg="rgba(64,158,255,0.1)" />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard title="高风险数" :value="stats.highRisk" icon="Warning" color="#F56C6C" icon-bg="rgba(245,108,108,0.1)" />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard title="待处理" :value="stats.pending" icon="Clock" color="#E6A23C" icon-bg="rgba(230,162,60,0.1)" />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard title="已确认作弊" :value="stats.confirmed" icon="CircleCheck" color="#67C23A" icon-bg="rgba(103,194,58,0.1)" />
      </el-col>
    </el-row>

    <DataTable
      :data="records"
      :loading="loading"
      :total="total"
      :show-search="true"
      search-placeholder="搜索用户名/竞赛"
      @search="handleSearch"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <el-button type="danger" :disabled="!selected.length" @click="handleBatchConfirm">
          批量确认作弊
        </el-button>
        <el-button type="info" :disabled="!selected.length" @click="handleBatchIgnore">
          批量忽略
        </el-button>
      </template>
      <el-table-column label="ID" prop="id" width="70" align="center" />
      <el-table-column label="用户" width="160">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="32" style="background-color: #409EFF; color: #fff;">
              {{ row.user?.nickname?.charAt(0) || row.user?.username?.charAt(0) }}
            </el-avatar>
            <div>
              <div class="username">{{ row.user?.nickname || row.user?.username }}</div>
              <div class="sub-name">@{{ row.user?.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="竞赛" prop="contestTitle" min-width="160" />
      <el-table-column label="检测类型" width="130" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ getDetectionText(row.detectionType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="风险等级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getRiskType(row.riskLevel)" size="small">
            {{ getRiskText(row.riskLevel) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="相似度" width="110" align="center">
        <template #default="{ row }">
          <el-progress :percentage="row.similarity * 100" :status="row.similarity > 0.7 ? 'exception' : row.similarity > 0.5 ? 'warning' : ''" :stroke-width="8" />
        </template>
      </el-table-column>
      <el-table-column label="处理状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="检测时间" width="170">
        <template #default="{ row }">{{ formatTime(row.detectedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleViewDetail(row)">查看详情</el-button>
          <el-button v-if="row.status !== 'reviewed'" type="success" link size="small" @click="handleConfirm(row)">确认作弊</el-button>
          <el-button v-if="row.status !== 'ignored'" type="info" link size="small" @click="handleIgnore(row)">忽略</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="detailVisible" title="作弊检测详情" width="800px">
      <el-descriptions v-if="current" :column="2" border>
        <el-descriptions-item label="用户">{{ current.user?.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ current.user?.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="竞赛">{{ current.contestTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="检测类型">{{ getDetectionText(current.detectionType) }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="getRiskType(current.riskLevel)">{{ getRiskText(current.riskLevel) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="相似度">{{ (current.similarity * 100).toFixed(1) }}%</el-descriptions-item>
        <el-descriptions-item label="检测时间" :span="2">{{ formatTime(current.detectedAt) }}</el-descriptions-item>
        <el-descriptions-item label="检测详情" :span="2">
          <div style="max-height: 200px; overflow: auto; background: #f5f7fa; padding: 12px; border-radius: 4px; white-space: pre-wrap;">
            {{ current.details || '暂无详细信息' }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="current && current.status !== 'reviewed'" type="success" @click="handleConfirm(current)">确认作弊</el-button>
        <el-button v-if="current && current.status !== 'ignored'" type="info" @click="handleIgnore(current)">忽略记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAntiCheatRecords, confirmCheat, ignoreRecord, batchConfirmCheat, batchIgnoreRecords, getAntiCheatStats } from '@/api/report'
import DataTable from '@/components/DataTable.vue'
import StatCard from '@/components/StatCard.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

interface AntiCheatRecord {
  id: number
  user?: { username: string; nickname: string }
  contestTitle: string
  detectionType: string
  riskLevel: string
  similarity: number
  status: string
  detectedAt: string
  details: string
}

const loading = ref(false)
const records = ref<AntiCheatRecord[]>([])
const total = ref(0)
const detailVisible = ref(false)
const current = ref<AntiCheatRecord | null>(null)
const selected = ref<any[]>([])
const keyword = ref('')
const riskFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

const stats = ref({
  totalDetections: 0,
  highRisk: 0,
  pending: 0,
  confirmed: 0
})

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function getDetectionText(type: string) {
  const map: Record<string, string> = {
    code_copy: '代码复制',
    ip_duplicate: 'IP重复',
    same_machine: '同机登录',
    time_anomaly: '时间异常',
    pattern_match: '模式匹配'
  }
  return map[type] || type
}

function getRiskType(level: string) {
  const map: Record<string, string> = { high: 'danger', medium: 'warning', low: 'info' }
  return map[level] || 'info'
}

function getRiskText(level: string) {
  const map: Record<string, string> = { high: '高风险', medium: '中风险', low: '低风险' }
  return map[level] || '未知'
}

function getStatusType(status: string) {
  const map: Record<string, string> = { pending: 'warning', reviewed: 'success', ignored: 'info' }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = { pending: '待处理', reviewed: '已复核', ignored: '已忽略' }
  return map[status] || '未知'
}

async function loadStats() {
  try {
    const res = await getAntiCheatStats()
    stats.value = res || stats.value
  } catch (e) {
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getAntiCheatRecords({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      riskLevel: riskFilter.value || undefined,
      status: statusFilter.value || undefined
    })
    records.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch(val: string) {
  keyword.value = val
  page.value = 1
  loadData()
}

function handlePageChange(p: number, ps: number) {
  page.value = p
  pageSize.value = ps
  loadData()
}

function handleSelectionChange(val: any[]) {
  selected.value = val
}

function handleViewDetail(row: AntiCheatRecord) {
  current.value = row
  detailVisible.value = true
}

async function handleConfirm(row: AntiCheatRecord) {
  try {
    await confirmCheat(row.id)
    ElMessage.success('已确认作弊')
    loadData()
    loadStats()
    detailVisible.value = false
  } catch (e) {
  }
}

async function handleIgnore(row: AntiCheatRecord) {
  try {
    await ignoreRecord(row.id)
    ElMessage.success('已忽略')
    loadData()
    detailVisible.value = false
  } catch (e) {
  }
}

async function handleBatchConfirm() {
  try {
    await batchConfirmCheat(selected.value.map(r => r.id))
    ElMessage.success('批量确认成功')
    loadData()
    loadStats()
  } catch (e) {
  }
}

async function handleBatchIgnore() {
  try {
    await batchIgnoreRecords(selected.value.map(r => r.id))
    ElMessage.success('批量忽略成功')
    loadData()
  } catch (e) {
  }
}

onMounted(() => {
  loadStats()
  loadData()
})
</script>

<style lang="scss" scoped>
.header-actions {
  display: flex;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .username {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }

  .sub-name {
    font-size: 12px;
    color: #909399;
  }
}
</style>
