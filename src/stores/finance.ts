import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService, type Transaction, type Account, type Category, type Friend, type Project, type SharedTransaction } from '../services/api'

export { type Transaction, type Account, type Category, type Friend, type Project, type SharedTransaction }

export const useFinanceStore = defineStore('finance', () => {
  // Состояние загрузки
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Данные
  const transactions = ref<Transaction[]>([])
  const accounts = ref<Account[]>([])
  const categories = ref<Category[]>([])
  const friends = ref<Friend[]>([])
  const projects = ref<Project[]>([])
  const sharedTransactions = ref<SharedTransaction[]>([])

  // Вычисляемые значения для категорий
  const categoriesTree = computed(() => {
    const buildTree = (parentId?: string): Category[] => {
      return categories.value
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id)
        }))
    }
    return buildTree()
  })

  const rootCategories = computed(() => {
    return categories.value.filter(cat => cat.level === 1)
  })

  const getChildCategories = (parentId: string) => {
    return categories.value.filter(cat => cat.parentId === parentId)
  }

  // Вычисляемые значения
  const totalBalance = computed(() => {
    return accounts.value.reduce((sum, account) => sum + account.balance, 0)
  })

  const monthlyIncome = computed(() => {
    const currentMonth = new Date().getMonth()
    return transactions.value
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0)
  })

  const monthlyExpenses = computed(() => {
    const currentMonth = new Date().getMonth()
    return Math.abs(transactions.value
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0))
  })

  // Утилиты для обработки ошибок
  const handleError = (err: any) => {
    error.value = err.message || 'Произошла ошибка'
    console.error('API Error:', err)
  }

  const clearError = () => {
    error.value = null
  }

  // Загрузка всех данных
  const loadAllData = async () => {
    isLoading.value = true
    clearError()
    
    try {
      const [
        transactionsResponse,
        accountsResponse,
        categoriesResponse,
        friendsResponse,
        projectsResponse,
        sharedResponse
      ] = await Promise.all([
        apiService.getTransactions(),
        apiService.getAccounts(),
        apiService.getCategories(),
        apiService.getFriends(),
        apiService.getProjects(),
        apiService.getSharedTransactions()
      ])

      if (transactionsResponse.success) {
        transactions.value = transactionsResponse.data
      }
      
      if (accountsResponse.success) {
        accounts.value = accountsResponse.data
      }
      
      if (categoriesResponse.success) {
        categories.value = categoriesResponse.data
      }
      
      if (friendsResponse.success) {
        friends.value = friendsResponse.data
      }
      
      if (projectsResponse.success) {
        projects.value = projectsResponse.data
      }
      
      if (sharedResponse.success) {
        sharedTransactions.value = sharedResponse.data
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  // Транзакции
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    try {
      const response = await apiService.createTransaction(transaction)
      if (response.success) {
        transactions.value.unshift(response.data)
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      const response = await apiService.updateTransaction(id, transaction)
      if (response.success) {
        const index = transactions.value.findIndex(t => t.id === id)
        if (index > -1) {
          transactions.value[index] = response.data
        }
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await apiService.deleteTransaction(id)
      if (response.success) {
        const index = transactions.value.findIndex(t => t.id === id)
        if (index > -1) {
          transactions.value.splice(index, 1)
        }
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  // Счета
  const addAccount = async (account: Omit<Account, 'id' | 'userId'>) => {
    try {
      const response = await apiService.createAccount(account)
      if (response.success) {
        accounts.value.push(response.data)
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateAccount = async (id: string, account: Partial<Account>) => {
    try {
      const response = await apiService.updateAccount(id, account)
      if (response.success) {
        const index = accounts.value.findIndex(a => a.id === id)
        if (index > -1) {
          accounts.value[index] = response.data
        }
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      const response = await apiService.deleteAccount(id)
      if (response.success) {
        const index = accounts.value.findIndex(a => a.id === id)
        if (index > -1) {
          accounts.value.splice(index, 1)
        }
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  // Категории
  const addCategory = async (category: Omit<Category, 'id' | 'userId'>) => {
    try {
      const response = await apiService.createCategory(category)
      if (response.success) {
        categories.value.push(response.data)
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const response = await apiService.updateCategory(id, category)
      if (response.success) {
        const index = categories.value.findIndex(c => c.id === id)
        if (index > -1) {
          categories.value[index] = response.data
        }
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const response = await apiService.deleteCategory(id)
      if (response.success) {
        const index = categories.value.findIndex(c => c.id === id)
        if (index > -1) {
          categories.value.splice(index, 1)
        }
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  // Друзья
  const addFriend = async (friend: Omit<Friend, 'id' | 'userId'>) => {
    try {
      const response = await apiService.addFriend(friend)
      if (response.success) {
        friends.value.push(response.data)
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  // Проекты
  const addProject = async (project: Omit<Project, 'id' | 'userId'>) => {
    try {
      const response = await apiService.createProject(project)
      if (response.success) {
        projects.value.push(response.data)
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const updateProject = async (id: string, project: Partial<Project>) => {
    try {
      const response = await apiService.updateProject(id, project)
      if (response.success) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index > -1) {
          projects.value[index] = response.data
        }
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  // Совместные транзакции
  const addSharedTransaction = async (sharedTransaction: Omit<SharedTransaction, 'id'>) => {
    try {
      const response = await apiService.createSharedTransaction(sharedTransaction)
      if (response.success) {
        sharedTransactions.value.push(response.data)
        return response.data
      }
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  return {
    // Состояние
    isLoading,
    error,
    
    // Данные
    transactions,
    accounts,
    categories,
    categoriesTree,
    rootCategories,
    friends,
    projects,
    sharedTransactions,
    
    // Вычисляемые значения
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    
    // Методы
    loadAllData,
    clearError,
    
    // CRUD операции
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addFriend,
    addProject,
    updateProject,
    addSharedTransaction,
    getChildCategories
  }
})