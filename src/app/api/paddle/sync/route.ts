import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paddle } from '@/lib/paddle'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const PLAN_LIMITS: Record<string, { conversations: number }> = {
  starter: { conversations: 500 },
  growth: { conversations: 5000 },
  pro: { conversations: -1 },
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const serviceSupabase = createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('paddle_customer_id, email')
      .eq('id', user.id)
      .single()

    const email = profile?.email || user.email!

    // Search Paddle customers by email — iterate collection
    const customersCollection = await paddle.customers.list({ email: [email] })
    let customer = null
    for await (const c of customersCollection) {
      customer = c
      break
    }

    if (!customer) {
      return NextResponse.json({ error: 'No Paddle customer found for this email.' }, { status: 404 })
    }

    // Get subscriptions for this customer — iterate collection
    const subsCollection = await paddle.subscriptions.list({ customerId: [(customer as { id: string }).id] })
    let sub = null
    for await (const s of subsCollection) {
      sub = s
      break
    }

    if (!sub) {
      return NextResponse.json({ error: 'No subscription found.' }, { status: 404 })
    }

    const typedSub = sub as {
      id: string
      status: string
      items?: Array<{ price?: { id: string } }>
    }
    const typedCustomer = customer as { id: string }

    // Determine plan from price ID
    const priceId = typedSub.items?.[0]?.price?.id || ''
    let plan = 'starter'
    if (priceId === process.env.PADDLE_GROWTH_PRICE_ID) plan = 'growth'
    else if (priceId === process.env.PADDLE_PRO_PRICE_ID) plan = 'pro'

    const limits = PLAN_LIMITS[plan]

    await serviceSupabase.from('profiles').update({
      paddle_customer_id: typedCustomer.id,
      paddle_subscription_id: typedSub.id,
      subscription_status: typedSub.status,
      plan,
      conversations_limit: limits.conversations,
    }).eq('id', user.id)

    return NextResponse.json({ success: true, plan, status: typedSub.status })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Sync failed.' }, { status: 500 })
  }
}
