<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">我的证书</h2>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="cert in certificates" :key="cert.id">
        <el-card class="cert-card card-shadow" shadow="hover">
          <div class="cert-cover" :style="getCoverStyle(cert)">
            <div class="cert-badge">
              <el-icon><Medal /></el-icon>
            </div>
            <div class="cert-type">{{ getCertTypeName(cert.type) }}</div>
          </div>
          <div class="cert-info">
            <h3 class="cert-title">{{ cert.title || (cert.contest?.title + ' 证书') }}</h3>
            <div class="cert-meta">
              <span class="contest-name">{{ cert.contest?.title || '-' }}</span>
            </div>
            <div class="cert-detail" v-if="cert.rank">
              最终排名: 第 <strong>{{ cert.rank }}</strong> 名
            </div>
            <div class="cert-detail" v-if="cert.score">
              最终得分: <strong>{{ cert.score }}</strong> 分
            </div>
            <div class="cert-footer">
              <span class="issue-date">颁发日期: {{ formatTime(cert.issuedAt || cert.createdAt) }}</span>
            </div>
          </div>
          <div class="cert-actions">
            <el-button type="primary" @click="handleDownload(cert.id)">
              <el-icon><Download /></el-icon>下载
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && certificates.length === 0" description="暂无证书，快去参加比赛获取证书吧！" />

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyCertificates, downloadCertificate } from '@/api/certificate'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const certificates = ref<any[]>([])

function formatTime(time: string) {
  return time ? dayjs(time).format('YYYY-MM-DD') : '-'
}

function getCertTypeName(type: string) {
  const map: Record<string, string> = {
    participation: '参与证书',
    excellence: '优秀奖',
    third_place: '季军',
    second_place: '亚军',
    first_place: '冠军'
  }
  return map[type] || '荣誉证书'
}

function getCoverStyle(cert: any) {
  const colorMap: Record<string, string> = {
    first_place: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    second_place: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
    third_place: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
    excellence: 'linear-gradient(135deg, #67C23A 0%, #4CAF50 100%)',
    participation: 'linear-gradient(135deg, #409EFF 0%, #667eea 100%)'
  }
  const bg = colorMap[cert.type] || colorMap.participation
  return { background: bg }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMyCertificates({ page: page.value, pageSize: pageSize.value })
    certificates.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function handleDownload(id: number) {
  try {
    const data = await downloadCertificate(id)
    const url = typeof data === 'string' ? data : data?.url
    if (url) {
      window.open(url, '_blank')
    } else {
      ElMessage.success('证书下载已开始')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '下载失败')
  }
}

function handlePageChange(p: number) {
  page.value = p
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.cert-card {
  margin-bottom: 20px;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  :deep(.el-card__body) {
    padding: 0;
  }
}

.cert-cover {
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  position: relative;

  .cert-badge {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin-bottom: 12px;
  }

  .cert-type {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 2px;
  }
}

.cert-info {
  padding: 16px;

  .cert-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cert-meta {
    .contest-name {
      font-size: 13px;
      color: #606266;
    }
  }

  .cert-detail {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;

    strong {
      color: #E6A23C;
      font-size: 14px;
    }
  }

  .cert-footer {
    margin-top: 12px;

    .issue-date {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}

.cert-actions {
  padding: 0 16px 16px;

  .el-button {
    width: 100%;
  }
}
</style>
