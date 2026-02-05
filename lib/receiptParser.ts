import type { BillingCycle } from '@/lib/types'

interface ParsedReceipt {
  id: string
  serviceName: string
  amount: number
  billingCycle: BillingCycle
  date: string
  email_subject: string
  confidence: 'high' | 'medium' | 'low'
}

interface ReceiptPattern {
  pattern: RegExp
  serviceName: string
  category: string
}

const RECEIPT_PATTERNS: ReceiptPattern[] = [
  { pattern: /netflix/i, serviceName: 'Netflix', category: 'streaming' },
  { pattern: /spotify/i, serviceName: 'Spotify', category: 'music' },
  { pattern: /disney\+|disneyplus/i, serviceName: 'Disney+', category: 'streaming' },
  { pattern: /hulu/i, serviceName: 'Hulu', category: 'streaming' },
  { pattern: /hbo\s*max|max\.com/i, serviceName: 'HBO Max', category: 'streaming' },
  { pattern: /apple\s*music/i, serviceName: 'Apple Music', category: 'music' },
  { pattern: /youtube\s*(premium|music)/i, serviceName: 'YouTube Premium', category: 'music' },
  { pattern: /amazon\s*prime/i, serviceName: 'Amazon Prime', category: 'shopping' },
  { pattern: /adobe|creative\s*cloud/i, serviceName: 'Adobe Creative Cloud', category: 'productivity' },
  { pattern: /microsoft\s*365|office\s*365/i, serviceName: 'Microsoft 365', category: 'productivity' },
  { pattern: /dropbox/i, serviceName: 'Dropbox', category: 'cloud-storage' },
  { pattern: /google\s*one/i, serviceName: 'Google One', category: 'cloud-storage' },
  { pattern: /notion/i, serviceName: 'Notion', category: 'productivity' },
  { pattern: /slack/i, serviceName: 'Slack', category: 'productivity' },
  { pattern: /zoom/i, serviceName: 'Zoom', category: 'productivity' },
  { pattern: /chatgpt|openai/i, serviceName: 'ChatGPT Plus', category: 'ai' },
  { pattern: /github/i, serviceName: 'GitHub Pro', category: 'development' },
  { pattern: /figma/i, serviceName: 'Figma', category: 'design' },
  { pattern: /canva/i, serviceName: 'Canva Pro', category: 'design' },
  { pattern: /grammarly/i, serviceName: 'Grammarly', category: 'productivity' },
]

const PRICE_REGEX = /\$(\d+(?:\.\d{2})?)/g

const YEARLY_INDICATORS = /\b(annual|yearly|year|yr|12[\s-]*months?)\b/i
const MONTHLY_INDICATORS = /\b(monthly|month|mo|per\s*month)\b/i

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function detectBillingCycle(text: string): BillingCycle {
  if (YEARLY_INDICATORS.test(text)) return 'yearly'
  return 'monthly'
}

function extractDate(text: string): string {
  // Try common date formats
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\w+\s+\d{1,2},?\s+\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const parsed = new Date(match[1])
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0]
      }
    }
  }

  return new Date().toISOString().split('T')[0]
}

function extractSubjectLine(text: string): string {
  const lines = text.split('\n').filter(l => l.trim())
  const subjectLine = lines.find(l => /subject:/i.test(l))
  if (subjectLine) {
    return subjectLine.replace(/subject:\s*/i, '').trim()
  }
  return lines[0]?.trim().substring(0, 80) || 'Receipt'
}

export function parseReceiptText(text: string): ParsedReceipt[] {
  const results: ParsedReceipt[] = []
  const matchedServices = new Set<string>()

  for (const { pattern, serviceName } of RECEIPT_PATTERNS) {
    if (pattern.test(text) && !matchedServices.has(serviceName)) {
      matchedServices.add(serviceName)

      // Extract prices
      const prices: number[] = []
      let priceMatch
      const priceRegex = new RegExp(PRICE_REGEX.source, 'g')
      while ((priceMatch = priceRegex.exec(text)) !== null) {
        const amount = parseFloat(priceMatch[1])
        if (amount > 0 && amount < 1000) {
          prices.push(amount)
        }
      }

      const amount = prices.length > 0 ? prices[0] : 0
      const billingCycle = detectBillingCycle(text)
      const date = extractDate(text)
      const subject = extractSubjectLine(text)

      // Determine confidence
      let confidence: 'high' | 'medium' | 'low' = 'low'
      if (amount > 0 && pattern.test(text)) {
        confidence = prices.length === 1 ? 'high' : 'medium'
      }

      if (amount > 0) {
        results.push({
          id: generateId(),
          serviceName,
          amount,
          billingCycle,
          date,
          email_subject: subject,
          confidence,
        })
      }
    }
  }

  return results
}

export function parseMultipleReceipts(texts: string[]): ParsedReceipt[] {
  const allReceipts: ParsedReceipt[] = []
  const seenServices = new Set<string>()

  for (const text of texts) {
    const parsed = parseReceiptText(text)
    for (const receipt of parsed) {
      if (!seenServices.has(receipt.serviceName)) {
        seenServices.add(receipt.serviceName)
        allReceipts.push(receipt)
      }
    }
  }

  return allReceipts
}

export const SAMPLE_RECEIPTS = [
  `Subject: Your Netflix payment receipt
Date: January 15, 2025

Hi there,

Your monthly Netflix subscription has been renewed.

Plan: Premium
Amount charged: $22.99
Billing period: Monthly
Payment method: Visa ending in 4242

Thanks for being a Netflix member!`,

  `Subject: Spotify Premium - Payment Confirmation
Date: January 18, 2025

Payment Receipt

Spotify Premium Individual
Amount: $11.99/month
Date: Jan 18, 2025
Payment method: PayPal

Thank you for your Spotify Premium subscription.`,

  `Subject: Your Adobe Creative Cloud Invoice
Date: January 20, 2025

Invoice #INV-2025-0120

Adobe Creative Cloud - All Apps
Monthly subscription: $59.99
Billing date: January 20, 2025

Thank you for choosing Adobe Creative Cloud.`,

  `Subject: Receipt for your GitHub Pro subscription
Date: January 22, 2025

GitHub Pro
Amount: $4.00/month
Date: Jan 22, 2025

Thanks for supporting GitHub!`,
]
