'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Company } from '@/types'
import { useStore } from '@/store/useStore'

const COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f97316', label: 'Orange' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
]

interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
}

export function CompanyDialog({ open, onOpenChange, company }: CompanyDialogProps) {
  const { addCompany, updateCompany } = useStore()
  const [name, setName] = useState('')
  const [paymentType, setPaymentType] = useState<'weekly' | 'monthly'>('monthly')
  const [paymentDay, setPaymentDay] = useState<string>('')
  const [expectedAmount, setExpectedAmount] = useState<string>('')
  const [color, setColor] = useState(COLORS[0].value)

  useEffect(() => {
    if (company) {
      setName(company.name)
      setPaymentType(company.paymentType)
      setPaymentDay(company.paymentDay?.toString() || '')
      setExpectedAmount(company.expectedAmount?.toString() || '')
      setColor(company.color)
    } else {
      setName('')
      setPaymentType('monthly')
      setPaymentDay('')
      setExpectedAmount('')
      setColor(COLORS[0].value)
    }
  }, [company, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name,
      paymentType,
      paymentDay: paymentDay ? parseInt(paymentDay) : undefined,
      expectedAmount: expectedAmount ? parseFloat(expectedAmount) : 0,
      color,
    }

    if (company) {
      updateCompany(company.id, data)
    } else {
      addCompany(data)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{company ? 'Edit Company' : 'Add Company'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as 'weekly' | 'monthly')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentDay">
                Payment Day {paymentType === 'monthly' ? '(1-31)' : '(1=Mon, 7=Sun)'}
              </Label>
              <Input
                id="paymentDay"
                type="number"
                min={1}
                max={paymentType === 'monthly' ? 31 : 7}
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expectedAmount">
                Lương dự kiến {paymentType === 'weekly' ? '(mỗi tuần)' : '(mỗi tháng)'}
              </Label>
              <Input
                id="expectedAmount"
                type="number"
                value={expectedAmount}
                onChange={(e) => setExpectedAmount(e.target.value)}
                placeholder="VD: 5000000"
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
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
              Cancel
            </Button>
            <Button type="submit">
              {company ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
