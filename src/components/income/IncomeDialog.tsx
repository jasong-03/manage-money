'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { Income, Company } from '@/types'
import { useStore } from '@/store/useStore'
import { getMonthPeriod, getWeekPeriod, parseMonthPeriod } from '@/lib/period'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'

interface IncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  income?: Income | null
  currentMonth: string
}

export function IncomeDialog({ open, onOpenChange, income, currentMonth }: IncomeDialogProps) {
  const { companies, addIncome, updateIncome } = useStore()
  const [companyId, setCompanyId] = useState('')
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const selectedCompany = companies.find((c: Company) => c.id === companyId)
  const monthDate = parseMonthPeriod(currentMonth)

  useEffect(() => {
    if (income) {
      setCompanyId(income.companyId)
      setPaymentDate(income.paymentDate ? new Date(income.paymentDate) : undefined)
      setAmount(income.amount.toString())
      setNote(income.note || '')
    } else {
      setCompanyId(companies[0]?.id || '')
      setPaymentDate(new Date())
      setAmount('')
      setNote('')
    }
  }, [income, open, companies])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate period based on company type and selected date
    let period: string
    if (selectedCompany?.paymentType === 'weekly' && paymentDate) {
      period = getWeekPeriod(paymentDate)
    } else {
      period = currentMonth
    }

    const data = {
      companyId,
      period,
      paymentDate: paymentDate,
      amount: parseFloat(amount),
      note: note || undefined,
      status: income?.status || 'received' as const,
      receivedDate: income?.receivedDate || new Date(),
    }

    if (income) {
      updateIncome(income.id, data)
    } else {
      addIncome(data)
    }

    onOpenChange(false)
  }

  if (companies.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            Please add a company first before adding income.
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{income ? 'Edit Income' : 'Add Income'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company: Company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: company.color }}
                        />
                        {company.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompany?.paymentType === 'weekly' && (
              <div className="grid gap-2">
                <Label>Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      defaultMonth={monthDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (VND)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., bonus, OT, trừ thuế"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {income ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
