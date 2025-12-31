'use client'

import { Income, Company } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Clock, Plus, Trash2 } from 'lucide-react'
import { formatAmount } from '@/lib/period'
import { format } from 'date-fns'

interface WeeklyIncomeGridProps {
  company: Company
  incomes: Income[]
  onAdd: (companyId: string) => void
  onDelete: (id: string) => void
}

export function WeeklyIncomeGrid({ company, incomes, onAdd, onDelete }: WeeklyIncomeGridProps) {
  // Sort incomes by payment date
  const sortedIncomes = [...incomes].sort((a, b) => {
    const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0
    const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0
    return dateA - dateB
  })

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: company.color }}
          />
          <h3 className="font-medium">{company.name}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onAdd(company.id)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {sortedIncomes.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No income entries this month
        </div>
      ) : (
        <div className="space-y-2">
          {sortedIncomes.map((income) => (
            <div
              key={income.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                income.status === 'received'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    income.status === 'received'
                      ? 'bg-green-500 text-white'
                      : 'bg-orange-100 text-orange-500'
                  }`}
                >
                  {income.status === 'received' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{formatAmount(income.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {income.paymentDate
                      ? format(new Date(income.paymentDate), 'MMM d, yyyy')
                      : 'No date'}
                    {income.note && ` • ${income.note}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(income.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
