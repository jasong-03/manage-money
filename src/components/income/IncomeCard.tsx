'use client'

import { Income, Company } from '@/types'
import { Button } from '@/components/ui/button'
import { Check, Clock, Trash2 } from 'lucide-react'
import { formatAmount } from '@/lib/period'

interface IncomeCardProps {
  income: Income
  onDelete: () => void
}

export function IncomeCard({ income, onDelete }: IncomeCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${
        income.status === 'received'
          ? 'bg-green-50 border-green-200'
          : 'bg-orange-50 border-orange-200'
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
          {income.note && (
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{income.note}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
        onClick={onDelete}
      >
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    </div>
  )
}
