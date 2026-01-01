'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardTab } from '@/components/tabs/DashboardTab'
import { CompensationTab } from '@/components/tabs/CompensationTab'
import { SpendingTab } from '@/components/tabs/SpendingTab'
import { SubscriptionTab } from '@/components/tabs/SubscriptionTab'
import { TodoTab } from '@/components/tabs/TodoTab'
import { Loader2 } from 'lucide-react'
import { useHydration } from '@/store/useStore'

const TAB_STORAGE_KEY = 'money-manager-tab'

export default function Home() {
  const hydrated = useHydration()
  const [currentTab, setCurrentTab] = useState('dashboard')

  // Load saved tab on mount
  useEffect(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY)
    if (saved) setCurrentTab(saved)
  }, [])

  // Save tab when changed
  const handleTabChange = (value: string) => {
    setCurrentTab(value)
    localStorage.setItem(TAB_STORAGE_KEY, value)
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isWideTab = currentTab === 'todo'

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        {/* Header with Tabs */}
        <header className="sticky top-0 z-50 bg-slate-800 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <TabsList className="bg-slate-700/50 p-1 sm:p-1.5 rounded-full gap-0.5 sm:gap-1 w-full max-w-lg mx-auto justify-between">
              <TabsTrigger
                value="dashboard"
                className="rounded-full px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex-1"
              >
                Home
              </TabsTrigger>
              <TabsTrigger
                value="compensation"
                className="rounded-full px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex-1"
              >
                Income
              </TabsTrigger>
              <TabsTrigger
                value="spending"
                className="rounded-full px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex-1"
              >
                Spend
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="rounded-full px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex-1"
              >
                Subs
              </TabsTrigger>
              <TabsTrigger
                value="todo"
                className="rounded-full px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex-1"
              >
                To do
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        {/* Content */}
        <div className={`mx-auto px-3 sm:px-6 py-4 sm:py-6 ${isWideTab ? 'max-w-7xl' : 'max-w-5xl'}`}>
          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="compensation" className="mt-0">
            <CompensationTab />
          </TabsContent>

          <TabsContent value="spending" className="mt-0">
            <SpendingTab />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-0">
            <SubscriptionTab />
          </TabsContent>

          <TabsContent value="todo" className="mt-0">
            <TodoTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
