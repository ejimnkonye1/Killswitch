'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import type { Subscription } from '@/lib/types'

interface SubscriptionsContextType {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalMonthlySpend: number
  totalYearlyProjection: number
  activeCount: number
  cancelledSavings: number
}

const SubscriptionsContext = createContext<SubscriptionsContextType>({
  subscriptions: [],
  loading: true,
  error: null,
  refetch: async () => {},
  totalMonthlySpend: 0,
  totalYearlyProjection: 0,
  activeCount: 0,
  cancelledSavings: 0,
})

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const value = useSubscriptions()
  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptionsContext() {
  return useContext(SubscriptionsContext)
}
