'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme-context'
import type { Subscription } from '@/lib/types'

interface SubscriptionGrowthChartProps {
  subscriptions: Subscription[]
}

export function SubscriptionGrowthChart({ subscriptions }: SubscriptionGrowthChartProps) {
  const { isDark } = useTheme()

  const chartData = useMemo(() => {
    const months: { name: string; count: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' })

      const activeCount = subscriptions.filter((s) => {
        const created = new Date(s.created_at)
        // Subscription must have been created before end of this month
        if (created > monthEnd) return false
        // If cancelled, it was still active before its updated_at date
        if (s.status === 'cancelled') {
          const cancelledAt = new Date(s.updated_at)
          // If cancelled before this month started, it wasn't active this month
          if (cancelledAt < monthStart) return false
        }
        return true
      }).length

      months.push({
        name: monthName,
        count: activeCount,
      })
    }

    return months
  }, [subscriptions])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg px-3 py-2 shadow-xl ${
          isDark
            ? 'bg-[#111111] border border-[#222222]'
            : 'bg-white border border-gray-300'
        }`}>
          <p className={`text-xs mb-1 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            {payload[0].value} subscriptions
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`rounded-2xl p-6 ${
        isDark
          ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Subscription Growth</h3>
      <p className={`text-xs mb-6 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Active subscriptions over time</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1A1A1A' : '#e5e7eb'} vertical={false} />
            <XAxis
              dataKey="name"
              stroke={isDark ? '#444444' : '#9ca3af'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#444444' : '#9ca3af'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={isDark ? '#10b981' : '#059669'}
              strokeWidth={3}
              dot={{ fill: isDark ? '#10b981' : '#059669', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: isDark ? '#10b981' : '#059669', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
