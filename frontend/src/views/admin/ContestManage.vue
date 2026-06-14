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
      <el-table-column label="竞赛名称" prop="title" min-width="200">
        <template #default="{ row }">
          <el-link type="primary">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.type === 'individual' ? '个人赛' : '团队赛' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="170">
        <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" width="170">
        <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="参赛人数" width="100" align="center" prop="participantCount" />
      <el-table-column label="题目数" width="80" align="center" prop="problemCount" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" link size="small" @click="handleManageProblems(row)">题目管理</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑竞赛' : '新建竞赛'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="竞赛名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入竞赛名称" />
        </el-form-item>
        <el-form-item label="竞赛类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="individual">个人赛</el-radio>
            <el-radio value="team">团队赛</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="竞赛描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入竞赛描述" />
        </el-form-item>
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
        <el-form-item label="最大人数">
          <el-input-number v-model="form.maxParticipants" :min="0" placeholder="不限" style="width: 100%" />
        </el-form-item>
        <el-form-item label="竞赛组别">
          <div class="groups-input">
            <div v-for="(group, index) in form.groups" :key="index" class="group-item">
              <el-input v-model="group.name" placeholder="组别名称" style="flex: 1;" />
              <el-input v-model="group.description" placeholder="描述（可选）" style="flex: 1; margin: 0 8px;" />
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
  type: 'individual',
  startTime: '',
  endTime: '',
  registrationStartTime: '',
  registrationEndTime: '',
  maxParticipants: 100,
  groups: [{ name: '', description: '' }] as { name: string; description?: string }[]
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入竞赛名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入竞赛描述', trigger: 'blur' }],
  type: [{ required: true, message: '请选择竞赛类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  registrationStartTime: [{ required: true, message: '请选择报名开始时间', trigger: 'change' }],
  registrationEndTime: [{ required: true, message: '请选择报名结束时间', trigger: 'change' }]
}

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function getStatusType(status: string) {
  const map: Record<string, string> = { upcoming: 'warning', ongoing: 'success', ended: 'info' }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = { upcoming: '即将开始', ongoing: '进行中', ended: '已结束' }
  return map[status] || '未知'
}

function addGroup() {
  form.groups.push({ name: '', description: '' })
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
  form.startTime = ''
  form.endTime = ''
  form.registrationStartTime = ''
  form.registrationEndTime = ''
  form.maxParticipants = 100
  form.groups = [{ name: '', description: '' }]
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
  form.startTime = row.startTime
  form.endTime = row.endTime
  form.registrationStartTime = row.registrationStartTime
  form.registrationEndTime = row.registrationEndTime
  form.maxParticipants = row.maxParticipants || 100
  form.groups = row.groups?.length ? row.groups.map(g => ({ name: g.name, description: g.description })) : [{ name: '', description: '' }]
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
    const payload = { ...form, groups: validGroups.length ? validGroups : undefined }
    if (isEdit.value) {
      await updateContest(form.id, payload)
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
