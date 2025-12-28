# Spending Feature - AI Categorization

**Date:** 2025-12-28
**Status:** Ready for Implementation

## Problem Statement

Cần feature tracking chi tiêu với:
- Input dạng chat tự nhiên (tiếng Việt)
- AI tự động phân loại category
- AI detect ngày từ input ("hôm qua", "hôm nay", "thứ 2")
- View theo ngày/tuần/tháng

## Final Solution

### Flow
```
User input "hôm qua ăn sáng 15k"
    → Gemini API parse
    → Extract: amount, category, description, date
    → Add to store
    → Show in list
    → User edit nếu sai
```

### Tech Stack
- **AI Model:** Gemini 1.5 Flash (fast, cheap)
- **API:** Client-side call với env variable
- **Storage:** Zustand + localStorage (như income)
- **Categories:** Dynamic, AI tự tạo

### Data Structure

```typescript
interface Expense {
  id: string
  amount: number
  category: string      // AI tạo động: "Ăn uống", "Di chuyển", etc.
  description: string   // Mô tả ngắn từ AI
  rawInput: string      // Input gốc của user
  date: Date            // Ngày chi tiêu (AI detect)
  createdAt: Date
}
```

### Gemini Prompt

```typescript
const systemPrompt = `
Bạn là assistant phân tích chi tiêu. Parse input và trả về JSON.

Quy tắc:
- amount: số tiền VND (15k = 15000, 1tr = 1000000)
- category: tự tạo category phù hợp bằng tiếng Việt
- description: mô tả ngắn gọn
- date: ISO date string, dựa vào context (hôm nay = ${new Date().toISOString().split('T')[0]})

Response format (JSON only, no markdown):
{"amount": number, "category": string, "description": string, "date": "YYYY-MM-DD"}

Examples:
- "ăn sáng 15k" → {"amount": 15000, "category": "Ăn uống", "description": "ăn sáng", "date": "2025-12-28"}
- "hôm qua grab 25k" → {"amount": 25000, "category": "Di chuyển", "description": "grab", "date": "2025-12-27"}
- "mua áo 200k thứ 2" → {"amount": 200000, "category": "Mua sắm", "description": "mua áo", "date": "2025-12-23"}
`
```

### UI Components

```
SpendingTab
├── ChatInput (input + send button)
├── DateNavigation (day/week/month selector)
├── ExpenseList
│   └── ExpenseCard (editable: amount, category, description)
└── CategorySummary (breakdown by category)
```

### UI Mockup

```
┌─────────────────────────────────────────────┐
│  December 2025                    [D][W][M] │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │ 💬 hôm nay ăn trưa 35k...    [Gửi] │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  📅 Hôm nay - 28/12                         │
│  ┌─────────────────────────────────────┐    │
│  │ 🍜 Ăn uống        35,000đ     [✏️🗑]│    │
│  │    ăn trưa                          │    │
│  ├─────────────────────────────────────┤    │
│  │ 🚗 Di chuyển      20,000đ     [✏️🗑]│    │
│  │    grab đi làm                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📅 Hôm qua - 27/12                         │
│  ┌─────────────────────────────────────┐    │
│  │ 🛒 Mua sắm       150,000đ     [✏️🗑]│    │
│  │    mua đồ dùng                      │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  📊 Tổng tháng này                          │
│  ┌─────────────────────────────────────┐    │
│  │ Ăn uống      ████████░░   500,000đ │    │
│  │ Di chuyển    ████░░░░░░   200,000đ │    │
│  │ Mua sắm      ██░░░░░░░░   150,000đ │    │
│  │ ─────────────────────────────────── │    │
│  │ Total                     850,000đ │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Environment Setup

```env
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### Implementation Files

1. `.env.local` - API key
2. `src/lib/gemini.ts` - Gemini API client
3. `src/store/useStore.ts` - Add expense actions
4. `src/components/tabs/SpendingTab.tsx` - Main tab (replace placeholder)
5. `src/components/spending/ChatInput.tsx` - Input component
6. `src/components/spending/ExpenseCard.tsx` - Editable expense card
7. `src/components/spending/CategorySummary.tsx` - Category breakdown

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI parse sai | User có thể edit inline |
| API fail | Show error toast, giữ input |
| Slow response | Show loading state |
| Invalid JSON | Fallback parse, ask user to rephrase |

### Success Metrics

- [ ] Input tự nhiên → AI parse đúng >90%
- [ ] Response time <2s
- [ ] Edit flow smooth, không cần nhiều click
- [ ] View day/week/month hoạt động

## Next Steps

1. Tạo `.env.local` với placeholder
2. Implement Gemini client
3. Update store với expense actions
4. Build SpendingTab UI
5. Test với các input khác nhau
