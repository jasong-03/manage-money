'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { CompanyDialog } from '@/components/company/CompanyDialog'
import { IncomeDialog } from '@/components/income/IncomeDialog'
import { IncomeCard } from '@/components/income/IncomeCard'
import { WeeklyIncomeGrid } from '@/components/income/WeeklyIncomeGrid'
import { Company, Income } from '@/types'
import {
  getMonthPeriod,
  navigateMonth,
  formatPeriodDisplay,
  formatAmount,
  getWeeksInMonth,
  parseMonthPeriod,
} from '@/lib/period'
import { startOfMonth, endOfMonth } from 'date-fns'

export function CompensationTab() {
  const { companies, incomes, deleteCompany, deleteIncome } = useStore()
  const [currentMonth, setCurrentMonth] = useState(getMonthPeriod(new Date()))

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  const weeksInMonth = getWeeksInMonth(currentMonth)

  // Filter incomes for current month
  const monthlyIncomes = useMemo(() => {
    const monthDate = parseMonthPeriod(currentMonth)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    return incomes.filter((income: Income) => {
      // For weekly incomes with paymentDate, check if date is in current month
      if (income.paymentDate) {
        const date = new Date(income.paymentDate)
        return date >= monthStart && date <= monthEnd
      }
      // Fallback to period-based filtering
      if (income.period.includes('-W')) {
        return weeksInMonth.includes(income.period)
      }
      return income.period === currentMonth
    })
  }, [incomes, currentMonth, weeksInMonth])

  // Calculate totals
  const totals = useMemo(() => {
    // Expected = sum of all company expected amounts for this month
    const expected = companies.reduce((sum: number, c: Company) => {
      if (c.paymentType === 'weekly') {
        // Weekly: expectedAmount × number of weeks in month
        return sum + (c.expectedAmount || 0) * weeksInMonth.length
      }
      // Monthly: just expectedAmount
      return sum + (c.expectedAmount || 0)
    }, 0)

    // Received = sum of all received incomes
    const received = monthlyIncomes
      .filter((i: Income) => i.status === 'received')
      .reduce((sum: number, i: Income) => sum + i.amount, 0)

    const progress = expected > 0 ? (received / expected) * 100 : 0

    return { expected, received, progress }
  }, [companies, monthlyIncomes, weeksInMonth])

  // Separate companies by payment type
  const weeklyCompanies = companies.filter((c: Company) => c.paymentType === 'weekly')
  const monthlyCompanies = companies.filter((c: Company) => c.paymentType === 'monthly')

  // Get incomes for a specific company
  const getCompanyIncomes = (companyId: string) =>
    monthlyIncomes.filter((i: Income) => i.companyId === companyId)

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company)
    setCompanyDialogOpen(true)
  }

  const handleAddWeeklyIncome = (companyId: string) => {
    setEditingIncome(null)
    setSelectedCompanyId(companyId)
    setIncomeDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(navigateMonth(currentMonth, 'prev'))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold min-w-[180px] text-center">
          {formatPeriodDisplay(currentMonth)}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(navigateMonth(currentMonth, 'next'))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => {
            setEditingIncome(null)
            setSelectedCompanyId(null)
            setIncomeDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </div>

      {/* Progress Summary + Companies */}
      <Card className="p-4">
        {monthlyIncomes.length > 0 && (
          <>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Received: {formatAmount(totals.received)}
              </span>
              <span className="font-medium">
                Expected: {formatAmount(totals.expected)}
              </span>
            </div>
            <Progress value={totals.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {totals.progress.toFixed(0)}% received
            </p>
          </>
        )}

        {/* Companies Row */}
        {companies.length > 0 && (
          <div className={monthlyIncomes.length > 0 ? 'mt-4 pt-4 border-t' : ''}>
            <div className="flex items-center gap-2 flex-wrap">
              {companies.map((company: Company) => (
                <button
                  key={company.id}
                  onClick={() => handleEditCompany(company)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: company.color }}
                  />
                  <span>{company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {company.paymentType === 'weekly' ? 'W' : 'M'}
                  </span>
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setEditingCompany(null)
                  setCompanyDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {companies.length === 0 && (
          <div className="text-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCompany(null)
                setCompanyDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add first company
            </Button>
          </div>
        )}
      </Card>

      {/* Weekly Incomes */}
      {weeklyCompanies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Weekly</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weeklyCompanies.map((company: Company) => (
              <WeeklyIncomeGrid
                key={company.id}
                company={company}
                incomes={getCompanyIncomes(company.id)}
                onAdd={handleAddWeeklyIncome}
                onDelete={deleteIncome}
              />
            ))}
          </div>
        </div>
      )}

      {/* Monthly Incomes */}
      {monthlyCompanies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Monthly</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {monthlyCompanies.map((company: Company) => {
              const companyIncomes = getCompanyIncomes(company.id)
              return (
                <Card key={company.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: company.color }}
                      />
                      <h3 className="font-medium">{company.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingIncome(null)
                        setSelectedCompanyId(company.id)
                        setIncomeDialogOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {companyIncomes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No income entries this month
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {companyIncomes.map((income: Income) => (
                        <IncomeCard
                          key={income.id}
                          income={income}
                          onDelete={() => deleteIncome(income.id)}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CompanyDialog
        open={companyDialogOpen}
        onOpenChange={setCompanyDialogOpen}
        company={editingCompany}
      />

      <IncomeDialog
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
        income={editingIncome}
        currentMonth={currentMonth}
        defaultCompanyId={selectedCompanyId}
      />
    </div>
  )
}
