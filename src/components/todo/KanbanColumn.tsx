'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  id: TaskStatus
  label: string
  color: string
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
}

export function KanbanColumn({
  id,
  label,
  color,
  tasks,
  onAddTask,
  onEditTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      className={`flex flex-col bg-muted/50 rounded-lg min-h-[300px] sm:min-h-[500px] ${
        isOver ? 'ring-2 ring-primary/50' : ''
      }`}
    >
      <div
        className="px-4 py-3 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base">{label}</h3>
          <span className="text-sm bg-white/50 px-2 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onAddTask}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-base">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}
