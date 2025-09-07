<template>
  <div class="category-tree">
    <div v-for="category in categories" :key="category.id" class="category-node">
      <div class="category-item" :class="`level-${category.level}`">
        <button 
          v-if="hasChildren(category)" 
          class="expand-btn"
          @click="toggleExpanded(category.id)"
        >
          <i 
            class="ri-arrow-right-s-line" 
            :class="{ expanded: expandedCategories.includes(category.id) }"
          ></i>
        </button>
        <div v-else class="expand-placeholder"></div>
        
        <div class="category-icon" :style="{ backgroundColor: category.color }">
          <i :class="category.icon"></i>
        </div>
        
        <div class="category-info">
          <div class="category-name">{{ category.name }}</div>
          <div class="category-stats">
            {{ getTransactionCount(category.name) }} {{ $t('nav.transactions').toLowerCase() }}
          </div>
        </div>
        
        <div class="category-actions">
          <button 
            v-if="category.level < 3" 
            class="action-btn add" 
            @click="$emit('add-child', category)"
            :title="$t('categories.addSubcategory')"
          >
            <i class="ri-add-line"></i>
          </button>
          <button class="action-btn edit" @click="$emit('edit', category)">
            <i class="ri-edit-line"></i>
          </button>
          <button class="action-btn delete" @click="$emit('delete', category.id)">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
      
      <div 
        v-if="hasChildren(category) && expandedCategories.includes(category.id)" 
        class="children-container"
      >
        <CategoryTree 
          :categories="getChildren(category)" 
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @add-child="$emit('add-child', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFinanceStore, type Category } from '../stores/finance'
import { useI18n } from 'vue-i18n'

interface Props {
  categories: Category[]
}

defineProps<Props>()
defineEmits(['edit', 'delete', 'add-child'])

const { t } = useI18n()
const financeStore = useFinanceStore()
const expandedCategories = ref<string[]>([])

const hasChildren = (category: Category): boolean => {
  return financeStore.getChildCategories(category.id).length > 0
}

const getChildren = (category: Category): Category[] => {
  return financeStore.getChildCategories(category.id)
}

const toggleExpanded = (categoryId: string) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

const getTransactionCount = (categoryName: string): number => {
  return financeStore.transactions.filter(t => t.category === categoryName).length
}
</script>

<style scoped>
.category-tree {
  display: flex;
  flex-direction: column;
}

.category-node {
  margin-bottom: var(--spacing-sm);
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

.category-item.level-1 {
  font-weight: 500;
}

.category-item.level-2 {
  margin-left: var(--spacing-xl);
  opacity: 0.9;
}

.category-item.level-3 {
  margin-left: calc(var(--spacing-xl) * 2);
  opacity: 0.8;
  font-size: 14px;
}

.expand-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: var(--spacing-xs);
  transition: transform 0.2s ease;
}

.expand-btn i.expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 24px;
  height: 24px;
}

.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.category-item.level-2 .category-icon,
.category-item.level-3 .category-icon {
  width: 28px;
  height: 28px;
  font-size: 12px;
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

.category-item.level-2 .category-name,
.category-item.level-3 .category-name {
  font-size: 14px;
}

.category-stats {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.category-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--color-surface-alt);
}

.action-btn.add:hover {
  color: var(--color-success);
}

.action-btn.edit:hover {
  color: var(--color-info);
}

.action-btn.delete:hover {
  color: var(--color-error);
}

.children-container {
  margin-left: var(--spacing-lg);
  border-left: 2px solid var(--color-border-light);
  padding-left: var(--spacing);
}
</style>