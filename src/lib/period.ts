import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, getWeek, getYear, parse, addWeeks, subWeeks } from 'date-fns'

export function getMonthPeriod(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function getWeekPeriod(date: Date): string {
  const week = getWeek(date, { weekStartsOn: 1 })
  const year = getYear(date)
  return `${year}-W${week.toString().padStart(2, '0')}`
}

export function parseMonthPeriod(period: string): Date {
  return parse(period, 'yyyy-MM', new Date())
}

export function parseWeekPeriod(period: string): Date {
  const [year, week] = period.split('-W')
  const date = new Date(parseInt(year), 0, 1)
  const weekNumber = parseInt(week)
  return addWeeks(startOfWeek(date, { weekStartsOn: 1 }), weekNumber - 1)
}

export function formatPeriodDisplay(period: string): string {
  if (period.includes('-W')) {
    return `Week ${period.split('-W')[1]}`
  }
  const date = parseMonthPeriod(period)
  return format(date, 'MMMM yyyy')
}

export function getWeeksInMonth(monthPeriod: string): string[] {
  const date = parseMonthPeriod(monthPeriod)
  const start = startOfMonth(date)
  const end = endOfMonth(date)

  const weeks: string[] = []
  let current = startOfWeek(start, { weekStartsOn: 1 })

  while (current <= end) {
    const weekEnd = endOfWeek(current, { weekStartsOn: 1 })
    // Only include if week overlaps with the month
    if (weekEnd >= start && current <= end) {
      weeks.push(getWeekPeriod(current))
    }
    current = addWeeks(current, 1)
  }

  return [...new Set(weeks)] // Remove duplicates
}

export function navigateMonth(period: string, direction: 'prev' | 'next'): string {
  const date = parseMonthPeriod(period)
  const newDate = direction === 'next' ? addMonths(date, 1) : subMonths(date, 1)
  return getMonthPeriod(newDate)
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + 'đ'
}

export function formatAmountShort(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K'
  }
  return amount.toString()
}
