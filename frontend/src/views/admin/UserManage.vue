<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <div>
        <el-select v-model="roleFilter" placeholder="角色筛选" style="width: 140px; margin-right: 12px;">
          <el-option label="全部" value="" />
          <el-option label="参赛者" value="PARTICIPANT" />
          <el-option label="评委" value="JUDGE" />
          <el-option label="管理员" value="ADMIN" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 140px; margin-right: 12px;">
          <el-option label="全部" value="" />
          <el-option label="正常" value="active" />
          <el-option label="已禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
      </div>
    </div>

    <DataTable
      :data="users"
      :loading="loading"
      :total="total"
      :show-search="true"
      search-placeholder="搜索用户名/昵称/邮箱"
      @search="handleSearch"
      @page-change="handlePageChange"
    >
      <el-table-column label="ID" prop="id" width="70" align="center" />
      <el-table-column label="头像" width="70" align="center">
        <template #default="{ row }">
          <el-avatar :size="36" :src="row.avatar" :style="{ backgroundColor: '#409EFF', color: '#fff' }">
            {{ row.nickname?.charAt(0) || row.username?.charAt(0) }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" width="130" />
      <el-table-column label="昵称" prop="nickname" width="130" />
      <el-table-column label="邮箱" prop="email" min-width="180" />
      <el-table-column label="角色" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getRoleTag(row.role)" size="small">{{ getRoleText(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status === 'active'" @change="(val) => handleToggleStatus(row, val)" />
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" link size="small" @click="handleResetPwd(row)">重置密码</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%;">
            <el-option label="参赛者" value="PARTICIPANT" />
            <el-option label="评委" value="JUDGE" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
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
import { getUserList, createUser, updateUser, deleteUser, resetUserPassword, disableUser, enableUser } from '@/api/user'
import DataTable from '@/components/DataTable.vue'
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import type { User } from '@/types/user'
import dayjs from 'dayjs'

const loading = ref(false)
const saving = ref(false)
const users = ref<User[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const keyword = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

const form = reactive({
  id: 0,
  username: '',
  nickname: '',
  email: '',
  role: 'PARTICIPANT',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function getRoleTag(role: string) {
  const map: Record<string, string> = { PARTICIPANT: 'success', JUDGE: 'warning', ADMIN: 'danger' }
  return map[role] || 'info'
}

function getRoleText(role: string) {
  const map: Record<string, string> = { PARTICIPANT: '参赛者', JUDGE: '评委', ADMIN: '管理员' }
  return map[role] || '未知'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getUserList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      role: roleFilter.value || undefined,
      status: statusFilter.value || undefined
    })
    users.value = res.list || []
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
  form.username = ''
  form.nickname = ''
  form.email = ''
  form.role = 'PARTICIPANT'
  form.password = ''
}

function handleAddUser() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: User) {
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.nickname = row.nickname
  form.email = row.email
  form.role = row.role
  dialogVisible.value = true
}

async function handleToggleStatus(row: User, active: boolean) {
  try {
    if (active) {
      await enableUser(row.id)
    } else {
      await disableUser(row.id)
    }
    ElMessage.success(active ? '已启用' : '已禁用')
  } catch (e) {
    row.status = active ? 'disabled' : 'active'
  }
}

async function handleResetPwd(row: User) {
  try {
    const newPwd = Math.random().toString(36).slice(-8)
    await ElMessageBox.confirm(
      `将为用户「${row.username}」重置密码为：${newPwd}，确定吗？`,
      '重置密码',
      { type: 'warning' }
    )
    await resetUserPassword(row.id, newPwd)
    ElMessage.success(`重置成功，新密码：${newPwd}`)
  } catch (e) {
  }
}

async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？`, '提示', {
      type: 'warning'
    })
    await deleteUser(row.id)
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
    if (isEdit.value) {
      await updateUser(form.id, { nickname: form.nickname, email: form.email, role: form.role })
      ElMessage.success('更新成功')
    } else {
      await createUser(form as any)
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
