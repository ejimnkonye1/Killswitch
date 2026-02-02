'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiAlertCircle, FiDollarSign } from 'react-icons/fi'
import type { Subscription } from '@/lib/types'

interface InsightsCardProps {
  subscriptions: Subscription[]
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export function InsightsCard({ subscriptions }: InsightsCardProps) {
  const insights = useMemo(() => {
    const result: { icon: any; title: string; description: string }[] = []
    const active = subscriptions.filter(
      (s) => s.status === 'active' || s.status === 'trial'
    )

    // Spending by category comparison
    const categorySpend: Record<string, number> = {}
    active.forEach((s) => {
      const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
      categorySpend[s.category] = (categorySpend[s.category] || 0) + monthly
    })

    const categories = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])
    if (categories.length >= 2) {
      const topCat = categories[0]
      const bottomCat = categories[categories.length - 1]
      if (bottomCat[1] > 0) {
        const ratio = Math.round((topCat[1] / bottomCat[1]) * 100 - 100)
        if (ratio > 0) {
          result.push({
            icon: FiTrendingUp,
            title: 'Category Insight',
            description: `You spend ${ratio}% more on ${topCat[0]} than ${bottomCat[0]}`,
          })
        }
      }
    }

    // Unused subscriptions (last_used > 30 days ago or null)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const unused = active.filter((s) => {
      if (!s.last_used) return true
      return new Date(s.last_used) < thirtyDaysAgo
    })
    if (unused.length > 0) {
      result.push({
        icon: FiAlertCircle,
        title: 'Unused Subscriptions',
        description: `${unused.length} subscription${unused.length > 1 ? 's' : ''} unused in the last 30 days`,
      })
    }

    // Savings from switching to annual
    const monthlyOnly = active.filter((s) => s.billing_cycle === 'monthly')
    if (monthlyOnly.length > 0) {
      const potentialSavings = monthlyOnly.reduce(
        (sum, s) => sum + s.cost * 12 * 0.17,
        0
      )
      result.push({
        icon: FiDollarSign,
        title: 'Potential Savings',
        description: `Save up to ${formatCurrency(potentialSavings)}/yr by switching ${monthlyOnly.length} subscription${monthlyOnly.length > 1 ? 's' : ''} to annual plans`,
      })
    }

    return result
  }, [subscriptions])

  if (insights.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      <h3 className="text-white font-semibold text-sm">Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, i) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#222222] transition-all duration-300"
            >
              <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[#666666]" />
              </div>
              <p className="text-white text-sm font-medium mb-1">{insight.title}</p>
              <p className="text-[#555555] text-xs leading-relaxed">
                {insight.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
