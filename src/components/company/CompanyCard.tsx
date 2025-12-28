'use client'

import { Company } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Building2 } from 'lucide-react'

interface CompanyCardProps {
  company: Company
  onEdit: () => void
  onDelete: () => void
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: company.color + '20' }}
        >
          <Building2 className="w-5 h-5" style={{ color: company.color }} />
        </div>
        <div>
          <h3 className="font-medium">{company.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {company.paymentType === 'weekly' ? 'Weekly' : 'Monthly'}
            </Badge>
            {company.paymentDay && (
              <span className="text-xs text-muted-foreground">
                Day {company.paymentDay}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
