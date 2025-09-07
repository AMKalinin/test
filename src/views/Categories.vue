<template>
  <div class="categories-page">
    <div class="page-header">
      <div>
        <h1>{{ $t('categories.title') }}</h1>
        <p class="subtitle">{{ $t('categories.subtitle') }}</p>
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
      </button>
    </div>

    <div v-if="activeTab === 'categories'" class="categories-tab">
      <div class="tab-header">
        <h2>{{ $t('categories.tabs.categories') }}</h2>
        <button class="btn btn-primary" @click="showAddCategoryModal = true">
          <i class="ri-add-line"></i>
          {{ $t('categories.addCategory') }}
        </button>
      </div>

      <div class="categories-sections">
        <div class="section card">
          <div class="section-header">
            <h3>{{ $t('categories.incomeCategories') }}</h3>
            <button class="btn btn-secondary btn-sm" @click="openCategoryModal('income')">
              <i class="ri-add-line"></i>
              {{ $t('categories.addCategory') }}
            </button>
          </div>
          <CategoryTree 
            :categories="incomeCategories" 
            @edit="editCategory"
            @delete="deleteCategory"
            @add-child="addChildCategory"
          />
        </div>

        <div class="section card">
          <div class="section-header">
            <h3>{{ $t('categories.expenseCategories') }}</h3>
            <button class="btn btn-secondary btn-sm" @click="openCategoryModal('expense')">
              <i class="ri-add-line"></i>
              {{ $t('categories.addCategory') }}
            </button>
          </div>
          <CategoryTree 
            :categories="expenseCategories" 
            @edit="editCategory"
            @delete="deleteCategory"
            @add-child="addChildCategory"
          />
        </div>
      </div>
    </div>

    <div v-else class="budgets-tab">
      <div class="tab-header">
        <h2>{{ $t('categories.tabs.budgets') }}</h2>
        <button class="btn btn-primary" @click="showAddBudgetModal = true">
          <i class="ri-add-line"></i>
          {{ $t('categories.addBudget') }}
        </button>
      </div>

      <div class="period-filter">
        <button
          v-for="period in periodOptions"
          :key="period.value"
          class="period-btn"
          :class="{ active: selectedPeriod === period.value }"
          @click="selectedPeriod = period.value"
        >
          {{ $t(`periods.${period.value}`) }}
        </button>
      </div>

      <div class="budgets-grid">
        <div v-for="budget in budgetCategories" :key="budget.id" class="budget-card card">
          <div class="budget-header">
            <div class="budget-icon" :style="{ backgroundColor: budget.color }">
              <i :class="budget.icon"></i>
            </div>
            <div class="budget-name">{{ budget.name }}</div>
            <div class="budget-actions">
              <button class="action-btn" @click="editBudget(budget)">
                <i class="ri-edit-line"></i>
              </button>
              <button class="action-btn" @click="deleteBudget(budget.id)">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
          
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :class="getProgressClass(budget)"
              :style="{ width: `${Math.min(getProgressPercentage(budget), 100)}%` }"
            ></div>
          </div>
          
          <div class="budget-info">
            <div class="budget-amounts">
              {{ formatCurrency(budget.spent || 0) }} / {{ formatCurrency(budget.budget || 0) }}
            </div>
            <div class="budget-percentage" :class="getProgressClass(budget)">
              {{ getProgressPercentage(budget) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCategoryModal" class="modal-overlay" @click="closeCategoryModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCategory ? $t('categories.editCategory') : $t('categories.newCategory') }}</h2>
          <button class="close-btn" @click="closeCategoryModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label class="form-label">{{ $t('categories.categoryName') }}</label>
              <input 
                v-model="categoryForm.name" 
                type="text" 
                class="form-control" 
                :placeholder="$t('categories.categoryName')"
                required 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('common.type') }}</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input 
                    v-model="categoryForm.type" 
                    type="radio" 
                    value="income"
                    :disabled="!!categoryForm.parentId"
                  />
                  {{ $t('transactions.types.income') }}
                </label>
                <label class="radio-option">
                  <input 
                    v-model="categoryForm.type" 
                    type="radio" 
                    value="expense"
                    :disabled="!!categoryForm.parentId"
                  />
                  {{ $t('transactions.types.expense') }}
                </label>
              </div>
            </div>
            
            <div v-if="categoryForm.parentId" class="form-group">
              <label class="form-label">{{ $t('categories.parentCategory') }}</label>
              <div class="parent-category-display">
                <div class="category-icon" :style="{ backgroundColor: getParentCategory()?.color }">
                  <i :class="getParentCategory()?.icon"></i>
                </div>
                {{ getParentCategory()?.name }}
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
                  :class="{ selected: categoryForm.icon === icon }"
                  @click="categoryForm.icon = icon"
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
                  :class="{ selected: categoryForm.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="categoryForm.color = color"
                ></button>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeCategoryModal">
                {{ $t('modal.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingCategory ? $t('modal.save') : $t('modal.add') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Budget Modal -->
    <div v-if="showAddBudgetModal" class="modal-overlay" @click="closeBudgetModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingBudget ? $t('categories.editBudget') : $t('categories.newBudget') }}</h2>
          <button class="close-btn" @click="closeBudgetModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="saveBudget">
            <div class="form-group">
              <label class="form-label">{{ $t('common.category') }}</label>
              <select v-model="budgetForm.categoryId" class="form-control" required>
                <option value="">{{ $t('transactions.selectCategory') }}</option>
                <option 
                  v-for="category in expenseCategories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('categories.budgetLimit') }}</label>
              <input 
                v-model="budgetForm.budget" 
                type="number" 
                class="form-control" 
                :placeholder="$t('common.amount')"
                min="1"
                required 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('categories.period') }}</label>
              <div class="period-options">
                <button
                  v-for="period in periodOptions"
                  :key="period.value"
                  type="button"
                  class="period-option"
                  :class="{ selected: budgetForm.period === period.value }"
                  @click="budgetForm.period = period.value"
                >
                  {{ $t(`categories.periods.${period.value}`) }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('categories.notifications') }}</label>
              <div class="checkbox-group">
                <label class="checkbox-option">
                  <input type="checkbox" v-model="budgetForm.notifications.fifty" />
                  {{ $t('categories.notificationOptions.fifty') }}
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" v-model="budgetForm.notifications.seventyFive" />
                  {{ $t('categories.notificationOptions.seventyFive') }}
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" v-model="budgetForm.notifications.hundred" />
                  {{ $t('categories.notificationOptions.hundred') }}
                </label>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeBudgetModal">
                {{ $t('modal.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingBudget ? $t('modal.save') : $t('modal.create') }}
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
import { useFinanceStore, type Category } from '../stores/finance'
import { useI18n } from 'vue-i18n'
import CategoryTree from '../components/CategoryTree.vue'

const { t } = useI18n()
const financeStore = useFinanceStore()

const activeTab = ref('categories')
const selectedPeriod = ref('month')
const showAddCategoryModal = ref(false)
const showAddBudgetModal = ref(false)
const editingCategory = ref<Category | null>(null)
const editingBudget = ref<Category | null>(null)

const tabs = [
  { labelKey: 'categories.tabs.categories', value: 'categories' },
  { labelKey: 'categories.tabs.budgets', value: 'budgets' }
]

const periodOptions = [
  { value: 'week' },
  { value: 'month' },
  { value: 'quarter' },
  { value: 'year' }
]

const iconOptions = [
  'ri-shopping-cart-line',
  'ri-car-line',
  'ri-home-line',
  'ri-heart-pulse-line',
  'ri-film-line',
  'ri-restaurant-line',
  'ri-money-dollar-circle-line',
  'ri-briefcase-line',
  'ri-bank-line',
  'ri-gift-line',
  'ri-computer-line',
  'ri-book-line',
  'ri-store-line',
  'ri-store-2-line',
  'ri-bus-line',
  'ri-subway-line',
  'ri-taxi-line',
  'ri-movie-line',
  'ri-cake-line'
]

const colorOptions = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
]

const categoryForm = ref({
  name: '',
  type: 'expense' as 'income' | 'expense',
  icon: 'ri-shopping-cart-line',
  color: '#f44336',
  parentId: undefined as string | undefined,
  level: 1
})

const budgetForm = ref({
  categoryId: '',
  budget: 0,
  period: 'month',
  notifications: {
    fifty: true,
    seventyFive: true,
    hundred: true
  }
})

const incomeCategories = computed(() => {
  return financeStore.categoriesTree.filter(c => c.type === 'income')
})

const expenseCategories = computed(() => {
  return financeStore.categoriesTree.filter(c => c.type === 'expense')
})

const budgetCategories = computed(() => {
  return financeStore.categories.filter(c => c.budget && c.spent !== undefined)
})

const getTransactionCount = (categoryName: string): number => {
  return financeStore.transactions.filter(t => t.category === categoryName).length
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const getProgressPercentage = (category: Category): number => {
  if (!category.budget || !category.spent) return 0
  return Math.round((category.spent / category.budget) * 100)
}

const getProgressClass = (category: Category): string => {
  const percentage = getProgressPercentage(category)
  if (percentage >= 100) return 'danger'
  if (percentage >= 80) return 'warning'
  return 'normal'
}

const openCategoryModal = (type: 'income' | 'expense', parentId?: string) => {
  categoryForm.value.type = type
  categoryForm.value.parentId = parentId
  categoryForm.value.level = parentId ? (getParentLevel(parentId) + 1) : 1
  showAddCategoryModal.value = true
}

const addChildCategory = (parentCategory: Category) => {
  if (parentCategory.level >= 3) {
    alert('Максимальная глубина вложенности - 3 уровня')
    return
  }
  openCategoryModal(parentCategory.type, parentCategory.id)
}

const getParentLevel = (parentId: string): number => {
  const parent = financeStore.categories.find(c => c.id === parentId)
  return parent?.level || 0
}

const getParentCategory = (): Category | undefined => {
  if (!categoryForm.value.parentId) return undefined
  return financeStore.categories.find(c => c.id === categoryForm.value.parentId)
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    parentId: category.parentId,
    level: category.level
  }
  showAddCategoryModal.value = true
}

const deleteCategory = (id: string) => {
  const hasChildren = financeStore.categories.some(c => c.parentId === id)
  if (hasChildren) {
    alert('Нельзя удалить категорию, у которой есть подкатегории')
    return
  }
  
  if (confirm(t('categories.confirmDeleteCategory'))) {
    financeStore.deleteCategory(id)
      .catch(() => {
        alert('Ошибка удаления категории')
      })
  }
}

const editBudget = (budget: Category) => {
  editingBudget.value = budget
  budgetForm.value = {
    categoryId: budget.id,
    budget: budget.budget || 0,
    period: 'month',
    notifications: {
      fifty: true,
      seventyFive: true,
      hundred: true
    }
  }
  showAddBudgetModal.value = true
}

const deleteBudget = (id: string) => {
  if (confirm(t('categories.confirmDeleteBudget'))) {
    const category = financeStore.categories.find(c => c.id === id)
    if (category) {
      delete category.budget
      delete category.spent
    }
  }
}

const saveCategory = () => {
  if (editingCategory.value) {
    financeStore.updateCategory(editingCategory.value.id, categoryForm.value)
      .then(() => {
        closeCategoryModal()
      })
      .catch(() => {
        alert('Ошибка обновления категории')
      })
  } else {
    financeStore.addCategory(categoryForm.value)
      .then(() => {
        closeCategoryModal()
      })
      .catch(() => {
        alert('Ошибка создания категории')
      })
  }
}

const saveBudget = () => {
  const category = financeStore.categories.find(c => c.id === budgetForm.value.categoryId)
  if (category) {
    category.budget = budgetForm.value.budget
    category.spent = category.spent || 0
  }
  
  closeBudgetModal()
}

const closeCategoryModal = () => {
  showAddCategoryModal.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    type: 'expense',
    icon: 'ri-shopping-cart-line',
    color: '#f44336',
    parentId: undefined,
    level: 1
  }
}

const closeBudgetModal = () => {
  showAddBudgetModal.value = false
  editingBudget.value = null
  budgetForm.value = {
    categoryId: '',
    budget: 0,
    period: 'month',
    notifications: {
      fifty: true,
      seventyFive: true,
      hundred: true
    }
  }
}
</script>

<style scoped>
.categories-page {
  max-width: 1400px;
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
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab:hover:not(.active) {
  color: var(--color-text-primary);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.tab-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.categories-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.section-header {
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.btn-sm {
  padding: var(--spacing-sm) var(--spacing);
  font-size: 12px;
}

.parent-category-display {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing);
  background-color: var(--color-surface-alt);
  border-radius: var(--radius);
  font-size: 14px;
  color: var(--color-text-primary);
}

.parent-category-display .category-icon {
  width: 24px;
  height: 24px;
  font-size: 12px;
}
.categories-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.category-item {
  display: flex;
  align-items: center;
  padding: var(--spacing);
  border-radius: var(--radius);
  transition: background-color 0.2s ease;
  gap: var(--spacing);
}

.category-item:hover {
  background-color: var(--color-surface-alt);
}

.expand-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: var(--spacing-xs);
}

.category-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.category-info {
  flex: 1;
}

.category-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 16px;
  margin-bottom: 2px;
}

.category-stats {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.category-actions {
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
  color: var(--color-primary);
}

.period-filter {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.period-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn.active,
.period-btn:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.budget-card {
  padding: var(--spacing-xl);
}

.budget-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing);
}

.budget-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.budget-name {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 16px;
}

.budget-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.progress-container {
  height: 8px;
  background-color: var(--color-border-light);
  border-radius: 4px;
  margin-bottom: var(--spacing);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
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

.budget-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-amounts {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

.budget-percentage {
  font-weight: 500;
  font-size: 14px;
}

.budget-percentage.normal {
  color: var(--color-success);
}

.budget-percentage.warning {
  color: var(--color-warning);
}

.budget-percentage.danger {
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

.radio-group {
  display: flex;
  gap: var(--spacing-lg);
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: var(--spacing-sm);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-sm);
}

.icon-option {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
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
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-sm);
}

.color-option {
  width: 32px;
  height: 32px;
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

.period-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.period-option {
  padding: var(--spacing);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-option:hover,
.period-option.selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .budgets-grid {
    grid-template-columns: 1fr;
  }
  
  .icon-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .color-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .period-options {
    grid-template-columns: 1fr;
  }
  
  .period-filter {
    flex-wrap: wrap;
  }
  
  .tab-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.checkbox-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: var(--spacing);
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