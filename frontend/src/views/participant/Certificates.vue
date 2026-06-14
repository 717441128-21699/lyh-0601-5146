<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">我的证书</h2>
    </div>

    <el-empty v-if="!loading && certificates.length === 0" description="暂无证书" />

    <el-row v-else :gutter="20">
      <el-col v-for="cert in certificates" :key="cert.id" :xs="24" :sm="12" :md="8">
        <el-card class="cert-card card-shadow" :body-style="{ padding: 0 }">
          <div class="cert-cover" :class="cert.type">
            <el-icon :size="64" class="cert-icon"><Award /></el-icon>
            <el-tag :type="getTypeTagType(cert.type)" size="large" class="cert-type-tag">
              {{ getTypeText(cert.type) }}
            </el-tag>
          </div>
          <div class="cert-body">
            <h3 class="cert-title">{{ cert.title }}</h3>
            <p class="cert-contest">{{ cert.contest?.title }}</p>
            <div class="cert-meta">
              <div v-if="cert.rank" class="meta-item">
                <el-icon><Medal /></el-icon>
                <span>第 {{ cert.rank }} 名</span>
              </div>
              <div v-if="cert.score !== undefined" class="meta-item">
                <el-icon><Trophy /></el-icon>
                <span>{{ cert.score }} 分</span>
              </div>
            </div>
            <div class="cert-footer">
              <span class="issue-date">{{ formatDate(cert.issuedAt) }} 颁发</span>
              <el-button type="primary" size="small" @click="handleDownload(cert.id)">
                <el-icon><Download /></el-icon>下载
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="pagination-wrap mt-20" v-if="total > 0">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[8, 16, 24, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="loadCertificates"
        @current-change="loadCertificates"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyCertificates, downloadCertificate, type Certificate } from '@/api/certificate'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const certificates = ref<Certificate[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

function formatDate(time: string) {
  return dayjs(time).format('YYYY年MM月DD日')
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    winner: '获奖证书',
    participant: '参赛证书',
    achievement: '成就证书'
  }
  return map[type] || '证书'
}

function getTypeTagType(type: string) {
  const map: Record<string, string> = {
    winner: 'success',
    participant: '',
    achievement: 'warning'
  }
  return map[type] || 'info'
}

async function loadCertificates() {
  loading.value = true
  try {
    const res = await getMyCertificates({
      page: page.value,
      pageSize: pageSize.value
    })
    certificates.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function handleDownload(id: number) {
  try {
    const blob = await downloadCertificate(id) as any
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `certificate_${id}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '下载失败')
  }
}

onMounted(() => {
  loadCertificates()
})
</script>

<style lang="scss" scoped>
.cert-card {
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  .cert-cover {
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    &.winner {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.achievement {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }

    .cert-icon {
      color: rgba(255, 255, 255, 0.95);
    }

    .cert-type-tag {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  .cert-body {
    padding: 16px;

    .cert-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cert-contest {
      font-size: 13px;
      color: #606266;
      margin: 0 0 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cert-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #606266;
      }
    }

    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;

      .issue-date {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
}
</style>
