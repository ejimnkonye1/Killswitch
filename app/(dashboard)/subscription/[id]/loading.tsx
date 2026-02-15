'use client'

import { useTheme } from '@/lib/theme-context'

function Skeleton({ className = '' }: { className?: string }) {
  const { isDark } = useTheme()
  return (
    <div
      className={`animate-pulse rounded-lg ${
        isDark ? 'bg-[#111111]' : 'bg-gray-200'
      } ${className}`}
    />
  )
}

export default function SubscriptionDetailLoading() {
  const { isDark } = useTheme()

  return (
    <div className="animate-in fade-in duration-300">
      {/* Back button */}
      <Skeleton className="h-4 w-20 mb-6" />

      {/* Header with logo + name */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Details card */}
      <div
        className={`rounded-2xl p-6 mb-4 ${
          isDark
            ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Notes / actions card */}
      <div
        className={`rounded-2xl p-6 ${
          isDark
            ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
