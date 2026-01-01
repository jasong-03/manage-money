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
        {/* Centered Tab Bar */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm py-2 sm:py-4">
          <div className="flex justify-center px-2 sm:px-3 overflow-x-auto">
            <TabsList className="bg-slate-800 p-1 sm:p-2 rounded-full gap-0.5 sm:gap-2 flex-shrink-0">
              <TabsTrigger
                value="dashboard"
                className="rounded-full px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Home
              </TabsTrigger>
              <TabsTrigger
                value="compensation"
                className="rounded-full px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Income
              </TabsTrigger>
              <TabsTrigger
                value="spending"
                className="rounded-full px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Spend
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="rounded-full px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Subs
              </TabsTrigger>
              <TabsTrigger
                value="todo"
                className="rounded-full px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                To do
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content */}
        <div className={`mx-auto px-4 sm:px-8 py-4 sm:py-8 ${isWideTab ? 'max-w-7xl' : 'max-w-6xl'}`}>
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
