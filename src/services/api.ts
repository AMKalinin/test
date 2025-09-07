// API Service для работы с внешним API
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'premium'
  createdAt: string
}

export interface Transaction {
  id: string
  date: string
  account: string
  category: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  icon?: string
  color?: string
  userId: string
}

export interface Account {
  id: string
  name: string
  type: 'debit' | 'savings' | 'credit' | 'loan_given' | 'loan_taken'
  balance: number
  currency: string
  icon: string
  color: string
  userId: string
  isArchived?: boolean
  isPrimary?: boolean
  isSafetyNet?: boolean
  interestRate?: number
  creditLimit?: number
  paymentDate?: string
  loanCounterparty?: string
  loanIssueDate?: string
  loanReturnDate?: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  budget?: number
  spent?: number
  userId: string
  parentId?: string
  level: number
  isDefault?: boolean
}

export interface Friend {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  status: 'active' | 'pending' | 'sent'
  balance: number
  userId: string
}

export interface Project {
  id: string
  name: string
  description: string
  budget: number
  spent: number
  startDate: string
  endDate?: string
  color: string
  icon: string
  isActive: boolean
  userId: string
}

export interface SharedTransaction {
  id: string
  transactionId: string
  participants: {
    userId: string
    name: string
    amount: number
    paid: boolean
  }[]
  splitMethod: 'equal' | 'percentage' | 'amount'
  totalAmount: number
  paidBy: string
  createdBy: string
}

// Заглушки для API вызовов
class ApiService {
  private baseUrl = 'https://api.finsi.app/v1'
  private currentUser: User = {
    id: 'user-1',
    name: 'Алексей Петров',
    email: 'alexey@example.com',
    plan: 'free',
    createdAt: '2024-01-01'
  }

  // Имитация задержки сети
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Утилита для генерации ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Пользователь
  async getCurrentUser(): Promise<ApiResponse<User>> {
    await this.delay(300)
    return {
      data: this.currentUser,
      success: true
    }
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    await this.delay(500)
    this.currentUser = { ...this.currentUser, ...userData }
    return {
      data: this.currentUser,
      success: true,
      message: 'Профиль обновлен'
    }
  }

  // Транзакции
  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    await this.delay(800)
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: '2024-01-25',
        account: 'Дебетовая карта',
        category: 'Продукты',
        description: 'Покупка в Пятерочке',
        amount: -2450,
        type: 'expense',
        icon: 'ri-restaurant-line',
        color: '#ff9500',
        userId: this.currentUser.id
      },
      {
        id: '2',
        date: '2024-01-24',
        account: 'Дебетовая карта',
        category: 'Транспорт',
        description: 'Яндекс Такси',
        amount: -350,
        type: 'expense',
        icon: 'ri-taxi-line',
        color: '#5856d6',
        userId: this.currentUser.id
      },
      {
        id: '3',
        date: '2024-01-20',
        account: 'Сберегательный счет',
        category: 'Зарплата',
        description: 'Зарплата за январь',
        amount: 85000,
        type: 'income',
        icon: 'ri-money-dollar-circle-line',
        color: '#34c759',
        userId: this.currentUser.id
      }
    ]
    
    return {
      data: mockTransactions,
      success: true
    }
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'userId'>): Promise<ApiResponse<Transaction>> {
    await this.delay(600)
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      userId: this.currentUser.id
    }
    
    return {
      data: newTransaction,
      success: true,
      message: 'Транзакция создана'
    }
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    await this.delay(500)
    const updatedTransaction: Transaction = {
      id,
      userId: this.currentUser.id,
      ...transaction
    } as Transaction
    
    return {
      data: updatedTransaction,
      success: true,
      message: 'Транзакция обновлена'
    }
  }

  async deleteTransaction(id: string): Promise<ApiResponse<void>> {
    await this.delay(400)
    return {
      data: undefined,
      success: true,
      message: 'Транзакция удалена'
    }
  }

  // Счета
  async getAccounts(): Promise<ApiResponse<Account[]>> {
    await this.delay(600)
    const mockAccounts: Account[] = [
      {
        id: '1',
        name: 'Дебетовая карта',
        type: 'debit',
        balance: 125000,
        currency: '₽',
        icon: 'ri-bank-card-line',
        color: '#1a5d42',
        userId: this.currentUser.id
      },
      {
        id: '2',
        name: 'Наличные',
        type: 'debit',
        balance: 15000,
        currency: '₽',
        icon: 'ri-money-dollar-circle-line',
        color: '#34c759',
        userId: this.currentUser.id
      },
      {
        id: '3',
        name: 'Сберегательный счет',
        type: 'savings',
        balance: 250000,
        currency: '₽',
        icon: 'ri-bank-line',
        color: '#2196f3',
        userId: this.currentUser.id,
        isSafetyNet: true,
        interestRate: 5.5
      }
    ]
    
    return {
      data: mockAccounts,
      success: true
    }
  }

  async createAccount(account: Omit<Account, 'id' | 'userId'>): Promise<ApiResponse<Account>> {
    await this.delay(600)
    const newAccount: Account = {
      ...account,
      id: this.generateId(),
      userId: this.currentUser.id
    }
    
    return {
      data: newAccount,
      success: true,
      message: 'Счет создан'
    }
  }

  async updateAccount(id: string, account: Partial<Account>): Promise<ApiResponse<Account>> {
    await this.delay(500)
    const updatedAccount: Account = {
      id,
      userId: this.currentUser.id,
      ...account
    } as Account
    
    return {
      data: updatedAccount,
      success: true,
      message: 'Счет обновлен'
    }
  }

  async deleteAccount(id: string): Promise<ApiResponse<void>> {
    await this.delay(400)
    return {
      data: undefined,
      success: true,
      message: 'Счет удален'
    }
  }

  // Категории
  async getCategories(): Promise<ApiResponse<Category[]>> {
    await this.delay(500)
    const mockCategories: Category[] = [
      // Категории расходов - уровень 1
      {
        id: '1',
        name: 'Продукты',
        type: 'expense',
        icon: 'ri-shopping-cart-line',
        color: '#f44336',
        budget: 30000,
        spent: 19500,
        userId: this.currentUser.id,
        level: 1
      },
      {
        id: '1-1',
        name: 'Супермаркеты',
        type: 'expense',
        icon: 'ri-store-line',
        color: '#f44336',
        parentId: '1',
        userId: this.currentUser.id,
        level: 2
      },
      {
        id: '1-1-1',
        name: 'Пятерочка',
        type: 'expense',
        icon: 'ri-store-2-line',
        color: '#f44336',
        parentId: '1-1',
        userId: this.currentUser.id,
        level: 3
      },
      {
        id: '1-1-2',
        name: 'Магнит',
        type: 'expense',
        icon: 'ri-store-2-line',
        color: '#f44336',
        parentId: '1-1',
        userId: this.currentUser.id,
        level: 3
      },
      {
        id: '1-2',
        name: 'Рестораны',
        type: 'expense',
        icon: 'ri-restaurant-line',
        color: '#f44336',
        parentId: '1',
        userId: this.currentUser.id,
        level: 2
      },
      {
        id: '1-2-1',
        name: 'Фастфуд',
        type: 'expense',
        icon: 'ri-cake-line',
        color: '#f44336',
        parentId: '1-2',
        userId: this.currentUser.id,
        level: 3
      },
      {
        id: '2',
        name: 'Транспорт',
        type: 'expense',
        icon: 'ri-car-line',
        color: '#3f51b5',
        budget: 10000,
        spent: 8500,
        userId: this.currentUser.id,
        level: 1
      },
      {
        id: '2-1',
        name: 'Общественный транспорт',
        type: 'expense',
        icon: 'ri-bus-line',
        color: '#3f51b5',
        parentId: '2',
        userId: this.currentUser.id,
        level: 2
      },
      {
        id: '2-1-1',
        name: 'Метро',
        type: 'expense',
        icon: 'ri-subway-line',
        color: '#3f51b5',
        parentId: '2-1',
        userId: this.currentUser.id,
        level: 3
      },
      {
        id: '2-2',
        name: 'Такси',
        type: 'expense',
        icon: 'ri-taxi-line',
        color: '#3f51b5',
        parentId: '2',
        userId: this.currentUser.id,
        level: 2
      },
      {
        id: '3',
        name: 'Развлечения',
        type: 'expense',
        icon: 'ri-film-line',
        color: '#673ab7',
        budget: 5000,
        spent: 5500,
        userId: this.currentUser.id,
        level: 1
      },
      {
        id: '3-1',
        name: 'Кино',
        type: 'expense',
        icon: 'ri-movie-line',
        color: '#673ab7',
        parentId: '3',
        userId: this.currentUser.id,
        level: 2
      },
      // Категории доходов - уровень 1
      {
        id: '4',
        name: 'Зарплата',
        type: 'income',
        icon: 'ri-money-dollar-circle-line',
        color: '#4caf50',
        userId: this.currentUser.id,
        level: 1
      },
      {
        id: '4-1',
        name: 'Основная работа',
        type: 'income',
        icon: 'ri-briefcase-line',
        color: '#4caf50',
        parentId: '4',
        userId: this.currentUser.id,
        level: 2
      },
      {
        id: '4-2',
        name: 'Фриланс',
        type: 'income',
        icon: 'ri-computer-line',
        color: '#4caf50',
        parentId: '4',
        userId: this.currentUser.id,
        level: 2
      },
      {
        id: '5',
        name: 'Инвестиции',
        type: 'income',
        icon: 'ri-line-chart-line',
        color: '#2196f3',
        userId: this.currentUser.id,
        level: 1
      }
    ]
    
    return {
      data: mockCategories,
      success: true
    }
  }

  async createCategory(category: Omit<Category, 'id' | 'userId'>): Promise<ApiResponse<Category>> {
    await this.delay(500)
    const newCategory: Category = {
      ...category,
      id: this.generateId(),
      userId: this.currentUser.id,
      level: category.level || 1
    }
    
    return {
      data: newCategory,
      success: true,
      message: 'Категория создана'
    }
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
    await this.delay(400)
    const updatedCategory: Category = {
      id,
      userId: this.currentUser.id,
      ...category
    } as Category
    
    return {
      data: updatedCategory,
      success: true,
      message: 'Категория обновлена'
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    await this.delay(300)
    return {
      data: undefined,
      success: true,
      message: 'Категория удалена'
    }
  }

  // Друзья
  async getFriends(): Promise<ApiResponse<Friend[]>> {
    await this.delay(400)
    const mockFriends: Friend[] = [
      {
        id: '1',
        name: 'Анна Ковалева',
        email: 'anna@example.com',
        status: 'active',
        balance: 1000,
        userId: this.currentUser.id
      },
      {
        id: '2',
        name: 'Иван Смирнов',
        phone: '+7 (912) 345-67-89',
        status: 'active',
        balance: -500,
        userId: this.currentUser.id
      },
      {
        id: '3',
        name: 'Мария Петрова',
        email: 'maria@example.com',
        status: 'active',
        balance: 0,
        userId: this.currentUser.id
      }
    ]
    
    return {
      data: mockFriends,
      success: true
    }
  }

  async addFriend(friend: Omit<Friend, 'id' | 'userId'>): Promise<ApiResponse<Friend>> {
    await this.delay(600)
    const newFriend: Friend = {
      ...friend,
      id: this.generateId(),
      userId: this.currentUser.id
    }
    
    return {
      data: newFriend,
      success: true,
      message: 'Приглашение отправлено'
    }
  }

  // Проекты
  async getProjects(): Promise<ApiResponse<Project[]>> {
    await this.delay(500)
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Ремонт кухни',
        description: 'Полный ремонт кухни с заменой мебели',
        budget: 300000,
        spent: 125000,
        startDate: '2024-01-01',
        endDate: '2024-06-01',
        color: '#ff9800',
        icon: 'ri-home-repair-line',
        isActive: true,
        userId: this.currentUser.id
      },
      {
        id: '2',
        name: 'Отпуск в Греции',
        description: 'Семейный отпуск на 2 недели',
        budget: 150000,
        spent: 45000,
        startDate: '2024-02-01',
        endDate: '2024-07-01',
        color: '#2196f3',
        icon: 'ri-plane-line',
        isActive: true,
        userId: this.currentUser.id
      }
    ]
    
    return {
      data: mockProjects,
      success: true
    }
  }

  async createProject(project: Omit<Project, 'id' | 'userId'>): Promise<ApiResponse<Project>> {
    await this.delay(600)
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      userId: this.currentUser.id
    }
    
    return {
      data: newProject,
      success: true,
      message: 'Проект создан'
    }
  }

  async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    await this.delay(500)
    const updatedProject: Project = {
      id,
      userId: this.currentUser.id,
      ...project
    } as Project
    
    return {
      data: updatedProject,
      success: true,
      message: 'Проект обновлен'
    }
  }

  // Совместные транзакции
  async getSharedTransactions(): Promise<ApiResponse<SharedTransaction[]>> {
    await this.delay(600)
    const mockSharedTransactions: SharedTransaction[] = [
      {
        id: '1',
        transactionId: 'shared-1',
        participants: [
          { userId: this.currentUser.id, name: 'Вы', amount: 1000, paid: true },
          { userId: '1', name: 'Анна Ковалева', amount: 1000, paid: false },
          { userId: '2', name: 'Иван Смирнов', amount: 1000, paid: false }
        ],
        splitMethod: 'equal',
        totalAmount: 3000,
        paidBy: this.currentUser.id,
        createdBy: this.currentUser.id
      }
    ]
    
    return {
      data: mockSharedTransactions,
      success: true
    }
  }

  async createSharedTransaction(sharedTransaction: Omit<SharedTransaction, 'id'>): Promise<ApiResponse<SharedTransaction>> {
    await this.delay(700)
    const newSharedTransaction: SharedTransaction = {
      ...sharedTransaction,
      id: this.generateId()
    }
    
    return {
      data: newSharedTransaction,
      success: true,
      message: 'Совместная транзакция создана'
    }
  }

  // Аналитика
  async getAnalytics(period: string): Promise<ApiResponse<any>> {
    await this.delay(1000)
    const mockAnalytics = {
      totalBalance: 390000,
      monthlyIncome: 85000,
      monthlyExpenses: 40700,
      monthlySavings: 44300,
      expensesByCategory: [
        { name: 'Продукты', value: 19500, color: '#f44336' },
        { name: 'Транспорт', value: 8500, color: '#3f51b5' },
        { name: 'Развлечения', value: 5500, color: '#673ab7' },
        { name: 'Здоровье', value: 3000, color: '#009688' },
        { name: 'Другое', value: 4200, color: '#ff9800' }
      ],
      balanceHistory: [120000, 125000, 123000, 128000, 130000, 127000, 132000],
      trends: [
        {
          category: 'Продукты',
          change: '+15%',
          direction: 'up'
        },
        {
          category: 'Транспорт',
          change: '-8%',
          direction: 'down'
        }
      ]
    }
    
    return {
      data: mockAnalytics,
      success: true
    }
  }

  // Настройки
  async getSettings(): Promise<ApiResponse<any>> {
    await this.delay(300)
    const mockSettings = {
      theme: 'light',
      language: 'ru',
      currency: 'RUB',
      notifications: {
        push: true,
        budget: true,
        weekly: false
      }
    }
    
    return {
      data: mockSettings,
      success: true
    }
  }

  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    await this.delay(500)
    return {
      data: settings,
      success: true,
      message: 'Настройки сохранены'
    }
  }

  // Премиум подписка
  async subscribeToPremium(promoCode?: string): Promise<ApiResponse<any>> {
    await this.delay(1000)
    
    if (promoCode === 'FINSI2024') {
      return {
        data: { discount: 50, finalPrice: 149.50 },
        success: true,
        message: 'Промокод применен! Скидка 50%'
      }
    }
    
    return {
      data: { finalPrice: 299 },
      success: true,
      message: 'Подписка оформлена'
    }
  }

  async validatePromoCode(code: string): Promise<ApiResponse<any>> {
    await this.delay(300)
    
    if (code === 'FINSI2024') {
      return {
        data: { valid: true, discount: 50 },
        success: true,
        message: 'Промокод действителен'
      }
    }
    
    return {
      data: { valid: false },
      success: false,
      message: 'Промокод недействителен'
    }
  }
}

export const apiService = new ApiService()