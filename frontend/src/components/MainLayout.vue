<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo" @click="goHome">
        <el-icon :size="28" color="#409EFF"><Trophy /></el-icon>
        <span v-show="!isCollapse" class="logo-text">编程竞赛平台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#409EFF"
      >
        <template v-for="item in menuItems" :key="item.index">
          <el-menu-item :index="item.index" v-if="!item.children">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
          <el-sub-menu :index="item.index" v-else>
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.index" :index="child.index">
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" :size="20" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
            <el-button text @click="goNotifications">
              <el-icon :size="20"><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                {{ userStore.userInfo?.nickname?.charAt(0) || userStore.userInfo?.username?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getUnreadCount } from '@/api/notification'
import { UserRole } from '@/types/user'
import { ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const unreadCount = ref(0)

const activeMenu = computed(() => route.path)

const menuItems = computed(() => {
  if (userStore.isAdmin) {
    return [
      { index: '/admin', title: '管理首页', icon: 'DataAnalysis' },
      { index: '/admin/contests', title: '竞赛管理', icon: 'Trophy' },
      { index: '/admin/users', title: '用户管理', icon: 'User' },
      { index: '/admin/anti-cheat', title: '反作弊检测', icon: 'Warning' },
      { index: '/admin/reports', title: '运营报表', icon: 'PieChart' },
      { index: '/admin/config', title: '系统配置', icon: 'Setting' },
      { index: '/admin/notifications', title: '消息通知', icon: 'Bell' }
    ]
  }
  if (userStore.isJudge) {
    return [
      { index: '/judge', title: '评委首页', icon: 'DataAnalysis' },
      { index: '/judge/pending', title: '待评分列表', icon: 'EditPen' },
      { index: '/judge/notifications', title: '消息通知', icon: 'Bell' }
    ]
  }
  return [
    { index: '/', title: '工作台', icon: 'HomeFilled' },
    { index: '/contests', title: '竞赛列表', icon: 'Trophy' },
    { index: '/submissions', title: '我的提交', icon: 'Document' },
    { index: '/ranking', title: '排行榜', icon: 'Medal' },
    { index: '/certificates', title: '我的证书', icon: 'Award' },
    { index: '/notifications', title: '消息通知', icon: 'Bell' }
  ]
})

const breadcrumbs = computed(() => {
  const crumbs: { path: string; title: string }[] = []
  const matched = route.matched.filter(r => r.meta && r.meta.title)
  matched.forEach(r => {
    crumbs.push({
      path: r.path,
      title: r.meta.title as string
    })
  })
  return crumbs.length > 0 ? crumbs : [{ path: '/', title: '首页' }]
})

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

function goHome() {
  const path = userStore.isAdmin ? '/admin' : userStore.isJudge ? '/judge' : '/'
  router.push(path)
}

function goNotifications() {
  const path = userStore.isAdmin ? '/admin/notifications' : userStore.isJudge ? '/judge/notifications' : '/notifications'
  router.push(path)
}

async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.count
  } catch (error) {
  }
}

async function handleUserCommand(command: string) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.handleLogout()
      router.push('/login')
    } catch (error) {
    }
  } else if (command === 'profile') {
    router.push('/notifications')
  }
}

onMounted(() => {
  fetchUnreadCount()
})
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: #001529;
  transition: width 0.2s;
  overflow: hidden;

  :deep(.el-menu) {
    border-right: none;
  }
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid #1f3a5c;

  .logo-text {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    white-space: nowrap;
  }
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;

  .collapse-btn {
    cursor: pointer;
    color: #606266;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;

  .notification-badge {
    .el-button {
      padding: 8px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .username {
      font-size: 14px;
      color: #303133;
    }
  }
}

.main-content {
  background: #f0f2f5;
  padding: 0;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
