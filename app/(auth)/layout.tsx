import { StarfieldBackground } from '@/components/StarfieldBackground'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <StarfieldBackground />
      {children}
    </div>
  )
}
