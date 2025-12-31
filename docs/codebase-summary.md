# Codebase Summary

## Project Structure

```
manage-money/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with fonts and metadata
│   │   ├── page.tsx            # Home page with tabbed interface
│   │   └── globals.css         # Global styles (Tailwind + CSS variables)
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/Radix UI primitives (11 files)
│   │   ├── tabs/               # Main feature tabs (4 files)
│   │   ├── company/            # Company management (2 files)
│   │   ├── income/             # Income tracking (3 files)
│   │   ├── spending/           # Expense management (3 files)
│   │   └── subscription/       # Subscription management (2 files)
│   │
│   ├── lib/                    # Utilities and services
│   │   ├── supabase.ts         # Supabase client initialization
│   │   ├── gemini.ts           # AI expense parsing (Gemini API)
│   │   ├── period.ts           # Date/period utilities
│   │   └── utils.ts            # General utilities (cn function)
│   │
│   ├── store/                  # State management
│   │   └── useStore.ts         # Zustand store (451 lines)
│   │
│   └── types/                  # TypeScript definitions
│       ├── index.ts            # Domain types (Company, Income, Expense, etc.)
│       └── database.ts         # Supabase schema types
│
├── supabase/
│   └── schema.sql              # Database schema
│
├── public/                     # Static assets (SVG icons)
├── plans/                      # Planning documents
└── [config files]              # Next.js, TypeScript, Tailwind, ESLint
```

---

## Key Files by Purpose

### Entry Points
| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, font loading, metadata |
| `src/app/page.tsx` | Main page with 4-tab interface |

### Feature Components
| Directory | Files | Purpose |
|-----------|-------|---------|
| `tabs/` | DashboardTab, CompensationTab, SpendingTab, SubscriptionTab | Main application views |
| `company/` | CompanyCard, CompanyDialog | Income source management |
| `income/` | IncomeCard, IncomeDialog, WeeklyIncomeGrid | Payment tracking |
| `spending/` | ExpenseCard, ChatInput, CategorySummary | Expense management |
| `subscription/` | SubscriptionCard, SubscriptionDialog | Recurring payments |

### Core Libraries
| File | Purpose | Key Exports |
|------|---------|-------------|
| `lib/supabase.ts` | Database client | `supabase` |
| `lib/gemini.ts` | AI parsing | `parseExpenseWithAI()` |
| `lib/period.ts` | Date utilities | `getMonthPeriod()`, `formatAmount()` |
| `lib/utils.ts` | CSS utilities | `cn()` |

### State Management
| File | Purpose | Key Exports |
|------|---------|-------------|
| `store/useStore.ts` | Zustand store | `useStore()`, `useHydration()` |

---

## Component Inventory

### UI Primitives (shadcn/ui)
| Component | Radix Primitive | Purpose |
|-----------|-----------------|---------|
| Button | @radix-ui/react-slot | Action buttons with variants |
| Card | - | Container with header/content/footer |
| Dialog | @radix-ui/react-dialog | Modal dialogs |
| Tabs | @radix-ui/react-tabs | Tab navigation |
| Select | @radix-ui/react-select | Dropdown selection |
| Input | - | Text input fields |
| Label | @radix-ui/react-label | Form labels |
| Calendar | react-day-picker | Date selection |
| Popover | @radix-ui/react-popover | Floating content |
| Progress | @radix-ui/react-progress | Progress bars |
| Badge | - | Status indicators |

### Feature Components (25 total)
- **Tabs**: 4 main views
- **Company**: 2 components (card + dialog)
- **Income**: 3 components (card + dialog + grid)
- **Spending**: 3 components (card + chat input + summary)
- **Subscription**: 2 components (card + dialog)
- **UI**: 11 primitives

---

## Data Models

### Company
```typescript
{
  id: string
  name: string
  paymentType: 'weekly' | 'monthly'
  paymentDay?: number
  expectedAmount: number
  color: string
  createdAt: Date
}
```

### Income
```typescript
{
  id: string
  companyId: string
  period: string           // '2025-01' or '2025-W03'
  paymentDate?: Date
  amount: number
  status: 'pending' | 'received'
  receivedDate?: Date
  note?: string
  createdAt: Date
}
```

### Expense
```typescript
{
  id: string
  category: string
  amount: number
  description: string
  rawInput: string         // Original AI input
  date: Date
  createdAt: Date
}
```

### Subscription
```typescript
{
  id: string
  name: string
  amount: number
  billingDay: number
  category: string
  isActive: boolean
  color: string
  createdAt: Date
}
```

---

## Database Schema

### Tables
| Table | Description | Indexes |
|-------|-------------|---------|
| companies | Income sources | - |
| incomes | Payment records | company_id, period |
| expenses | Spending records | date, category |
| subscriptions | Recurring payments | is_active |

### Relationships
```
companies (1) ──── (N) incomes
```
- Cascade delete: Deleting a company removes all associated incomes

---

## External Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | React framework |
| react | 19.2.3 | UI library |
| zustand | ^5.0.9 | State management |
| @supabase/supabase-js | ^2.89.0 | Database client |
| recharts | ^3.6.0 | Charts |
| date-fns | ^4.1.0 | Date utilities |
| lucide-react | ^0.562.0 | Icons |
| @radix-ui/* | various | UI primitives |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5 | Type checking |
| eslint | ^9 | Code linting |
| tailwindcss | ^4 | CSS framework |

---

## API Integrations

### Supabase
- **Type**: PostgreSQL database
- **Authentication**: Anonymous key (demo mode)
- **Operations**: Full CRUD on all tables
- **Environment**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Google Gemini
- **Model**: gemini-2.0-flash
- **Purpose**: Natural language expense parsing
- **Input**: Vietnamese text with amounts
- **Output**: Structured expense data
- **Environment**: `NEXT_PUBLIC_GEMINI_API_KEY`

---

## File Statistics

| Category | Count |
|----------|-------|
| TypeScript Files | ~30 |
| React Components | 25 |
| Lines in Store | 451 |
| Database Tables | 4 |
| External APIs | 2 |
