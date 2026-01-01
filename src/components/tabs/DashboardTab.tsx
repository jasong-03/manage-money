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
    <div className="space-y-4 sm:space-y-6">
      {/* Current Month Header */}
      <div className="text-center">
        <h2 className="text-lg sm:text-2xl font-bold">{formatPeriodDisplay(currentMonth)}</h2>
      </div>

      {/* Income Progress */}
      {currentStats.expected > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="text-muted-foreground">
              Received: {formatAmount(currentStats.received)}
            </span>
            <span className="font-medium">
              Expected: {formatAmount(currentStats.expected)}
            </span>
          </div>
          <Progress value={currentStats.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {currentStats.progress.toFixed(0)}% received
          </p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Received */}
        <Card className="p-3 sm:p-4 text-center">
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-green-500 mb-1 sm:mb-2" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">Income</p>
          <p className="text-sm sm:text-lg font-bold text-green-600 truncate">
            {formatAmount(currentStats.received)}
          </p>
          {comparison && (
            <div className="flex items-center justify-center gap-1 mt-1 text-[10px] sm:text-xs">
              {comparison.isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={comparison.isPositive ? 'text-green-500' : 'text-red-500'}>
                {comparison.isPositive ? '+' : ''}{comparison.percentage}%
              </span>
            </div>
          )}
        </Card>

        {/* Spending */}
        <Card className="p-3 sm:p-4 text-center">
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-red-500 mb-1 sm:mb-2" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">Spending</p>
          <p className="text-sm sm:text-lg font-bold text-red-600 truncate">
            {formatAmount(currentStats.spending)}
          </p>
        </Card>

        {/* Net Income */}
        <Card className="p-3 sm:p-4 text-center">
          <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-blue-500 mb-1 sm:mb-2" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">Savings</p>
          <p className={`text-sm sm:text-lg font-bold truncate ${currentStats.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {currentStats.netIncome >= 0 ? '+' : ''}{formatAmount(currentStats.netIncome)}
          </p>
        </Card>

        {/* Subscriptions */}
        <Card className="p-3 sm:p-4 text-center">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-purple-500 mb-1 sm:mb-2" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">Subscriptions</p>
          <p className="text-sm sm:text-lg font-bold text-purple-600 truncate">
            {formatAmount(subscriptionStats.total)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {subscriptionStats.count} dịch vụ
          </p>
        </Card>
      </div>

      {/* Chart and Company Breakdown - side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Income Trend Chart */}
        {chartData.some((d) => d.amount > 0) && (
          <Card className="p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Income Trend (6 months)</h3>
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    tickFormatter={formatYAxis}
                    width={35}
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
          <Card className="p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">By Company</h3>
            <div className="space-y-2 sm:space-y-3">
              {companyBreakdown.map(({ company, total, pending }: { company: Company; total: number; pending: number }) => (
                <div key={company.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: company.color }}
                    />
                    <span className="text-sm sm:text-base font-medium truncate">{company.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm sm:text-base font-semibold">{formatAmount(total)}</p>
                    {pending > 0 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Upcoming Payments */}
        {upcomingPayments.length > 0 && (
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <CalendarClock className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm sm:text-base font-medium">Sắp đến hạn (7 ngày)</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {upcomingPayments.map((sub: Subscription) => (
                <div key={sub.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="text-xs sm:text-sm truncate">{sub.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-medium text-xs sm:text-sm">{formatAmount(sub.amount)}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Ngày {sub.billingDay}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Spending by Category */}
        {spendingByCategory.length > 0 && (
          <Card className="p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Chi tiêu theo danh mục</h3>
            <div className="space-y-2 sm:space-y-3">
              {spendingByCategory.slice(0, 5).map(({ category, amount, percentage }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm truncate">{category}</span>
                    <span className="text-xs sm:text-sm font-medium ml-2">{formatAmount(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="h-1.5 sm:h-2 rounded-full transition-all"
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
        <Card className="p-6 sm:p-8 text-center">
          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <h3 className="text-sm sm:text-base font-medium mb-2">No data yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Go to Income tab to add companies and track income
          </p>
        </Card>
      )}
    </div>
  )
}
