'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { PriceHistoryDataPoint } from '@/lib/types'

interface PriceHistoryChartProps {
  data: PriceHistoryDataPoint[]
  subscriptionName: string
}

export function PriceHistoryChart({ data, subscriptionName }: PriceHistoryChartProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()

  if (data.length === 0) {
    return (
      <div className={`rounded-xl p-6 text-center ${
        isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
      }`}>
        <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
          No price history available for {subscriptionName}
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-4 ${
      isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
    }`}>
      <p className={`text-xs font-medium mb-3 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
        {subscriptionName} Price History
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: isDark ? '#555555' : '#999999' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: isDark ? '#555555' : '#999999' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#111111' : '#ffffff',
              border: `1px solid ${isDark ? '#222222' : '#e5e7eb'}`,
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: isDark ? '#888888' : '#666666' }}
            formatter={(value: number) => [formatAmount(value), 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={isDark ? '#f97316' : '#ea580c'}
            strokeWidth={2}
            dot={{ fill: isDark ? '#f97316' : '#ea580c', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
