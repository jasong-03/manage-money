'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Subscription } from '@/types'
import { formatAmount } from '@/lib/period'
import { Trash2, Pause, Play, Pencil } from 'lucide-react'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

export function SubscriptionCard({ subscription, onEdit, onDelete, onToggle }: SubscriptionCardProps) {
  return (
    <Card className={`p-2 sm:p-3 ${!subscription.isActive ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: subscription.color }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-medium truncate">{subscription.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Ngày {subscription.billingDay} hàng tháng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-sm sm:text-base font-semibold">{formatAmount(subscription.amount)}</span>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={onToggle}>
              {subscription.isActive ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
