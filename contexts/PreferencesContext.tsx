'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { usePreferences } from '@/hooks/usePreferences'
import type { UserPreferences } from '@/lib/types'

interface PreferencesContextType {
  preferences: UserPreferences
  loading: boolean
  saving: boolean
  updatePreferences: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>
  refetch: () => Promise<void>
}

const DEFAULT_PREFERENCES: UserPreferences = {
  id: '',
  user_id: '',
  email_reminders_renewal: true,
  email_reminders_trial: true,
  in_app_reminders: true,
  reminder_days_before: 2,
  timezone: 'UTC',
  currency: 'USD',
  budget_enabled: false,
  monthly_budget: null,
  budget_alert_threshold: 80,
  created_at: '',
  updated_at: '',
}

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: DEFAULT_PREFERENCES,
  loading: true,
  saving: false,
  updatePreferences: async () => {},
  refetch: async () => {},
})

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const value = usePreferences()
  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferencesContext() {
  return useContext(PreferencesContext)
}
