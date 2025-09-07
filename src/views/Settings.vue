<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1>{{ $t('settings.title') }}</h1>
        <p class="subtitle">{{ $t('settings.subtitle') }}</p>
      </div>
    </div>

    <div class="settings-content">
      <div class="settings-section card">
        <div class="section-header">
          <h3>{{ $t('settings.sections.appearance') }}</h3>
          <p>{{ $t('settings.appearance.themeDesc') }}</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.appearance.theme') }}</div>
            <div class="setting-description">{{ $t('settings.appearance.themeDesc') }}</div>
          </div>
          <div class="theme-toggle" @click="toggleTheme">
            <div class="toggle-option" :class="{ active: !themeStore.isDark }">
              <i class="ri-sun-line"></i>
              {{ $t('settings.appearance.light') }}
            </div>
            <div class="toggle-option" :class="{ active: themeStore.isDark }">
              <i class="ri-moon-line"></i>
              {{ $t('settings.appearance.dark') }}
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.appearance.language') }}</div>
            <div class="setting-description">{{ $t('settings.appearance.languageDesc') }}</div>
          </div>
          <select v-model="selectedLocale" @change="changeLocale" class="form-control">
            <option 
              v-for="locale in localeStore.availableLocales" 
              :key="locale.code" 
              :value="locale.code"
            >
              {{ locale.flag }} {{ locale.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="settings-section card">
        <div class="section-header">
          <h3>{{ $t('settings.sections.notifications') }}</h3>
          <p>{{ $t('settings.notifications.pushDesc') }}</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.notifications.push') }}</div>
            <div class="setting-description">{{ $t('settings.notifications.pushDesc') }}</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settings.pushNotifications" />
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.notifications.budget') }}</div>
            <div class="setting-description">{{ $t('settings.notifications.budgetDesc') }}</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settings.budgetAlerts" />
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.notifications.weekly') }}</div>
            <div class="setting-description">{{ $t('settings.notifications.weeklyDesc') }}</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settings.weeklyReports" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section card">
        <div class="section-header">
          <h3>{{ $t('settings.sections.currency') }}</h3>
          <p>{{ $t('settings.currency.defaultDesc') }}</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.currency.default') }}</div>
            <div class="setting-description">{{ $t('settings.currency.defaultDesc') }}</div>
          </div>
          <select v-model="settings.defaultCurrency" class="form-control">
            <option value="RUB">₽ Российский рубль</option>
            <option value="USD">$ Доллар США</option>
            <option value="EUR">€ Евро</option>
          </select>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.currency.dateFormat') }}</div>
            <div class="setting-description">{{ $t('settings.currency.dateFormatDesc') }}</div>
          </div>
          <select v-model="settings.dateFormat" class="form-control">
            <option value="dd.mm.yyyy">ДД.ММ.ГГГГ</option>
            <option value="mm/dd/yyyy">ММ/ДД/ГГГГ</option>
            <option value="yyyy-mm-dd">ГГГГ-ММ-ДД</option>
          </select>
        </div>
      </div>

      <div class="settings-section card">
        <div class="section-header">
          <h3>{{ $t('settings.sections.security') }}</h3>
          <p>{{ $t('settings.security.twoFactorDesc') }}</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.security.autoLogout') }}</div>
            <div class="setting-description">{{ $t('settings.security.autoLogoutDesc') }}</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settings.autoLogout" />
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.security.twoFactor') }}</div>
            <div class="setting-description">{{ $t('settings.security.twoFactorDesc') }}</div>
          </div>
          <button class="btn btn-primary">
            {{ $t('settings.security.setup2FA') }}
          </button>
        </div>
      </div>

      <div class="settings-section card">
        <div class="section-header">
          <h3>{{ $t('settings.sections.data') }}</h3>
          <p>{{ $t('settings.data.exportDesc') }}</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.data.export') }}</div>
            <div class="setting-description">{{ $t('settings.data.exportDesc') }}</div>
          </div>
          <button class="btn btn-secondary">
            <i class="ri-download-line"></i>
            {{ $t('settings.data.exportBtn') }}
          </button>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ $t('settings.data.autoBackup') }}</div>
            <div class="setting-description">{{ $t('settings.data.autoBackupDesc') }}</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settings.autoBackup" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn btn-primary" @click="saveSettings">
          <i class="ri-save-line"></i>
          {{ $t('settings.saveSettings') }}
        </button>
        <button class="btn btn-secondary" @click="resetSettings">
          {{ $t('settings.resetSettings') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useLocaleStore } from '../stores/locale'

const themeStore = useThemeStore()
const localeStore = useLocaleStore()

const selectedLocale = ref(localeStore.currentLocale)

const settings = reactive({
  pushNotifications: true,
  budgetAlerts: true,
  weeklyReports: false,
  defaultCurrency: 'RUB',
  dateFormat: 'dd.mm.yyyy',
  autoLogout: false,
  autoBackup: true
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const changeLocale = () => {
  localeStore.setLocale(selectedLocale.value)
}

const saveSettings = () => {
  // Сохранить настройки
  localStorage.setItem('app-settings', JSON.stringify(settings))
  
  // Показать уведомление об успехе
  alert($t('settings.settingsSaved'))
}

const resetSettings = () => {
  if (confirm($t('settings.confirmReset'))) {
    settings.pushNotifications = true
    settings.budgetAlerts = true
    settings.weeklyReports = false
    settings.defaultCurrency = 'RUB'
    settings.dateFormat = 'dd.mm.yyyy'
    settings.autoLogout = false
    settings.autoBackup = true
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-3xl);
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.settings-section {
  padding: var(--spacing-2xl);
}

.section-header {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.section-header p {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: var(--spacing-lg);
}

.setting-label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 16px;
  margin-bottom: var(--spacing-xs);
}

.setting-description {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.theme-toggle {
  display: flex;
  background-color: var(--color-surface-alt);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
  cursor: pointer;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing);
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.toggle-option.active {
  background-color: var(--color-primary);
  color: white;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.form-control {
  min-width: 180px;
  padding: var(--spacing-sm) var(--spacing);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 14px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }
  
  .setting-info {
    margin-right: 0;
    width: 100%;
  }
  
  .settings-actions {
    flex-direction: column;
    gap: var(--spacing);
  }
  
  .form-control {
    min-width: auto;
    width: 100%;
  }
  
  .theme-toggle {
    width: 100%;
  }
  
  .toggle-option {
    flex: 1;
    justify-content: center;
  }
}
</style>