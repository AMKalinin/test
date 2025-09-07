import { ref } from 'vue'
import { defineStore } from 'pinia'
import i18n from '../i18n'

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref(localStorage.getItem('locale') || 'ru')

  const setLocale = (locale: string) => {
    currentLocale.value = locale
    i18n.global.locale.value = locale as any
    localStorage.setItem('locale', locale)
    
    // Update document language
    document.documentElement.lang = locale
    
    // Update currency symbol based on locale
    updateCurrencySymbol(locale)
  }

  const updateCurrencySymbol = (locale: string) => {
    const currencyMap = {
      'ru': '₽',
      'en': '$'
    }
    
    // This could be used to update currency display throughout the app
    const currency = currencyMap[locale as keyof typeof currencyMap] || '₽'
    localStorage.setItem('defaultCurrency', currency)
  }

  const availableLocales = [
    { code: 'ru', name: 'Русский', flag: 'RU' },
    { code: 'en', name: 'English', flag: 'US' }
  ]

  const initLocale = () => {
    const savedLocale = localStorage.getItem('locale') || 'ru'
    setLocale(savedLocale)
  }

  return {
    currentLocale,
    availableLocales,
    setLocale,
    initLocale
  }
})