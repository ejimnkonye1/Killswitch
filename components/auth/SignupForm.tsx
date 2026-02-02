'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiGithub } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { signInWithOAuth } from '@/lib/supabase/auth'

export function SignupForm() {
  const [error, setError] = useState('')

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError('')
    const { error } = await signInWithOAuth(provider)
    if (error) {
      setError(error.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">S</span>
            </div>
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Create account
        </h1>
        <p className="text-[#999999] text-center text-sm mb-8">
          Start tracking your subscriptions today
        </p>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 mb-6"
          >
            <p className="text-[#999999] text-sm">{error}</p>
          </motion.div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuth('github')}
            className="w-full flex items-center justify-center gap-3 bg-[#111111] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 hover:border-[#333333] hover:bg-[#1A1A1A] transition-all duration-200"
          >
            <FiGithub className="w-5 h-5" />
            <span className="text-sm font-medium">Continue with GitHub</span>
          </button>
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 bg-[#111111] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 hover:border-[#333333] hover:bg-[#1A1A1A] transition-all duration-200"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-sm font-medium">Continue with Google</span>
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-[#666666] text-sm mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-white hover:text-gray-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
