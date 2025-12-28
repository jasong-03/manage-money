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
    <Card className={`p-3 ${!subscription.isActive ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: subscription.color }}
          />
          <div>
            <p className="font-medium">{subscription.name}</p>
            <p className="text-xs text-muted-foreground">
              Ngày {subscription.billingDay} hàng tháng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatAmount(subscription.amount)}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
              {subscription.isActive ? (
                <Pause className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Play className="w-4 h-4 text-green-500" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
