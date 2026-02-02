'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { getSpendingByCategory } from '@/lib/supabase/queries'
import { SpendingPieChart } from '@/components/analytics/SpendingPieChart'
import { SpendingLineChart } from '@/components/analytics/SpendingLineChart'
import { InsightsCard } from '@/components/analytics/InsightsCard'

export default function AnalyticsPage() {
  const { subscriptions, loading } = useSubscriptions()
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [categoryLoading, setCategoryLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setCategoryLoading(true)
      const { data } = await getSpendingByCategory()
      if (data) setCategoryData(data)
      setCategoryLoading(false)
    }
    if (!loading) {
      fetchData()
    }
  }, [subscriptions, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#222222] border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-[#555555] text-sm mt-1">
          Understand your subscription spending patterns
        </p>
      </motion.div>

      {subscriptions.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-12 text-center">
          <p className="text-[#444444] text-sm">
            Add some subscriptions to see your analytics here.
          </p>
        </div>
      ) : (
        <>
          {/* Insights */}
          <div className="mb-6">
            <InsightsCard subscriptions={subscriptions} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {categoryLoading ? (
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 flex items-center justify-center h-80">
                <div className="w-5 h-5 border-2 border-[#222222] border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <SpendingPieChart data={categoryData} />
            )}
            <SpendingLineChart subscriptions={subscriptions} />
          </div>
        </>
      )}
    </>
  )
}
