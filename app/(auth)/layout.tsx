'use client'

import { StarfieldBackground } from '@/components/StarfieldBackground'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      <StarfieldBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
