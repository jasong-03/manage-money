export interface Company {
  id: string
  name: string
  paymentType: 'weekly' | 'monthly'
  paymentDay?: number
  expectedAmount: number // Lương dự kiến mỗi kỳ (tuần/tháng)
  color: string
  createdAt: Date
}

export interface Income {
  id: string
  companyId: string
  period: string // "2025-01" for monthly, "2025-W03" for weekly
  paymentDate?: Date // Specific date for the payment
  amount: number
  status: 'pending' | 'received'
  receivedDate?: Date
  note?: string
  createdAt: Date
}

export interface Expense {
  id: string
  category: string
  amount: number
  description: string
  rawInput: string
  date: Date
  createdAt: Date
}

export interface Subscription {
  id: string
  name: string
  amount: number           // VND
  billingDay: number       // 1-31
  category: string         // 'AI' | 'Entertainment' | 'Productivity' | 'Other'
  isActive: boolean
  color: string
  createdAt: Date
}

export interface AppData {
  companies: Company[]
  incomes: Income[]
  expenses: Expense[]
  subscriptions: Subscription[]
}
