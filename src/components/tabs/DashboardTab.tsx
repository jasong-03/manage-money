'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/useStore'
import {
  getMonthPeriod,
  formatAmount,
  formatPeriodDisplay,
  getWeeksInMonth,
  navigateMonth,
} from '@/lib/period'
import { TrendingUp, TrendingDown, Wallet, Building2, ShoppingBag, PiggyBank, CreditCard, CalendarClock } from 'lucide-react'
import { Income, Company, Expense, Subscription } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, getDaysInMonth, addDays } from 'date-fns'

export function DashboardTab() {
  const { companies, incomes, expenses, subscriptions } = useStore()
  const currentMonth = getMonthPeriod(new Date())
  const today = new Date()

  // Current month stats
  const currentStats = useMemo(() => {
    const weeksInMonth = getWeeksInMonth(currentMonth)
    const monthlyIncomes = incomes.filter((income: Income) => {
      if (income.period.includes('-W')) {
        return weeksInMonth.includes(income.period)
      }
      return income.period === currentMonth
    })

    // Expected from company settings
    const expected = companies.reduce((sum: number, c: Company) => {
      if (c.paymentType === 'weekly') {
        return sum + (c.expectedAmount || 0) * weeksInMonth.length
      }
      return sum + (c.expectedAmount || 0)
    }, 0)

    const received = monthlyIncomes
      .filter((i: Income) => i.status === 'received')
      .reduce((sum: number, i: Income) => sum + i.amount, 0)

    // Spending for current month
    const monthDate = new Date(currentMonth + '-01')
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const spending = expenses
      .filter((e: Expense) => {
        const expenseDate = new Date(e.date)
        return expenseDate >= monthStart && expenseDate <= monthEnd
      })
      .reduce((sum: number, e: Expense) => sum + e.amount, 0)

    const progress = expected > 0 ? (received / expected) * 100 : 0
    const netIncome = received - spending

    return { expected, received, spending, progress, netIncome }
  }, [incomes, companies, expenses, currentMonth])

  // Last 6 months chart data
  const chartData = useMemo(() => {
    const data = []
    const date = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(date, i)
      const month = getMonthPeriod(monthDate)
      const weeksInMonth = getWeeksInMonth(month)

      const monthlyIncomes = incomes.filter((income: Income) => {
        if (income.period.includes('-W')) {
          return weeksInMonth.includes(income.period)
        }
        return income.period === month
      })

      const total = monthlyIncomes.reduce((sum: number, income: Income) => sum + income.amount, 0)

      data.push({
        month: format(monthDate, 'MMM'),
        fullMonth: month,
        amount: total,
        isCurrent: month === currentMonth,
      })
    }

    return data
  }, [incomes, currentMonth])

  // Previous month comparison
  const comparison = useMemo(() => {
    const prevMonth = navigateMonth(currentMonth, 'prev')
    const prevWeeks = getWeeksInMonth(prevMonth)
    const prevIncomes = incomes.filter((income: Income) => {
      if (income.period.includes('-W')) {
        return prevWeeks.includes(income.period)
      }
      return income.period === prevMonth
    })

    const prevTotal = prevIncomes.reduce((sum: number, i: Income) => sum + i.amount, 0)
    const currentTotal = currentStats.expected

    if (prevTotal === 0) return null

    const diff = currentTotal - prevTotal
    const percentage = ((diff / prevTotal) * 100).toFixed(1)

    return {
      diff,
      percentage,
      isPositive: diff >= 0,
    }
  }, [incomes, currentMonth, currentStats.expected])

  // Company breakdown for current month
  const companyBreakdown = useMemo(() => {
    const weeksInMonth = getWeeksInMonth(currentMonth)

    return companies.map((company: Company) => {
      const companyIncomes = incomes.filter((income: Income) => {
        if (income.companyId !== company.id) return false
        if (income.period.includes('-W')) {
          return weeksInMonth.includes(income.period)
        }
        return income.period === currentMonth
      })

      const total = companyIncomes.reduce((sum: number, i: Income) => sum + i.amount, 0)
      const received = companyIncomes
        .filter((i: Income) => i.status === 'received')
        .reduce((sum: number, i: Income) => sum + i.amount, 0)

      return {
        company,
        total,
        received,
        pending: total - received,
      }
    }).filter((item: { company: Company; total: number; received: number; pending: number }) => item.total > 0)
  }, [companies, incomes, currentMonth])

  // Subscription stats
  const subscriptionStats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((s: Subscription) => s.isActive)
    const totalMonthly = activeSubscriptions.reduce((sum: number, s: Subscription) => sum + s.amount, 0)
    return { total: totalMonthly, count: activeSubscriptions.length }
  }, [subscriptions])

  // Upcoming payments (subscriptions due in next 7 days)
  const upcomingPayments = useMemo(() => {
    const currentDay = today.getDate()
    const daysInMonth = getDaysInMonth(today)
    const next7Days: number[] = []

    for (let i = 0; i < 7; i++) {
      const day = ((currentDay + i - 1) % daysInMonth) + 1
      next7Days.push(day)
    }

    return subscriptions
      .filter((s: Subscription) => s.isActive)
      .filter((s: Subscription) => {
        const effectiveDay = Math.min(s.billingDay, daysInMonth)
        return next7Days.includes(effectiveDay) && effectiveDay >= currentDay
      })
      .sort((a: Subscription, b: Subscription) => a.billingDay - b.billingDay)
      .slice(0, 5)
  }, [subscriptions, today])

  // Spending by category
  const spendingByCategory = useMemo(() => {
    const monthDate = new Date(currentMonth + '-01')
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    const monthExpenses = expenses.filter((e: Expense) => {
      const expenseDate = new Date(e.date)
      return expenseDate >= monthStart && expenseDate <= monthEnd
    })

    const categoryTotals: Record<string, number> = {}
    monthExpenses.forEach((e: Expense) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
    })

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0)

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses, currentMonth])

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`
    }
    return `${(value / 1000).toFixed(0)}K`
  }

  const categoryColors: Record<string, string> = {
    'Food': '#f97316',
    'Transport': '#3b82f6',
    'Entertainment': '#a855f7',
    'Shopping': '#ec4899',
    'AI': '#14b8a6',
    'Productivity': '#22c55e',
    'Cloud': '#6366f1',
    'Other': '#6b7280',
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Current Month Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-bold">{formatPeriodDisplay(currentMonth)}</h2>
      </div>

      {/* Income Progress */}
      {currentStats.expected > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-sm sm:text-base mb-3">
            <span className="text-muted-foreground">
              Received: <span className="font-medium text-foreground">{formatAmount(currentStats.received)}</span>
            </span>
            <span className="text-muted-foreground">
              Expected: <span className="font-medium text-foreground">{formatAmount(currentStats.expected)}</span>
            </span>
          </div>
          <Progress value={currentStats.progress} className="h-3" />
          <p className="text-sm sm:text-base text-muted-foreground mt-3 text-center">
            {currentStats.progress.toFixed(0)}% received
          </p>
        </Card>
      )}

      {/* Net Savings - Hero Card */}
      <Card className={`p-4 sm:p-6 text-center ${currentStats.netIncome >= 0 ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'}`}>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
          <PiggyBank className={`w-6 h-6 sm:w-8 sm:h-8 ${currentStats.netIncome >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
          <p className="text-base sm:text-lg text-muted-foreground">Net Savings This Month</p>
        </div>
        <p className={`text-2xl sm:text-4xl font-bold ${currentStats.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {currentStats.netIncome >= 0 ? '+' : ''}{formatAmount(currentStats.netIncome)}
        </p>
      </Card>

      {/* Stats Grid - Income vs Spending */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {/* Income */}
        <Card className="p-3 sm:p-6 text-center">
          <Wallet className="w-5 h-5 sm:w-8 sm:h-8 mx-auto text-green-500 mb-1.5 sm:mb-3" />
          <p className="text-xs sm:text-base text-muted-foreground">Income</p>
          <p className="text-lg sm:text-3xl font-bold text-green-600 truncate mt-0.5 sm:mt-1">
            {formatAmount(currentStats.received)}
          </p>
          {comparison && (
            <div className="flex items-center justify-center gap-1 mt-1.5 sm:mt-2 text-xs sm:text-base">
              {comparison.isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              )}
              <span className={comparison.isPositive ? 'text-green-500' : 'text-red-500'}>
                {comparison.isPositive ? '+' : ''}{comparison.percentage}%
              </span>
            </div>
          )}
        </Card>

        {/* Spending */}
        <Card className="p-3 sm:p-6 text-center">
          <ShoppingBag className="w-5 h-5 sm:w-8 sm:h-8 mx-auto text-red-500 mb-1.5 sm:mb-3" />
          <p className="text-xs sm:text-base text-muted-foreground">Spending</p>
          <p className="text-lg sm:text-3xl font-bold text-red-600 truncate mt-0.5 sm:mt-1">
            {formatAmount(currentStats.spending)}
          </p>
        </Card>
      </div>

      {/* Subscriptions Card */}
      <Card className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <CreditCard className="w-5 h-5 sm:w-8 sm:h-8 text-purple-500" />
            <div>
              <p className="text-xs sm:text-base text-muted-foreground">Monthly Subscriptions</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">
                {formatAmount(subscriptionStats.total)}
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {subscriptionStats.count} active
          </p>
        </div>
      </Card>

      {/* Chart and Company Breakdown - side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Income Trend Chart */}
        {chartData.some((d) => d.amount > 0) && (
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">Income Trend (6 months)</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tickFormatter={formatYAxis}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value) => [formatAmount(value as number), 'Income']}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCurrent ? '#3b82f6' : '#e5e7eb'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Company Breakdown */}
        {companyBreakdown.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">By Company</h3>
            <div className="space-y-3 sm:space-y-4">
              {companyBreakdown.map(({ company, total, pending }: { company: Company; total: number; pending: number }) => (
                <div key={company.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: company.color }}
                    />
                    <span className="text-base sm:text-lg font-medium truncate">{company.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-base sm:text-lg font-semibold">{formatAmount(total)}</p>
                    {pending > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(pending)} pending
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Upcoming Payments & Spending by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Payments */}
        {upcomingPayments.length > 0 && (
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              <h3 className="text-base sm:text-lg font-semibold">Sắp đến hạn (7 ngày)</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {upcomingPayments.map((sub: Subscription) => (
                <div key={sub.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="text-base truncate">{sub.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-semibold text-base">{formatAmount(sub.amount)}</p>
                    <p className="text-sm text-muted-foreground">Ngày {sub.billingDay}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Spending by Category */}
        {spendingByCategory.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">Chi tiêu theo danh mục</h3>
            <div className="space-y-3 sm:space-y-4">
              {spendingByCategory.slice(0, 5).map(({ category, amount, percentage }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base truncate">{category}</span>
                    <span className="text-base font-medium ml-3">{formatAmount(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: categoryColors[category] || categoryColors['Other'],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {companies.length === 0 && (
        <Card className="p-8 sm:p-12 text-center">
          <Building2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl font-medium mb-3">No data yet</h3>
          <p className="text-base sm:text-lg text-muted-foreground">
            Go to Income tab to add companies and track income
          </p>
        </Card>
      )}
    </div>
  )
}
