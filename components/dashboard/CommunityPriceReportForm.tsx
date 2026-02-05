'use client'

import { useState } from 'react'
import { FiSend, FiCheck } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { createClient } from '@/lib/supabase/client'
import type { BillingCycle } from '@/lib/types'

const SERVICE_SUGGESTIONS = [
  'Netflix', 'Spotify', 'Disney+', 'Hulu', 'HBO Max', 'Apple Music',
  'YouTube Premium', 'Amazon Prime', 'Adobe Creative Cloud', 'Microsoft 365',
  'Dropbox', 'Google One', 'iCloud+', 'Notion', 'Slack', 'Zoom',
  'ChatGPT Plus', 'GitHub Pro', 'Figma', 'Canva Pro',
]

export function CommunityPriceReportForm() {
  const { isDark } = useTheme()
  const [serviceName, setServiceName] = useState('')
  const [price, setPrice] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [plan, setPlan] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = SERVICE_SUGGESTIONS.filter(
    s => s.toLowerCase().includes(serviceName.toLowerCase()) && serviceName.length > 0
  ).slice(0, 5)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceName || !price) return

    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Please sign in')
        setSubmitting(false)
        return
      }

      const response = await fetch('/api/price-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'community_report',
          serviceName,
          price: parseFloat(price),
          billingCycle,
          plan: plan || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        setServiceName('')
        setPrice('')
        setPlan('')
        setTimeout(() => setSubmitted(false), 3000)
      } else {
        setError(data.error || 'Failed to submit report')
      }
    } catch {
      setError('Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
          Service Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={serviceName}
            onChange={(e) => {
              setServiceName(e.target.value)
              setShowSuggestions(true)
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="e.g. Netflix"
            className={`w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#0D0D0D] border border-[#1A1A1A] text-white placeholder:text-[#444444] focus:border-[#333333]'
                : 'bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:border-gray-400'
            }`}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className={`absolute z-10 w-full mt-1 rounded-xl overflow-hidden border shadow-lg ${
              isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-gray-200'
            }`}>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setServiceName(suggestion)
                    setShowSuggestions(false)
                  }}
                  className={`w-full text-left text-xs px-3 py-2 transition-colors ${
                    isDark
                      ? 'text-[#CCCCCC] hover:bg-[#1A1A1A]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
            Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="9.99"
            className={`w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#0D0D0D] border border-[#1A1A1A] text-white placeholder:text-[#444444] focus:border-[#333333]'
                : 'bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:border-gray-400'
            }`}
          />
        </div>
        <div>
          <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
            Billing Cycle
          </label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
            className={`w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#0D0D0D] border border-[#1A1A1A] text-white focus:border-[#333333]'
                : 'bg-gray-50 border border-gray-200 text-black focus:border-gray-400'
            }`}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div>
        <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
          Plan (optional)
        </label>
        <input
          type="text"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="e.g. Premium, Family, Student"
          className={`w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-colors ${
            isDark
              ? 'bg-[#0D0D0D] border border-[#1A1A1A] text-white placeholder:text-[#444444] focus:border-[#333333]'
              : 'bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:border-gray-400'
          }`}
        />
      </div>

      {error && (
        <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      )}

      <button
        type="submit"
        disabled={!serviceName || !price || submitting}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
          submitted
            ? isDark
              ? 'bg-green-500/20 text-green-400'
              : 'bg-green-100 text-green-700'
            : !serviceName || !price || submitting
              ? isDark
                ? 'bg-[#111111] text-[#444444] cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        }`}
      >
        {submitted ? (
          <>
            <FiCheck className="w-4 h-4" />
            Report Submitted!
          </>
        ) : (
          <>
            <FiSend className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Price Report'}
          </>
        )}
      </button>
    </form>
  )
}
