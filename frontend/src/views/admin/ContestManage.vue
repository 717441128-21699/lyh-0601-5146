<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">竞赛管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>新建竞赛
      </el-button>
    </div>

    <DataTable
      :data="contests"
      :loading="loading"
      :total="total"
      :show-search="true"
      search-placeholder="搜索竞赛名称"
      @search="handleSearch"
      @page-change="handlePageChange"
    >
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="标题" prop="title" min-width="200">
        <template #default="{ row }">
          <el-link type="primary">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.type === 'individual' ? '个人赛' : '团队赛' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="难度" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getDifficultyType(row.difficulty)" size="small">
            {{ getDifficultyText(row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报名时间" width="340">
        <template #default="{ row }">
          <div>{{ formatTime(row.registrationStartTime) }}</div>
          <div style="color:#909399">至 {{ formatTime(row.registrationEndTime) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="比赛时间" width="340">
        <template #default="{ row }">
          <div>{{ formatTime(row.startTime) }}</div>
          <div style="color:#909399">至 {{ formatTime(row.endTime) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" link size="small" @click="handleManageProblems(row)">题目管理</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑竞赛' : '新建竞赛'" width="800px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入竞赛标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入竞赛描述" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" style="width:100%">
                <el-option label="个人赛" value="individual" />
                <el-option label="团队赛" value="team" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" style="width:100%">
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
                <el-option label="专家" value="expert" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width:100%">
                <el-option label="草稿" value="draft" />
                <el-option label="报名中" value="registering" />
                <el-option label="进行中" value="ongoing" />
                <el-option label="已结束" value="ended" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="主办方" prop="organizer">
          <el-input v-model="form.organizer" placeholder="请输入主办方名称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="最大人数">
              <el-input-number v-model="form.maxParticipants" :min="0" placeholder="不限" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="反作弊阈值">
              <el-input-number v-model="form.antiCheatThreshold" :min="0" :max="1" :step="0.01" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检查点数量">
              <el-input-number v-model="form.checkPointCount" :min="1" :default-value="3" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="报名开始" prop="registrationStartTime">
              <el-date-picker v-model="form.registrationStartTime" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名结束" prop="registrationEndTime">
              <el-date-picker v-model="form.registrationEndTime" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="比赛开始" prop="startTime">
              <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="比赛结束" prop="endTime">
              <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="竞赛组别">
          <div class="groups-input">
            <div v-for="(group, index) in form.groups" :key="index" class="group-item">
              <el-input v-model="group.name" placeholder="组别名称" style="width: 160px;" />
              <el-input v-model="group.description" placeholder="描述（可选）" style="width: 180px; margin: 0 8px;" />
              <el-input-number v-model="group.capacity" :min="1" placeholder="容量" style="width: 120px;" />
              <el-input-number v-model="group.minRating" :min="0" placeholder="最小Rating" style="width: 120px; margin: 0 8px;" />
              <el-input-number v-model="group.maxRating" :min="0" placeholder="最大Rating" style="width: 120px;" />
              <el-button type="danger" link @click="form.groups.splice(index, 1)">删除</el-button>
            </div>
            <el-button type="primary" link @click="addGroup">
              <el-icon><Plus /></el-icon>添加组别
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, type FormInstance } from 'vue'
import { getContestList, createContest, updateContest, deleteContest } from '@/api/contest'
import DataTable from '@/components/DataTable.vue'
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import type { Contest } from '@/types/contest'
import dayjs from 'dayjs'

const loading = ref(false)
const saving = ref(false)
const contests = ref<Contest[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)

const form = reactive({
  id: 0,
  title: '',
  description: '',
  type: 'individual' as 'individual' | 'team',
  difficulty: 'medium' as 'easy' | 'medium' | 'hard' | 'expert',
  status: 'draft' as 'draft' | 'registering' | 'ongoing' | 'ended' | 'cancelled',
  organizer: '',
  startTime: '',
  endTime: '',
  registrationStartTime: '',
  registrationEndTime: '',
  maxParticipants: 100,
  antiCheatThreshold: 0.8,
  checkPointCount: 3,
  groups: [{ name: '', description: '', capacity: 100, minRating: 0, maxRating: 9999 }] as {
    id?: number
    name: string
    description?: string
    capacity: number
    minRating?: number
    maxRating?: number
  }[]
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入竞赛标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入竞赛描述', trigger: 'blur' }],
  type: [{ required: true, message: '请选择竞赛类型', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择竞赛难度', trigger: 'change' }],
  organizer: [{ required: true, message: '请输入主办方', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  registrationStartTime: [{ required: true, message: '请选择报名开始时间', trigger: 'change' }],
  registrationEndTime: [{ required: true, message: '请选择报名结束时间', trigger: 'change' }]
}

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function getDifficultyType(difficulty: string) {
  const map: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger', expert: 'danger' }
  return map[difficulty] || 'info'
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return map[difficulty] || '未知'
}

function getStatusType(status: string) {
  const map: Record<string, string> = { draft: 'info', registering: 'warning', ongoing: 'success', ended: 'info', cancelled: 'danger' }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = { draft: '草稿', registering: '报名中', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }
  return map[status] || '未知'
}

function addGroup() {
  form.groups.push({ name: '', description: '', capacity: 100, minRating: 0, maxRating: 9999 })
}

async function loadData() {
  loading.value = true
  try {
    const res = await getContestList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    contests.value = res.list || []
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

function resetForm() {
  form.id = 0
  form.title = ''
  form.description = ''
  form.type = 'individual'
  form.difficulty = 'medium'
  form.status = 'draft'
  form.organizer = ''
  form.startTime = ''
  form.endTime = ''
  form.registrationStartTime = ''
  form.registrationEndTime = ''
  form.maxParticipants = 100
  form.antiCheatThreshold = 0.8
  form.checkPointCount = 3
  form.groups = [{ name: '', description: '', capacity: 100, minRating: 0, maxRating: 9999 }]
}

function handleCreate() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: Contest) {
  isEdit.value = true
  form.id = row.id
  form.title = row.title
  form.description = row.description
  form.type = row.type
  form.difficulty = row.difficulty
  form.status = row.status
  form.organizer = row.organizer
  form.startTime = row.startTime
  form.endTime = row.endTime
  form.registrationStartTime = row.registrationStartTime
  form.registrationEndTime = row.registrationEndTime
  form.maxParticipants = row.maxParticipants || 100
  form.antiCheatThreshold = row.antiCheatThreshold ?? 0.8
  form.checkPointCount = row.checkPointCount || 3
  form.groups = row.groups?.length
    ? row.groups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        capacity: g.capacity,
        minRating: g.minRating ?? 0,
        maxRating: g.maxRating ?? 9999
      }))
    : [{ name: '', description: '', capacity: 100, minRating: 0, maxRating: 9999 }]
  dialogVisible.value = true
}

function handleManageProblems(row: Contest) {
  ElMessage.info(`题目管理功能 - 竞赛ID: ${row.id}`)
}

async function handleDelete(row: Contest) {
  try {
    await ElMessageBox.confirm(`确定要删除竞赛「${row.title}」吗？`, '提示', {
      type: 'warning'
    })
    await deleteContest(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    saving.value = true
    const validGroups = form.groups.filter(g => g.name.trim())
    const payload = {
      ...form,
      groups: validGroups.length ? validGroups : undefined
    }
    if (isEdit.value) {
      await updateContest(form.id, payload as any)
      ElMessage.success('更新成功')
    } else {
      await createContest(payload as any)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.groups-input {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .group-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
