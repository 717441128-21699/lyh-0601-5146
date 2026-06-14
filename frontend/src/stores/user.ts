import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm, RegisterForm } from '@/types/user'
import { login, register, getCurrentUser, logout as apiLogout } from '@/api/auth'
import { getToken, setToken, removeToken, setUserInfo, getUserInfo } from '@/utils/auth'
import { UserRole } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())
  const userInfo = ref<User | null>(getUserInfo<User>())
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => userInfo.value?.role)
  const isAdmin = computed(() => userInfo.value?.role === UserRole.ADMIN)
  const isJudge = computed(() => userInfo.value?.role === UserRole.JUDGE)
  const isParticipant = computed(() => userInfo.value?.role === UserRole.PARTICIPANT)

  async function handleLogin(form: LoginForm) {
    loading.value = true
    try {
      const res = await login(form)
      token.value = res.accessToken
      userInfo.value = res.user
      setToken(res.accessToken)
      setUserInfo(res.user)
      return res
    } finally {
      loading.value = false
    }
  }

  async function handleRegister(form: RegisterForm) {
    loading.value = true
    try {
      return await register(form)
    } finally {
      loading.value = false
    }
  }

  async function fetchUserInfo() {
    try {
      const res = await getCurrentUser()
      userInfo.value = res
      setUserInfo(res)
      return res
    } catch (error) {
      return null
    }
  }

  async function handleLogout() {
    try {
      await apiLogout()
    } catch (error) {
    } finally {
      token.value = null
      userInfo.value = null
      removeToken()
    }
  }

  function updateUserInfo(user: Partial<User>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...user }
      setUserInfo(userInfo.value)
    }
  }

  return {
    token,
    userInfo,
    loading,
    isLoggedIn,
    role,
    isAdmin,
    isJudge,
    isParticipant,
    handleLogin,
    handleRegister,
    fetchUserInfo,
    handleLogout,
    updateUserInfo
  }
})
