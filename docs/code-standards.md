# Code Standards & Conventions

## Project Conventions

### File Organization

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components (feature-based + UI primitives)
├── lib/           # Utilities, API clients, helpers
├── store/         # Zustand state management
└── types/         # TypeScript type definitions
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `IncomeCard.tsx`, `DashboardTab.tsx` |
| Utilities | camelCase | `formatAmount()`, `parseExpenseWithAI()` |
| Types/Interfaces | PascalCase | `Company`, `Income`, `AppState` |
| Files | PascalCase (components), camelCase (utils) | `IncomeCard.tsx`, `period.ts` |
| CSS Variables | kebab-case | `--background`, `--muted-foreground` |
| Database Columns | snake_case | `company_id`, `payment_type` |

---

## TypeScript Standards

### Strict Mode
TypeScript is configured with strict mode enabled:
```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  }
}
```

### Type Definitions
- Domain types in `src/types/index.ts`
- Database types in `src/types/database.ts`
- Use explicit typing for function parameters and returns

```typescript
// Good
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

// Avoid
function formatAmount(amount) {
  return amount + 'đ'
}
```

### Import Aliases
Use path aliases for cleaner imports:
```typescript
// Good
import { useStore } from '@/store/useStore'
import { Company } from '@/types'
import { cn } from '@/lib/utils'

// Avoid
import { useStore } from '../../../store/useStore'
```

---

## React Patterns

### Component Structure
```typescript
'use client'  // Client component directive (when needed)

import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { ComponentType } from '@/types'

interface Props {
  item: ItemType
  onAction: () => void
}

export function ComponentName({ item, onAction }: Props) {
  // State declarations
  const [localState, setLocalState] = useState(initialValue)

  // Store access
  const { data, actions } = useStore()

  // Memoized computations
  const computed = useMemo(() => {
    // expensive calculation
  }, [dependencies])

  // Event handlers
  const handleClick = () => {
    // handler logic
  }

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Server vs Client Components
| Type | Marker | Use Case |
|------|--------|----------|
| Server | (default) | Static content, data fetching |
| Client | `'use client'` | Interactivity, hooks, browser APIs |

Current components using `'use client'`:
- All tab components
- All dialog/form components
- Components using `useStore()` or `useState()`

### Props Patterns

**Dialog Pattern:**
```typescript
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: ItemType | null  // Optional for create/edit modes
}
```

**Card Pattern:**
```typescript
interface CardProps {
  item: ItemType
  onEdit: () => void
  onDelete: () => void
}
```

---

## State Management

### Zustand Store Pattern
```typescript
interface AppState {
  // Data
  items: Item[]
  isLoading: boolean
  error: string | null

  // Actions
  loadData: () => Promise<void>
  addItem: (item: Omit<Item, 'id'>) => Promise<void>
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  // Implementation
}))
```

### Data Flow
1. UI triggers action → `useStore().action()`
2. Action updates Supabase
3. Action updates local state with `set()`
4. Components re-render with new state

### Hydration Hook
```typescript
export function useHydration() {
  const [hydrated, setHydrated] = useState(false)
  const loadData = useStore((state) => state.loadData)

  useEffect(() => {
    loadData().then(() => setHydrated(true))
  }, [loadData])

  return hydrated
}
```

---

## Styling Standards

### Tailwind CSS
- Use utility classes directly in JSX
- Use `cn()` for conditional classes
- Use CSS variables for theming

```typescript
// Good
<div className={cn(
  "flex items-center gap-2 p-4",
  isActive && "bg-primary text-primary-foreground"
)}>

// Avoid inline styles
<div style={{ display: 'flex', gap: '8px' }}>
```

### Color System
Use semantic color tokens:
```css
/* Semantic tokens */
--background
--foreground
--primary
--primary-foreground
--muted
--muted-foreground
--destructive
```

### Component Variants
Use `class-variance-authority` for component variants:
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "variant-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "size-classes",
        sm: "small-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

---

## Database Conventions

### Snake Case to Camel Case
Database uses snake_case, JavaScript uses camelCase:
```typescript
// Transformation helper
function toIncome(row: Database['incomes']['Row']): Income {
  return {
    id: row.id,
    companyId: row.company_id,      // snake → camel
    paymentDate: row.payment_date,  // snake → camel
    // ...
  }
}
```

### Supabase Queries
```typescript
// Select with error handling
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('created_at', { ascending: false })

if (error) {
  console.error('Error:', error)
  return
}
```

---

## Error Handling

### Store Level
```typescript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  set({ data, error: null })
} catch (e) {
  console.error('Error:', e)
  set({ error: 'Failed to load data' })
}
```

### Component Level
- Display error states in UI
- Preserve original input for recovery (rawInput field)
- Use loading states during async operations

---

## Performance Guidelines

### Memoization
Use `useMemo` for expensive calculations:
```typescript
const filteredData = useMemo(() => {
  return data.filter(item => item.date >= startDate)
}, [data, startDate])
```

### Parallel Data Loading
```typescript
const [companies, incomes, expenses] = await Promise.all([
  supabase.from('companies').select(),
  supabase.from('incomes').select(),
  supabase.from('expenses').select(),
])
```

---

## Localization

### Vietnamese Support
- Currency: VND with "đ" suffix
- Date format: Vietnamese locale from date-fns
- UI text: Vietnamese labels and messages
- AI parsing: Vietnamese natural language support

```typescript
// Currency formatting
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

// Date formatting
import { vi } from 'date-fns/locale'
format(date, 'MMMM yyyy', { locale: vi })
```

---

## Git Conventions

### Branch Naming
- `main` - Production branch
- `feature/*` - New features
- `fix/*` - Bug fixes

### Commit Messages
- Use conventional commits format
- Include scope when relevant
- Keep messages concise

```
feat(income): add weekly income tracking
fix(expense): correct AI parsing for amounts
docs: update README with setup instructions
```
