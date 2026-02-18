import { createRouter, createWebHistory } from 'vue-router'
import SheetPage from '@/pages/SheetPage.vue'
import SeparatePage from '@/pages/SeparatePage.vue'
import ExtractPage from '@/pages/ExtractPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'sheet',
      component: SheetPage,
    },
    {
      path: '/separate',
      name: 'separate',
      component: SeparatePage,
    },
    {
      path: '/extract',
      name: 'extract',
      component: ExtractPage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
