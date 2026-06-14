<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">竞赛列表</h2>
    </div>

    <el-card class="card-shadow mb-20" :body-style="{ padding: '16px 20px' }">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable style="width: 140px">
            <el-option label="个人赛" value="individual" />
            <el-option label="团队赛" value="team" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索竞赛名称"
            clearable
            style="width: 240px"
            @clear="loadData"
            @keyup.enter="loadData"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-empty v-if="!loading && contestList.length === 0" description="暂无竞赛" />

    <el-row v-else :gutter="20">
      <el-col v-for="contest in contestList" :key="contest.id" :xs="24" :sm="12" :lg="8" :xl="6">
        <ContestCard :contest="contest" />
      </el-col>
    </el-row>

    <div class="pagination-wrap mt-20" v-if="total > 0">
      <el-pagination
        v-model:current-page="filterForm.page"
        v-model:page-size="filterForm.pageSize"
        :page-sizes="[8, 16, 24, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getContestList } from '@/api/contest'
import ContestCard from '@/components/ContestCard.vue'
import type { Contest } from '@/types/contest'

const loading = ref(false)
const contestList = ref<Contest[]>([])
const total = ref(0)

const filterForm = reactive({
  page: 1,
  pageSize: 12,
  status: '',
  type: '',
  keyword: ''
})

async function loadData() {
  loading.value = true
  try {
    const res = await getContestList({
      page: filterForm.page,
      pageSize: filterForm.pageSize,
      keyword: filterForm.keyword,
      status: filterForm.status,
      type: filterForm.type
    })
    contestList.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filterForm.page = 1
  filterForm.status = ''
  filterForm.type = ''
  filterForm.keyword = ''
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.pagination-wrap {
  display: flex;
  justify-content: center;
}
</style>
