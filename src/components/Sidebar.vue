<template>
  <div class="sidebar">
    <div class="logo">
      <div class="logo-icon owl-logo">
        <img src="/photo_2025-09-01_19-56-30.jpg" alt="Finsi" />
      </div>
      <div class="logo-text">Finsi</div>
    </div>
    
    <nav class="nav-menu">
      <router-link
        v-for="item in menuItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.name === item.name }"
      >
        <i :class="item.icon"></i>
        <span>{{ $t(item.labelKey) }}</span>
      </router-link>
    </nav>
    
    <div class="premium-section">
      <div class="plan-badge">{{ $t('sidebar.planFree') }}</div>
      <p class="premium-text">
        {{ $t('sidebar.upgradeToPremium') }}
      </p>
      <button class="premium-btn" @click="showPremiumModal">
        {{ $t('sidebar.upgradeToPremium') }}
        <i class="ri-arrow-right-line"></i>
      </button>
    </div>
    
    <!-- Premium Modal -->
    <div v-if="showPremium" class="modal-overlay" @click="closePremiumModal">
      <div class="modal premium-modal" @click.stop>
        <div class="modal-header">
          <div class="premium-header">
            <div class="premium-icon">
              <i class="ri-vip-crown-fill"></i>
            </div>
            <div>
              <h2>{{ $t('sidebar.premiumModal.title') }}</h2>
              <p>{{ $t('sidebar.premiumModal.subtitle') }}</p>
            </div>
          </div>
          <button class="close-btn" @click="closePremiumModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="premium-price">
            <span class="price-amount">{{ getFinalPrice() }}</span>
            <span v-if="promoDiscount > 0" class="discount-badge">
              -{{ promoDiscount }}%
            </span>
          </div>
          
          <div class="premium-features">
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.unlimited') }}</span>
            </div>
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.analytics') }}</span>
            </div>
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.export') }}</span>
            </div>
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.attachments') }}</span>
            </div>
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.goals') }}</span>
            </div>
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.support') }}</span>
            </div>
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.noAds') }}</span>
            </div>
            <div class="feature-item">
              <i class="ri-check-line"></i>
              <span>{{ $t('sidebar.premiumModal.features.backup') }}</span>
            </div>
          </div>
          
          <div class="promo-section">
            <label class="form-label">{{ $t('sidebar.premiumModal.promoCode') }}</label>
            <div class="promo-input-group">
              <input 
                v-model="promoCode" 
                type="text" 
                class="form-control" 
                :placeholder="$t('sidebar.premiumModal.promoPlaceholder')"
                :disabled="isApplyingPromo"
              />
              <button 
                class="btn btn-secondary" 
                @click="applyPromo"
                :disabled="isApplyingPromo || !promoCode.trim()"
              >
                <i v-if="isApplyingPromo" class="ri-loader-4-line rotating"></i>
                {{ $t('sidebar.premiumModal.applyPromo') }}
              </button>
            </div>
            <p v-if="promoMessage" class="promo-message" :class="{ success: promoDiscount > 0, error: promoDiscount === 0 }">
              {{ promoMessage }}
            </p>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closePremiumModal">
              {{ $t('sidebar.premiumModal.cancel') }}
            </button>
            <button 
              class="btn btn-primary premium-subscribe-btn"
              @click="subscribeToPremium"
              :disabled="isSubscribing"
            >
              <i v-if="isSubscribing" class="ri-loader-4-line rotating"></i>
              <i class="ri-vip-crown-line"></i>
              {{ $t('sidebar.premiumModal.subscribe') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()

const showPremium = ref(false)
const promoCode = ref('')
const isApplyingPromo = ref(false)
const promoMessage = ref('')
const promoDiscount = ref(0)
const isSubscribing = ref(false)

const menuItems = [
  {
    name: 'dashboard',
    path: '/',
    labelKey: 'nav.dashboard',
    icon: 'ri-dashboard-line'
  },
  {
    name: 'accounts',
    path: '/accounts',
    labelKey: 'nav.accounts',
    icon: 'ri-bank-card-line'
  },
  {
    name: 'transactions',
    path: '/transactions',
    labelKey: 'nav.transactions',
    icon: 'ri-exchange-dollar-line'
  },
  {
    name: 'categories',
    path: '/categories',
    labelKey: 'nav.categories',
    icon: 'ri-price-tag-3-line'
  },
  {
    name: 'analytics',
    path: '/analytics',
    labelKey: 'nav.analytics',
    icon: 'ri-bar-chart-box-line'
  },
  {
    name: 'friends',
    path: '/friends',
    labelKey: 'nav.friends',
    icon: 'ri-group-line'
  },
  {
    name: 'projects',
    path: '/projects',
    labelKey: 'nav.projects',
    icon: 'ri-folder-line'
  },
  {
    name: 'settings',
    path: '/settings',
    labelKey: 'nav.settings',
    icon: 'ri-settings-3-line'
  }
]

const showPremiumModal = () => {
  showPremium.value = true
}

const closePremiumModal = () => {
  showPremium.value = false
  promoCode.value = ''
}

const applyPromo = () => {
  if (promoCode.value.trim()) {
    isApplyingPromo.value = true
    promoMessage.value = ''
    
    userStore.validatePromoCode(promoCode.value.trim())
      .then(response => {
        if (response.success) {
          promoDiscount.value = response.data.discount || 0
          promoMessage.value = response.message || t('sidebar.premiumModal.promoApplied')
        } else {
          promoMessage.value = response.message || t('sidebar.premiumModal.promoInvalid')
        }
      })
      .catch(() => {
        promoMessage.value = t('sidebar.premiumModal.promoError')
      })
      .finally(() => {
        isApplyingPromo.value = false
      })
  }
}

const subscribeToPremium = () => {
  isSubscribing.value = true
  
  userStore.subscribeToPremium(promoCode.value.trim() || undefined)
    .then(() => {
      alert(t('sidebar.premiumModal.subscriptionSuccess'))
      closePremiumModal()
    })
    .catch(() => {
      alert(t('sidebar.premiumModal.subscriptionError'))
    })
    .finally(() => {
      isSubscribing.value = false
    })
}

const getFinalPrice = (): string => {
  const basePrice = t('sidebar.premiumModal.price') === '299 ₽/месяц' ? 299 : 9.99
  if (promoDiscount.value > 0) {
    const discountedPrice = basePrice * (1 - promoDiscount.value / 100)
    return t('sidebar.premiumModal.price').includes('₽') 
      ? `${discountedPrice.toFixed(0)} ₽/месяц`
      : `$${discountedPrice.toFixed(2)}/month`
  }
  return t('sidebar.premiumModal.price')
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl) 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-xl) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: var(--spacing);
  font-size: 18px;
}

.owl-logo {
  padding: 0 !important;
  background: none !important;
}

.owl-logo img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  font-weight: bold;
  font-size: 18px;
  color: var(--color-primary);
}

.premium-modal {
  max-width: 500px;
  width: 90%;
}

.premium-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.premium-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ffd700, #ffb300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.premium-price {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
}

.premium-features {
  margin-bottom: var(--spacing-3xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing);
  border-radius: var(--radius);
  background-color: var(--color-surface-alt);
}

.feature-item i {
  color: var(--color-success);
  font-size: 18px;
  flex-shrink: 0;
}

.promo-section {
  margin-bottom: var(--spacing-3xl);
}

.promo-input-group {
  display: flex;
  gap: var(--spacing);
}

.promo-input-group .form-control {
  flex: 1;
}

.premium-subscribe-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: none;
  font-weight: 600;
  font-size: 16px;
  padding: var(--spacing-lg) var(--spacing-3xl);
}

.premium-subscribe-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  transform: translateY(-1px);
}

.discount-badge {
  background-color: var(--color-success);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 600;
  margin-left: var(--spacing);
}

.promo-message {
  margin-top: var(--spacing-sm);
  font-size: 14px;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.promo-message.success {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--color-success);
}

.promo-message.error {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nav-menu {
  flex: 1;
  padding: 0 var(--spacing-sm);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing) var(--spacing-lg);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius);
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-sm);
}

.nav-item:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.nav-item i {
  margin-right: var(--spacing);
  font-size: 20px;
}

.premium-section {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  margin-top: var(--spacing-xl);
}

.plan-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing);
  background-color: var(--color-surface-alt);
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: var(--spacing);
  color: var(--color-text-secondary);
}

.premium-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing);
  line-height: 1.4;
}

.premium-btn {
  width: 100%;
  padding: var(--spacing) var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.premium-btn:hover {
  background-color: var(--color-primary-dark);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>