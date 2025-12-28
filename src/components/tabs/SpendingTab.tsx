'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatInput } from '@/components/spending/ChatInput'
import { ExpenseCard } from '@/components/spending/ExpenseCard'
import { CategorySummary } from '@/components/spending/CategorySummary'
import { parseExpenseWithAI } from '@/lib/gemini'
import { formatAmount } from '@/lib/period'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Expense } from '@/types'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
} from 'date-fns'
import { vi } from 'date-fns/locale'

type ViewMode = 'day' | 'week' | 'month'

export function SpendingTab() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useStore()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get date range based on view mode
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) }
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        }
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
    }
  }, [viewMode, currentDate])

  // Filter expenses for current period
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= dateRange.start && expenseDate <= dateRange.end
    })
  }, [expenses, dateRange])

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {}

    filteredExpenses.forEach((expense: Expense) => {
      const dateKey = format(new Date(expense.date), 'yyyy-MM-dd')
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(expense)
    })

    // Sort by date descending
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, expenseList]) => ({
        date: new Date(dateKey),
        expenses: expenseList.sort(
          (a: Expense, b: Expense) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
  }, [filteredExpenses])

  // Navigation handlers
  const navigate = (direction: 'prev' | 'next') => {
    const fn = direction === 'prev'
      ? { day: subDays, week: subWeeks, month: subMonths }
      : { day: addDays, week: addWeeks, month: addMonths }

    setCurrentDate(fn[viewMode](currentDate, 1))
  }

  const goToToday = () => setCurrentDate(new Date())

  // Format period display
  const periodDisplay = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, d MMMM yyyy', { locale: vi })
      case 'week':
        return `${format(dateRange.start, 'd MMM')} - ${format(dateRange.end, 'd MMM yyyy')}`
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: vi })
    }
  }, [viewMode, currentDate, dateRange])

  // Handle AI parsing
  const handleSubmit = async (input: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const parsed = await parseExpenseWithAI(input)

      addExpense({
        amount: parsed.amount,
        category: parsed.category,
        description: parsed.description,
        rawInput: input,
        date: new Date(parsed.date),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse expense')
    } finally {
      setIsLoading(false)
    }
  }

  // Format date header
  const formatDateHeader = (date: Date) => {
    const today = new Date()
    const yesterday = subDays(today, 1)

    if (isSameDay(date, today)) {
      return `Hôm nay - ${format(date, 'd/M')}`
    }
    if (isSameDay(date, yesterday)) {
      return `Hôm qua - ${format(date, 'd/M')}`
    }
    return format(date, 'EEEE, d/M', { locale: vi })
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1 bg-muted/30">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="px-4"
            >
              {mode === 'day' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}
            </Button>
          ))}
        </div>
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <button
          onClick={goToToday}
          className="text-lg font-semibold min-w-[200px] text-center hover:text-primary transition-colors"
        >
          {periodDisplay}
        </button>
        <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Input */}
      <Card className="p-4">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </Card>

      {/* Expense List */}
      {groupedExpenses.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>Chưa có chi tiêu nào trong khoảng thời gian này</p>
          <p className="text-sm mt-1">Nhập chi tiêu ở ô trên để bắt đầu</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedExpenses.map(({ date, expenses }) => (
            <div key={date.toISOString()}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {formatDateHeader(date)}
                <span className="ml-2 text-foreground">
                  ({formatAmount(expenses.reduce((sum, e) => sum + e.amount, 0))})
                </span>
              </h3>
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onUpdate={updateExpense}
                    onDelete={deleteExpense}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Summary */}
      <CategorySummary expenses={filteredExpenses} />
    </div>
  )
}
