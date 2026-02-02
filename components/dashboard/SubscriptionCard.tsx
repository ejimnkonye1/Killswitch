'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { getSubscriptionIcon } from '@/lib/icons'
import type { Subscription } from '@/lib/types'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
  index: number
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const statusStyles: Record<string, string> = {
  active: 'bg-[#1A1A1A] text-[#CCCCCC]',
  trial: 'bg-[#1A1A1A] text-[#999999]',
  cancelled: 'bg-[#111111] text-[#555555]',
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  index,
}: SubscriptionCardProps) {
  const Icon = getSubscriptionIcon(
    subscription.logo_identifier || subscription.name
  )
  const renewalDate = new Date(subscription.renewal_date)
  const formattedDate = renewalDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const monthlyCost =
    subscription.billing_cycle === 'yearly'
      ? subscription.cost / 12
      : subscription.cost

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#222222] hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <Link
          href={`/subscription/${subscription.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 bg-[#111111] border border-[#1A1A1A] rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[#999999] group-hover:text-white transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-medium text-sm truncate">
              {subscription.name}
            </h3>
            <p className="text-[#555555] text-xs capitalize">{subscription.category}</p>
          </div>
        </Link>

        {/* Status badge */}
        <span
          className={`text-xs px-2 py-1 rounded-full capitalize ${
            statusStyles[subscription.status] || statusStyles.active
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {/* Cost */}
      <div className="mb-3">
        <p className="text-white text-lg font-bold">
          {formatCurrency(subscription.cost)}
          <span className="text-[#555555] text-xs font-normal ml-1">
            /{subscription.billing_cycle === 'yearly' ? 'yr' : 'mo'}
          </span>
        </p>
        {subscription.billing_cycle === 'yearly' && (
          <p className="text-[#444444] text-xs">
            {formatCurrency(monthlyCost)}/mo effective
          </p>
        )}
      </div>

      {/* Renewal date */}
      <p className="text-[#555555] text-xs mb-4">
        Next billing: {formattedDate}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.preventDefault()
            onEdit(subscription)
          }}
          className="flex items-center gap-1.5 text-[#666666] hover:text-white text-xs px-3 py-1.5 rounded-lg border border-[#1A1A1A] hover:border-[#333333] transition-all duration-200"
        >
          <FiEdit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(subscription.id)
          }}
          className="flex items-center gap-1.5 text-[#666666] hover:text-white text-xs px-3 py-1.5 rounded-lg border border-[#1A1A1A] hover:border-[#333333] transition-all duration-200"
        >
          <FiTrash2 className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </motion.div>
  )
}
