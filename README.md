# Money Manager

A personal finance tracking application for managing income, expenses, and subscriptions with AI-powered expense entry.

## Features

- **Income Tracking**: Track income from multiple sources with weekly/monthly payment schedules
- **Expense Management**: AI-powered natural language expense entry (Vietnamese)
- **Subscription Tracking**: Manage recurring subscriptions with billing reminders
- **Dashboard Analytics**: Visual summaries, charts, and upcoming payment alerts

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Radix UI + Tailwind CSS v4 |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.0 Flash |
| Language | TypeScript 5 (strict mode) |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd manage-money

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup

Run the SQL schema in your Supabase project:

```bash
# Copy contents of supabase/schema.sql to Supabase SQL Editor
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Project Structure

```
src/
├── app/                # Next.js App Router pages
├── components/         # React components
│   ├── ui/            # Shadcn UI primitives
│   ├── tabs/          # Main feature views
│   ├── company/       # Company management
│   ├── income/        # Income tracking
│   ├── spending/      # Expense management
│   └── subscription/  # Subscription tracking
├── lib/               # Utilities and services
├── store/             # Zustand state management
└── types/             # TypeScript definitions
```

## Documentation

Detailed documentation available in the `docs/` folder:

- [Project Overview & PDR](docs/project-overview-pdr.md) - Requirements and scope
- [Codebase Summary](docs/codebase-summary.md) - File structure and components
- [Code Standards](docs/code-standards.md) - Conventions and patterns
- [System Architecture](docs/system-architecture.md) - Technical architecture

## Key Features

### AI Expense Parsing

Enter expenses naturally in Vietnamese:
```
ăn sáng 15k, hôm qua grab 20k
```

The AI parses this into structured expense records with amount, category, description, and date.

### Income Tracking

- Support for weekly and monthly payment schedules
- Track expected vs. received amounts
- Status tracking (pending/received)
- Progress visualization

### Dashboard

- Income progress by company
- Spending breakdown by category
- 6-month income trends
- Upcoming subscription payments

## License

Private project - All rights reserved
