'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSubscription } from '@/lib/supabase/queries'
import { DetailView } from '@/components/subscription/DetailView'
import SubscriptionDetailLoading from './loading'
import type { Subscription } from '@/lib/types'

export default function SubscriptionDetailPage() {
  const params = useParams()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!params.id || typeof params.id !== 'string') return

      const { data, error } = await getSubscription(params.id)
      if (error || !data) {
        setError(true)
      } else {
        setSubscription(data)
      }
      setLoading(false)
    }

    fetchSubscription()
  }, [params.id])

  if (loading) {
    return <SubscriptionDetailLoading />
  }

  if (error || !subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-[#555555] text-sm">Subscription not found</p>
      </div>
    )
  }

  return <DetailView subscription={subscription} />
}
