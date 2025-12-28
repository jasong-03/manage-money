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
      className={`flex items-center justify-between p-3 rounded-lg border ${
        income.status === 'received'
          ? 'bg-green-50 border-green-200'
          : 'bg-orange-50 border-orange-200'
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
          {income.note && (
            <p className="text-xs text-muted-foreground">{income.note}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
