'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PriceTrendInfo } from '@/lib/types'

export function usePriceTrends() {
  const [trends, setTrends] = useState<Record<string, PriceTrendInfo>>({})
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchTrends = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = supabaseRef.current
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/price-changes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (data.success && data.priceTrends) {
        setTrends(data.priceTrends)
      }
    } catch {
      // Silently fail - trends are optional
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrends()
  }, [fetchTrends])

  return { trends, loading, refetch: fetchTrends }
}
