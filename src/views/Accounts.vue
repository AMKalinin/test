<template>
  <div class="accounts-page">
    <div class="page-header">
      <div>
        <h1>{{ $t('accounts.title') }}</h1>
        <p class="subtitle">{{ $t('accounts.subtitle') }}</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="ri-add-line"></i>
        {{ $t('accounts.addAccount') }}
      </button>
    </div>

    <div class="accounts-grid">
      <div v-for="account in financeStore.accounts" :key="account.id" class="account-card card">
        <div class="account-header">
          <div class="account-icon" :style="{ backgroundColor: account.color }">
            <i :class="account.icon"></i>
          </div>
          <div class="account-actions">
            <button class="action-btn" @click="editAccount(account)">
              <i class="ri-edit-line"></i>
            </button>
            <button class="action-btn" @click="deleteAccount(account.id)">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
        
        <div class="account-info">
          <h3 class="account-name">{{ account.name }}</h3>
          <p class="account-type">{{ $t(`accounts.types.${account.type}`) }}</p>
        </div>
        
        <div class="account-balance">
          <span class="balance-amount">{{ formatCurrency(account.balance) }}</span>
          <div class="balance-change positive">
            <i class="ri-arrow-up-line"></i>
            +2.5%
          </div>
        </div>
        
        <div class="account-stats">
          <div class="stat-item">
            <span class="stat-label">{{ $t('accounts.income') }}</span>
            <span class="stat-value positive">{{ formatCurrency(getAccountIncome(account.id)) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('accounts.expenses') }}</span>
            <span class="stat-value negative">{{ formatCurrency(getAccountExpenses(account.id)) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Account Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingAccount ? $t('accounts.editAccount') : $t('accounts.newAccount') }}</h2>
          <button class="close-btn" @click="closeModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="saveAccount">
            <div class="form-group">
              <label class="form-label">{{ $t('accounts.accountName') }}</label>
              <input 
                v-model="accountForm.name" 
                type="text" 
                class="form-control" 
                :placeholder="$t('accounts.placeholders.accountName')"
                required 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('accounts.accountType') }}</label>
              <select v-model="accountForm.type" class="form-control" required>
                <option value="">{{ $t('accounts.accountType') }}</option>
                <option value="debit">{{ $t('accounts.types.debit') }}</option>
                <option value="savings">{{ $t('accounts.types.savings') }}</option>
                <option value="credit">{{ $t('accounts.types.credit') }}</option>
                <option value="loan_given">{{ $t('accounts.types.loan_given') }}</option>
                <option value="loan_taken">{{ $t('accounts.types.loan_taken') }}</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('accounts.initialBalance') }}</label>
                <input 
                  v-model="accountForm.balance" 
                  type="number" 
                  class="form-control" 
                  step="0.01"
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('accounts.currency') }}</label>
                <select v-model="accountForm.currency" class="form-control">
                  <option>₽</option>
                  <option>$</option>
                  <option>€</option>
                </select>
              </div>
            </div>
            
            <!-- Дополнительные поля для разных типов счетов -->
            <div v-if="accountForm.type === 'savings'" class="form-group">
              <label class="form-label">{{ $t('accounts.interestRate') }}</label>
              <input 
                v-model="accountForm.interestRate" 
                type="number" 
                class="form-control" 
                step="0.01"
                placeholder="5.5"
              />
            </div>
            
            <div v-if="accountForm.type === 'savings'" class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="accountForm.isSafetyNet" />
                {{ $t('accounts.safetyNet') }}
              </label>
            </div>
            
            <div v-if="accountForm.type === 'credit'" class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('accounts.creditLimit') }}</label>
                <input 
                  v-model="accountForm.creditLimit" 
                  type="number" 
                  class="form-control" 
                  step="0.01"
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('accounts.paymentDate') }}</label>
                <input 
                  v-model="accountForm.paymentDate" 
                  type="date" 
                  class="form-control" 
                />
              </div>
            </div>
            
            <div v-if="accountForm.type === 'credit'" class="form-group">
              <label class="form-label">{{ $t('accounts.interestRate') }}</label>
              <input 
                v-model="accountForm.interestRate" 
                type="number" 
                class="form-control" 
                step="0.01"
                placeholder="24.9"
              />
            </div>
            
            <div v-if="accountForm.type === 'loan_given' || accountForm.type === 'loan_taken'" class="form-group">
              <label class="form-label">{{ $t('accounts.counterparty') }}</label>
              <input 
                v-model="accountForm.loanCounterparty" 
                type="text" 
                class="form-control" 
                :placeholder="$t('accounts.placeholders.counterparty')"
              />
            </div>
            
            <div v-if="accountForm.type === 'loan_given' || accountForm.type === 'loan_taken'" class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('accounts.issueDate') }}</label>
                <input 
                  v-model="accountForm.loanIssueDate" 
                  type="date" 
                  class="form-control" 
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('accounts.returnDate') }}</label>
                <input 
                  v-model="accountForm.loanReturnDate" 
                  type="date" 
                  class="form-control" 
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('accounts.icon') }}</label>
              <div class="icon-grid">
                <button
                  v-for="icon in iconOptions"
                  :key="icon"
                  type="button"
                  class="icon-option"
                  :class="{ selected: accountForm.icon === icon }"
                  @click="accountForm.icon = icon"
                >
                  <i :class="icon"></i>
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('accounts.color') }}</label>
              <div class="color-grid">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  class="color-option"
                  :class="{ selected: accountForm.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="accountForm.color = color"
                ></button>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                {{ $t('modal.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingAccount ? $t('modal.save') : $t('modal.add') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFinanceStore, type Account } from '../stores/finance'

const financeStore = useFinanceStore()

const showAddModal = ref(false)
const editingAccount = ref<Account | null>(null)

const accountForm = ref({
  name: '',
  type: '' as Account['type'] | '',
  balance: 0,
  currency: '₽',
  icon: 'ri-bank-card-line',
  color: '#1a5d42',
  isArchived: false,
  isPrimary: false,
  isSafetyNet: false,
  interestRate: 0,
  creditLimit: 0,
  paymentDate: '',
  loanCounterparty: '',
  loanIssueDate: '',
  loanReturnDate: ''
})

const iconOptions = [
  'ri-bank-card-line',
  'ri-money-dollar-circle-line',
  'ri-bank-line',
  'ri-wallet-3-line',
  'ri-safe-line',
  'ri-coins-line',
  'ri-currency-line',
  'ri-credit-card-line'
]

const colorOptions = [
  '#1a5d42', '#2196f3', '#4caf50', '#ff9800',
  '#f44336', '#9c27b0', '#673ab7', '#3f51b5',
  '#00bcd4', '#009688', '#8bc34a', '#cddc39'
]

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(Math.abs(amount))
}

const getAccountIncome = (accountId: string): number => {
  const account = financeStore.accounts.find(a => a.id === accountId)
  if (!account) return 0
  
  return financeStore.transactions
    .filter(t => t.account === account.name && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
}

const getAccountExpenses = (accountId: string): number => {
  const account = financeStore.accounts.find(a => a.id === accountId)
  if (!account) return 0
  
  return Math.abs(financeStore.transactions
    .filter(t => t.account === account.name && t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0))
}

const editAccount = (account: Account) => {
  editingAccount.value = account
  accountForm.value = {
    name: account.name,
    type: account.type,
    balance: account.balance,
    currency: account.currency,
    icon: account.icon,
    color: account.color,
    isArchived: account.isArchived || false,
    isPrimary: account.isPrimary || false,
    isSafetyNet: account.isSafetyNet || false,
    interestRate: account.interestRate || 0,
    creditLimit: account.creditLimit || 0,
    paymentDate: account.paymentDate || '',
    loanCounterparty: account.loanCounterparty || '',
    loanIssueDate: account.loanIssueDate || '',
    loanReturnDate: account.loanReturnDate || ''
  }
  showAddModal.value = true
}

const deleteAccount = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить этот счет?')) {
    financeStore.deleteAccount(id)
      .catch(() => {
        alert('Ошибка удаления счета')
      })
  }
}

const saveAccount = () => {
  if (editingAccount.value) {
    financeStore.updateAccount(editingAccount.value.id, accountForm.value)
      .then(() => {
        closeModal()
      })
      .catch(() => {
        alert('Ошибка обновления счета')
      })
  } else {
    financeStore.addAccount(accountForm.value)
      .then(() => {
        closeModal()
      })
      .catch(() => {
        alert('Ошибка создания счета')
      })
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingAccount.value = null
  accountForm.value = {
    name: '',
    type: '' as Account['type'] | '',
    balance: 0,
    currency: '₽',
    icon: 'ri-bank-card-line',
    color: '#1a5d42',
    isArchived: false,
    isPrimary: false,
    isSafetyNet: false,
    interestRate: 0,
    creditLimit: 0,
    paymentDate: '',
    loanCounterparty: '',
    loanIssueDate: '',
    loanReturnDate: ''
  }
}
</script>

<style scoped>
.accounts-page {
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

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.account-card {
  padding: var(--spacing-xl);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.account-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.account-actions {
  display: flex;
  gap: var(--spacing-xs);
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
  color: var(--color-primary);
}

.account-info {
  margin-bottom: var(--spacing-xl);
}

.account-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.account-type {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.account-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.balance-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.balance-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  font-weight: 500;
}

.balance-change.positive {
  color: var(--color-success);
}

.balance-change.negative {
  color: var(--color-error);
}

.account-stats {
  display: flex;
  justify-content: space-between;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
}

.stat-value.positive {
  color: var(--color-success);
}

.stat-value.negative {
  color: var(--color-error);
}

.modal {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  max-height: 90vh;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
}

.icon-option {
  width: 48px;
  height: 48px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 20px;
  color: var(--color-text-secondary);
}

.icon-option:hover,
.icon-option.selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-sm);
}

.color-option {
  width: 36px;
  height: 36px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover,
.color-option.selected {
  border-color: var(--color-text-primary);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .account-card:hover {
    transform: none;
  }
  
  .account-stats {
    flex-direction: column;
    gap: var(--spacing);
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}
</style>