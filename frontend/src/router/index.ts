import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'

NProgress.configure({ showSpinner: false })

const participantRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'ParticipantDashboard',
    component: () => import('@/views/participant/Dashboard.vue'),
    meta: { title: '工作台' }
  },
  {
    path: 'contests',
    name: 'ParticipantContestList',
    component: () => import('@/views/participant/ContestList.vue'),
    meta: { title: '竞赛列表' }
  },
  {
    path: 'contests/:id',
    name: 'ParticipantContestDetail',
    component: () => import('@/views/participant/ContestDetail.vue'),
    meta: { title: '竞赛详情' }
  },
  {
    path: 'problems/:id',
    name: 'ParticipantProblemDetail',
    component: () => import('@/views/participant/ProblemDetail.vue'),
    meta: { title: '题目详情' }
  },
  {
    path: 'submissions',
    name: 'ParticipantMySubmissions',
    component: () => import('@/views/participant/MySubmissions.vue'),
    meta: { title: '我的提交' }
  },
  {
    path: 'ranking',
    name: 'ParticipantRanking',
    component: () => import('@/views/participant/Ranking.vue'),
    meta: { title: '排行榜' }
  },
  {
    path: 'certificates',
    name: 'ParticipantCertificates',
    component: () => import('@/views/participant/Certificates.vue'),
    meta: { title: '我的证书' }
  },
  {
    path: 'notifications',
    name: 'ParticipantNotifications',
    component: () => import('@/views/common/NotificationCenter.vue'),
    meta: { title: '消息通知' }
  }
]

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { title: '管理首页' }
  },
  {
    path: 'contests',
    name: 'AdminContestManage',
    component: () => import('@/views/admin/ContestManage.vue'),
    meta: { title: '竞赛管理' }
  },
  {
    path: 'users',
    name: 'AdminUserManage',
    component: () => import('@/views/admin/UserManage.vue'),
    meta: { title: '用户管理' }
  },
  {
    path: 'anti-cheat',
    name: 'AdminAntiCheat',
    component: () => import('@/views/admin/AntiCheat.vue'),
    meta: { title: '反作弊检测' }
  },
  {
    path: 'reports',
    name: 'AdminReportCenter',
    component: () => import('@/views/admin/ReportCenter.vue'),
    meta: { title: '运营报表' }
  },
  {
    path: 'config',
    name: 'AdminSystemConfig',
    component: () => import('@/views/admin/SystemConfig.vue'),
    meta: { title: '系统配置' }
  },
  {
    path: 'notifications',
    name: 'AdminNotifications',
    component: () => import('@/views/common/NotificationCenter.vue'),
    meta: { title: '消息通知' }
  }
]

const judgeRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'JudgeDashboard',
    component: () => import('@/views/judge/Dashboard.vue'),
    meta: { title: '评委首页' }
  },
  {
    path: 'pending',
    name: 'JudgePendingList',
    component: () => import('@/views/judge/PendingList.vue'),
    meta: { title: '待评分列表' }
  },
  {
    path: 'score/:id',
    name: 'JudgeScoreDetail',
    component: () => import('@/views/judge/ScoreDetail.vue'),
    meta: { title: '评分详情' }
  },
  {
    path: 'notifications',
    name: 'JudgeNotifications',
    component: () => import('@/views/common/NotificationCenter.vue'),
    meta: { title: '消息通知' }
  }
]

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: () => import('@/components/MainLayout.vue'),
    children: participantRoutes,
    meta: { requiresAuth: true, roles: [UserRole.PARTICIPANT, UserRole.ADMIN, UserRole.JUDGE] }
  },
  {
    path: '/admin',
    component: () => import('@/components/MainLayout.vue'),
    children: adminRoutes,
    meta: { requiresAuth: true, roles: [UserRole.ADMIN] }
  },
  {
    path: '/judge',
    component: () => import('@/components/MainLayout.vue'),
    children: judgeRoutes,
    meta: { requiresAuth: true, roles: [UserRole.JUDGE, UserRole.ADMIN] }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  document.title = `${to.meta.title || '编程竞赛平台'} - 编程竞赛平台`

  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (!requiresAuth) {
    if (to.path === '/login' && userStore.isLoggedIn) {
      const redirectPath = userStore.isAdmin
        ? '/admin'
        : userStore.isJudge
          ? '/judge'
          : '/'
      next(redirectPath)
      return
    }
    next()
    return
  }

  if (!userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (!userStore.userInfo) {
    await userStore.fetchUserInfo()
  }

  const roles = to.meta.roles as UserRole[] | undefined
  if (roles && userStore.userInfo && !roles.includes(userStore.userInfo.role)) {
    const redirectPath = userStore.isAdmin
      ? '/admin'
      : userStore.isJudge
        ? '/judge'
        : '/'
    next(redirectPath)
    return
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
