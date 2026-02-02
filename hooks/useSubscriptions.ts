'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Subscription } from '@/lib/types'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())

  const fetchSubscriptions = useCallback(async () => {
    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setSubscriptions(data as Subscription[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSubscriptions()

    // Real-time listener
    const supabase = supabaseRef.current
    const channel = supabase
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions' },
        () => {
          fetchSubscriptions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSubscriptions])

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === 'active' || s.status === 'trial'
  )

  const totalMonthlySpend = activeSubscriptions.reduce((sum, s) => {
    const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
    return sum + monthly
  }, 0)

  const totalYearlyProjection = totalMonthlySpend * 12

  const activeCount = activeSubscriptions.length

  const cancelledSavings = subscriptions
    .filter((s) => s.status === 'cancelled')
    .reduce((sum, s) => {
      const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
      return sum + monthly
    }, 0)

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
    totalMonthlySpend,
    totalYearlyProjection,
    activeCount,
    cancelledSavings,
  }
}
