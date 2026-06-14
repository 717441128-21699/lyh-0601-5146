<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand-info">
          <el-icon :size="64" color="#fff"><Trophy /></el-icon>
          <h1 class="brand-title">编程竞赛平台</h1>
          <p class="brand-desc">专业的在线编程竞赛系统，支持算法竞赛、团队赛等多种形式</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Lightning /></el-icon>
            <span>高性能评测引擎</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Shield /></el-icon>
            <span>智能反作弊系统</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><DataLine /></el-icon>
            <span>实时排行榜</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Award /></el-icon>
            <span>电子证书颁发</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="form-wrapper">
          <h2 class="form-title">
            {{ activeTab === 'login' ? '欢迎回来' : '创建账户' }}
          </h2>
          <p class="form-subtitle">
            {{ activeTab === 'login' ? '请登录您的账户' : '加入我们，开始编程之旅' }}
          </p>

          <el-tabs v-model="activeTab" class="login-tabs" @tab-change="handleTabChange">
            <el-tab-pane label="登录" name="login" />
            <el-tab-pane label="注册" name="register" />
          </el-tabs>

          <el-form
            ref="formRef"
            v-if="activeTab === 'login'"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            @submit.prevent="handleLogin"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              </div>
            </el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="userStore.loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form>

          <el-form
            ref="registerFormRef"
            v-else
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            @submit.prevent="handleRegister"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="registerForm.nickname"
                placeholder="请输入昵称"
                size="large"
                :prefix-icon="UserFilled"
              />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                size="large"
                :prefix-icon="Message"
              />
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-radio-group v-model="registerForm.role" size="large">
                <el-radio-button value="participant">参赛者</el-radio-button>
                <el-radio-button value="judge">评委</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input
                v-model="registerForm.realName"
                placeholder="请输入真实姓名"
                size="large"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码（至少6位）"
                size="large"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="userStore.loading"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'
import type { LoginForm, RegisterForm } from '@/types/user'
import {
  User,
  UserFilled,
  Lock,
  Message
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const activeTab = ref<'login' | 'register'>('login')
const formRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  rememberMe: false
})

const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  nickname: '',
  role: UserRole.PARTICIPANT,
  realName: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    await userStore.handleLogin(loginForm)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || getDefaultPath()
    router.push(redirect)
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  }
}

async function handleRegister() {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
    await userStore.handleRegister(registerForm)
    ElMessage.success('注册成功，请登录')
    activeTab.value = 'login'
    loginForm.username = registerForm.username
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  }
}

function getDefaultPath() {
  if (userStore.isAdmin) return '/admin'
  if (userStore.isJudge) return '/judge'
  return '/'
}

function handleTabChange() {
  formRef.value?.resetFields()
  registerFormRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1400px;
  margin: auto;
  padding: 40px;
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 60px;
  color: #fff;

  .brand-info {
    margin-bottom: 60px;

    .brand-title {
      font-size: 42px;
      font-weight: 700;
      margin: 20px 0 12px;
    }

    .brand-desc {
      font-size: 16px;
      opacity: 0.85;
      line-height: 1.6;
    }
  }

  .features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      opacity: 0.9;
    }
  }
}

.login-right {
  width: 480px;
  display: flex;
  align-items: center;

  .form-wrapper {
    width: 100%;
    background: #fff;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

    .form-title {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px;
    }

    .form-subtitle {
      font-size: 14px;
      color: #909399;
      margin: 0 0 24px;
    }

    .login-tabs {
      margin-bottom: 24px;

      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }

      :deep(.el-tabs__item) {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .form-options {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }

    .submit-btn {
      width: 100%;
      height: 46px;
      font-size: 16px;
      margin-top: 8px;
    }
  }
}

@media (max-width: 1024px) {
  .login-left {
    display: none;
  }

  .login-right {
    margin: 0 auto;
  }
}
</style>
