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

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  const { isDark } = useTheme()
  return (
    <div
      className={`rounded-2xl p-6 ${
        isDark
          ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <Skeleton className="h-4 w-40 mb-5" />
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <Skeleton className="h-3.5 w-44 mb-2" />
              <Skeleton className="h-2.5 w-64" />
            </div>
            <Skeleton className="h-8 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-7 w-28 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Theme */}
        <SectionSkeleton rows={1} />

        {/* Profile */}
        <SectionSkeleton rows={1} />

        {/* Notification Preferences */}
        <SectionSkeleton rows={4} />

        {/* Display Preferences */}
        <SectionSkeleton rows={1} />

        {/* Budget Settings */}
        <SectionSkeleton rows={1} />

        {/* Change Password */}
        <SectionSkeleton rows={2} />
      </div>
    </div>
  )
}
