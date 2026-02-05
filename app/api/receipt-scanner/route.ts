import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseMultipleReceipts } from '@/lib/receiptParser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Type: scan receipts
    if (body.receipts && !body.type) {
      const texts = body.receipts as string[]
      if (!Array.isArray(texts) || texts.length === 0) {
        return NextResponse.json({ success: false, error: 'No receipt texts provided' }, { status: 400 })
      }

      const parsed = parseMultipleReceipts(texts)

      return NextResponse.json({
        success: true,
        receipts: parsed,
      })
    }

    // Type: import selected receipts as subscriptions
    if (body.type === 'import' && body.receipts) {
      const receipts = body.receipts as Array<{
        serviceName: string
        amount: number
        billingCycle: string
        category?: string
      }>

      const imported: string[] = []
      const skipped: string[] = []

      for (const receipt of receipts) {
        // Check if already exists
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', `%${receipt.serviceName}%`)
          .limit(1)

        if (existing && existing.length > 0) {
          skipped.push(receipt.serviceName)
          continue
        }

        const renewalDate = new Date()
        renewalDate.setMonth(renewalDate.getMonth() + 1)

        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            name: receipt.serviceName,
            category: receipt.category || 'other',
            cost: receipt.amount,
            billing_cycle: receipt.billingCycle || 'monthly',
            renewal_date: renewalDate.toISOString(),
            status: 'active',
            cancellation_difficulty: 'medium',
            notes: 'Added via Email Receipt Scanner',
          })

        if (!insertError) {
          imported.push(receipt.serviceName)
        }
      }

      return NextResponse.json({
        success: true,
        imported,
        skipped,
        importedCount: imported.length,
        skippedCount: skipped.length,
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 })
  } catch (error: any) {
    console.error('Receipt scanner error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
