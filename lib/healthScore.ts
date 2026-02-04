import type { Subscription } from './types'

export interface HealthScoreResult {
  score: number
  breakdown: {
    usageScore: number
    valueScore: number
    ageScore: number
  }
  status: 'healthy' | 'warning' | 'unhealthy'
  recommendation: string
}

/**
 * Calculate a health score (0-100) for a subscription based on:
 * - Usage frequency (last_used date) - 40% weight
 * - Cost vs average cost ratio - 30% weight
 * - Time since signup (newer = healthier) - 30% weight
 */
export function calculateHealthScore(
  subscription: Subscription,
  allSubscriptions: Subscription[]
): HealthScoreResult {
  const now = new Date()

  // 1. Usage Score (40% weight) - based on last_used date
  let usageScore = 100
  if (subscription.last_used) {
    const lastUsed = new Date(subscription.last_used)
    const daysSinceUsed = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceUsed <= 7) {
      usageScore = 100 // Used in last week
    } else if (daysSinceUsed <= 14) {
      usageScore = 85 // Used in last 2 weeks
    } else if (daysSinceUsed <= 30) {
      usageScore = 70 // Used in last month
    } else if (daysSinceUsed <= 60) {
      usageScore = 50 // Used in last 2 months
    } else if (daysSinceUsed <= 90) {
      usageScore = 30 // Used in last 3 months
    } else {
      usageScore = 10 // Not used in 3+ months
    }
  } else {
    // No usage data - assume moderate usage
    usageScore = 60
  }

  // 2. Value Score (30% weight) - cost compared to category average
  const activeSubscriptions = allSubscriptions.filter(s => s.status === 'active')
  const sameCategorySubs = activeSubscriptions.filter(s => s.category === subscription.category)

  let valueScore = 70 // Default if no comparison possible

  if (sameCategorySubs.length > 1) {
    const avgCost = sameCategorySubs.reduce((sum, s) => {
      const monthlyCost = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
      return sum + monthlyCost
    }, 0) / sameCategorySubs.length

    const subMonthlyCost = subscription.billing_cycle === 'yearly'
      ? subscription.cost / 12
      : subscription.cost

    const costRatio = subMonthlyCost / avgCost

    if (costRatio <= 0.5) {
      valueScore = 100 // Great value - less than half average
    } else if (costRatio <= 0.75) {
      valueScore = 90 // Good value
    } else if (costRatio <= 1.0) {
      valueScore = 80 // Average value
    } else if (costRatio <= 1.25) {
      valueScore = 65 // Slightly expensive
    } else if (costRatio <= 1.5) {
      valueScore = 50 // Expensive
    } else if (costRatio <= 2.0) {
      valueScore = 30 // Very expensive
    } else {
      valueScore = 15 // Extremely expensive
    }
  }

  // 3. Age Score (30% weight) - how long you've had the subscription
  const createdAt = new Date(subscription.created_at)
  const monthsOwned = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30))

  let ageScore = 80
  if (monthsOwned <= 1) {
    ageScore = 100 // New subscription - peak value
  } else if (monthsOwned <= 3) {
    ageScore = 90 // Still relatively new
  } else if (monthsOwned <= 6) {
    ageScore = 80 // Established
  } else if (monthsOwned <= 12) {
    ageScore = 70 // Long-term
  } else if (monthsOwned <= 24) {
    ageScore = 60 // Very long-term - might be worth reviewing
  } else {
    ageScore = 50 // Old subscription - definitely review
  }

  // Calculate weighted total
  const totalScore = Math.round(
    (usageScore * 0.4) + (valueScore * 0.3) + (ageScore * 0.3)
  )

  // Determine status and recommendation
  let status: 'healthy' | 'warning' | 'unhealthy'
  let recommendation: string

  if (totalScore >= 80) {
    status = 'healthy'
    recommendation = 'This subscription is providing good value. Keep it!'
  } else if (totalScore >= 50) {
    status = 'warning'
    if (usageScore < 50) {
      recommendation = 'Consider if you still need this - low usage detected.'
    } else if (valueScore < 50) {
      recommendation = 'This seems expensive compared to similar subscriptions.'
    } else {
      recommendation = 'Review this subscription to ensure it still meets your needs.'
    }
  } else {
    status = 'unhealthy'
    if (usageScore < 30) {
      recommendation = 'You rarely use this. Consider cancelling to save money.'
    } else if (valueScore < 30) {
      recommendation = 'This is significantly overpriced. Look for alternatives.'
    } else {
      recommendation = 'This subscription may not be worth keeping. Review it soon.'
    }
  }

  return {
    score: totalScore,
    breakdown: {
      usageScore,
      valueScore,
      ageScore,
    },
    status,
    recommendation,
  }
}

/**
 * Get the color class for a health score
 */
export function getHealthScoreColor(score: number, isDark: boolean = true): string {
  if (score >= 80) {
    return isDark ? 'text-green-400' : 'text-green-600'
  } else if (score >= 50) {
    return isDark ? 'text-yellow-400' : 'text-yellow-600'
  } else {
    return isDark ? 'text-red-400' : 'text-red-600'
  }
}

/**
 * Get background color for health score badge
 */
export function getHealthScoreBgColor(score: number, isDark: boolean = true): string {
  if (score >= 80) {
    return isDark ? 'bg-green-400/10 border-green-400/30' : 'bg-green-100 border-green-300'
  } else if (score >= 50) {
    return isDark ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-yellow-100 border-yellow-300'
  } else {
    return isDark ? 'bg-red-400/10 border-red-400/30' : 'bg-red-100 border-red-300'
  }
}

/**
 * Calculate overall portfolio health score
 */
export function calculatePortfolioHealth(subscriptions: Subscription[]): {
  score: number
  status: 'healthy' | 'warning' | 'unhealthy'
  healthyCount: number
  warningCount: number
  unhealthyCount: number
  totalSavingsPotential: number
} {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')

  if (activeSubscriptions.length === 0) {
    return {
      score: 100,
      status: 'healthy',
      healthyCount: 0,
      warningCount: 0,
      unhealthyCount: 0,
      totalSavingsPotential: 0,
    }
  }

  let totalScore = 0
  let healthyCount = 0
  let warningCount = 0
  let unhealthyCount = 0
  let totalSavingsPotential = 0

  activeSubscriptions.forEach(sub => {
    const result = calculateHealthScore(sub, subscriptions)
    totalScore += result.score

    if (result.status === 'healthy') {
      healthyCount++
    } else if (result.status === 'warning') {
      warningCount++
      // Estimate 50% of cost as potential savings
      const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
      totalSavingsPotential += monthlyCost * 0.5
    } else {
      unhealthyCount++
      // Estimate full cost as potential savings
      const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
      totalSavingsPotential += monthlyCost
    }
  })

  const avgScore = Math.round(totalScore / activeSubscriptions.length)

  return {
    score: avgScore,
    status: avgScore >= 80 ? 'healthy' : avgScore >= 50 ? 'warning' : 'unhealthy',
    healthyCount,
    warningCount,
    unhealthyCount,
    totalSavingsPotential: Math.round(totalSavingsPotential * 100) / 100,
  }
}
