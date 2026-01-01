'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Task, TASK_PRIORITIES, TASK_COLUMNS } from '@/types'
import { MoreVertical, Pencil, Trash2, GripVertical } from 'lucide-react'
import { formatDistanceToNow, isPast, isToday } from 'date-fns'
import { useStore } from '@/store/useStore'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onEdit, isDragging }: TaskCardProps) {
  const { deleteTask, updateTask, companies } = useStore()
  const priority = TASK_PRIORITIES.find((p) => p.value === task.priority)
  const company = task.companyId ? companies.find((c) => c.id === task.companyId) : null

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getDueDateText = () => {
    if (!task.dueDate) return null

    if (isPast(task.dueDate) && !isToday(task.dueDate)) {
      return { text: 'Overdue', className: 'text-red-600' }
    }
    if (isToday(task.dueDate)) {
      return { text: 'Due today', className: 'text-orange-600' }
    }
    return {
      text: formatDistanceToNow(task.dueDate, { addSuffix: false }) + ' left',
      className: 'text-muted-foreground',
    }
  }

  const dueInfo = getDueDateText()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-2 sm:p-3 border-l-4 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'shadow-lg opacity-90' : 'hover:shadow-md'
      }`}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <div
          {...listeners}
          className="mt-1 text-muted-foreground hover:text-foreground cursor-grab"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div
              className="w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-md"
              style={{ backgroundColor: task.color }}
            />
            <h4 className="text-sm font-medium truncate">{task.title}</h4>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {TASK_COLUMNS.filter((col) => col.id !== task.status).map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => updateTask(task.id, { status: col.id })}
                  >
                    Move to {col.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {priority && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: priority.bgColor,
                  color: priority.color,
                }}
              >
                {priority.label}
              </span>
            )}
            {company && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: company.color }}
                />
                {company.name}
              </span>
            )}
            {dueInfo && (
              <span className={`text-xs ${dueInfo.className}`}>
                {dueInfo.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
