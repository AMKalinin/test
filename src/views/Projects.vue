<template>
  <div class="projects-page">
    <div class="page-header">
      <div>
        <h1>Проекты</h1>
        <p class="subtitle">Отслеживайте бюджеты крупных событий и проектов</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="ri-add-line"></i>
        Создать проект
      </button>
    </div>

    <div class="projects-grid">
      <div v-for="project in financeStore.projects" :key="project.id" class="project-card card">
        <div class="project-header">
          <div class="project-icon" :style="{ backgroundColor: project.color }">
            <i :class="project.icon"></i>
          </div>
          <div class="project-actions">
            <button class="action-btn" @click="editProject(project)">
              <i class="ri-edit-line"></i>
            </button>
            <button class="action-btn" @click="archiveProject(project.id)">
              <i class="ri-archive-line"></i>
            </button>
          </div>
        </div>
        
        <div class="project-info">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-description">{{ project.description }}</p>
        </div>
        
        <div class="project-progress">
          <div class="progress-header">
            <span class="progress-label">{{ $t('projects.progress') }}</span>
            <span class="progress-percentage">{{ getProgressPercentage(project) }}%</span>
          </div>
          <div class="progress-bar-container">
            <div 
              class="progress-bar" 
              :class="getProgressClass(project)"
              :style="{ width: `${Math.min(getProgressPercentage(project), 100)}%` }"
            ></div>
          </div>
          <div class="progress-amounts">
            <span>{{ formatCurrency(project.spent) }}</span>
            <span>{{ formatCurrency(project.budget) }}</span>
          </div>
        </div>
        
        <div class="project-dates">
          <div class="date-item">
            <i class="ri-calendar-line"></i>
            <span>{{ formatDate(project.startDate) }}</span>
          </div>
          <div v-if="project.endDate" class="date-item">
            <i class="ri-flag-line"></i>
            <span>{{ formatDate(project.endDate) }}</span>
          </div>
        </div>
        
        <div class="project-stats">
          <div class="stat-item">
            <span class="stat-label">{{ $t('projects.remaining') }}</span>
            <span class="stat-value" :class="{ negative: project.spent > project.budget }">
              {{ formatCurrency(project.budget - project.spent) }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('projects.daysToCompletion') }}</span>
            <span class="stat-value">{{ getDaysRemaining(project.endDate) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Project Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProject ? $t('projects.editProject') : $t('projects.newProject') }}</h2>
          <button class="close-btn" @click="closeModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="saveProject">
            <div class="form-group">
              <label class="form-label">{{ $t('projects.projectName') }}</label>
              <input 
                v-model="projectForm.name" 
                type="text" 
                class="form-control" 
                :placeholder="$t('projects.placeholders.projectName')"
                required 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('common.description') }}</label>
              <textarea 
                v-model="projectForm.description" 
                class="form-control" 
                rows="3"
                :placeholder="$t('projects.placeholders.description')"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ $t('projects.budget') }}</label>
                <input 
                  v-model="projectForm.budget" 
                  type="number" 
                  class="form-control" 
                  step="0.01"
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ $t('projects.startDate') }}</label>
                <input 
                  v-model="projectForm.startDate" 
                  type="date" 
                  class="form-control" 
                  required 
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('projects.endDate') }}</label>
              <input 
                v-model="projectForm.endDate" 
                type="date" 
                class="form-control" 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('accounts.icon') }}</label>
              <div class="icon-grid">
                <button
                  v-for="icon in iconOptions"
                  :key="icon"
                  type="button"
                  class="icon-option"
                  :class="{ selected: projectForm.icon === icon }"
                  @click="projectForm.icon = icon"
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
                  :class="{ selected: projectForm.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="projectForm.color = color"
                ></button>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                {{ $t('modal.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingProject ? $t('modal.save') : $t('modal.create') }}
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
import { useFinanceStore, type Project } from '../stores/finance'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const financeStore = useFinanceStore()

const showAddModal = ref(false)
const editingProject = ref<Project | null>(null)

const projectForm = ref({
  name: '',
  description: '',
  budget: 0,
  spent: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  color: '#ff9800',
  icon: 'ri-folder-line',
  isActive: true
})

const iconOptions = [
  'ri-home-repair-line',
  'ri-plane-line',
  'ri-car-line',
  'ri-graduation-cap-line',
  'ri-heart-line',
  'ri-gift-line',
  'ri-computer-line',
  'ri-camera-line',
  'ri-music-line',
  'ri-book-line',
  'ri-briefcase-line',
  'ri-folder-line'
]

const colorOptions = [
  '#ff9800', '#2196f3', '#4caf50', '#f44336',
  '#9c27b0', '#673ab7', '#3f51b5', '#00bcd4',
  '#009688', '#8bc34a', '#cddc39', '#ffc107'
]

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getProgressPercentage = (project: Project): number => {
  if (!project.budget) return 0
  return Math.round((project.spent / project.budget) * 100)
}

const getProgressClass = (project: Project): string => {
  const percentage = getProgressPercentage(project)
  if (percentage >= 100) return 'danger'
  if (percentage >= 80) return 'warning'
  return 'normal'
}

const getDaysRemaining = (endDate?: string): string => {
  if (!endDate) return '∞'
  
  const today = new Date()
  const end = new Date(endDate)
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return t('projects.overdue')
  if (diffDays === 0) return t('projects.today')
  return `${diffDays} ${t('projects.days')}`
}

const editProject = (project: Project) => {
  editingProject.value = project
  projectForm.value = {
    name: project.name,
    description: project.description,
    budget: project.budget,
    spent: project.spent,
    startDate: project.startDate,
    endDate: project.endDate || '',
    color: project.color,
    icon: project.icon,
    isActive: project.isActive
  }
  showAddModal.value = true
}

const archiveProject = (id: string) => {
  if (confirm(t('projects.confirmArchive'))) {
    const project = financeStore.projects.find(p => p.id === id)
    if (project) {
      project.isActive = false
    }
  }
}

const saveProject = () => {
  if (editingProject.value) {
    financeStore.updateProject(editingProject.value.id, projectForm.value)
      .then(() => {
        closeModal()
      })
      .catch(() => {
        alert('Ошибка обновления проекта')
      })
  } else {
    financeStore.addProject(projectForm.value)
      .then(() => {
        closeModal()
      })
      .catch(() => {
        alert('Ошибка создания проекта')
      })
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingProject.value = null
  projectForm.value = {
    name: '',
    description: '',
    budget: 0,
    spent: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#ff9800',
    icon: 'ri-folder-line',
    isActive: true
  }
}
</script>

<style scoped>
.projects-page {
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

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-xl);
}

.project-card {
  padding: var(--spacing-xl);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.project-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.project-actions {
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

.project-info {
  margin-bottom: var(--spacing-xl);
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.project-description {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.project-progress {
  margin-bottom: var(--spacing-xl);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.progress-percentage {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.progress-bar-container {
  height: 8px;
  background-color: var(--color-border-light);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
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

.progress-amounts {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
}

.project-dates {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.date-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.project-stats {
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
  color: var(--color-text-primary);
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
  grid-template-columns: repeat(6, 1fr);
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .project-dates {
    flex-direction: column;
    gap: var(--spacing);
  }
  
  .project-card:hover {
    transform: none;
  }
  
  .project-stats {
    flex-direction: column;
    gap: var(--spacing);
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
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