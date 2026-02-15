'use client'

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/lib/theme-context'
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
})

const ICONS: Record<ToastType, typeof FiCheck> = {
  success: FiCheck,
  error: FiX,
  warning: FiAlertTriangle,
  info: FiInfo,
}

const DURATION = 3000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, DURATION)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { isDark } = useTheme()
  const Icon = ICONS[t.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-[400px] border ${
        isDark
          ? 'bg-[#0A0A0A] border-[#1A1A1A] text-white'
          : 'bg-white border-gray-200 text-black'
      }`}
    >
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'
      }`}>
        <Icon className={`w-3 h-3 ${isDark ? 'text-white' : 'text-black'}`} />
      </div>
      <p className={`text-sm flex-1 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>
        {t.message}
      </p>
      <button
        onClick={() => onDismiss(t.id)}
        className={`flex-shrink-0 p-1 rounded transition-colors ${
          isDark
            ? 'text-[#444444] hover:text-white hover:bg-[#1A1A1A]'
            : 'text-gray-400 hover:text-black hover:bg-gray-100'
        }`}
      >
        <FiX className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
