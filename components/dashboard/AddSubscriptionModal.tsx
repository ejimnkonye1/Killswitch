'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiLoader } from 'react-icons/fi'
import { createSubscription, updateSubscription, deleteSubscription } from '@/lib/supabase/queries'
import { getSubscriptionIcon } from '@/lib/icons'
import type { Subscription, SubscriptionFormData, BillingCycle, SubscriptionStatus, CancellationDifficulty } from '@/lib/types'

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editSubscription?: Subscription | null
}

const suggestions = [
  'Netflix', 'Spotify', 'YouTube Premium', 'Disney+', 'Apple Music',
  'Amazon Prime', 'HBO Max', 'Hulu', 'Adobe Creative Cloud', 'Microsoft 365',
  'Google One', 'Notion', 'Slack', 'GitHub', 'Figma', 'Linear',
  'ChatGPT Plus', 'Dropbox', 'Discord Nitro', 'Twitch',
]

const categories = ['Entertainment', 'Productivity', 'Fitness', 'Developer Tools', 'Storage', 'Other']

export function AddSubscriptionModal({
  isOpen,
  onClose,
  onSaved,
  editSubscription,
}: AddSubscriptionModalProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [formError, setFormError] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Entertainment')
  const [cost, setCost] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [renewalDate, setRenewalDate] = useState('')
  const [status, setStatus] = useState<SubscriptionStatus>('active')
  const [trialEndDate, setTrialEndDate] = useState('')
  const [cancellationDifficulty, setCancellationDifficulty] = useState<CancellationDifficulty>('easy')
  const [cancellationLink, setCancellationLink] = useState('')
  const [notes, setNotes] = useState('')

  const isEditing = !!editSubscription

  useEffect(() => {
    if (editSubscription) {
      setName(editSubscription.name)
      setCategory(editSubscription.category)
      setCost(editSubscription.cost.toString())
      setBillingCycle(editSubscription.billing_cycle)
      setRenewalDate(editSubscription.renewal_date.split('T')[0])
      setStatus(editSubscription.status)
      setTrialEndDate(editSubscription.trial_end_date?.split('T')[0] || '')
      setCancellationDifficulty(editSubscription.cancellation_difficulty)
      setCancellationLink(editSubscription.cancellation_link || '')
      setNotes(editSubscription.notes || '')
    } else {
      resetForm()
    }
  }, [editSubscription, isOpen])

  const resetForm = () => {
    setName('')
    setCategory('Entertainment')
    setCost('')
    setBillingCycle('monthly')
    setRenewalDate('')
    setStatus('active')
    setTrialEndDate('')
    setCancellationDifficulty('easy')
    setCancellationLink('')
    setNotes('')
    setShowDeleteConfirm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    const formData: SubscriptionFormData = {
      name,
      category,
      cost: parseFloat(cost),
      billing_cycle: billingCycle,
      renewal_date: new Date(renewalDate).toISOString(),
      status,
      trial_end_date: trialEndDate ? new Date(trialEndDate).toISOString() : null,
      cancellation_difficulty: cancellationDifficulty,
      cancellation_link: cancellationLink || null,
      logo_identifier: name.toLowerCase().trim(),
      notes: notes || null,
    }

    let result
    if (isEditing) {
      result = await updateSubscription(editSubscription.id, formData)
    } else {
      result = await createSubscription(formData)
    }

    setLoading(false)

    if (result.error) {
      setFormError(typeof result.error === 'object' && 'message' in result.error ? result.error.message : 'Something went wrong')
      return
    }

    onSaved()
    onClose()
    resetForm()
  }

  const handleDelete = async () => {
    if (!editSubscription) return
    setFormError('')
    setDeleting(true)
    const { error } = await deleteSubscription(editSubscription.id)
    setDeleting(false)

    if (error) {
      setFormError(typeof error === 'object' && 'message' in error ? error.message : 'Failed to delete')
      return
    }

    onSaved()
    onClose()
    resetForm()
  }

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(name.toLowerCase()) && name.length > 0
  )

  const PreviewIcon = getSubscriptionIcon(name)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-[#1A1A1A] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#111111] border border-[#1A1A1A] rounded-lg flex items-center justify-center">
                  <PreviewIcon className="w-4 h-4 text-[#999999]" />
                </div>
                <h2 className="text-white font-semibold text-base">
                  {isEditing ? 'Edit Subscription' : 'Add Subscription'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#555555] hover:text-white p-1 rounded-lg hover:bg-[#111111] transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3">
                  <p className="text-[#999999] text-sm">{formError}</p>
                </div>
              )}
              {/* Name with autocomplete */}
              <div className="relative">
                <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                  Subscription Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="e.g., Netflix, Spotify"
                  required
                  className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#444444] focus:border-[#555555] focus:outline-none transition-colors"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#1A1A1A] rounded-lg overflow-hidden z-20 shadow-xl">
                    {filteredSuggestions.slice(0, 5).map((suggestion) => {
                      const SuggIcon = getSubscriptionIcon(suggestion)
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseDown={() => {
                            setName(suggestion)
                            setShowSuggestions(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#1A1A1A] transition-colors"
                        >
                          <SuggIcon className="w-4 h-4 text-[#666666]" />
                          <span className="text-white text-sm">{suggestion}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Category and Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm focus:border-[#555555] focus:outline-none transition-colors appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                    Cost *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] text-sm">$</span>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="9.99"
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg pl-7 pr-4 py-3 text-sm placeholder:text-[#444444] focus:border-[#555555] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Cycle and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                    Billing Cycle *
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm focus:border-[#555555] focus:outline-none transition-colors appearance-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm focus:border-[#555555] focus:outline-none transition-colors appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Renewal Date and Trial End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                    Renewal Date *
                  </label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    required
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm focus:border-[#555555] focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
                {status === 'trial' && (
                  <div>
                    <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                      Trial End Date
                    </label>
                    <input
                      type="date"
                      value={trialEndDate}
                      onChange={(e) => setTrialEndDate(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm focus:border-[#555555] focus:outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                )}
              </div>

              {/* Cancellation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                    Cancellation Difficulty
                  </label>
                  <select
                    value={cancellationDifficulty}
                    onChange={(e) =>
                      setCancellationDifficulty(e.target.value as CancellationDifficulty)
                    }
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm focus:border-[#555555] focus:outline-none transition-colors appearance-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                    Cancellation Link
                  </label>
                  <input
                    type="url"
                    value={cancellationLink}
                    onChange={(e) => setCancellationLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#444444] focus:border-[#555555] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#444444] focus:border-[#555555] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                {isEditing ? (
                  <div>
                    {showDeleteConfirm ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#666666] text-xs">Delete?</span>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="text-white text-xs px-3 py-1.5 border border-[#333333] rounded-lg hover:bg-[#1A1A1A] transition-all"
                        >
                          {deleting ? 'Deleting...' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="text-[#555555] text-xs px-3 py-1.5 border border-[#1A1A1A] rounded-lg hover:text-white transition-all"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-[#555555] text-xs hover:text-white transition-colors"
                      >
                        Delete subscription
                      </button>
                    )}
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[#666666] text-sm px-5 py-2.5 border border-[#1A1A1A] rounded-lg hover:border-[#333333] hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      'Save Changes'
                    ) : (
                      'Add Subscription'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
