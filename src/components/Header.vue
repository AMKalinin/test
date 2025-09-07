<template>
  <header class="header">
    <div class="header-left">
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <i class="ri-menu-line"></i>
      </button>
      
      <div class="search-bar">
        <i class="ri-search-line"></i>
        <input
          type="text"
          :placeholder="$t('header.searchPlaceholder')"
          v-model="searchQuery"
        />
      </div>
    </div>
    
    <div class="header-right">
      <LanguageSwitcher />
      
      <button class="theme-toggle" @click="toggleTheme">
        <i :class="themeStore.isDark ? 'ri-sun-line' : 'ri-moon-line'"></i>
      </button>
      
      <div class="notification-icon" @click="toggleNotifications">
        <i class="ri-notification-3-line"></i>
        <span class="notification-badge" v-if="notificationCount > 0">
          {{ notificationCount }}
        </span>
      </div>
      
      <div class="user-profile" @click="toggleUserMenu">
        <div class="user-avatar">АП</div>
        <div class="user-info">
          <div class="user-name">{{ userStore.currentUser?.name || 'Пользователь' }}</div>
          <div class="user-role">{{ $t('header.personalAccount') }}</div>
        </div>
        <i class="ri-arrow-down-s-line"></i>
      </div>
      
      <!-- Notifications dropdown -->
      <div v-if="showNotifications" class="notifications-dropdown">
        <div class="notifications-header">
          <h3>{{ $t('header.notifications') }}</h3>
          <button @click="markAllAsRead" class="mark-read-btn">
            {{ $t('header.markAllRead') }}
          </button>
        </div>
        <div class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
          >
            <div class="notification-icon">
              <i :class="notification.icon"></i>
            </div>
            <div class="notification-content">
              <p class="notification-text">{{ notification.text }}</p>
              <span class="notification-time">{{ notification.time }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- User menu dropdown -->
      <div v-if="showUserMenu" class="user-menu-dropdown">
        <a href="#" class="menu-item">
          <i class="ri-user-line"></i>
          {{ $t('header.profile') }}
        </a>
        <a href="#" class="menu-item">
          <i class="ri-settings-3-line"></i>
          {{ $t('nav.settings') }}
        </a>
        <a href="#" class="menu-item">
          <i class="ri-question-line"></i>
          {{ $t('header.help') }}
        </a>
        <div class="menu-divider"></div>
        <a href="#" class="menu-item">
          <i class="ri-logout-circle-line"></i>
          {{ $t('header.logout') }}
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useUserStore } from '../stores/user'
import LanguageSwitcher from './LanguageSwitcher.vue'

const emit = defineEmits(['toggle-mobile-menu'])

const themeStore = useThemeStore()
const userStore = useUserStore()
const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)

const notifications = ref([
  {
    id: '1',
    text: 'Превышен бюджет на развлечения на 10%',
    time: '2 мин. назад',
    icon: 'ri-alert-line',
    read: false
  },
  {
    id: '2',
    text: 'Пополнение счета на 25,000 ₽',
    time: '1 час назад',
    icon: 'ri-money-dollar-circle-line',
    read: false
  },
  {
    id: '3',
    text: 'Достигнуто 75% бюджета на транспорт',
    time: '3 часа назад',
    icon: 'ri-car-line',
    read: true
  }
])

const notificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleMobileMenu = () => {
  emit('toggle-mobile-menu')
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.notification-icon') && !target.closest('.notifications-dropdown')) {
    showNotifications.value = false
  }
  if (!target.closest('.user-profile') && !target.closest('.user-menu-dropdown')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  height: 64px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-3xl);
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--color-surface-alt);
  border-radius: var(--radius);
  padding: var(--spacing-sm) var(--spacing);
  width: 300px;
}

.search-bar i {
  color: var(--color-text-muted);
  margin-right: var(--spacing);
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background-color: var(--color-surface-alt);
  color: var(--color-text-primary);
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.notification-icon:hover {
  background-color: var(--color-surface-alt);
}

.notification-icon i {
  font-size: 20px;
  color: var(--color-text-secondary);
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: var(--color-error);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius);
  transition: all 0.2s ease;
  gap: var(--spacing);
}

.user-profile:hover {
  background-color: var(--color-surface-alt);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-role {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.notifications-dropdown,
.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  min-width: 300px;
  z-index: 1000;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.notifications-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mark-read-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: var(--spacing);
  border-bottom: 1px solid var(--color-border-light);
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: var(--color-surface-alt);
}

.notification-item.unread {
  background-color: var(--color-primary-light);
}

.notification-item .notification-icon {
  margin-right: var(--spacing);
  padding: 0;
}

.notification-content {
  flex: 1;
}

.notification-text {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: var(--spacing) var(--spacing-lg);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color 0.2s ease;
  gap: var(--spacing);
}

.menu-item:hover {
  background-color: var(--color-surface-alt);
}

.menu-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--spacing-sm) 0;
}

@media (max-width: 768px) {
  .header {
    padding: 0 var(--spacing-lg);
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .search-bar {
    width: 150px;
  }
  
  .search-bar input {
    font-size: 12px;
  }
  
  .user-info {
    display: none;
  }
  
  .header-right {
    gap: var(--spacing);
  }
  
  .notifications-dropdown,
  .user-menu-dropdown {
    min-width: 250px;
    right: var(--spacing);
    left: var(--spacing);
    width: auto;
  }
}
</style>