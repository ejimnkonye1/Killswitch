'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

interface SpendingPieChartProps {
  data: { name: string; value: number }[]
}

const COLORS = ['#ffffff', '#cccccc', '#999999', '#666666', '#444444', '#222222']

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export function SpendingPieChart({ data }: SpendingPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      return (
        <div className="bg-[#111111] border border-[#222222] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-white text-sm font-medium">{item.name}</p>
          <p className="text-[#999999] text-xs">
            {formatCurrency(item.value)} ({((item.value / total) * 100).toFixed(0)}%)
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
      transition={{ duration: 0.4 }}
      className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
    >
      <h3 className="text-white font-semibold text-sm mb-1">Spending by Category</h3>
      <p className="text-[#555555] text-xs mb-6">Monthly breakdown</p>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-[#444444] text-sm">No data available</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div>
                  <p className="text-white text-xs font-medium">{item.name}</p>
                  <p className="text-[#555555] text-xs">{formatCurrency(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
