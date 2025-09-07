<template>
  <div class="friends-page">
    <div class="page-header">
      <div>
        <h1>Друзья</h1>
        <p class="subtitle">Управляйте совместными расходами и долгами</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="ri-user-add-line"></i>
        Добавить друга
      </button>
    </div>

    <div class="search-section">
      <div class="search-bar">
        <i class="ri-search-line"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск друзей..."
        />
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ $t(tab.labelKey) }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="friends-content">
      <div v-if="activeTab === 'all'" class="friends-list">
        <div v-for="friend in filteredFriends" :key="friend.id" class="friend-card card">
          <div class="friend-avatar">
            {{ getInitials(friend.name) }}
          </div>
          <div class="friend-info">
            <div class="friend-name">{{ friend.name }}</div>
            <div class="friend-contact">{{ friend.email || friend.phone }}</div>
            <div v-if="friend.balance !== 0" class="friend-balance" :class="getBalanceClass(friend.balance)">
              {{ getBalanceText(friend.balance) }}
            </div>
          </div>
          <div class="friend-actions">
            <button class="action-btn primary" @click="createSharedTransaction(friend)">
              <i class="ri-exchange-dollar-line"></i>
              {{ $t('friends.sharedTransaction') }}
            </button>
            <button 
              v-if="friend.balance > 0" 
              class="action-btn warning" 
              @click="remindDebt(friend)"
            >
              <i class="ri-notification-2-line"></i>
              {{ $t('friends.remind') }}
            </button>
            <button class="action-btn ghost" @click="showFriendMenu(friend)">
              <i class="ri-more-2-fill"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'requests'" class="requests-list">
        <div class="empty-state">
          <i class="ri-user-add-line"></i>
          <h3>{{ $t('friends.emptyStates.noRequests') }}</h3>
          <p>{{ $t('friends.emptyStates.noRequestsDesc') }}</p>
        </div>
      </div>

      <div v-else class="sent-list">
        <div class="empty-state">
          <i class="ri-send-plane-line"></i>
          <h3>{{ $t('friends.emptyStates.noSent') }}</h3>
          <p>{{ $t('friends.emptyStates.noSentDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- Add Friend Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ $t('friends.addFriend') }}</h2>
          <button class="close-btn" @click="closeModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-tabs">
          <button
            v-for="tab in addTabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ active: selectedAddTab === tab.value }"
            @click="selectedAddTab = tab.value"
          >
            {{ $t(`friends.addTabs.${tab.value}`) }}
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="addFriend">
            <div v-if="selectedAddTab === 'email'" class="form-group">
              <label class="form-label">{{ $t('common.email') }}</label>
              <input 
                v-model="friendForm.email" 
                type="email" 
                class="form-control" 
                :placeholder="$t('friends.placeholders.email')"
                required 
              />
              <p class="form-hint">{{ $t('friends.emailHint') }}</p>
            </div>
            
            <div v-if="selectedAddTab === 'phone'" class="form-group">
              <label class="form-label">{{ $t('common.phone') }}</label>
              <input 
                v-model="friendForm.phone" 
                type="tel" 
                class="form-control" 
                :placeholder="$t('friends.placeholders.phone')"
                required 
              />
              <p class="form-hint">{{ $t('friends.phoneHint') }}</p>
            </div>
            
            <div v-if="selectedAddTab === 'name'" class="form-group">
              <label class="form-label">{{ $t('common.name') }}</label>
              <input 
                v-model="friendForm.name" 
                type="text" 
                class="form-control" 
                :placeholder="$t('friends.placeholders.name')"
                required 
              />
              <p class="form-hint">{{ $t('friends.nameHint') }}</p>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                {{ $t('modal.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ $t('friends.sendInvitation') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Shared Transaction Modal -->
    <div v-if="showSharedModal" class="modal-overlay" @click="closeSharedModal">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h2>Совместная транзакция</h2>
          <button class="close-btn" @click="closeSharedModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-tabs">
          <button
            v-for="tab in transactionTabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ active: selectedTransactionTab === tab.value }"
            @click="selectedTransactionTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="saveSharedTransaction">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Счет</label>
                <select v-model="sharedForm.account" class="form-control" required>
                  <option value="">Выберите счет</option>
                  <option v-for="account in financeStore.accounts" :key="account.id" :value="account.name">
                    {{ account.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Категория</label>
                <select v-model="sharedForm.category" class="form-control" required>
                  <option value="">Выберите категорию</option>
                  <option v-for="category in expenseCategories" :key="category.id" :value="category.name">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Сумма</label>
                <div class="amount-input">
                  <input 
                    v-model="sharedForm.amount" 
                    type="number" 
                    class="form-control" 
                    step="0.01"
                    required 
                  />
                  <span class="currency">₽</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Дата</label>
                <input v-model="sharedForm.date" type="date" class="form-control" required />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Описание</label>
              <textarea 
                v-model="sharedForm.description" 
                class="form-control" 
                rows="2"
                placeholder="Добавьте описание..."
              ></textarea>
            </div>
            
            <div class="attach-section">
              <button type="button" class="attach-btn">
                <i class="ri-attachment-2"></i>
                Прикрепить чек/файл
              </button>
            </div>
            
            <div class="participants-section">
              <h3>Разделить с друзьями</h3>
              
              <div class="participants-list">
                <div class="participant">
                  <div class="participant-avatar">Я</div>
                  <div class="participant-name">Вы</div>
                  <select class="form-control split-method">
                    <option>Поровну</option>
                    <option>Процент</option>
                    <option>Сумма</option>
                  </select>
                  <input type="text" class="form-control split-value" value="50%" disabled />
                  <button type="button" class="remove-btn" disabled>
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
                
                <div v-if="selectedFriend" class="participant">
                  <div class="participant-avatar" :style="{ backgroundColor: '#ff7043' }">
                    {{ getInitials(selectedFriend.name) }}
                  </div>
                  <div class="participant-name">{{ selectedFriend.name }}</div>
                  <select class="form-control split-method">
                    <option>Поровну</option>
                    <option>Процент</option>
                    <option>Сумма</option>
                  </select>
                  <input type="text" class="form-control split-value" value="50%" disabled />
                  <button type="button" class="remove-btn">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
              
              <button type="button" class="add-participant-btn">
                <i class="ri-add-line"></i>
                Добавить участника
              </button>
            </div>
            
            <div class="split-algorithm">
              <h3>Алгоритм разделения</h3>
              
              <div class="split-options">
                <button
                  v-for="option in splitOptions"
                  :key="option.value"
                  type="button"
                  class="split-option"
                  :class="{ active: selectedSplitMethod === option.value }"
                  @click="selectedSplitMethod = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
              
              <div class="chart-container">
                <div class="pie-chart"></div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <div class="legend-color" style="background-color: #5e35b1;"></div>
                    <div>Вы: {{ formatCurrency(sharedForm.amount / 2) }} (50%)</div>
                  </div>
                  <div v-if="selectedFriend" class="legend-item">
                    <div class="legend-color" style="background-color: #ff7043;"></div>
                    <div>{{ selectedFriend.name }}: {{ formatCurrency(sharedForm.amount / 2) }} (50%)</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="summary-section">
              <div class="summary-row total">
                <div>Общая сумма:</div>
                <div>{{ formatCurrency(sharedForm.amount) }}</div>
              </div>
              <div class="summary-row">
                <div>Ваша доля:</div>
                <div>{{ formatCurrency(sharedForm.amount / 2) }}</div>
              </div>
              
              <div v-if="selectedFriend" class="debt-list">
                <div class="debt-item">
                  <div>{{ selectedFriend.name }} должен вам:</div>
                  <div>{{ formatCurrency(sharedForm.amount / 2) }}</div>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeSharedModal">
                Отмена
              </button>
              <button type="submit" class="btn btn-primary">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceStore, type Friend } from '../stores/finance'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const financeStore = useFinanceStore()

const activeTab = ref('all')
const searchQuery = ref('')
const showAddModal = ref(false)
const showSharedModal = ref(false)
const selectedAddTab = ref('email')
const selectedTransactionTab = ref('expense')
const selectedSplitMethod = ref('equal')
const selectedFriend = ref<Friend | null>(null)

const friendForm = ref({
  name: '',
  email: '',
  phone: ''
})

const sharedForm = ref({
  account: '',
  category: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  description: ''
})

const tabs = [
  { labelKey: 'friends.tabs.all', value: 'all' },
  { labelKey: 'friends.tabs.requests', value: 'requests', badge: 3 },
  { labelKey: 'friends.tabs.sent', value: 'sent' }
]

const addTabs = [
  { value: 'email' },
  { value: 'phone' },
  { value: 'name' }
]

const transactionTabs = [
  { label: 'Расход', value: 'expense' },
  { label: 'Доход', value: 'income' },
  { label: 'Перевод', value: 'transfer' }
]

const splitOptions = [
  { label: 'Поровну', value: 'equal' },
  { label: 'Пропорционально', value: 'percentage' },
  { label: 'Указать суммы', value: 'amount' }
]

const filteredFriends = computed(() => {
  if (!searchQuery.value) return financeStore.friends
  
  return financeStore.friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    friend.phone?.includes(searchQuery.value)
  )
})

const expenseCategories = computed(() => {
  return financeStore.categories.filter(c => c.type === 'expense')
})

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getBalanceClass = (balance: number): string => {
  return balance > 0 ? 'positive' : 'negative'
}

const getBalanceText = (balance: number): string => {
  if (balance > 0) {
    return `${t('friends.owesYou')} ${formatCurrency(balance)}`
  } else {
    return `${t('friends.youOwe')} ${formatCurrency(Math.abs(balance))}`
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const createSharedTransaction = (friend: Friend) => {
  selectedFriend.value = friend
  showSharedModal.value = true
}

const remindDebt = (friend: Friend) => {
  alert(`Напоминание отправлено ${friend.name}`)
}

const showFriendMenu = (friend: Friend) => {
  // Показать контекстное меню
}

const addFriend = () => {
  const newFriend = {
    name: friendForm.value.name || 'Новый друг',
    email: friendForm.value.email,
    phone: friendForm.value.phone,
    status: 'sent' as const,
    balance: 0
  }
  
  financeStore.addFriend(newFriend)
    .then(() => {
      closeModal()
    })
    .catch(() => {
      alert('Ошибка добавления друга')
    })
}

const saveSharedTransaction = () => {
  // Сохранить совместную транзакцию
  closeSharedModal()
}

const closeModal = () => {
  showAddModal.value = false
  friendForm.value = {
    name: '',
    email: '',
    phone: ''
  }
}

const closeSharedModal = () => {
  showSharedModal.value = false
  selectedFriend.value = null
  sharedForm.value = {
    account: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  }
}
</script>

<style scoped>
.friends-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.search-section {
  margin-bottom: var(--spacing-xl);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--spacing) var(--spacing-lg);
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
  color: var(--color-text-primary);
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-3xl);
}

.tab {
  padding: var(--spacing-lg) var(--spacing-xl);
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab:hover:not(.active) {
  color: var(--color-text-primary);
}

.tab-badge {
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.friend-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-xl);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.friend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-right: var(--spacing-lg);
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.friend-contact {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.friend-balance {
  font-size: 14px;
  font-weight: 500;
}

.friend-balance.positive {
  color: var(--color-success);
}

.friend-balance.negative {
  color: var(--color-error);
}

.friend-actions {
  display: flex;
  gap: var(--spacing);
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all 0.2s ease;
  border: none;
}

.action-btn.primary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.action-btn.primary:hover {
  background-color: rgba(26, 93, 66, 0.2);
}

.action-btn.warning {
  background-color: rgba(255, 152, 0, 0.1);
  color: var(--color-warning);
}

.action-btn.warning:hover {
  background-color: rgba(255, 152, 0, 0.2);
}

.action-btn.ghost {
  background-color: transparent;
  color: var(--color-text-muted);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  justify-content: center;
}

.action-btn.ghost:hover {
  background-color: var(--color-surface-alt);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-secondary);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: var(--spacing);
  color: var(--color-text-primary);
}

.modal.large {
  max-width: 800px;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  flex: 1;
  padding: var(--spacing-lg);
  border: none;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-btn:hover:not(.active) {
  background-color: var(--color-surface-alt);
}

.form-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}

.amount-input {
  position: relative;
}

.currency {
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.attach-section {
  margin: var(--spacing-xl) 0;
}

.attach-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing) var(--spacing-lg);
  background-color: var(--color-surface-alt);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.attach-btn:hover {
  background-color: var(--color-border-light);
}

.participants-section {
  margin: var(--spacing-3xl) 0;
}

.participants-section h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.participants-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.participant {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  gap: var(--spacing);
}

.participant:last-child {
  border-bottom: none;
}

.participant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.participant-name {
  flex: 1;
  font-size: 16px;
  color: var(--color-text-primary);
}

.split-method {
  width: 120px;
}

.split-value {
  width: 100px;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 18px;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.remove-btn:hover:not(:disabled) {
  background-color: var(--color-surface-alt);
  color: var(--color-error);
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-participant-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing);
  padding: var(--spacing);
  background-color: var(--color-surface-alt);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease;
}

.add-participant-btn:hover {
  background-color: var(--color-primary-light);
}

.split-algorithm {
  margin: var(--spacing-3xl) 0;
}

.split-algorithm h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.split-options {
  display: flex;
  background-color: var(--color-surface-alt);
  border-radius: var(--radius);
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-xl);
}

.split-option {
  flex: 1;
  padding: var(--spacing) var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
  border: none;
  background: transparent;
  transition: all 0.2s ease;
}

.split-option.active {
  background-color: var(--color-primary);
  color: white;
}

.chart-container {
  display: flex;
  gap: var(--spacing-3xl);
  align-items: center;
}

.pie-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary) 0% 50%,
    #ff7043 50% 100%
  );
  position: relative;
}

.pie-chart::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background-color: var(--color-surface);
  border-radius: 50%;
}

.chart-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing);
  gap: var(--spacing);
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 3px;
}

.summary-section {
  background-color: var(--color-surface-alt);
  border-radius: var(--radius);
  padding: var(--spacing-xl);
  margin: var(--spacing-3xl) 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing);
  font-size: 16px;
}

.summary-row.total {
  font-weight: bold;
  font-size: 18px;
  padding-bottom: var(--spacing);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
}

.debt-list {
  margin-top: var(--spacing-lg);
}

.debt-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .friend-actions {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  
  .friend-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing);
  }
  
  .friend-info {
    width: 100%;
  }
  
  .chart-container {
    flex-direction: column;
    gap: var(--spacing-xl);
  }
  
  .modal.large {
    max-width: 95%;
    max-height: 95vh;
  }
  
  .participants-section {
    margin: var(--spacing-xl) 0;
  }
}
</style>