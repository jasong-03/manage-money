'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardTab } from '@/components/tabs/DashboardTab'
import { CompensationTab } from '@/components/tabs/CompensationTab'
import { SpendingTab } from '@/components/tabs/SpendingTab'
import { SubscriptionTab } from '@/components/tabs/SubscriptionTab'
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <header className="text-center py-6">
          <h1 className="text-2xl font-bold">Money Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your income</p>
        </header>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          {/* Top Pill Navigation */}
          <div className="flex justify-center mb-6">
            <TabsList className="bg-slate-800 p-1.5 rounded-full gap-1">
              <TabsTrigger
                value="dashboard"
                className="rounded-full px-6 py-2 text-sm font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="compensation"
                className="rounded-full px-6 py-2 text-sm font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Compensation
              </TabsTrigger>
              <TabsTrigger
                value="spending"
                className="rounded-full px-6 py-2 text-sm font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Spending
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="rounded-full px-6 py-2 text-sm font-medium text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Subs
              </TabsTrigger>
            </TabsList>
          </div>

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
        </Tabs>
      </div>
    </div>
  )
}
