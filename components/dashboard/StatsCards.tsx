'use client'

import { motion } from 'framer-motion'
import { FiDollarSign, FiTrendingUp, FiGrid, FiArrowDown } from 'react-icons/fi'

interface StatsCardsProps {
  totalMonthlySpend: number
  totalYearlyProjection: number
  activeCount: number
  savingsThisMonth?: number
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export function StatsCards({
  totalMonthlySpend,
  totalYearlyProjection,
  activeCount,
  savingsThisMonth = 0,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Monthly Spend',
      value: formatCurrency(totalMonthlySpend),
      icon: FiDollarSign,
      description: 'Total recurring costs',
    },
    {
      label: 'Yearly Projection',
      value: formatCurrency(totalYearlyProjection),
      icon: FiTrendingUp,
      description: 'Estimated annual cost',
    },
    {
      label: 'Active Subscriptions',
      value: activeCount.toString(),
      icon: FiGrid,
      description: 'Currently active',
    },
    {
      label: 'Savings',
      value: formatCurrency(savingsThisMonth),
      icon: FiArrowDown,
      description: 'From cancellations',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#222222] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#666666] text-xs font-medium uppercase tracking-wider">
                {stat.label}
              </span>
              <Icon className="w-4 h-4 text-[#444444]" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-[#555555] text-xs">{stat.description}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
