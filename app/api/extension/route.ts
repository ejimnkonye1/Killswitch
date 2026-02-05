import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Add subscription from browser extension detection
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceName, domain, category, defaultCost, billingCycle } = body

    if (!serviceName || !domain) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already has this subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', `%${serviceName}%`)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        subscription: existing[0],
        message: `${serviceName} is already in your subscriptions`,
      })
    }

    // Create new subscription
    const renewalDate = new Date()
    renewalDate.setMonth(renewalDate.getMonth() + 1)

    const { data: newSub, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        name: serviceName,
        category: category || 'other',
        cost: defaultCost || 0,
        billing_cycle: billingCycle || 'monthly',
        renewal_date: renewalDate.toISOString(),
        status: 'active',
        cancellation_difficulty: 'medium',
        notes: `Added via browser extension (detected on ${domain})`,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ success: false, error: 'Failed to create subscription' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      subscription: newSub,
      message: `${serviceName} added to your subscriptions`,
    })
  } catch (error: any) {
    console.error('Extension API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET - Return extension status for user
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, name, category, cost')
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])

    return NextResponse.json({
      success: true,
      subscriptionCount: subscriptions?.length || 0,
      subscriptions: (subscriptions || []).map(s => ({
        name: s.name,
        category: s.category,
        cost: s.cost,
      })),
    })
  } catch (error: any) {
    console.error('Extension status error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
