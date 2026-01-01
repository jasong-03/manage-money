'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Task, TaskStatus, TASK_COLUMNS } from '@/types'
import { useStore } from '@/store/useStore'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
  onAddTask: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
}

export function KanbanBoard({ tasks, onAddTask, onEditTask }: KanbanBoardProps) {
  const { reorderTasks, updateTask } = useStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      new: [],
      scheduled: [],
      in_progress: [],
      completed: [],
    }

    tasks.forEach((task) => {
      grouped[task.status].push(task)
    })

    // Sort by sortOrder within each column
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => a.sortOrder - b.sortOrder)
    })

    return grouped
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if dropping on a column
    const isOverColumn = TASK_COLUMNS.some((col) => col.id === overId)
    if (isOverColumn) {
      const newStatus = overId as TaskStatus
      if (activeTask.status !== newStatus) {
        updateTask(activeId, { status: newStatus })
      }
      return
    }

    // Check if dropping on a task
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask && activeTask.status !== overTask.status) {
      updateTask(activeId, { status: overTask.status })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Find the target status
    let targetStatus: TaskStatus = activeTask.status
    let targetOrder = activeTask.sortOrder

    // If dropping on a column
    const isOverColumn = TASK_COLUMNS.some((col) => col.id === overId)
    if (isOverColumn) {
      targetStatus = overId as TaskStatus
      const columnTasks = tasksByStatus[targetStatus]
      targetOrder = columnTasks.length > 0 ? columnTasks[columnTasks.length - 1].sortOrder + 1 : 0
    } else {
      // Dropping on a task
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask) {
        targetStatus = overTask.status
        targetOrder = overTask.sortOrder
      }
    }

    reorderTasks(activeId, targetStatus, targetOrder)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {TASK_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            color={column.color}
            tasks={tasksByStatus[column.id]}
            onAddTask={() => onAddTask(column.id)}
            onEditTask={onEditTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} onEdit={() => {}} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}
