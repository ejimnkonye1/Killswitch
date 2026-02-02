'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FiBell } from 'react-icons/fi'
import { useReminders } from '@/hooks/useReminders'
import { ReminderDropdown } from './ReminderDropdown'

export function ReminderBell() {
  const { reminders, unreadCount, refetch } = useReminders()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 text-[#666666] hover:text-white transition-colors duration-200"
      >
        <FiBell className="w-4 h-4" />
        <span className="text-sm">Reminders</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 left-2.5 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <ReminderDropdown
            reminders={reminders}
            onClose={() => setIsOpen(false)}
            onDismiss={refetch}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
