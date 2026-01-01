# Todo Feature - Brainstorm Report

**Date:** 2026-01-01
**Status:** Ready for Implementation

---

## Problem Statement

Add a personal task management feature to Money Manager app with:
- Kanban-style board with drag & drop (PRIORITY)
- 4 status columns
- Mobile-responsive design
- Consistent with existing app patterns

---

## Final Requirements

| Requirement | Decision |
|-------------|----------|
| Tab Name | "To do" |
| Columns | New task, Scheduled, In progress, Completed |
| Priority Levels | Low, Medium, High |
| Color Picker | Free color input (like company dialog) |
| Drag & Drop | YES - Priority feature |
| Views | Kanban (Phase 1), Table (Phase 2) |
| Due Reminders | Phase 2 |

---

## Technical Stack

### Drag & Drop Library
**Selected: `@dnd-kit`**

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Rationale:**
- Best mobile/touch support
- Lightweight (~12kb)
- Active maintenance
- Accessible (keyboard support)
- Works with React 19

---

## Database Schema

### Supabase Table: `tasks`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('new', 'scheduled', 'in_progress', 'completed'));

ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check
  CHECK (priority IN ('low', 'medium', 'high'));

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_sort ON tasks(status, sort_order);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- RLS (same as other tables - demo mode)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
```

---

## TypeScript Types

```typescript
// src/types/index.ts

export type TaskStatus = 'new' | 'scheduled' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  color: string
  sortOrder: number
  createdAt: Date
}
```

---

## Component Architecture

```
src/
├── app/page.tsx                    # Add "todo" tab
├── components/
│   ├── tabs/
│   │   └── TodoTab.tsx             # Main container
│   └── todo/
│       ├── KanbanBoard.tsx         # Board with DnD context
│       ├── KanbanColumn.tsx        # Single droppable column
│       ├── TaskCard.tsx            # Draggable card
│       └── TaskDialog.tsx          # Add/Edit modal
├── store/
│   └── useStore.ts                 # Add tasks state + actions
└── types/
    └── index.ts                    # Add Task types
```

---

## UI Design Specs

### Desktop Kanban (4 columns)
```
┌─────────────────────────────────────────────────────────────────┐
│  [+ Add Task]                                    🔍 Search      │
├────────────────┬────────────────┬────────────────┬──────────────┤
│ New task (3)   │ Scheduled (2)  │ In progress(1) │ Completed(5) │
├────────────────┼────────────────┼────────────────┼──────────────┤
│ ┌────────────┐ │ ┌────────────┐ │ ┌────────────┐ │ ┌──────────┐ │
│ │▎Task title │ │ │▎Task title │ │ │▎Task title │ │ │ ✓ Done   │ │
│ │ 🔴 High    │ │ │ 6 days left│ │ │ 🟡 Medium  │ │ │          │ │
│ └────────────┘ │ └────────────┘ │ └────────────┘ │ └──────────┘ │
│ ┌────────────┐ │                │                │              │
│ │▎Task 2     │ │                │                │              │
│ └────────────┘ │                │                │              │
└────────────────┴────────────────┴────────────────┴──────────────┘

▎ = Color stripe (left border using task.color)
```

### Mobile (Tabs + Single Column)
```
┌──────────────────────────┐
│ [New 3][Sched][Prog][Done]│  ← Scrollable status tabs
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │▎Task title           │ │
│ │ 🔴 High · 3 days     │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │▎Task 2               │ │
│ │ 🟢 Low               │ │
│ └──────────────────────┘ │
│                          │
│      [+ Add Task]        │
└──────────────────────────┘
```

---

## Task Card Design

```tsx
<Card className="border-l-4" style={{ borderLeftColor: task.color }}>
  <div className="flex justify-between">
    <h4>{task.title}</h4>
    <DropdownMenu>...</DropdownMenu>
  </div>
  <div className="flex gap-2 mt-2">
    <Badge variant={priorityVariant}>{task.priority}</Badge>
    {task.dueDate && <span className="text-xs">{dueText}</span>}
  </div>
</Card>
```

**Priority Badge Colors:**
- High: `bg-red-100 text-red-700`
- Medium: `bg-yellow-100 text-yellow-700`
- Low: `bg-green-100 text-green-700`

**Due Date Display:**
- Future: "6 days left"
- Today: "Due today" (orange)
- Overdue: "Overdue" (red)

---

## Drag & Drop Implementation

### DnD Kit Setup
```tsx
// KanbanBoard.tsx
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// Key handlers:
// 1. onDragStart - Show drag overlay
// 2. onDragOver - Handle column changes
// 3. onDragEnd - Persist new order to Supabase
```

### Sort Order Strategy
- Each column maintains independent sort_order
- On drop: Update task's status + sort_order
- Batch update affected cards in same column

---

## Store Actions

```typescript
// useStore.ts additions

interface TaskState {
  tasks: Task[]
  loadTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  reorderTasks: (taskId: string, newStatus: TaskStatus, newOrder: number) => Promise<void>
}
```

---

## Implementation Phases

### Phase 1 (Core) - Current Scope
- [ ] Add `tasks` table to Supabase
- [ ] Add Task types to TypeScript
- [ ] Add tasks state to Zustand store
- [ ] Create TodoTab component
- [ ] Create KanbanBoard with DnD
- [ ] Create KanbanColumn (droppable)
- [ ] Create TaskCard (draggable)
- [ ] Create TaskDialog (add/edit)
- [ ] Add "To do" tab to navigation
- [ ] Mobile responsive layout

### Phase 2 (Enhancement)
- [ ] Table view alternative
- [ ] Search tasks
- [ ] Filter by priority/due date
- [ ] Due date reminders

### Phase 3 (Advanced)
- [ ] Subtasks (✓ 0/4 progress)
- [ ] Tags/labels
- [ ] Recurring tasks
- [ ] Archive completed

---

## Mobile Drag & Drop Considerations

1. **Touch activation delay** - 250ms hold before drag starts
2. **Visual feedback** - Card lifts with shadow on drag
3. **Alternative interaction** - Dropdown menu to change status (no drag required)
4. **Swipe gesture** - Consider adding swipe-to-complete in Phase 2

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| DnD performance with many tasks | Virtualize list if >100 tasks |
| Mobile drag UX | Provide status dropdown as fallback |
| Sort order conflicts | Use optimistic updates + server reconciliation |

---

## Success Criteria

1. ✅ Can create/edit/delete tasks
2. ✅ Drag tasks between columns (desktop)
3. ✅ Change status on mobile (via dropdown or drag)
4. ✅ Tasks persist in Supabase
5. ✅ Responsive design matches app style
6. ✅ Page load < 1s with 50 tasks

---

## Dependencies

```bash
# New packages needed
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Next Steps

1. Run SQL schema in Supabase
2. Add database types to `src/types/database.ts`
3. Implement store actions
4. Build components in order: TaskDialog → TaskCard → KanbanColumn → KanbanBoard → TodoTab
5. Add tab to navigation
6. Test drag & drop on mobile

---

## Appendix: Column Configuration

```typescript
export const TASK_COLUMNS = [
  { id: 'new', label: 'New task', color: '#e5e7eb' },
  { id: 'scheduled', label: 'Scheduled', color: '#fef3c7' },
  { id: 'in_progress', label: 'In progress', color: '#dbeafe' },
  { id: 'completed', label: 'Completed', color: '#d1fae5' },
] as const
```

## Appendix: Priority Configuration

```typescript
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#22c55e', bgColor: '#dcfce7' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', bgColor: '#fef3c7' },
  { value: 'high', label: 'High', color: '#ef4444', bgColor: '#fee2e2' },
] as const
```
