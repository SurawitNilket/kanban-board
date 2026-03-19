import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('../views/BoardView.vue'),
    },
    {
      path: '/board/:boardId',
      name: 'board-detail',
      component: () => import('../views/BoardDetailView.vue'),
      props: true,
    },
  ],
})

export default router
