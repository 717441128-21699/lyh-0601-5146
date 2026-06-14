<template>
  <div class="data-table">
    <div v-if="$slots.toolbar || showSearch" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar" />
      </div>
      <div class="toolbar-right" v-if="showSearch">
        <el-input
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
          style="width: 240px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <el-card class="card-shadow" :body-style="{ padding: 0 }">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        :row-key="rowKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="showSelection" type="selection" width="50" />
        <el-table-column v-if="showIndex" type="index" label="序号" width="70" align="center" />
        <slot />
      </el-table>

      <div v-if="showPagination" class="table-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  data: any[]
  loading?: boolean
  total?: number
  showSearch?: boolean
  searchPlaceholder?: string
  showSelection?: boolean
  showIndex?: boolean
  showPagination?: boolean
  pageSizes?: number[]
  rowKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  total: 0,
  showSearch: false,
  searchPlaceholder: '请输入关键字搜索',
  showSelection: false,
  showIndex: true,
  showPagination: true,
  pageSizes: () => [10, 20, 50, 100],
  rowKey: 'id'
})

const emit = defineEmits<{
  (e: 'search', keyword: string): void
  (e: 'pageChange', page: number, pageSize: number): void
  (e: 'selectionChange', selection: any[]): void
}>()

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(props.pageSizes[0] || 10)
const tableData = ref<any[]>([])

watch(() => props.data, (val) => {
  tableData.value = val || []
}, { immediate: true, deep: true })

function handleSearch() {
  currentPage.value = 1
  emit('search', searchKeyword.value)
}

function handlePageChange() {
  emit('pageChange', currentPage.value, pageSize.value)
}

function handleSelectionChange(selection: any[]) {
  emit('selectionChange', selection)
}
</script>

<style lang="scss" scoped>
.data-table {
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  :deep(.el-table) {
    border-radius: 0;
  }

  .table-pagination {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
