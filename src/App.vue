<template>
  <div class="app" :class="{ 'mobile-menu-open': mobileMenuOpen }">
    <LoadingSpinner 
      v-if="financeStore.isLoading || userStore.isLoading" 
      overlay 
      :message="$t('common.loading')" 
    />
    
    <Sidebar :class="{ 'mobile-open': mobileMenuOpen }" />
    
    <div class="main-content">
      <Header @toggle-mobile-menu="toggleMobileMenu" />
      
      <main class="content">
        <router-view />
      </main>
    </div>
    
    <div 
      v-if="mobileMenuOpen" 
      class="mobile-overlay" 
      @click="closeMobileMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useThemeStore } from './stores/theme'
import { useLocaleStore } from './stores/locale'
import { useFinanceStore } from './stores/finance'
import { useUserStore } from './stores/user'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const financeStore = useFinanceStore()
const userStore = useUserStore()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

onMounted(() => {
  themeStore.initTheme()
  localeStore.initLocale()
  
  // Загружаем данные пользователя и финансовые данные
  userStore.loadUser()
  financeStore.loadAllData()
})
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: var(--spacing-3xl);
  overflow-x: hidden;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .content {
    padding: var(--spacing-lg);
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .app.mobile-menu-open .mobile-overlay {
    display: block;
  }
  
  .app.mobile-menu-open .sidebar {
    transform: translateX(0);
  }
}
</style>