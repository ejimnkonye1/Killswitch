'use client'

import { motion } from 'framer-motion'
import { FiHeart, FiAlertTriangle, FiCheckCircle, FiXCircle, FiTrendingDown } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { calculatePortfolioHealth, getHealthScoreColor, getHealthScoreBgColor } from '@/lib/healthScore'
import type { Subscription } from '@/lib/types'

interface PortfolioHealthProps {
  subscriptions: Subscription[]
}

export function PortfolioHealth({ subscriptions }: PortfolioHealthProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()

  const health = calculatePortfolioHealth(subscriptions)
  const activeCount = subscriptions.filter(s => s.status === 'active').length

  if (activeCount === 0) {
    return null
  }

  const getStatusIcon = () => {
    if (health.status === 'healthy') {
      return <FiCheckCircle className="w-5 h-5 text-green-400" />
    } else if (health.status === 'warning') {
      return <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
    } else {
      return <FiXCircle className="w-5 h-5 text-red-400" />
    }
  }

  const getStatusText = () => {
    if (health.status === 'healthy') {
      return 'Your subscriptions are in great shape!'
    } else if (health.status === 'warning') {
      return 'Some subscriptions need attention.'
    } else {
      return 'Several subscriptions may not be worth keeping.'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl p-5 border ${
        isDark
          ? 'bg-[#0A0A0A] border-[#1A1A1A]'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiHeart className={`w-4 h-4 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
            Portfolio Health
          </h3>
        </div>
        {getStatusIcon()}
      </div>

      {/* Score Circle */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4">
        <div className="relative flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke={isDark ? '#1A1A1A' : '#e5e5e5'}
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="40"
              cy="40"
              r="35"
              stroke={
                health.score >= 80
                  ? '#22c55e'
                  : health.score >= 50
                  ? '#eab308'
                  : '#ef4444'
              }
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 220' }}
              animate={{
                strokeDasharray: `${(health.score / 100) * 220} 220`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getHealthScoreColor(health.score, isDark)}`}>
              {health.score}
            </span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <p className={`text-sm mb-2 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
            {getStatusText()}
          </p>

          {/* Breakdown */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                {health.healthyCount} healthy
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                {health.warningCount} warning
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                {health.unhealthyCount} review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Potential Savings */}
      {health.totalSavingsPotential > 0 && (
        <div className={`flex items-center gap-3 p-3 rounded-xl ${
          isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
        }`}>
          <FiTrendingDown className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <div>
            <p className={`text-xs ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
              Potential monthly savings
            </p>
            <p className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {formatAmount(health.totalSavingsPotential)}/mo
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
