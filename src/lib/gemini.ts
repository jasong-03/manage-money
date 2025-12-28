interface ParsedExpense {
  amount: number
  category: string
  description: string
  date: string
}

export async function parseExpenseWithAI(input: string): Promise<ParsedExpense> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Gemini API key not configured')
  }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const prompt = `Bạn là assistant phân tích chi tiêu. Parse input và trả về JSON.

Quy tắc:
- amount: số tiền VND (15k = 15000, 1tr = 1000000, 1m = 1000000)
- category: tự tạo category phù hợp bằng tiếng Việt (Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn, Sức khỏe, etc.)
- description: mô tả ngắn gọn
- date: ISO date string YYYY-MM-DD
  - "hôm nay" hoặc không nói gì = ${today}
  - "hôm qua" = ${yesterday}
  - "thứ 2/3/4/5/6/7/CN tuần này" = tính từ hôm nay
  - ngày cụ thể như "25/12" = 2025-12-25

Response format (JSON only, no markdown, no explanation):
{"amount": number, "category": "string", "description": "string", "date": "YYYY-MM-DD"}

Input: "${input}"`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('No response from Gemini')
  }

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonStr = text.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  }

  try {
    const parsed = JSON.parse(jsonStr) as ParsedExpense

    // Validate required fields
    if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
      throw new Error('Invalid amount')
    }
    if (!parsed.category || !parsed.description || !parsed.date) {
      throw new Error('Missing required fields')
    }

    return parsed
  } catch {
    throw new Error(`Failed to parse AI response: ${jsonStr}`)
  }
}
