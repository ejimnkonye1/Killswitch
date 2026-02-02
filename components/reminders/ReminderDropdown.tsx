'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiAlertCircle, FiCalendar, FiClock, FiX } from 'react-icons/fi'
import { markReminderSent } from '@/lib/supabase/queries'
import type { Reminder } from '@/lib/types'

interface ReminderDropdownProps {
  reminders: Reminder[]
  onClose: () => void
  onDismiss: () => void
}

const reminderIcons = {
  trial_ending: FiAlertCircle,
  renewal: FiCalendar,
  unused: FiClock,
}

const reminderMessages = {
  trial_ending: 'Trial ending soon',
  renewal: 'Renewal coming up',
  unused: 'Subscription unused',
}

export function ReminderDropdown({ reminders, onClose, onDismiss }: ReminderDropdownProps) {
  const handleDismiss = async (id: string) => {
    await markReminderSent(id)
    onDismiss()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
      className="absolute bottom-full left-0 mb-2 w-80 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl shadow-2xl overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-[#1A1A1A]">
        <h3 className="text-white text-sm font-medium">Reminders</h3>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {reminders.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-[#444444] text-sm">No reminders</p>
          </div>
        ) : (
          reminders.map((reminder) => {
            const Icon = reminderIcons[reminder.reminder_type] || FiCalendar
            const message = reminderMessages[reminder.reminder_type] || 'Reminder'
            const subName = reminder.subscription?.name || 'Subscription'
            const date = new Date(reminder.reminder_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <div
                key={reminder.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-[#111111] transition-colors border-b border-[#1A1A1A] last:border-b-0"
              >
                <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#666666]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{message}</p>
                  <p className="text-[#555555] text-xs mt-0.5">
                    {subName} &middot; {date}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {reminder.subscription && (
                    <Link
                      href={`/subscription/${reminder.subscription_id}`}
                      onClick={onClose}
                      className="text-[#555555] text-xs hover:text-white transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className="text-[#444444] hover:text-white transition-colors p-0.5"
                    title="Dismiss"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
