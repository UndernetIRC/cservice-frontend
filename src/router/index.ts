import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  console.log('Route navigation to:', to.path, 'requires admin:', to.meta.requiresAdmin)

  // Check authentication status
  const isAuthenticated = await authStore.checkAuth()
  console.log('Is authenticated:', isAuthenticated)

  // If route requires auth and user is not authenticated, redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // If route requires admin and user is not admin, redirect to dashboard
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.log('User is not admin, redirecting to dashboard')
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
