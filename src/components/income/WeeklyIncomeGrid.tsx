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
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
            style={{ backgroundColor: company.color }}
          />
          <h3 className="text-sm sm:text-base font-medium">{company.name}</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3" onClick={() => onAdd(company.id)}>
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
          Add
        </Button>
      </div>

      {sortedIncomes.length === 0 ? (
        <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
          No income entries this month
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
          {sortedIncomes.map((income) => (
            <div
              key={income.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${
                income.status === 'received'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    income.status === 'received'
                      ? 'bg-green-500 text-white'
                      : 'bg-orange-100 text-orange-500'
                  }`}
                >
                  {income.status === 'received' ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold truncate">{formatAmount(income.amount)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
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
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => onDelete(income.id)}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
