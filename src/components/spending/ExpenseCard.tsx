'use client'

import { useState } from 'react'
import { Expense } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { formatAmount } from '@/lib/period'

interface ExpenseCardProps {
  expense: Expense
  onUpdate: (id: string, data: Partial<Expense>) => void
  onDelete: (id: string) => void
}

export function ExpenseCard({ expense, onUpdate, onDelete }: ExpenseCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    amount: expense.amount.toString(),
    category: expense.category,
    description: expense.description,
  })

  const handleSave = () => {
    const amount = parseFloat(editData.amount)
    if (isNaN(amount) || amount <= 0) return

    onUpdate(expense.id, {
      amount,
      category: editData.category.trim(),
      description: editData.description.trim(),
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="p-2 sm:p-3 rounded-lg border bg-muted/30 space-y-2">
        <div className="flex gap-2">
          <Input
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            placeholder="Category"
            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
          />
          <Input
            value={editData.amount}
            onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
            type="number"
            placeholder="Amount"
            className="w-24 sm:w-28 h-8 sm:h-9 text-xs sm:text-sm"
          />
        </div>
        <Input
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          placeholder="Description"
          className="h-8 sm:h-9 text-xs sm:text-sm"
        />
        <div className="flex justify-end gap-1.5 sm:gap-2">
          <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3" onClick={handleCancel}>
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3" onClick={handleSave}>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-medium text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 rounded-full bg-muted truncate max-w-[80px] sm:max-w-none">
            {expense.category}
          </span>
          <span className="text-sm sm:text-base font-semibold">{formatAmount(expense.amount)}</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">{expense.description}</p>
      </div>
      <div className="flex gap-0.5 sm:gap-1 flex-shrink-0 ml-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(expense.id)}
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  )
}
