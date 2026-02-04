'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiRefreshCw, FiDollarSign } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getSubscriptionIcon } from '@/lib/icons'
import { updateSubscription } from '@/lib/supabase/queries'
import type { Subscription } from '@/lib/types'

interface GraveyardProps {
  subscriptions: Subscription[]
  onRevive: () => void
}

interface GraveyardModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptions: Subscription[]
  onRevive: () => void
}

// Tombstone icon component
function TombstoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v1H7V9c0-2.76 2.24-5 5-5zm-3 8h6v2H9v-2zm0 4h6v2H9v-2z"/>
    </svg>
  )
}

function GraveyardModal({ isOpen, onClose, subscriptions, onRevive }: GraveyardModalProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [reviving, setReviving] = useState<string | null>(null)

  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled')

  const calculateSavings = (sub: Subscription) => {
    const cancelledDate = new Date(sub.updated_at)
    const now = new Date()
    const monthsSinceCancelled = Math.max(1, Math.floor(
      (now.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ))
    const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
    return monthlyCost * monthsSinceCancelled
  }

  const calculateDaysSinceCancelled = (sub: Subscription) => {
    const cancelledDate = new Date(sub.updated_at)
    const now = new Date()
    return Math.floor((now.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalLifetimeSavings = cancelledSubs.reduce((sum, sub) => sum + calculateSavings(sub), 0)

  const handleRevive = async (sub: Subscription) => {
    setReviving(sub.id)
    await updateSubscription(sub.id, { status: 'active' })
    setReviving(null)
    onRevive()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl border ${
              isDark
                ? 'bg-[#0A0A0A] border-[#1A1A1A]'
                : 'bg-white border-gray-300'
            }`}
          >
            {/* Header */}
            <div className={`sticky top-0 px-6 py-5 flex items-center justify-between z-10 backdrop-blur-sm border-b ${
              isDark
                ? 'bg-[#0A0A0A]/95 border-[#1A1A1A]'
                : 'bg-white/95 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <TombstoneIcon className={`w-6 h-6 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
                <div>
                  <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                    Subscription Graveyard
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>
                    Rest in peace, cancelled subscriptions
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark
                    ? 'text-[#555555] hover:text-white hover:bg-[#111111]'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* Total Savings Banner */}
              <div className={`mb-6 p-4 rounded-xl text-center ${
                isDark
                  ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border border-green-500/20'
                  : 'bg-gradient-to-r from-green-100 to-green-50 border border-green-200'
              }`}>
                <p className={`text-xs mb-1 ${isDark ? 'text-green-400/70' : 'text-green-700'}`}>
                  Lifetime Savings from Cancelled Subscriptions
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {formatAmount(totalLifetimeSavings)}
                </p>
              </div>

              {cancelledSubs.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                  <TombstoneIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No cancelled subscriptions yet.</p>
                  <p className="text-xs mt-1">Your graveyard is empty!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cancelledSubs.map((sub) => {
                    const Icon = getSubscriptionIcon(sub.logo_identifier || sub.name)
                    const savings = calculateSavings(sub)
                    const daysSince = calculateDaysSinceCancelled(sub)

                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-[#0D0D0D] border-[#1A1A1A] hover:border-[#333333]'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'
                            }`}>
                              <Icon className={`w-5 h-5 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                {sub.name}
                              </h4>
                              <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                                {daysSince} days since cancelled
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevive(sub)}
                            disabled={reviving === sub.id}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              isDark
                                ? 'text-[#666666] border-[#1A1A1A] hover:text-white hover:border-[#333333]'
                                : 'text-gray-600 border-gray-300 hover:text-black hover:border-gray-400'
                            } disabled:opacity-50`}
                          >
                            <FiRefreshCw className={`w-3 h-3 ${reviving === sub.id ? 'animate-spin' : ''}`} />
                            Revive
                          </button>
                        </div>

                        <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                          isDark ? 'border-[#1A1A1A]' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <FiDollarSign className={`w-3 h-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                            <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                              Saved so far:
                            </span>
                          </div>
                          <span className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            {formatAmount(savings)}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Graveyard({ subscriptions, onRevive }: GraveyardProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [modalOpen, setModalOpen] = useState(false)

  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled')
  const cancelledCount = cancelledSubs.length

  if (cancelledCount === 0) {
    return null
  }

  // Calculate total savings
  const totalSavings = cancelledSubs.reduce((sum, sub) => {
    const cancelledDate = new Date(sub.updated_at)
    const now = new Date()
    const monthsSinceCancelled = Math.max(1, Math.floor(
      (now.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ))
    const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
    return sum + (monthlyCost * monthsSinceCancelled)
  }, 0)

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setModalOpen(true)}
        className={`w-full rounded-2xl p-5 border text-left transition-all hover:-translate-y-0.5 ${
          isDark
            ? 'bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#333333]'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TombstoneIcon className={`w-4 h-4 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
              Graveyard
            </h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-[#1A1A1A] text-[#888888]' : 'bg-gray-100 text-gray-600'
          }`}>
            {cancelledCount} cancelled
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
            Total saved since cancellation
          </p>
          <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {formatAmount(totalSavings)}
          </p>
        </div>
      </motion.button>

      <GraveyardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        subscriptions={subscriptions}
        onRevive={() => {
          onRevive()
          setModalOpen(false)
        }}
      />
    </>
  )
}
