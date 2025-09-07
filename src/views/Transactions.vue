<template>
  <div class="transactions-page">
    <div class="page-header">
      <div>
        <h1>{{ $t('transactions.title') }}</h1>
        <p class="subtitle">{{ $t('transactions.subtitle') }}</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="ri-add-line"></i>
        {{ $t('transactions.addTransaction') }}
      </button>
    </div>

    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">{{ $t('common.type') }}</label>
          <select v-model="filters.type" class="form-control">
            <option value="">{{ $t('common.all') }}</option>
            <option value="income">{{ $t('transactions.types.income') }}</option>
            <option value="expense">{{ $t('transactions.types.expense') }}</option>
            <option value="transfer">{{ $t('transactions.types.transfer') }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">{{ $t('common.account') }}</label>
          <select v-model="filters.account" class="form-control">
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="account in financeStore.accounts" :key="account.id" :value="account.name">
              {{ account.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">{{ $t('common.category') }}</label>
          <select v-model="filters.category" class="form-control">
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="category in financeStore.rootCategories" :key="category.id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">{{ $t('transactions.periods.custom') }}</label>
          <div class="date-range">
            <input v-model="filters.dateFrom" type="date" class="form-control" />
            <span>—</span>
            <input v-model="filters.dateTo" type="date" class="form-control" />
          </div>
        </div>
        
        <button class="btn btn-secondary" @click="applyFilters">
          {{ $t('transactions.applyFilters') }}
        </button>
      </div>
    </div>

    <div class="transactions-content">
      <div class="transactions-table-container">
        <table class="transactions-table">
          <thead>
            <tr>
              <th>{{ $t('transactions.table.date') }}</th>
              <th>{{ $t('transactions.table.account') }}</th>
              <th>{{ $t('transactions.table.category') }}</th>
              <th>{{ $t('transactions.table.description') }}</th>
              <th>{{ $t('transactions.table.amount') }}</th>
              <th>{{ $t('transactions.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in paginatedTransactions" :key="transaction.id" class="transaction-row">
              <td>{{ formatDate(transaction.date) }}</td>
              <td>
                <div class="account-cell">
                  <div class="account-icon" :style="{ backgroundColor: getAccountColor(transaction.account) }">
                    <i :class="getAccountIcon(transaction.account)"></i>
                  </div>
                  {{ transaction.account }}
                </div>
              </td>
              <td>
                <div class="category-cell">
                  <div class="category-icon" :style="{ backgroundColor: transaction.color }">
                    <i :class="transaction.icon"></i>
                  </div>
                  {{ transaction.category }}
                </div>
              </td>
              <td>{{ transaction.description }}</td>
              <td>
                <span class="amount" :class="{ negative: transaction.amount < 0, positive: transaction.amount > 0 }">
                  {{ formatCurrency(transaction.amount) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn edit" @click="editTransaction(transaction)">
                    <i class="ri-edit-line"></i>
                  </button>
                  <button class="action-btn delete" @click="deleteTransaction(transaction.id)">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <div class="pagination-info">
          {{ $t('transactions.pagination.showing') }} {{ startIndex + 1 }}-{{ endIndex }} {{ $t('transactions.pagination.of') }} {{ filteredTransactions.length }}
        </div>
        <div class="pagination-controls">
          <button 
            class="btn btn-secondary btn-sm" 
            @click="currentPage--" 
            :disabled="currentPage === 1"
          >
            <i class="ri-arrow-left-line"></i>
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            class="btn btn-secondary btn-sm" 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
          >
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Transaction Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingTransaction ? $t('transactions.editTransaction') : $t('transactions.newTransaction') }}</h2>
          <button class="close-btn" @click="closeModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-tabs">
          <button
            v-for="tab in transactionTabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ active: selectedTab === tab.value }"
            @click="selectedTab = tab.value"
          >
            {{ $t(`transactions.tabs.${tab.value}`) }}
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="saveTransaction">
            <!-- Regular Transaction Form -->
            <div v-if="selectedTab !== 'shared'">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">{{ $t('common.account') }}</label>
                  <select v-model="transactionForm.account" class="form-control" required>
                    <option value="">{{ $t('transactions.selectAccount') }}</option>
                    <option v-for="account in financeStore.accounts" :key="account.id" :value="account.name">
                      {{ account.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ $t('common.category') }}</label>
                  <select v-model="transactionForm.category" class="form-control" required>
                    <option value="">{{ $t('transactions.selectCategory') }}</option>
                    <option 
                      v-for="category in getFilteredCategories()" 
                      :key="category.id" 
                      :value="category.name"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">{{ $t('common.amount') }}</label>
                  <div class="amount-input">
                    <input 
                      v-model="transactionForm.amount" 
                      type="number" 
                      class="form-control" 
                      step="0.01"
                      required 
                    />
                    <span class="currency">₽</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ $t('common.date') }}</label>
                  <input v-model="transactionForm.date" type="date" class="form-control" required />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">{{ $t('common.description') }}</label>
                <input 
                  v-model="transactionForm.description" 
                  type="text" 
                  class="form-control" 
                  :placeholder="$t('transactions.transactionDescription')"
                  required 
                />
              </div>
              
              <!-- Transfer specific fields -->
              <div v-if="selectedTab === 'transfer'" class="form-group">
                <label class="form-label">{{ $t('transactions.toAccount') }}</label>
                <select v-model="transactionForm.toAccount" class="form-control" required>
                  <option value="">{{ $t('transactions.selectAccount') }}</option>
                  <option 
                    v-for="account in financeStore.accounts" 
                    :key="account.id" 
                    :value="account.name"
                    :disabled="account.name === transactionForm.account"
                  >
                    {{ account.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Shared Transaction Form -->
            <div v-else>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">{{ $t('common.account') }}</label>
                  <select v-model="sharedForm.account" class="form-control" required>
                    <option value="">{{ $t('transactions.selectAccount') }}</option>
                    <option v-for="account in financeStore.accounts" :key="account.id" :value="account.name">
                      {{ account.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ $t('common.category') }}</label>
                  <select v-model="sharedForm.category" class="form-control" required>
                    <option value="">{{ $t('transactions.selectCategory') }}</option>
                    <option v-for="category in expenseCategories" :key="category.id" :value="category.name">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">{{ $t('common.amount') }}</label>
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
                  <label class="form-label">{{ $t('common.date') }}</label>
                  <input v-model="sharedForm.date" type="date" class="form-control" required />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">{{ $t('common.description') }}</label>
                <input 
                  v-model="sharedForm.description" 
                  type="text" 
                  class="form-control" 
                  :placeholder="$t('transactions.transactionDescription')"
                  required 
                />
              </div>
              
              <div class="participants-section">
                <h3>{{ $t('sharedTransactions.participants') }}</h3>
                
                <div class="participants-list">
                  <div class="participant">
                    <div class="participant-avatar">{{ $t('common.me') }}</div>
                    <div class="participant-name">{{ $t('common.you') }}</div>
                    <div class="participant-amount">{{ formatCurrency(getMyShare()) }}</div>
                  </div>
                  
                  <div v-for="friend in selectedFriends" :key="friend.id" class="participant">
                    <div class="participant-avatar">{{ getInitials(friend.name) }}</div>
                    <div class="participant-name">{{ friend.name }}</div>
                    <div class="participant-amount">{{ formatCurrency(getFriendShare()) }}</div>
                    <button type="button" class="remove-btn" @click="removeFriend(friend.id)">
                      <i class="ri-close-line"></i>
                    </button>
                  </div>
                </div>
                
                <div class="add-participant">
                  <select v-model="selectedFriendId" class="form-control">
                    <option value="">{{ $t('friends.selectFriend') }}</option>
                    <option 
                      v-for="friend in availableFriends" 
                      :key="friend.id" 
                      :value="friend.id"
                    >
                      {{ friend.name }}
                    </option>
                  </select>
                  <button type="button" class="btn btn-secondary" @click="addFriend" :disabled="!selectedFriendId">
                    {{ $t('sharedTransactions.addParticipant') }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                {{ $t('modal.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingTransaction ? $t('modal.save') : $t('modal.add') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore, type Transaction, type Friend } from '../stores/finance'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const financeStore = useFinanceStore()

const showAddModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const selectedTab = ref('expense')
const currentPage = ref(1)
const itemsPerPage = 20
const selectedFriendId = ref('')

const transactionTabs = [
  { value: 'expense' },
  { value: 'income' },
  { value: 'transfer' },
  { value: 'shared' }
]

const filters = ref({
  type: '',
  account: '',
  category: '',
  dateFrom: '',
  dateTo: ''
})

const transactionForm = ref({
  account: '',
  category: '',
  description: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  type: 'expense' as 'income' | 'expense' | 'transfer',
  toAccount: ''
})

const sharedForm = ref({
  account: '',
  category: '',
  description: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0]
})

const selectedFriends = ref<Friend[]>([])

const filteredTransactions = computed(() => {
  let transactions = financeStore.transactions
  
  if (filters.value.type) {
    transactions = transactions.filter(t => t.type === filters.value.type)
  }
  
  if (filters.value.account) {
    transactions = transactions.filter(t => t.account === filters.value.account)
  }
  
  if (filters.value.category) {
    transactions = transactions.filter(t => t.category === filters.value.category)
  }
  
  if (filters.value.dateFrom) {
    transactions = transactions.filter(t => t.date >= filters.value.dateFrom)
  }
  
  if (filters.value.dateTo) {
    transactions = transactions.filter(t => t.date <= filters.value.dateTo)
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage, filteredTransactions.value.length)
})

const paginatedTransactions = computed(() => {
  return filteredTransactions.value.slice(startIndex.value, endIndex.value)
})

const expenseCategories = computed(() => {
  return financeStore.categories.filter(c => c.type === 'expense')
})

const availableFriends = computed(() => {
  return financeStore.friends.filter(f => 
    !selectedFriends.value.some(sf => sf.id === f.id)
  )
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(Math.abs(amount))
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getAccountColor = (accountName: string): string => {
  const account = financeStore.accounts.find(a => a.name === accountName)
  return account?.color || '#1a5d42'
}

const getAccountIcon = (accountName: string): string => {
  const account = financeStore.accounts.find(a => a.name === accountName)
  return account?.icon || 'ri-bank-card-line'
}

const getFilteredCategories = () => {
  if (selectedTab.value === 'income') {
    return financeStore.categories.filter(c => c.type === 'income')
  } else {
    return financeStore.categories.filter(c => c.type === 'expense')
  }
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getMyShare = (): number => {
  const totalParticipants = selectedFriends.value.length + 1
  return sharedForm.value.amount / totalParticipants
}

const getFriendShare = (): number => {
  return getMyShare()
}

const addFriend = () => {
  const friend = financeStore.friends.find(f => f.id === selectedFriendId.value)
  if (friend && !selectedFriends.value.some(sf => sf.id === friend.id)) {
    selectedFriends.value.push(friend)
    selectedFriendId.value = ''
  }
}

const removeFriend = (friendId: string) => {
  const index = selectedFriends.value.findIndex(f => f.id === friendId)
  if (index > -1) {
    selectedFriends.value.splice(index, 1)
  }
}

const applyFilters = () => {
  currentPage.value = 1
}

const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction
  selectedTab.value = transaction.type
  transactionForm.value = {
    account: transaction.account,
    category: transaction.category,
    description: transaction.description,
    amount: Math.abs(transaction.amount),
    date: transaction.date,
    type: transaction.type,
    toAccount: ''
  }
  showAddModal.value = true
}

const deleteTransaction = (id: string) => {
  if (confirm(t('transactions.confirmDelete'))) {
    financeStore.deleteTransaction(id)
      .catch(() => {
        alert('Ошибка удаления транзакции')
      })
  }
}

const saveTransaction = () => {
  if (selectedTab.value === 'shared') {
    // Save shared transaction
    const sharedTransaction = {
      transactionId: Date.now().toString(),
      participants: [
        { userId: 'current-user', name: t('common.you'), amount: getMyShare(), paid: true },
        ...selectedFriends.value.map(f => ({
          userId: f.id,
          name: f.name,
          amount: getFriendShare(),
          paid: false
        }))
      ],
      splitMethod: 'equal' as const,
      totalAmount: sharedForm.value.amount,
      paidBy: 'current-user',
      createdBy: 'current-user'
    }
    
    financeStore.addSharedTransaction(sharedTransaction)
      .then(() => {
        closeModal()
      })
      .catch(() => {
        alert('Ошибка создания совместной транзакции')
      })
  } else {
    // Save regular transaction
    let amount = transactionForm.value.amount
    if (selectedTab.value === 'expense') {
      amount = -Math.abs(amount)
    } else if (selectedTab.value === 'income') {
      amount = Math.abs(amount)
    }
    
    const transaction = {
      ...transactionForm.value,
      amount,
      type: selectedTab.value as 'income' | 'expense' | 'transfer',
      icon: getCategoryIcon(transactionForm.value.category),
      color: getCategoryColor(transactionForm.value.category)
    }
    
    if (editingTransaction.value) {
      financeStore.updateTransaction(editingTransaction.value.id, transaction)
        .then(() => {
          closeModal()
        })
        .catch(() => {
          alert('Ошибка обновления транзакции')
        })
    } else {
      financeStore.addTransaction(transaction)
        .then(() => {
          closeModal()
        })
        .catch(() => {
          alert('Ошибка создания транзакции')
        })
    }
  }
}

const getCategoryIcon = (categoryName: string): string => {
  const category = financeStore.categories.find(c => c.name === categoryName)
  return category?.icon || 'ri-money-dollar-circle-line'
}

const getCategoryColor = (categoryName: string): string => {
  const category = financeStore.categories.find(c => c.name === categoryName)
  return category?.color || '#1a5d42'
}

const closeModal = () => {
  showAddModal.value = false
  editingTransaction.value = null
  selectedFriends.value = []
  transactionForm.value = {
    account: '',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    toAccount: ''
  }
  sharedForm.value = {
    account: '',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  }
  selectedTab.value = 'expense'
}

onMounted(() => {
  // Set default date range to current month
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  filters.value.dateFrom = firstDay.toISOString().split('T')[0]
  filters.value.dateTo = lastDay.toISOString().split('T')[0]
})
</script>

<style scoped>
.transactions-page {
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

.filters-section {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--color-border);
}

.filters-row {
  display: flex;
  gap: var(--spacing-lg);
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.date-range {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.date-range span {
  color: var(--color-text-secondary);
}

.transactions-content {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.transactions-table-container {
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th {
  background-color: var(--color-surface-alt);
  padding: var(--spacing-lg);
  text-align: left;
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 14px;
  border-bottom: 1px solid var(--color-border);
}

.transaction-row {
  border-bottom: 1px solid var(--color-border-light);
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background-color: var(--color-surface-alt);
}

.transactions-table td {
  padding: var(--spacing-lg);
  vertical-align: middle;
}

.account-cell,
.category-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing);
}

.account-icon,
.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.amount {
  font-weight: 600;
  font-size: 16px;
}

.amount.positive {
  color: var(--color-success);
}

.amount.negative {
  color: var(--color-error);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--color-surface-alt);
}

.action-btn.edit:hover {
  color: var(--color-info);
}

.action-btn.delete:hover {
  color: var(--color-error);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.pagination-info {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing);
}

.page-info {
  font-size: 14px;
  color: var(--color-text-primary);
  min-width: 60px;
  text-align: center;
}

.btn-sm {
  padding: var(--spacing-sm) var(--spacing);
  font-size: 12px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
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
  font-size: 14px;
}

.participant-name {
  flex: 1;
  font-size: 16px;
  color: var(--color-text-primary);
}

.participant-amount {
  font-weight: 600;
  color: var(--color-text-primary);
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

.remove-btn:hover {
  background-color: var(--color-surface-alt);
  color: var(--color-error);
}

.add-participant {
  display: flex;
  gap: var(--spacing);
  align-items: end;
}

.add-participant .form-control {
  flex: 1;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .date-range {
    flex-direction: column;
    gap: var(--spacing);
  }
  
  .transactions-table-container {
    overflow-x: scroll;
  }
  
  .transactions-table {
    min-width: 800px;
  }
  
  .pagination {
    flex-direction: column;
    gap: var(--spacing);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .add-participant {
    flex-direction: column;
  }
  
  .modal-tabs {
    overflow-x: auto;
  }
  
  .tab-btn {
    white-space: nowrap;
    min-width: 100px;
  }
}
</style>