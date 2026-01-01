'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, CheckSquare } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { KanbanBoard } from '@/components/todo/KanbanBoard'
import { TaskDialog } from '@/components/todo/TaskDialog'
import { Task, TaskStatus, TASK_COLUMNS } from '@/types'

export function TodoTab() {
  const { tasks } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('new')

  // Mobile: Active tab state
  const [activeColumn, setActiveColumn] = useState<TaskStatus>('new')

  // Count tasks per column
  const taskCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      new: 0,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
    }
    tasks.forEach((task) => {
      counts[task.status]++
    })
    return counts
  }, [tasks])

  // Filter tasks for mobile view
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.status === activeColumn)
  }, [tasks, activeColumn])

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null)
    setDefaultStatus(status)
    setDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const totalTasks = tasks.length
  const completedTasks = taskCounts.completed

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg sm:text-2xl font-bold">To do</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage your personal tasks
        </p>
      </div>

      {/* Summary Card */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <div>
              <p className="text-sm sm:text-base text-muted-foreground">Tasks completed</p>
              <p className="text-xl sm:text-3xl font-bold">
                {completedTasks} / {totalTasks}
              </p>
            </div>
          </div>
          <Button size="default" className="h-10 sm:h-11 text-sm sm:text-base" onClick={() => handleAddTask('new')}>
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add Task
          </Button>
        </div>
      </Card>

      {/* Mobile: Tab navigation */}
      <div className="sm:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {TASK_COLUMNS.map((col) => (
            <Button
              key={col.id}
              variant={activeColumn === col.id ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0 text-xs h-8"
              onClick={() => setActiveColumn(col.id)}
            >
              {col.label.split(' ')[0]}
              <span className="ml-1.5 bg-background/20 px-1.5 rounded-full text-[10px]">
                {taskCounts[col.id]}
              </span>
            </Button>
          ))}
        </div>

        {/* Mobile: Single column view */}
        <div className="space-y-2 mt-3">
          {filteredTasks.length > 0 ? (
            filteredTasks
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((task) => (
                <Card
                  key={task.id}
                  className="p-3 border-l-4 cursor-pointer"
                  style={{ borderLeftColor: task.color }}
                  onClick={() => handleEditTask(task)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium truncate">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No tasks in this column</p>
              <Button
                size="sm"
                className="mt-3 h-8 text-xs"
                onClick={() => handleAddTask(activeColumn)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add task
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Desktop: Kanban board */}
      <div className="hidden sm:block">
        {tasks.length > 0 ? (
          <KanbanBoard
            tasks={tasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        ) : (
          <Card className="p-6 sm:p-8 text-center">
            <CheckSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-base font-medium mb-2">No tasks yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Create your first task to get started
            </p>
            <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm" onClick={() => handleAddTask('new')}>
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Add your first task
            </Button>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
