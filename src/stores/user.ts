import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiService, type User } from '../services/api'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadUser = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.getCurrentUser()
      if (response.success) {
        currentUser.value = response.data
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки пользователя'
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateUser(userData)
      if (response.success) {
        currentUser.value = response.data
        return response.data
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка обновления профиля'
      throw err
    }
  }

  const subscribeToPremium = async (promoCode?: string) => {
    try {
      const response = await apiService.subscribeToPremium(promoCode)
      if (response.success && currentUser.value) {
        currentUser.value.plan = 'premium'
        return response.data
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка оформления подписки'
      throw err
    }
  }

  const validatePromoCode = async (code: string) => {
    try {
      const response = await apiService.validatePromoCode(code)
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка проверки промокода'
      throw err
    }
  }

  return {
    currentUser,
    isLoading,
    error,
    loadUser,
    updateUser,
    subscribeToPremium,
    validatePromoCode
  }
})