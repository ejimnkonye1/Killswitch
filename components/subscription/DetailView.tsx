'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowLeft, FiCalendar, FiDollarSign, FiTag, FiClock } from 'react-icons/fi'
import { getSubscriptionIcon } from '@/lib/icons'
import { KillSwitch } from './KillSwitch'
import type { Subscription } from '@/lib/types'

interface DetailViewProps {
  subscription: Subscription
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const statusStyles: Record<string, string> = {
  active: 'bg-[#1A1A1A] text-[#CCCCCC]',
  trial: 'bg-[#1A1A1A] text-[#999999]',
  cancelled: 'bg-[#111111] text-[#555555]',
}

export function DetailView({ subscription }: DetailViewProps) {
  const Icon = getSubscriptionIcon(
    subscription.logo_identifier || subscription.name
  )
  const monthlyCost =
    subscription.billing_cycle === 'yearly'
      ? subscription.cost / 12
      : subscription.cost

  const renewalDate = new Date(subscription.renewal_date)
  const formattedRenewal = renewalDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[#555555] hover:text-white text-sm mb-8 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 mb-6"
      >
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-[#111111] border border-[#1A1A1A] rounded-2xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{subscription.name}</h1>
              <span
                className={`text-xs px-3 py-1 rounded-full capitalize ${
                  statusStyles[subscription.status] || statusStyles.active
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <p className="text-[#555555] text-sm capitalize">{subscription.category}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {formatCurrency(subscription.cost)}
            </p>
            <p className="text-[#555555] text-sm">
              per {subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
            </p>
            {subscription.billing_cycle === 'yearly' && (
              <p className="text-[#444444] text-xs mt-1">
                {formatCurrency(monthlyCost)}/mo effective
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
                <FiCalendar className="w-4 h-4 text-[#555555]" />
              </div>
              <div>
                <p className="text-[#666666] text-xs">Next Renewal</p>
                <p className="text-white text-sm">{formattedRenewal}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-4 h-4 text-[#555555]" />
              </div>
              <div>
                <p className="text-[#666666] text-xs">Billing Cycle</p>
                <p className="text-white text-sm capitalize">{subscription.billing_cycle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
                <FiTag className="w-4 h-4 text-[#555555]" />
              </div>
              <div>
                <p className="text-[#666666] text-xs">Category</p>
                <p className="text-white text-sm capitalize">{subscription.category}</p>
              </div>
            </div>

            {subscription.trial_end_date && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
                  <FiClock className="w-4 h-4 text-[#555555]" />
                </div>
                <div>
                  <p className="text-[#666666] text-xs">Trial Ends</p>
                  <p className="text-white text-sm">
                    {new Date(subscription.trial_end_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {subscription.last_used && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
                  <FiClock className="w-4 h-4 text-[#555555]" />
                </div>
                <div>
                  <p className="text-[#666666] text-xs">Last Used</p>
                  <p className="text-white text-sm">
                    {new Date(subscription.last_used).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {subscription.notes && (
            <div className="mt-6 pt-4 border-t border-[#1A1A1A]">
              <p className="text-[#666666] text-xs mb-2">Notes</p>
              <p className="text-[#999999] text-sm">{subscription.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Kill Switch */}
        <KillSwitch subscription={subscription} />
      </div>
    </>
  )
}
