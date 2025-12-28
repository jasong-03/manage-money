'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, CreditCard } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog'
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard'
import { Subscription } from '@/types'
import { formatAmount } from '@/lib/period'
import { format, getDaysInMonth } from 'date-fns'

export function SubscriptionTab() {
  const { subscriptions, expenses, addExpense, deleteSubscription, toggleSubscriptionActive } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  // Group subscriptions by category
  const groupedSubscriptions = useMemo(() => {
    const groups: Record<string, Subscription[]> = {}
    subscriptions.forEach((sub: Subscription) => {
      if (!groups[sub.category]) {
        groups[sub.category] = []
      }
      groups[sub.category].push(sub)
    })
    return groups
  }, [subscriptions])

  // Calculate total monthly cost (only active)
  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter((s: Subscription) => s.isActive)
      .reduce((sum: number, s: Subscription) => sum + s.amount, 0)
  }, [subscriptions])

  // Auto-add subscriptions to Spending on billing day
  useEffect(() => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = format(today, 'yyyy-MM')
    const daysInMonth = getDaysInMonth(today)

    subscriptions
      .filter((s: Subscription) => s.isActive)
      .forEach((subscription: Subscription) => {
        // Handle billing day > days in month (e.g., 31 in Feb)
        const effectiveBillingDay = Math.min(subscription.billingDay, daysInMonth)

        if (currentDay >= effectiveBillingDay) {
          // Check if expense already exists for this subscription this month
          const alreadyExists = expenses.some((e) => {
            const expenseMonth = format(new Date(e.date), 'yyyy-MM')
            return (
              e.rawInput === `[Auto] ${subscription.name}` &&
              expenseMonth === currentMonth
            )
          })

          if (!alreadyExists) {
            // Create expense for this subscription
            const billingDate = new Date(today.getFullYear(), today.getMonth(), effectiveBillingDay)
            addExpense({
              category: subscription.category,
              amount: subscription.amount,
              description: subscription.name,
              rawInput: `[Auto] ${subscription.name}`,
              date: billingDate,
            })
          }
        }
      })
  }, [subscriptions, expenses, addExpense])

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingSubscription(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Subscriptions</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Quản lý các dịch vụ đăng ký hàng tháng
        </p>
      </div>

      {/* Total Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Tổng chi/tháng</p>
              <p className="text-2xl font-bold">{formatAmount(totalMonthly)}</p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm
          </Button>
        </div>
      </Card>

      {/* Subscription Groups */}
      {Object.keys(groupedSubscriptions).length > 0 ? (
        Object.entries(groupedSubscriptions).map(([category, subs]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
            <div className="space-y-2">
              {subs.map((subscription: Subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={() => handleEdit(subscription)}
                  onDelete={() => deleteSubscription(subscription.id)}
                  onToggle={() => toggleSubscriptionActive(subscription.id)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card className="p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Chưa có subscription nào</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Thêm các dịch vụ bạn đăng ký hàng tháng như Netflix, Spotify, ChatGPT...
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm subscription đầu tiên
          </Button>
        </Card>
      )}

      {/* Dialog */}
      <SubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subscription={editingSubscription}
      />
    </div>
  )
}
