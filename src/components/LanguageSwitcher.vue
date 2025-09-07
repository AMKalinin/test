<template>
  <div class="language-switcher">
    <button 
      class="language-btn" 
      @click="toggleDropdown"
      :class="{ active: showDropdown }"
    >
      <span class="current-code">{{ getCurrentCode() }}</span>
      <i class="ri-arrow-down-s-line" :class="{ rotated: showDropdown }"></i>
    </button>
    
    <div v-if="showDropdown" class="language-dropdown">
      <button
        v-for="locale in localeStore.availableLocales"
        :key="locale.code"
        class="language-option"
        :class="{ active: locale.code === localeStore.currentLocale }"
        @click="selectLanguage(locale.code)"
      >
        <span class="flag">{{ locale.flag }}</span>
        <span class="name">{{ locale.name }}</span>
        <i v-if="locale.code === localeStore.currentLocale" class="ri-check-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocaleStore } from '../stores/locale'

const localeStore = useLocaleStore()
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectLanguage = (code: string) => {
  localeStore.setLocale(code)
  showDropdown.value = false
}

const getCurrentCode = () => {
  return localeStore.currentLocale.toUpperCase()
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.language-switcher')) {
    showDropdown.value = false
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
.language-switcher {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.language-btn:hover,
.language-btn.active {
  background-color: var(--color-surface-alt);
  border-color: var(--color-primary);
}

.current-code {
  font-weight: 500;
  font-size: 14px;
}

.language-btn i {
  font-size: 16px;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.language-btn i.rotated {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  z-index: 1000;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing) var(--spacing-lg);
  width: 100%;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.language-option:hover {
  background-color: var(--color-surface-alt);
}

.language-option.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.flag {
  font-size: 16px;
}

.name {
  flex: 1;
  text-align: left;
}

.language-option i {
  color: var(--color-primary);
  font-size: 16px;
}
</style>