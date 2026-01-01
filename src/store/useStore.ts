'use client'

import { create } from 'zustand'
import { Company, Income, Expense, Subscription, Task, TaskStatus } from '@/types'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface AppState {
  companies: Company[]
  incomes: Income[]
  expenses: Expense[]
  subscriptions: Subscription[]
  tasks: Task[]
  isLoading: boolean
  error: string | null

  // Data loading
  loadData: () => Promise<void>

  // Company actions
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Promise<void>
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>

  // Income actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Promise<void>
  updateIncome: (id: string, data: Partial<Income>) => Promise<void>
  deleteIncome: (id: string) => Promise<void>
  toggleIncomeStatus: (id: string) => Promise<void>

  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  // Subscription actions
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => Promise<void>
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  toggleSubscriptionActive: (id: string) => Promise<void>

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'sortOrder'>) => Promise<void>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  reorderTasks: (taskId: string, newStatus: TaskStatus, newOrder: number) => Promise<void>
}

// Helper to convert snake_case to camelCase for companies
const toCompany = (row: Record<string, unknown>): Company => ({
  id: row.id as string,
  name: row.name as string,
  paymentType: row.payment_type as 'weekly' | 'monthly',
  paymentDay: row.payment_day as number | undefined,
  expectedAmount: Number(row.expected_amount) || 0,
  color: row.color as string,
  createdAt: new Date(row.created_at as string),
})

// Helper to convert snake_case to camelCase for incomes
const toIncome = (row: Record<string, unknown>): Income => ({
  id: row.id as string,
  companyId: row.company_id as string,
  period: row.period as string,
  paymentDate: row.payment_date ? new Date(row.payment_date as string) : undefined,
  amount: Number(row.amount),
  status: row.status as 'pending' | 'received',
  receivedDate: row.received_date ? new Date(row.received_date as string) : undefined,
  note: row.note as string | undefined,
  createdAt: new Date(row.created_at as string),
})

// Helper to convert snake_case to camelCase for expenses
const toExpense = (row: Record<string, unknown>): Expense => ({
  id: row.id as string,
  category: row.category as string,
  amount: Number(row.amount),
  description: row.description as string,
  rawInput: row.raw_input as string,
  date: new Date(row.date as string),
  createdAt: new Date(row.created_at as string),
})

// Helper to convert snake_case to camelCase for subscriptions
const toSubscription = (row: Record<string, unknown>): Subscription => ({
  id: row.id as string,
  name: row.name as string,
  amount: Number(row.amount),
  billingDay: row.billing_day as number,
  category: row.category as string,
  isActive: row.is_active as boolean,
  color: row.color as string,
  createdAt: new Date(row.created_at as string),
})

// Helper to convert snake_case to camelCase for tasks
const toTask = (row: Record<string, unknown>): Task => ({
  id: row.id as string,
  title: row.title as string,
  description: row.description as string | undefined,
  status: row.status as TaskStatus,
  priority: row.priority as 'low' | 'medium' | 'high',
  dueDate: row.due_date ? new Date(row.due_date as string) : undefined,
  color: row.color as string,
  sortOrder: row.sort_order as number,
  companyId: row.company_id as string | undefined,
  createdAt: new Date(row.created_at as string),
})

export const useStore = create<AppState>()((set, get) => ({
  companies: [],
  incomes: [],
  expenses: [],
  subscriptions: [],
  tasks: [],
  isLoading: true,
  error: null,

  // Load all data from Supabase
  loadData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [companiesRes, incomesRes, expensesRes, subscriptionsRes, tasksRes] = await Promise.all([
        supabase.from('companies').select('*').order('created_at', { ascending: false }),
        supabase.from('incomes').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('sort_order', { ascending: true }),
      ])

      if (companiesRes.error) throw companiesRes.error
      if (incomesRes.error) throw incomesRes.error
      if (expensesRes.error) throw expensesRes.error
      if (subscriptionsRes.error) throw subscriptionsRes.error
      if (tasksRes.error) throw tasksRes.error

      set({
        companies: (companiesRes.data || []).map(toCompany),
        incomes: (incomesRes.data || []).map(toIncome),
        expenses: (expensesRes.data || []).map(toExpense),
        subscriptions: (subscriptionsRes.data || []).map(toSubscription),
        tasks: (tasksRes.data || []).map(toTask),
        isLoading: false,
      })
    } catch (error) {
      console.error('Error loading data:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Company actions
  addCompany: async (company) => {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        payment_type: company.paymentType,
        payment_day: company.paymentDay,
        expected_amount: company.expectedAmount,
        color: company.color,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding company:', error)
      return
    }

    set((state) => ({
      companies: [toCompany(data), ...state.companies],
    }))
  },

  updateCompany: async (id, data) => {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.paymentType !== undefined) updateData.payment_type = data.paymentType
    if (data.paymentDay !== undefined) updateData.payment_day = data.paymentDay
    if (data.expectedAmount !== undefined) updateData.expected_amount = data.expectedAmount
    if (data.color !== undefined) updateData.color = data.color

    const { error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating company:', error)
      return
    }

    set((state) => ({
      companies: state.companies.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    }))
  },

  deleteCompany: async (id) => {
    const { error } = await supabase.from('companies').delete().eq('id', id)

    if (error) {
      console.error('Error deleting company:', error)
      return
    }

    set((state) => ({
      companies: state.companies.filter((c) => c.id !== id),
      incomes: state.incomes.filter((i) => i.companyId !== id),
    }))
  },

  // Income actions
  addIncome: async (income) => {
    const { data, error } = await supabase
      .from('incomes')
      .insert({
        company_id: income.companyId,
        period: income.period,
        payment_date: income.paymentDate ? new Date(income.paymentDate).toISOString().split('T')[0] : null,
        amount: income.amount,
        status: income.status,
        received_date: income.receivedDate ? new Date(income.receivedDate).toISOString().split('T')[0] : null,
        note: income.note,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding income:', error)
      return
    }

    set((state) => ({
      incomes: [toIncome(data), ...state.incomes],
    }))
  },

  updateIncome: async (id, data) => {
    const updateData: Record<string, unknown> = {}
    if (data.companyId !== undefined) updateData.company_id = data.companyId
    if (data.period !== undefined) updateData.period = data.period
    if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate ? new Date(data.paymentDate).toISOString().split('T')[0] : null
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.status !== undefined) updateData.status = data.status
    if (data.receivedDate !== undefined) updateData.received_date = data.receivedDate ? new Date(data.receivedDate).toISOString().split('T')[0] : null
    if (data.note !== undefined) updateData.note = data.note

    const { error } = await supabase
      .from('incomes')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating income:', error)
      return
    }

    set((state) => ({
      incomes: state.incomes.map((i) =>
        i.id === id ? { ...i, ...data } : i
      ),
    }))
  },

  deleteIncome: async (id) => {
    const { error } = await supabase.from('incomes').delete().eq('id', id)

    if (error) {
      console.error('Error deleting income:', error)
      return
    }

    set((state) => ({
      incomes: state.incomes.filter((i) => i.id !== id),
    }))
  },

  toggleIncomeStatus: async (id) => {
    const income = get().incomes.find((i) => i.id === id)
    if (!income) return

    const newStatus = income.status === 'pending' ? 'received' : 'pending'
    const newReceivedDate = newStatus === 'received' ? new Date().toISOString().split('T')[0] : null

    const { error } = await supabase
      .from('incomes')
      .update({
        status: newStatus,
        received_date: newReceivedDate,
      })
      .eq('id', id)

    if (error) {
      console.error('Error toggling income status:', error)
      return
    }

    set((state) => ({
      incomes: state.incomes.map((i) =>
        i.id === id
          ? {
              ...i,
              status: newStatus,
              receivedDate: newReceivedDate ? new Date(newReceivedDate) : undefined,
            }
          : i
      ),
    }))
  },

  // Expense actions
  addExpense: async (expense) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        raw_input: expense.rawInput,
        date: new Date(expense.date).toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding expense:', error)
      return
    }

    set((state) => ({
      expenses: [toExpense(data), ...state.expenses],
    }))
  },

  updateExpense: async (id, data) => {
    const updateData: Record<string, unknown> = {}
    if (data.category !== undefined) updateData.category = data.category
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description !== undefined) updateData.description = data.description
    if (data.rawInput !== undefined) updateData.raw_input = data.rawInput
    if (data.date !== undefined) updateData.date = new Date(data.date).toISOString().split('T')[0]

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating expense:', error)
      return
    }

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }))
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)

    if (error) {
      console.error('Error deleting expense:', error)
      return
    }

    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }))
  },

  // Subscription actions
  addSubscription: async (subscription) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        name: subscription.name,
        amount: subscription.amount,
        billing_day: subscription.billingDay,
        category: subscription.category,
        is_active: subscription.isActive,
        color: subscription.color,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding subscription:', error)
      return
    }

    set((state) => ({
      subscriptions: [toSubscription(data), ...state.subscriptions],
    }))
  },

  updateSubscription: async (id, data) => {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.billingDay !== undefined) updateData.billing_day = data.billingDay
    if (data.category !== undefined) updateData.category = data.category
    if (data.isActive !== undefined) updateData.is_active = data.isActive
    if (data.color !== undefined) updateData.color = data.color

    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    }))
  },

  deleteSubscription: async (id) => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return
    }

    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    }))
  },

  toggleSubscriptionActive: async (id) => {
    const subscription = get().subscriptions.find((s) => s.id === id)
    if (!subscription) return

    const newIsActive = !subscription.isActive

    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: newIsActive })
      .eq('id', id)

    if (error) {
      console.error('Error toggling subscription:', error)
      return
    }

    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, isActive: newIsActive } : s
      ),
    }))
  },

  // Task actions
  addTask: async (task) => {
    // Get max sort_order for the status column
    const tasksInColumn = get().tasks.filter((t) => t.status === task.status)
    const maxOrder = tasksInColumn.reduce((max, t) => Math.max(max, t.sortOrder), -1)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        color: task.color,
        sort_order: maxOrder + 1,
        company_id: task.companyId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
      return
    }

    set((state) => ({
      tasks: [...state.tasks, toTask(data)],
    }))
  },

  updateTask: async (id, data) => {
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate ? new Date(data.dueDate).toISOString() : null
    if (data.color !== undefined) updateData.color = data.color
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder
    if (data.companyId !== undefined) updateData.company_id = data.companyId || null

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating task:', error)
      return
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    }))
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      console.error('Error deleting task:', error)
      return
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
  },

  reorderTasks: async (taskId, newStatus, newOrder) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return

    // Update in database
    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        sort_order: newOrder,
      })
      .eq('id', taskId)

    if (error) {
      console.error('Error reordering task:', error)
      return
    }

    // Update local state
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, sortOrder: newOrder }
          : t
      ),
    }))
  },
}))

// Hook to initialize data and track loading state
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false)
  const loadData = useStore((state) => state.loadData)
  const isLoading = useStore((state) => state.isLoading)

  useEffect(() => {
    loadData().then(() => {
      setHydrated(true)
    })
  }, [loadData])

  return hydrated && !isLoading
}
