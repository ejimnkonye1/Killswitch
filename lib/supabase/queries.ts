import { createClient } from './client'
import type { Subscription, SubscriptionFormData, Reminder } from '@/lib/types'

async function getCurrentUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ─── Subscriptions ───────────────────────────────────────────────

export async function getSubscriptions() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Subscription[] | null, error }
}

export async function getSubscription(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  return { data: data as Subscription | null, error }
}

export async function createSubscription(formData: SubscriptionFormData) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      ...formData,
      user_id: userId,
      logo_identifier: formData.logo_identifier || formData.name.toLowerCase().trim(),
    })
    .select()
    .single()

  if (!error && data) {
    // Auto-create reminder 2 days before renewal
    const renewalDate = new Date(formData.renewal_date)
    const reminderDate = new Date(renewalDate)
    reminderDate.setDate(reminderDate.getDate() - 2)

    if (reminderDate > new Date()) {
      await supabase.from('reminders').insert({
        user_id: userId,
        subscription_id: data.id,
        reminder_type: 'renewal',
        reminder_date: reminderDate.toISOString(),
        is_sent: false,
      })
    }

    // Auto-create trial reminder if trial subscription
    if (formData.status === 'trial' && formData.trial_end_date) {
      const trialEnd = new Date(formData.trial_end_date)
      const trialReminder = new Date(trialEnd)
      trialReminder.setDate(trialReminder.getDate() - 2)

      if (trialReminder > new Date()) {
        await supabase.from('reminders').insert({
          user_id: userId,
          subscription_id: data.id,
          reminder_type: 'trial_ending',
          reminder_date: trialReminder.toISOString(),
          is_sent: false,
        })
      }
    }
  }

  return { data: data as Subscription | null, error }
}

export async function updateSubscription(id: string, formData: Partial<SubscriptionFormData>) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (!error && data && formData.renewal_date) {
    // Delete old unsent renewal reminders for this subscription
    await supabase
      .from('reminders')
      .delete()
      .eq('subscription_id', id)
      .eq('reminder_type', 'renewal')
      .eq('is_sent', false)

    // Create new renewal reminder
    const renewalDate = new Date(formData.renewal_date)
    const reminderDate = new Date(renewalDate)
    reminderDate.setDate(reminderDate.getDate() - 2)

    if (reminderDate > new Date()) {
      await supabase.from('reminders').insert({
        user_id: userId,
        subscription_id: id,
        reminder_type: 'renewal',
        reminder_date: reminderDate.toISOString(),
        is_sent: false,
      })
    }
  }

  return { data: data as Subscription | null, error }
}

export async function deleteSubscription(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { error: { message: 'Not authenticated' } }

  // Delete related reminders first
  await supabase
    .from('reminders')
    .delete()
    .eq('subscription_id', id)
    .eq('user_id', userId)

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

export async function markSubscriptionUsed(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { error: { message: 'Not authenticated' } }

  const { error } = await supabase
    .from('subscriptions')
    .update({ last_used: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

// ─── Reminders ───────────────────────────────────────────────────

export async function getReminders() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('reminders')
    .select('*, subscription:subscriptions(*)')
    .eq('user_id', userId)
    .order('reminder_date', { ascending: true })

  return { data: data as Reminder[] | null, error }
}

export async function getUpcomingReminders() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const now = new Date().toISOString()
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('reminders')
    .select('*, subscription:subscriptions(*)')
    .eq('user_id', userId)
    .eq('is_sent', false)
    .gte('reminder_date', now)
    .lte('reminder_date', weekFromNow)
    .order('reminder_date', { ascending: true })

  return { data: data as Reminder[] | null, error }
}

export async function createReminder(reminder: {
  subscription_id: string
  reminder_type: string
  reminder_date: string
}) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      ...reminder,
      user_id: userId,
      is_sent: false,
    })
    .select()
    .single()

  return { data, error }
}

export async function markReminderSent(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { error: { message: 'Not authenticated' } }

  const { error } = await supabase
    .from('reminders')
    .update({ is_sent: true })
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

// ─── Analytics helpers ───────────────────────────────────────────

export async function getSpendingByCategory() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('category, cost, billing_cycle')
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])

  if (error || !data) return { data: null, error }

  const categoryMap: Record<string, number> = {}
  data.forEach((sub) => {
    const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
    categoryMap[sub.category] = (categoryMap[sub.category] || 0) + monthlyCost
  })

  const result = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }))

  return { data: result, error: null }
}
