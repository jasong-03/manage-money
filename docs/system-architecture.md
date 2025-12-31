# System Architecture

## Architecture Overview

Money Manager follows a **client-heavy architecture** with direct browser-to-database communication. The application is built as a Single Page Application (SPA) using Next.js App Router with client-side state management.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js    │  │   Zustand   │  │      React Components   │  │
│  │  App Router │  │    Store    │  │  (Tabs, Cards, Dialogs) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                      │                │
│         └────────────────┼──────────────────────┘                │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │   State   │                                 │
│                    │  Manager  │                                 │
│                    └─────┬─────┘                                 │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  Supabase   │          │   Gemini    │
       │ (Database)  │          │    (AI)     │
       └─────────────┘          └─────────────┘
```

---

## Layer Architecture

### Presentation Layer
**Location:** `src/components/`, `src/app/`

Handles UI rendering and user interactions.

| Sublayer | Purpose | Files |
|----------|---------|-------|
| Pages | Route entry points | `app/page.tsx`, `app/layout.tsx` |
| Tabs | Feature views | `tabs/DashboardTab.tsx`, etc. |
| Feature Components | Domain-specific UI | `income/`, `spending/`, etc. |
| UI Primitives | Reusable elements | `ui/button.tsx`, `ui/dialog.tsx` |

### State Layer
**Location:** `src/store/`

Centralized state management using Zustand.

```
┌───────────────────────────────────────────┐
│              Zustand Store                │
├───────────────────────────────────────────┤
│  State                                    │
│  ├── companies: Company[]                 │
│  ├── incomes: Income[]                    │
│  ├── expenses: Expense[]                  │
│  ├── subscriptions: Subscription[]        │
│  ├── isLoading: boolean                   │
│  └── error: string | null                 │
├───────────────────────────────────────────┤
│  Actions                                  │
│  ├── loadData()                           │
│  ├── addCompany() / updateCompany()       │
│  ├── addIncome() / toggleIncomeStatus()   │
│  ├── addExpense() / updateExpense()       │
│  └── addSubscription() / toggleActive()   │
└───────────────────────────────────────────┘
```

### Service Layer
**Location:** `src/lib/`

External service integrations and utilities.

| Service | File | Purpose |
|---------|------|---------|
| Database | `supabase.ts` | Supabase client initialization |
| AI | `gemini.ts` | Natural language expense parsing |
| Utilities | `period.ts` | Date/period calculations |
| Helpers | `utils.ts` | CSS class utilities |

### Data Layer
**Location:** Supabase (external)

PostgreSQL database with Row Level Security.

---

## Data Flow

### Read Flow
```
User Opens App
      │
      ▼
┌─────────────────┐
│  useHydration() │  ← React hook triggers on mount
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   loadData()    │  ← Zustand action
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Promise.all()  │  ← Parallel database queries
│  - companies    │
│  - incomes      │
│  - expenses     │
│  - subscriptions│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Transform      │  ← snake_case → camelCase
│  & Store        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Components     │  ← Re-render with new data
│  Re-render      │
└─────────────────┘
```

### Write Flow (Create/Update/Delete)
```
User Action (e.g., Add Expense)
      │
      ▼
┌─────────────────┐
│  Component      │  ← Form submission
│  Handler        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Store Action   │  ← useStore().addExpense()
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌───────────────┐
│Supabase│  │ Optimistic    │  ← Parallel execution
│ Insert │  │ State Update  │
└───┬───┘  └───────────────┘
    │
    ▼
┌─────────────────┐
│  Return new ID  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Store   │  ← Add server-generated ID
│  with Full Data │
└─────────────────┘
```

### AI Parsing Flow
```
Natural Language Input
"ăn sáng 15k, hôm qua grab 20k"
      │
      ▼
┌─────────────────┐
│ parseExpenseWithAI() │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini API     │  ← POST to Google AI
│  Request        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse JSON     │  ← Extract structured data
│  Response       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Structured Expense Objects     │
│  [{amount: 15000,               │
│    category: "Ăn uống",         │
│    description: "ăn sáng",      │
│    date: "2025-01-20"}]         │
└─────────────────────────────────┘
```

---

## Component Architecture

### Composition Pattern
```
┌─────────────────────────────────────────┐
│              Page (page.tsx)            │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │           Tabs Component        │    │
│  ├─────────────────────────────────┤    │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ │    │
│  │  │Dashboard│Compen.│Spending│  │    │
│  │  └───────┘ └───────┘ └───────┘ │    │
│  └─────────────────────────────────┘    │
│                   │                      │
│                   ▼                      │
│  ┌─────────────────────────────────┐    │
│  │         Tab Content             │    │
│  │  ┌─────────┐  ┌─────────┐       │    │
│  │  │  Cards  │  │ Dialogs │       │    │
│  │  └─────────┘  └─────────┘       │    │
│  │       │            │            │    │
│  │  ┌────▼────────────▼────┐       │    │
│  │  │    UI Primitives     │       │    │
│  │  │ Button, Input, etc.  │       │    │
│  │  └──────────────────────┘       │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Component Types

| Type | Responsibility | State |
|------|----------------|-------|
| Page | Route rendering | Minimal (tab selection) |
| Tab | Feature orchestration | Local UI state + store access |
| Card | Data display | Props only |
| Dialog | Data input | Local form state + store actions |
| UI Primitive | Reusable elements | Controlled via props |

---

## Database Architecture

### Entity Relationship Diagram
```
┌──────────────┐       ┌──────────────┐
│  companies   │       │   incomes    │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ name         │  │    │ company_id(FK)│◄──┘
│ payment_type │  │    │ period       │
│ payment_day  │  │    │ amount       │
│ expected_amt │  │    │ status       │
│ color        │  │    │ received_date│
│ created_at   │       │ note         │
└──────────────┘       │ created_at   │
                       └──────────────┘

┌──────────────┐       ┌──────────────┐
│   expenses   │       │subscriptions │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ category     │       │ name         │
│ amount       │       │ amount       │
│ description  │       │ billing_day  │
│ raw_input    │       │ category     │
│ date         │       │ is_active    │
│ created_at   │       │ color        │
└──────────────┘       │ created_at   │
                       └──────────────┘
```

### Database Indexes
| Index | Table | Column(s) | Purpose |
|-------|-------|-----------|---------|
| idx_incomes_company_id | incomes | company_id | Fast company lookups |
| idx_incomes_period | incomes | period | Period-based queries |
| idx_expenses_date | expenses | date | Date range filtering |
| idx_expenses_category | expenses | category | Category filtering |
| idx_subscriptions_is_active | subscriptions | is_active | Active filter |

---

## Security Architecture

### Current State (Demo Mode)
```
Client ──────────────────► Supabase
        (anon key)         (RLS: allow all)
```

⚠️ **Note:** Current configuration allows anonymous access. Not suitable for production without authentication.

### Recommended Production Setup
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───►│  Auth    │───►│ Supabase │
│          │    │ (Supabase│    │ (RLS by  │
│          │    │   Auth)  │    │  user)   │
└──────────┘    └──────────┘    └──────────┘
```

### API Key Exposure
| Key | Location | Risk Level |
|-----|----------|------------|
| Supabase URL | `.env` (public) | Low |
| Supabase Anon | `.env` (public) | Low (RLS protected) |
| Gemini API | `.env.local` | Medium (client-exposed) |

---

## Technology Decisions

### Why Next.js?
- React Server Components support
- Built-in routing with App Router
- Optimized production builds
- Future-proof architecture

### Why Zustand over Redux?
- Minimal boilerplate
- Simpler mental model
- Direct state mutations
- Built-in TypeScript support

### Why Supabase?
- PostgreSQL reliability
- Real-time capabilities (future use)
- Built-in authentication (future use)
- Generous free tier

### Why Tailwind CSS?
- Utility-first approach
- No CSS file management
- Excellent DX with IDE support
- Small production bundles

---

## Scalability Considerations

### Current Limitations
- Single-user design
- Client-side only processing
- No caching layer
- No API rate limiting

### Future Improvements
1. **Authentication**: Supabase Auth for multi-user support
2. **API Routes**: Server-side processing for sensitive operations
3. **Caching**: React Query or SWR for data caching
4. **Real-time**: Supabase subscriptions for live updates
5. **Edge Functions**: Move AI parsing to server-side

---

## Deployment Architecture

### Current Setup
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │  Supabase   │    │   Google    │
│  (Frontend) │    │ (Database)  │    │  (Gemini)   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Browser  │
                    └───────────┘
```

### Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database auth | Yes |
| `NEXT_PUBLIC_GEMINI_API_KEY` | AI parsing | Yes |
