<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">反作弊检测</h2>
      <el-button type="primary" :loading="loadingStats" @click="loadStats">
        <el-icon><Refresh /></el-icon>刷新统计
      </el-button>
    </div>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="12" :sm="8">
        <el-card class="stat-card">
          <div class="stat-num">{{ stats.totalRecords || 0 }}</div>
          <div class="stat-label">总记录数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card class="stat-card pending">
          <div class="stat-num">{{ stats.pendingRecords || 0 }}</div>
          <div class="stat-label">待复核</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card class="stat-card confirmed">
          <div class="stat-num">{{ stats.confirmedRecords || 0 }}</div>
          <div class="stat-label">已确认作弊</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-20 card-shadow">
      <div class="filter-bar">
        <el-radio-group v-model="statusFilter" @change="loadData">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="pending">待处理</el-radio-button>
          <el-radio-button value="confirmed">已确认</el-radio-button>
          <el-radio-button value="dismissed">已驳回</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="records" v-loading="loading" stripe class="mt-20">
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="竞赛" width="200">
          <template #default="{ row }">
            <div class="cell-content">
              <div class="title">{{ row.contest?.title || '-' }}</div>
              <div class="sub">相似度: <span :class="getSimilarityClass(row.similarity)">{{ (row.similarity * 100).toFixed(1) }}%</span></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提交人A" width="180">
          <template #default="{ row }">
            <div class="cell-content">
              <div class="title">{{ row.submissionA?.user?.realName || row.submissionA?.user?.username || '-' }}</div>
              <div class="sub">提交ID: #{{ row.submissionIdA }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提交人B" width="180">
          <template #default="{ row }">
            <div class="cell-content">
              <div class="title">{{ row.submissionB?.user?.realName || row.submissionB?.user?.username || '-' }}</div>
              <div class="sub">提交ID: #{{ row.submissionIdB }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="相似度" width="110" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round(row.similarity * 100)"
              :color="getProgressColor(row.similarity)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" width="180">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDiff(row)">
              <el-icon><View /></el-icon>查看代码对比
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              :disabled="row.status !== 'pending'"
              @click="openReviewDialog(row)"
            >
              <el-icon><Edit /></el-icon>复核
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        class="mt-20"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog v-model="reviewDialogVisible" title="复核作弊记录" width="500px">
      <div v-if="currentRecord" class="review-form">
        <el-alert
          :title="`相似度: ${(currentRecord.similarity * 100).toFixed(1)}%`"
          type="warning"
          show-icon
          class="mb-20"
          :closable="false"
        />
        <el-form label-width="80px">
          <el-form-item label="复核结果">
            <el-radio-group v-model="reviewForm.status">
              <el-radio value="confirmed" border>确认作弊</el-radio>
              <el-radio value="dismissed" border>驳回记录</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="复核备注">
            <el-input v-model="reviewForm.reviewNote" type="textarea" :rows="4" placeholder="请填写复核备注..." />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReview">确认提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="diffDialogVisible" title="代码对比" width="80%" top="5vh">
      <div v-if="currentRecord" class="diff-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="diff-header">
              <span class="diff-title">提交人 A</span>
              <span class="diff-user">{{ currentRecord.submissionA?.user?.realName || currentRecord.submissionA?.user?.username }}</span>
            </div>
            <pre class="diff-code">{{ currentRecord.submissionA?.code || '无代码' }}</pre>
          </el-col>
          <el-col :span="12">
            <div class="diff-header">
              <span class="diff-title">提交人 B</span>
              <span class="diff-user">{{ currentRecord.submissionB?.user?.realName || currentRecord.submissionB?.user?.username }}</span>
            </div>
            <pre class="diff-code">{{ currentRecord.submissionB?.code || '无代码' }}</pre>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { getAntiCheatRecords, reviewRecord, getAntiCheatStats } from '@/api/antiCheat'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const loadingStats = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const statusFilter = ref('')
const records = ref<any[]>([])
const stats = ref({ totalRecords: 0, pendingRecords: 0, confirmedRecords: 0 })

const reviewDialogVisible = ref(false)
const diffDialogVisible = ref(false)
const currentRecord = ref<any>(null)
const submitting = ref(false)
const reviewForm = reactive({
  status: 'confirmed' as 'confirmed' | 'dismissed',
  reviewNote: ''
})

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function getSimilarityClass(similarity: number) {
  if (similarity >= 0.9) return 'danger'
  if (similarity >= 0.7) return 'warning'
  return ''
}

function getProgressColor(similarity: number) {
  if (similarity >= 0.9) return '#F56C6C'
  if (similarity >= 0.7) return '#E6A23C'
  return '#67C23A'
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'danger',
    dismissed: 'info'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    confirmed: '已确认',
    dismissed: '已驳回'
  }
  return map[status] || '未知'
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await getAntiCheatRecords(params)
    records.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  loadingStats.value = true
  try {
    const res = await getAntiCheatStats()
    stats.value = {
      totalRecords: res.totalRecords || 0,
      pendingRecords: res.pendingRecords || 0,
      confirmedRecords: res.confirmedRecords || 0
    }
  } finally {
    loadingStats.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  loadData()
}

function handleSizeChange(ps: number) {
  pageSize.value = ps
  page.value = 1
  loadData()
}

function openReviewDialog(row: any) {
  currentRecord.value = row
  reviewForm.status = 'confirmed'
  reviewForm.reviewNote = ''
  reviewDialogVisible.value = true
}

function showDiff(row: any) {
  currentRecord.value = row
  diffDialogVisible.value = true
}

async function submitReview() {
  if (!currentRecord.value) return
  submitting.value = true
  try {
    await reviewRecord(currentRecord.value.id, {
      status: reviewForm.status,
      reviewNote: reviewForm.reviewNote
    })
    ElMessage.success('复核成功')
    reviewDialogVisible.value = false
    loadData()
    loadStats()
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style lang="scss" scoped>
.stat-card {
  text-align: center;

  &.pending .stat-num {
    color: #E6A23C;
  }

  &.confirmed .stat-num {
    color: #F56C6C;
  }

  .stat-num {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cell-content {
  .title {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .sub {
    font-size: 12px;
    color: #909399;
  }

  .danger {
    color: #F56C6C;
    font-weight: 600;
  }

  .warning {
    color: #E6A23C;
    font-weight: 600;
  }
}

.mb-20 {
  margin-bottom: 20px;
}

.review-form {
  padding: 10px 0;
}

.diff-container {
  .diff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #ecf5ff;
    border-radius: 4px 4px 0 0;

    .diff-title {
      font-size: 14px;
      font-weight: 600;
      color: #409EFF;
    }

    .diff-user {
      font-size: 13px;
      color: #606266;
    }
  }

  .diff-code {
    margin: 0;
    padding: 16px;
    height: 400px;
    overflow: auto;
    background: #f5f7fa;
    border: 1px solid #ebeef5;
    border-top: none;
    border-radius: 0 0 4px 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
</style>
