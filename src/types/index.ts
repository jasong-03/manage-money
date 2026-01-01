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

export type TaskStatus = 'new' | 'scheduled' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  color: string
  sortOrder: number
  companyId?: string
  createdAt: Date
}

export const TASK_COLUMNS = [
  { id: 'new', label: 'New task', color: '#e5e7eb' },
  { id: 'scheduled', label: 'Scheduled', color: '#fef3c7' },
  { id: 'in_progress', label: 'In progress', color: '#dbeafe' },
  { id: 'completed', label: 'Completed', color: '#d1fae5' },
] as const

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#22c55e', bgColor: '#dcfce7' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', bgColor: '#fef3c7' },
  { value: 'high', label: 'High', color: '#ef4444', bgColor: '#fee2e2' },
] as const

export interface AppData {
  companies: Company[]
  incomes: Income[]
  expenses: Expense[]
  subscriptions: Subscription[]
  tasks: Task[]
}
