'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (input: string) => Promise<void>
  isLoading: boolean
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    await onSubmit(input.trim())
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5 sm:gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="VD: ăn sáng 15k, grab 20k..."
        disabled={isLoading}
        className="flex-1 h-9 sm:h-10 text-sm"
      />
      <Button type="submit" disabled={isLoading || !input.trim()} size="sm" className="h-9 sm:h-10 w-9 sm:w-10 p-0">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  )
}
