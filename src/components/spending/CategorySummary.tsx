'use client'

import { useMemo } from 'react'
import { Expense } from '@/types'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatAmount } from '@/lib/period'

interface CategorySummaryProps {
  expenses: Expense[]
}

export function CategorySummary({ expenses }: CategorySummaryProps) {
  const summary = useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    let total = 0

    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
      total += expense.amount
    })

    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    return { categories, total }
  }, [expenses])

  if (expenses.length === 0) {
    return null
  }

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-4">Category Summary</h3>
      <div className="space-y-3">
        {summary.categories.map(({ category, amount, percentage }) => (
          <div key={category}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{category}</span>
              <span className="font-medium">{formatAmount(amount)}</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatAmount(summary.total)}</span>
      </div>
    </Card>
  )
}
