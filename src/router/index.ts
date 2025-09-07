import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Accounts from '../views/Accounts.vue'
import Transactions from '../views/Transactions.vue'
import Categories from '../views/Categories.vue'
import Analytics from '../views/Analytics.vue'
import Settings from '../views/Settings.vue'
import Friends from '../views/Friends.vue'
import Projects from '../views/Projects.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: Accounts
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: Transactions
    },
    
    {
      path: '/categories',
      name: 'categories',
      component: Categories
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/friends',
      name: 'friends',
      component: Friends
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    }
  ]
})

export default router