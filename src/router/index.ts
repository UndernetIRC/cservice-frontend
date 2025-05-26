import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignUpView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/activate',
    name: 'activate',
    component: () => import('@/views/ActivateView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/channels',
    name: 'channels',
    component: () => import('@/views/ChannelsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin-layout',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        redirect: { name: 'admin-roles' },
      },
      {
        path: 'roles',
        name: 'admin-roles',
        component: () => import('@/views/admin/RolesView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  console.log('Route navigation to:', to.path, 'requires admin:', to.meta.requiresAdmin)

  // Check authentication status
  const isAuthenticated = await authStore.checkAuth()
  console.log('Is authenticated:', isAuthenticated)

  // Auto-redirect authenticated users away from the landing page
  if (to.name === 'landing' && isAuthenticated) {
    console.log('User already logged in, redirecting to dashboard')
    next({ name: 'dashboard' })
    return
  }

  // If route requires auth and user is not authenticated, redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // If route requires admin and user is not admin, redirect to dashboard
  console.log(
    '[Router Guard] Checking admin requirement. UserInfo:',
    JSON.parse(JSON.stringify(authStore.userInfo || null)),
  )
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.log(
      '[Router Guard] User is not admin (or userInfo not ready), redirecting to dashboard',
    )
    next({ name: 'dashboard' })
    return
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (to.name === 'login' && isAuthenticated) {
    console.log('User is already logged in, redirecting to dashboard')
    next({ name: 'dashboard' })
    return
  }

  // Otherwise, proceed with navigation
  console.log('Proceeding with navigation')
  next()
})

export default router
