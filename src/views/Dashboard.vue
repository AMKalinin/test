<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>{{ $t('dashboard.title') }}</h1>
        <p class="subtitle">{{ $t('dashboard.subtitle') }}</p>
      </div>
      <div class="dashboard-actions">
        <select class="period-select">
          <option>{{ $t('dashboard.periods.thisMonth') }}</option>
          <option>{{ $t('dashboard.periods.lastMonth') }}</option>
          <option>{{ $t('dashboard.periods.quarter') }}</option>
          <option>{{ $t('dashboard.periods.year') }}</option>
        </select>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="ri-wallet-3-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(financeStore.totalBalance) }}</div>
          <div class="stat-label">{{ $t('dashboard.totalBalance') }}</div>
          <div class="stat-change positive">
            <i class="ri-arrow-up-line"></i>
            +12.5%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon income">
          <i class="ri-arrow-down-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(financeStore.monthlyIncome) }}</div>
          <div class="stat-label">{{ $t('dashboard.monthlyIncome') }}</div>
          <div class="stat-change positive">
            <i class="ri-arrow-up-line"></i>
            +5.2%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon expense">
          <i class="ri-arrow-up-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(financeStore.monthlyExpenses) }}</div>
          <div class="stat-label">{{ $t('dashboard.monthlyExpenses') }}</div>
          <div class="stat-change negative">
            <i class="ri-arrow-down-line"></i>
            -2.1%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon savings">
          <i class="ri-piggy-bank-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(financeStore.monthlyIncome - financeStore.monthlyExpenses) }}</div>
          <div class="stat-label">{{ $t('dashboard.monthlySavings') }}</div>
          <div class="stat-change positive">
            <i class="ri-arrow-up-line"></i>
            +18.3%
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="main-charts">
        <div class="card chart-card">
          <div class="card-header">
            <h3>{{ $t('dashboard.balanceDynamics') }}</h3>
            <div class="chart-controls">
              <button class="chart-btn active">{{ $t('charts.7d') }}</button>
              <button class="chart-btn">{{ $t('charts.30d') }}</button>
              <button class="chart-btn">{{ $t('charts.3m') }}</button>
              <button class="chart-btn">{{ $t('charts.year') }}</button>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="balanceChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <div class="card chart-card">
          <div class="card-header">
            <h3>{{ $t('dashboard.expenseStructure') }}</h3>
          </div>
          <div class="chart-container">
            <canvas ref="expensesChart" width="400" height="200"></canvas>
          </div>
          <div class="expenses-legend">
            <div v-for="category in expensesData" :key="category.name" class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: category.color }"></div>
              <span class="legend-label">{{ category.name }}</span>
              <span class="legend-value">{{ formatCurrency(category.value) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="sidebar-content">
        <div class="card">
          <div class="card-header">
            <h3>{{ $t('nav.accounts') }}</h3>
            <router-link to="/accounts" class="view-all-btn">
              {{ $t('dashboard.viewAll') }}
              <i class="ri-arrow-right-line"></i>
            </router-link>
          </div>
          <div class="accounts-list">
            <div v-for="account in financeStore.accounts.slice(0, 3)" :key="account.id" class="account-item">
              <div class="account-icon" :style="{ backgroundColor: account.color }">
                <i :class="account.icon"></i>
              </div>
              <div class="account-info">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-type">{{ getAccountTypeText(account.type) }}</div>
              </div>
              <div class="account-balance">{{ formatCurrency(account.balance) }}</div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>{{ $t('dashboard.activeProjects') }}</h3>
            <router-link to="/projects" class="view-all-btn">
              {{ $t('dashboard.viewAll') }}
              <i class="ri-arrow-right-line"></i>
            </router-link>
          </div>
          <div class="projects-list">
            <div v-for="project in activeProjects" :key="project.id" class="project-item">
              <div class="project-icon" :style="{ backgroundColor: project.color }">
                <i :class="project.icon"></i>
              </div>
              <div class="project-info">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-progress">
                  <div class="progress-bar-mini">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${Math.min(getProjectProgress(project), 100)}%` }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ getProjectProgress(project) }}%</span>
                </div>
              </div>
              <div class="project-budget">{{ formatCurrency(project.budget - project.spent) }}</div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>{{ $t('dashboard.budgets') }}</h3>
            <router-link to="/categories" class="view-all-btn">
              {{ $t('dashboard.viewAll') }}
              <i class="ri-arrow-right-line"></i>
            </router-link>
          </div>
          <div class="budgets-list">
            <div v-for="category in budgetCategories" :key="category.id" class="budget-item">
              <div class="budget-info">
                <div class="budget-name">{{ category.name }}</div>
                <div class="budget-amounts">
                  {{ formatCurrency(category.spent || 0) }} / {{ formatCurrency(category.budget || 0) }}
                </div>
              </div>
              <div class="budget-progress">
                <div 
                  class="progress-bar" 
                  :class="getProgressClass(category)"
                  :style="{ width: `${getProgressPercentage(category)}%` }"
                ></div>
              </div>
              <div class="budget-percentage">{{ getProgressPercentage(category) }}%</div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>{{ $t('dashboard.recentTransactions') }}</h3>
            <router-link to="/transactions" class="view-all-btn">
              {{ $t('dashboard.viewAll') }}
              <i class="ri-arrow-right-line"></i>
            </router-link>
          </div>
          <div class="transactions-list">
            <div v-for="transaction in financeStore.transactions.slice(0, 5)" :key="transaction.id" class="transaction-item">
              <div class="transaction-icon" :style="{ backgroundColor: transaction.color }">
                <i :class="transaction.icon"></i>
              </div>
              <div class="transaction-info">
                <div class="transaction-description">{{ transaction.description }}</div>
                <div class="transaction-category">{{ transaction.category }}</div>
              </div>
              <div class="transaction-amount" :class="{ negative: transaction.amount < 0 }">
                {{ formatCurrency(transaction.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import { useFinanceStore } from '../stores/finance'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const financeStore = useFinanceStore()
const balanceChart = ref<HTMLCanvasElement>()
const expensesChart = ref<HTMLCanvasElement>()

const activeProjects = computed(() => {
  return financeStore.projects.filter(p => p.isActive).slice(0, 3)
})

const budgetCategories = computed(() => {
  return financeStore.categories.filter(c => c.budget && c.spent !== undefined)
})

const expensesData = [
  { name: 'Продукты', value: 19500, color: '#f44336' },
  { name: 'Транспорт', value: 8500, color: '#3f51b5' },
  { name: 'Развлечения', value: 5500, color: '#673ab7' },
  { name: 'Здоровье', value: 3000, color: '#009688' },
  { name: 'Другое', value: 4200, color: '#ff9800' }
]

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(Math.abs(amount))
}

const getAccountTypeText = (type: string): string => {
  return t(`accounts.types.${type}`)
}

const getProjectProgress = (project: any): number => {
  if (!project.budget) return 0
  return Math.round((project.spent / project.budget) * 100)
}

const getProgressPercentage = (category: any): number => {
  if (!category.budget || !category.spent) return 0
  return Math.min(Math.round((category.spent / category.budget) * 100), 100)
}

const getProgressClass = (category: any): string => {
  const percentage = getProgressPercentage(category)
  if (percentage >= 100) return 'danger'
  if (percentage >= 80) return 'warning'
  return 'normal'
}

const initCharts = () => {
  if (balanceChart.value) {
    const balanceConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        datasets: [{
          label: 'Баланс',
          data: [120000, 125000, 123000, 128000, 130000, 127000, 132000],
          borderColor: 'rgb(26, 93, 66)',
          backgroundColor: 'rgba(26, 93, 66, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return formatCurrency(value as number)
              }
            }
          }
        }
      }
    }
    
    new Chart(balanceChart.value, balanceConfig)
  }
  
  if (expensesChart.value) {
    const expensesConfig: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: expensesData.map(item => item.name),
        datasets: [{
          data: expensesData.map(item => item.value),
          backgroundColor: expensesData.map(item => item.color),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        cutout: '60%'
      }
    }
    
    new Chart(expensesChart.value, expensesConfig)
  }
}

onMounted(async () => {
  await nextTick()
  initCharts()
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3xl);
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.period-select {
  padding: var(--spacing) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
}

.stat-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.income {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--color-success);
}

.stat-icon.expense {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.stat-icon.savings {
  background-color: rgba(33, 150, 243, 0.1);
  color: var(--color-info);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: var(--spacing-xs);
}

.stat-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--color-success);
}

.stat-change.negative {
  color: var(--color-error);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-3xl);
}

.main-charts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.chart-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.chart-btn {
  padding: var(--spacing-sm) var(--spacing);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-btn.active,
.chart-btn:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.chart-container {
  height: 300px;
  position: relative;
}

.expenses-legend {
  margin-top: var(--spacing-xl);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing);
  gap: var(--spacing);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.legend-value {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.accounts-list,
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.account-item,
.transaction-item {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing);
  border-radius: var(--radius);
  transition: background-color 0.2s ease;
}

.account-item:hover,
.transaction-item:hover {
  background-color: var(--color-surface-alt);
}

.account-icon,
.transaction-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.account-info,
.transaction-info {
  flex: 1;
}

.account-name,
.transaction-description {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.account-type,
.transaction-category {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.account-balance,
.transaction-amount {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.project-item {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing);
  border-radius: var(--radius);
  transition: background-color 0.2s ease;
}

.project-item:hover {
  background-color: var(--color-surface-alt);
}

.project-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.project-info {
  flex: 1;
}

.project-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-bar-mini {
  flex: 1;
  height: 4px;
  background-color: var(--color-border-light);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-success);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 35px;
}

.project-budget {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
}

.transaction-amount.negative {
  color: var(--color-error);
}

.budgets-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.budget-item {
  display: flex;
  align-items: center;
  gap: var(--spacing);
}

.budget-info {
  flex: 1;
  min-width: 0;
}

.budget-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.budget-amounts {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.budget-progress {
  flex: 1;
  height: 6px;
  background-color: var(--color-border-light);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-bar.normal {
  background-color: var(--color-success);
}

.progress-bar.warning {
  background-color: var(--color-warning);
}

.progress-bar.danger {
  background-color: var(--color-error);
}

.budget-percentage {
  font-weight: 500;
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 35px;
  text-align: right;
}

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing);
  }
  
  .main-charts {
    gap: var(--spacing-xl);
  }
  
  .sidebar-content {
    gap: var(--spacing-lg);
  }
  
  .chart-controls {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  
  .legend-item {
    flex-wrap: wrap;
  }
}
</style>