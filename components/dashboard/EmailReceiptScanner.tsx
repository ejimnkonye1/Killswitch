'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMail,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiZap,
  FiArrowRight,
} from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { createClient } from '@/lib/supabase/client'
import { SAMPLE_RECEIPTS } from '@/lib/receiptParser'
import type { ScannedReceipt } from '@/lib/types'

type Step = 'input' | 'results' | 'success'

export function EmailReceiptScanner() {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [receiptText, setReceiptText] = useState('')
  const [scanning, setScanning] = useState(false)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ScannedReceipt[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importedCount, setImportedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!receiptText.trim()) return
    setScanning(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Please sign in')
        setScanning(false)
        return
      }

      const response = await fetch('/api/receipt-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          receipts: receiptText.split('\n---\n').filter(t => t.trim()),
        }),
      })

      const data = await response.json()

      if (data.success && data.receipts.length > 0) {
        setResults(data.receipts)
        setSelected(new Set(data.receipts.map((r: ScannedReceipt) => r.id)))
        setStep('results')
      } else if (data.success && data.receipts.length === 0) {
        setError('No subscriptions found in the provided text. Try pasting a receipt email.')
      } else {
        setError(data.error || 'Failed to scan receipts')
      }
    } catch {
      setError('Failed to scan receipts')
    } finally {
      setScanning(false)
    }
  }

  const handleDemoMode = () => {
    setReceiptText(SAMPLE_RECEIPTS.join('\n---\n'))
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const handleImport = async () => {
    const toImport = results.filter(r => selected.has(r.id))
    if (toImport.length === 0) return

    setImporting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Please sign in')
        setImporting(false)
        return
      }

      const response = await fetch('/api/receipt-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'import',
          receipts: toImport.map(r => ({
            serviceName: r.serviceName,
            amount: r.amount,
            billingCycle: r.billingCycle,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setImportedCount(data.importedCount)
        setStep('success')
      } else {
        setError(data.error || 'Failed to import')
      }
    } catch {
      setError('Failed to import subscriptions')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setModalOpen(false)
    setTimeout(() => {
      setStep('input')
      setReceiptText('')
      setResults([])
      setSelected(new Set())
      setError(null)
      setImportedCount(0)
    }, 300)
  }

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const styles = {
      high: isDark ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-700',
      medium: isDark ? 'bg-yellow-400/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      low: isDark ? 'bg-red-400/20 text-red-400' : 'bg-red-100 text-red-700',
    }
    return styles[confidence]
  }

  return (
    <>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.02] ${
          isDark
            ? 'bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#333333]'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiMail className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
              Email Receipt Scanner
            </h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isDark ? 'bg-emerald-400/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}>
            Beta
          </span>
        </div>
        <p className={`text-xs mb-3 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
          Paste receipt emails to automatically detect and import subscriptions.
        </p>
        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDark
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
        >
          <FiMail className="w-4 h-4" />
          Scan Receipts
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border ${
                isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-gray-300'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-5 flex items-center justify-between border-b ${
                isDark ? 'border-[#1A1A1A]' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-400/20' : 'bg-emerald-100'}`}>
                    <FiMail className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                      Email Receipt Scanner
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>
                      {step === 'input' && 'Paste receipt emails to find subscriptions'}
                      {step === 'results' && `Found ${results.length} subscription${results.length !== 1 ? 's' : ''}`}
                      {step === 'success' && 'Import complete'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? 'text-[#555555] hover:text-white hover:bg-[#111111]'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                {/* Step 1: Input */}
                {step === 'input' && (
                  <div className="space-y-4">
                    <textarea
                      value={receiptText}
                      onChange={(e) => setReceiptText(e.target.value)}
                      placeholder="Paste your receipt email text here...&#10;&#10;Separate multiple receipts with ---"
                      rows={10}
                      className={`w-full text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors resize-none ${
                        isDark
                          ? 'bg-[#0D0D0D] border border-[#1A1A1A] text-white placeholder:text-[#444444] focus:border-[#333333]'
                          : 'bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:border-gray-400'
                      }`}
                    />

                    {error && (
                      <div className={`flex items-center gap-2 p-3 rounded-xl ${
                        isDark ? 'bg-red-400/10 border border-red-400/30' : 'bg-red-50 border border-red-200'
                      }`}>
                        <FiAlertCircle className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleDemoMode}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isDark
                            ? 'bg-[#111111] border border-[#1A1A1A] text-[#888888] hover:text-white hover:border-[#333333]'
                            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
                        }`}
                      >
                        <FiZap className="w-4 h-4" />
                        Demo Mode
                      </button>
                      <button
                        onClick={handleScan}
                        disabled={!receiptText.trim() || scanning}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          !receiptText.trim() || scanning
                            ? isDark
                              ? 'bg-[#111111] text-[#444444] cursor-not-allowed'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isDark
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {scanning ? (
                          <>
                            <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
                              isDark ? 'border-[#222222] border-t-emerald-400' : 'border-gray-300 border-t-emerald-600'
                            }`} />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <FiArrowRight className="w-4 h-4" />
                            Scan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Results */}
                {step === 'results' && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {results.map((receipt) => (
                        <div
                          key={receipt.id}
                          onClick={() => toggleSelect(receipt.id)}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            selected.has(receipt.id)
                              ? isDark
                                ? 'bg-emerald-400/5 border-emerald-400/30'
                                : 'bg-emerald-50 border-emerald-200'
                              : isDark
                                ? 'bg-[#0D0D0D] border-[#1A1A1A] hover:border-[#333333]'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                            selected.has(receipt.id)
                              ? isDark
                                ? 'bg-emerald-400 border-emerald-400'
                                : 'bg-emerald-600 border-emerald-600'
                              : isDark
                                ? 'border-[#333333]'
                                : 'border-gray-300'
                          }`}>
                            {selected.has(receipt.id) && (
                              <FiCheck className="w-3 h-3 text-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                {receipt.serviceName}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${getConfidenceBadge(receipt.confidence)}`}>
                                {receipt.confidence}
                              </span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                              {receipt.email_subject}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                              {formatAmount(receipt.amount)}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                              /{receipt.billingCycle === 'monthly' ? 'mo' : 'yr'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {error && (
                      <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('input')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isDark
                            ? 'bg-[#111111] border border-[#1A1A1A] text-[#888888] hover:text-white hover:border-[#333333]'
                            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
                        }`}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleImport}
                        disabled={selected.size === 0 || importing}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selected.size === 0 || importing
                            ? isDark
                              ? 'bg-[#111111] text-[#444444] cursor-not-allowed'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isDark
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {importing ? 'Importing...' : `Import Selected (${selected.size})`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      isDark ? 'bg-emerald-400/20' : 'bg-emerald-100'
                    }`}>
                      <FiCheckCircle className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                      Successfully Imported!
                    </h3>
                    <p className={`text-sm mb-6 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                      {importedCount} subscription{importedCount !== 1 ? 's' : ''} added to your dashboard.
                    </p>
                    <button
                      onClick={handleClose}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isDark
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
