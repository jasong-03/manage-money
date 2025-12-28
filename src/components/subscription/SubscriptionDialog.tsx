'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Subscription } from '@/types'
import { useStore } from '@/store/useStore'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f97316', label: 'Orange' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
]

const CATEGORIES = [
  { value: 'AI', label: 'AI' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Other', label: 'Other' },
]

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: Subscription | null
}

export function SubscriptionDialog({ open, onOpenChange, subscription }: SubscriptionDialogProps) {
  const { addSubscription, updateSubscription } = useStore()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [billingDate, setBillingDate] = useState<Date | undefined>(undefined)
  const [category, setCategory] = useState('Other')
  const [color, setColor] = useState(COLORS[0].value)
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    if (subscription) {
      setName(subscription.name)
      setAmount(subscription.amount.toString())
      // Set date with the billing day in current month
      const today = new Date()
      setBillingDate(new Date(today.getFullYear(), today.getMonth(), subscription.billingDay))
      setCategory(subscription.category)
      setColor(subscription.color)
    } else {
      setName('')
      setAmount('')
      setBillingDate(undefined)
      setCategory('Other')
      setColor(COLORS[0].value)
    }
  }, [subscription, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!billingDate) return

    const data = {
      name,
      amount: parseFloat(amount) || 0,
      billingDay: billingDate.getDate(),
      category,
      color,
      isActive: true,
    }

    if (subscription) {
      updateSubscription(subscription.id, data)
    } else {
      addSubscription(data)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên dịch vụ</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: ChatGPT Plus"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Số tiền (VND)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 500000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Ngày thanh toán</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !billingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {billingDate ? `Ngày ${billingDate.getDate()} hàng tháng` : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={billingDate}
                    onSelect={(date) => {
                      setBillingDate(date)
                      setCalendarOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Màu sắc</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">
              {subscription ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
