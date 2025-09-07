<template>
  <div class="analytics-page">
    <div class="page-header">
      <div>
        <h1>{{ $t('analytics.title') }}</h1>
        <p class="subtitle">{{ $t('analytics.subtitle') }}</p>
      </div>
      <select class="period-select">
        <option>{{ $t('analytics.periods.month') }}</option>
        <option>{{ $t('analytics.periods.quarter') }}</option>
        <option>{{ $t('analytics.periods.year') }}</option>
      </select>
    </div>

    <div class="analytics-grid">
      <div class="chart-card card">
        <div class="card-header">
          <h3>{{ $t('analytics.incomeExpenses') }}</h3>
        </div>
        <div class="chart-container">
          <canvas ref="incomeExpenseChart"></canvas>
        </div>
      </div>
      
      <div class="chart-card card">
        <div class="card-header">
          <h3>{{ $t('analytics.expenseStructure') }}</h3>
        </div>
        <div class="chart-container">
          <canvas ref="expenseStructureChart"></canvas>
        </div>
      </div>
      
      <div class="chart-card card">
        <div class="card-header">
          <h3>{{ $t('analytics.comparison') }}</h3>
        </div>
        <div class="comparison-stats">
          <div class="comparison-item">
            <div class="comparison-label">{{ $t('dashboard.monthlyIncome') }}</div>
            <div class="comparison-values">
              <span class="current-value">{{ formatCurrency(85000) }}</span>
              <span class="change-indicator positive">
                <i class="ri-arrow-up-line"></i>
                +5.2%
              </span>
            </div>
          </div>
          <div class="comparison-item">
            <div class="comparison-label">{{ $t('dashboard.monthlyExpenses') }}</div>
            <div class="comparison-values">
              <span class="current-value">{{ formatCurrency(69000) }}</span>
              <span class="change-indicator negative">
                <i class="ri-arrow-down-line"></i>
                -2.1%
              </span>
            </div>
          </div>
          <div class="comparison-item">
            <div class="comparison-label">{{ $t('dashboard.monthlySavings') }}</div>
            <div class="comparison-values">
              <span class="current-value">{{ formatCurrency(16000) }}</span>
              <span class="change-indicator positive">
                <i class="ri-arrow-up-line"></i>
                +18.3%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="trends-card card">
        <div class="card-header">
          <h3>{{ $t('analytics.trends') }}</h3>
        </div>
        <div class="trends-list">
          <div v-for="trend in trends" :key="trend.category" class="trend-item">
            <div class="trend-icon" :style="{ backgroundColor: trend.color }">
              <i :class="trend.icon"></i>
            </div>
            <div class="trend-info">
              <div class="trend-category">{{ trend.category }}</div>
              <div class="trend-description">{{ trend.description }}</div>
            </div>
            <div class="trend-change" :class="trend.changeClass">
              <i :class="trend.changeIcon"></i>
              {{ trend.change }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="insights-card card">
        <div class="card-header">
          <h3>{{ $t('analytics.recommendations') }}</h3>
        </div>
        <div class="insights-list">
          <div v-for="insight in insights" :key="insight.id" class="insight-item">
            <div class="insight-icon" :class="insight.type">
              <i :class="insight.icon"></i>
            </div>
            <div class="insight-content">
              <div class="insight-title">{{ insight.title }}</div>
              <div class="insight-description">{{ insight.description }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="safety-net-card card">
        <div class="card-header">
          <h3>{{ $t('analytics.safetyNet') }}</h3>
        </div>
        <div class="safety-net-content">
          <div class="safety-net-amount">
            <span class="amount-value">{{ formatCurrency(safetyNetAmount) }}</span>
            <span class="amount-label">{{ $t('analytics.totalAmount') }}</span>
          </div>
          <div class="safety-net-months">
            <div class="months-circle">
              <span class="months-number">{{ safetyNetMonths }}</span>
              <span class="months-label">{{ $t('analytics.months') }}</span>
            </div>
            <p class="months-description">
              {{ $t('analytics.safetyNetDesc') }} {{ formatCurrency(averageMonthlyExpenses) }}
            </p>
          </div>
        </div>
        <div class="safety-net-recommendation">
          <i class="ri-lightbulb-line"></i>
          <span>{{ $t('analytics.safetyNetRecommendation') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import { useFinanceStore } from '../stores/finance'

const financeStore = useFinanceStore()

const incomeExpenseChart = ref<HTMLCanvasElement>()
const expenseStructureChart = ref<HTMLCanvasElement>()

const trends = [
  {
    category: 'Продукты',
    description: 'Расходы увеличились на 15%',
    change: '+15%',
    changeClass: 'negative',
    changeIcon: 'ri-arrow-up-line',
    color: '#f44336',
    icon: 'ri-shopping-cart-line'
  },
  {
    category: 'Транспорт',
    description: 'Расходы снизились на 8%',
    change: '-8%',
    changeClass: 'positive',
    changeIcon: 'ri-arrow-down-line',
    color: '#3f51b5',
    icon: 'ri-car-line'
  },
  {
    category: 'Развлечения',
    description: 'Превышен бюджет на 10%',
    change: '+110%',
    changeClass: 'warning',
    changeIcon: 'ri-alert-line',
    color: '#673ab7',
    icon: 'ri-film-line'
  }
]

const insights = [
  {
    id: 1,
    type: 'warning',
    icon: 'ri-alert-line',
    title: 'Превышение бюджета',
    description: 'Вы превысили бюджет на развлечения на 500 ₽. Рекомендуем пересмотреть траты.'
  },
  {
    id: 2,
    type: 'success',
    icon: 'ri-thumb-up-line',
    title: 'Отличная экономия',
    description: 'За этот месяц вы сэкономили 12,000 ₽. Продолжайте в том же духе!'
  },
  {
    id: 3,
    type: 'info',
    icon: 'ri-lightbulb-line',
    title: 'Совет по планированию',
    description: 'Создайте отдельную категорию для непредвиденных расходов.'
  }
]

const safetyNetAmount = computed(() => {
  return financeStore.accounts
    .filter(a => a.isSafetyNet)
    .reduce((sum, a) => sum + a.balance, 0)
})

const averageMonthlyExpenses = computed(() => {
  // Упрощенный расчет - в реальном приложении нужно анализировать последние 12 месяцев
  return 58000
})

const safetyNetMonths = computed(() => {
  if (averageMonthlyExpenses.value === 0) return 0
  return Math.floor(safetyNetAmount.value / averageMonthlyExpenses.value)
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const initCharts = () => {
  if (incomeExpenseChart.value) {
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
        datasets: [
          {
            label: 'Доходы',
            data: [85000, 87000, 85000, 90000, 88000, 85000],
            backgroundColor: 'rgba(76, 175, 80, 0.8)'
          },
          {
            label: 'Расходы',
            data: [65000, 70000, 68000, 75000, 72000, 69000],
            backgroundColor: 'rgba(244, 67, 54, 0.8)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  minimumFractionDigits: 0
                }).format(value as number)
              }
            }
          }
        }
      }
    }
    
    new Chart(incomeExpenseChart.value, config)
  }
  
  if (expenseStructureChart.value) {
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Продукты', 'Транспорт', 'Развлечения', 'Здоровье', 'Другое'],
        datasets: [{
          data: [19500, 8500, 5500, 3000, 4200],
          backgroundColor: [
            '#f44336',
            '#3f51b5',
            '#673ab7',
            '#009688',
            '#ff9800'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    }
    
    new Chart(expenseStructureChart.value, config)
  }
}

onMounted(async () => {
  await nextTick()
  initCharts()
})
</script>

<style scoped>
.analytics-page {
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

.period-select {
  padding: var(--spacing) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 14px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
}

.chart-card {
  grid-column: span 1;
}

.chart-card .chart-container {
  height: 300px;
  position: relative;
}

.card-header {
  margin-bottom: var(--spacing-xl);
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.trends-card,
.insights-card {
  grid-column: span 1;
}

.trends-list,
.insights-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.trend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing);
  border-radius: var(--radius);
  transition: background-color 0.2s ease;
}

.trend-item:hover {
  background-color: var(--color-surface-alt);
}

.trend-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.trend-info {
  flex: 1;
}

.trend-category {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.trend-description {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.trend-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  font-size: 12px;
}

.trend-change.positive {
  color: var(--color-success);
}

.trend-change.negative {
  color: var(--color-error);
}

.trend-change.warning {
  color: var(--color-warning);
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing);
  padding: var(--spacing-lg);
  border-radius: var(--radius);
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.insight-item:hover {
  background-color: var(--color-surface-alt);
}

.insight-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.insight-icon.warning {
  background-color: var(--color-warning);
}

.insight-icon.success {
  background-color: var(--color-success);
}

.insight-icon.info {
  background-color: var(--color-info);
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: var(--spacing-xs);
}

.insight-description {
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.comparison-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--color-surface-alt);
  border-radius: var(--radius);
}

.comparison-label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.comparison-values {
  display: flex;
  align-items: center;
  gap: var(--spacing);
}

.current-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.change-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.change-indicator.positive {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--color-success);
}

.change-indicator.negative {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.safety-net-card {
  grid-column: span 1;
}

.safety-net-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.safety-net-amount {
  display: flex;
  flex-direction: column;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.amount-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.safety-net-months {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.months-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing);
}

.months-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.months-label {
  font-size: 12px;
  color: var(--color-primary);
}

.months-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 120px;
}

.safety-net-recommendation {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing);
  background-color: var(--color-info-light);
  border-radius: var(--radius);
  font-size: 14px;
  color: var(--color-info);
}

@media (max-width: 1200px) {
  .analytics-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .safety-net-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  .comparison-stats {
    gap: var(--spacing);
  }
  
  .comparison-item {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
  
  .trend-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .insight-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>