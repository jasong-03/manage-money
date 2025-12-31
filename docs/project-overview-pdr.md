# Money Manager - Project Overview & PDR

## Project Overview

**Money Manager** is a personal finance tracking application built for managing income, expenses, and subscriptions. It provides a comprehensive dashboard for monitoring financial health with AI-powered expense entry capabilities.

### Key Features

1. **Income Tracking**
   - Track income from multiple companies/clients
   - Support for both weekly and monthly payment schedules
   - Payment status tracking (pending/received)
   - Visual progress indicators for expected vs. received income

2. **Expense Management**
   - AI-powered natural language expense entry (Vietnamese)
   - Category-based expense organization
   - Day/week/month view modes
   - Automatic parsing of amounts (15k, 1tr notation)

3. **Subscription Management**
   - Track recurring subscriptions
   - Billing day reminders
   - Active/paused status toggle
   - Category grouping

4. **Dashboard Analytics**
   - Income progress tracking
   - Spending breakdown by category
   - 6-month income trend charts
   - Upcoming payment reminders

---

## Product Development Requirements (PDR)

### Target Users
- Individual users tracking personal finances
- Freelancers managing multiple income sources
- Vietnamese-speaking users (primary localization)

### Core Requirements

#### Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | User can add/edit/delete income sources (companies) | High | Implemented |
| FR-02 | User can track income by period (weekly/monthly) | High | Implemented |
| FR-03 | User can mark income as received/pending | High | Implemented |
| FR-04 | User can enter expenses via natural language | High | Implemented |
| FR-05 | User can categorize and view expenses by time period | High | Implemented |
| FR-06 | User can manage recurring subscriptions | Medium | Implemented |
| FR-07 | User can view dashboard with financial summary | High | Implemented |
| FR-08 | User can view income trends over time | Medium | Implemented |

#### Non-Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-01 | Application loads within 3 seconds | High | Met |
| NFR-02 | Data persists across sessions | High | Met (Supabase) |
| NFR-03 | Responsive design for mobile/desktop | Medium | Met |
| NFR-04 | Vietnamese language support | High | Met |
| NFR-05 | Dark mode support | Low | Met |

### Technical Requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| TR-01 | Frontend Framework | Next.js 16 with App Router |
| TR-02 | UI Component Library | Radix UI + Tailwind CSS |
| TR-03 | State Management | Zustand |
| TR-04 | Database | Supabase (PostgreSQL) |
| TR-05 | AI Integration | Google Gemini 2.0 Flash |
| TR-06 | Type Safety | TypeScript 5 (strict mode) |
| TR-07 | Styling | Tailwind CSS v4 |

---

## Project Scope

### In Scope
- Personal finance tracking (single user)
- Income, expense, and subscription management
- AI-powered expense parsing
- Dashboard analytics and visualizations
- Vietnamese localization

### Out of Scope (Future Considerations)
- Multi-user authentication
- Budget planning and alerts
- Bank account integration
- Export/import functionality
- Mobile native applications

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Data Entry Speed | < 5 seconds per expense | AI parsing accuracy |
| Page Load Time | < 3 seconds | Lighthouse performance |
| User Satisfaction | Intuitive UI | Personal feedback |
| Data Reliability | 100% persistence | Supabase uptime |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI parsing errors | Medium | Preserve raw input, allow manual editing |
| Data loss | High | Supabase automatic backups |
| API key exposure | Medium | Environment variables, client-side only for demo |
| Performance degradation | Low | Memoization, lazy loading |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2024-12 | Initial release with core features |
