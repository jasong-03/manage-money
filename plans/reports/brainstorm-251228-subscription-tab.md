# Brainstorm: Subscription Tab

**Date:** 2024-12-28
**Status:** Approved
**Topic:** Add subscription tracking for recurring monthly payments

---

## Problem Statement

User pays monthly subscriptions (YouTube Premium, ChatGPT, Gemini, etc.) and needs to:
- Track all recurring subscriptions in one place
- See total monthly subscription cost
- Auto-add subscription payments to Spending on billing day

---

## Requirements

| Requirement | Decision |
|-------------|----------|
| Currency | VND only (no conversion needed) |
| Integration | Auto-add to Spending on billing day |
| Payment tracking | Via Spending tab (no separate tracking) |

---

## Evaluated Approaches

### Approach 1: Simple List ✅ SELECTED

```typescript
interface Subscription {
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

**Pros:**
- Simple, follows KISS principle
- Reuses patterns from existing code (Company model)
- Fast to implement (~2-3 hours)
- No duplicate tracking (Spending = payment history)

**Cons:**
- Cannot track price changes over time

### Approach 2: With Payment History ❌ REJECTED

Separate `SubscriptionPayment` entity to track each payment.

**Rejected because:**
- YAGNI - Spending already tracks actual payments
- Adds complexity without clear benefit
- Violates DRY principle

---

## Final Solution

### Data Model

```typescript
interface Subscription {
  id: string
  name: string
  amount: number           // VND
  billingDay: number       // 1-31
  category: string         // 'AI' | 'Entertainment' | 'Productivity' | 'Other'
  isActive: boolean
  color: string
  createdAt: Date
}
```

### Features

1. **CRUD Operations** - Add/Edit/Delete subscriptions
2. **Category Grouping** - Visual grouping by category
3. **Monthly Total** - Sum of all active subscriptions
4. **Toggle Active** - Pause without deleting
5. **Auto-add to Spending** - Create expense on billing day
6. **Dashboard Integration** - Show subscription total

### Auto-add Logic

On app load, for each active subscription:
1. Check if today >= billingDay
2. Check if no expense exists for this subscription in current month
3. If both true → create expense:
   - `category`: subscription.category
   - `amount`: subscription.amount
   - `description`: subscription.name
   - `date`: billingDay of current month
   - `rawInput`: "[Auto] {name}"

### UI Structure

```
SubscriptionTab
├── Header (month + total)
├── Category Groups
│   ├── AI (ChatGPT, Gemini, Claude)
│   ├── Entertainment (YouTube, Netflix)
│   └── Productivity (Notion, etc.)
├── Add Button
└── SubscriptionDialog (add/edit modal)
```

---

## Implementation Plan

| Task | Files |
|------|-------|
| 1. Add Subscription type | `src/types/index.ts` |
| 2. Add store actions | `src/store/useStore.ts` |
| 3. Create SubscriptionTab | `src/components/tabs/SubscriptionTab.tsx` |
| 4. Create SubscriptionDialog | `src/components/subscription/SubscriptionDialog.tsx` |
| 5. Create SubscriptionCard | `src/components/subscription/SubscriptionCard.tsx` |
| 6. Add auto-add logic | `src/hooks/useAutoSubscription.ts` |
| 7. Add tab to page.tsx | `src/app/page.tsx` |
| 8. Dashboard widget (optional) | `src/components/tabs/DashboardTab.tsx` |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Duplicate expenses if user opens app multiple times | Check existing expenses before creating |
| Billing day > days in month (e.g., 31 in Feb) | Use last day of month as fallback |

---

## Success Metrics

- User can add/manage all subscriptions
- Total monthly cost visible at a glance
- Subscriptions auto-appear in Spending on correct day
- No duplicate expenses created

---

## Next Steps

1. Implement Subscription type and store
2. Build SubscriptionTab UI
3. Add auto-add logic
4. Test with real subscriptions
5. Optional: Add to Dashboard
