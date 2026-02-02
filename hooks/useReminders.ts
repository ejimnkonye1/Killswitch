'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reminder } from '@/lib/types'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchReminders = useCallback(async () => {
    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const weekFromNow = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data, error } = await supabase
      .from('reminders')
      .select('*, subscription:subscriptions(*)')
      .eq('user_id', user.id)
      .eq('is_sent', false)
      .lte('reminder_date', weekFromNow)
      .order('reminder_date', { ascending: true })

    if (!error && data) {
      setReminders(data as Reminder[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReminders()

    // Real-time listener
    const supabase = supabaseRef.current
    const channel = supabase
      .channel('reminders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders' },
        () => {
          fetchReminders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReminders])

  const unreadCount = reminders.length

  return {
    reminders,
    loading,
    unreadCount,
    refetch: fetchReminders,
  }
}
