import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import authService from '../services/authService.js'

const routes = [
  { 
    path: '/login', 
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/', 
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/dashboard', 
    name: 'DashboardAlt',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach(async (to, from, next) => {
  // tunggu auth siap pada refresh agar tidak false negative
  await authService.ready()
  const isAuthenticated = authService.isAuthenticated()
  
  // If route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // If route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router
