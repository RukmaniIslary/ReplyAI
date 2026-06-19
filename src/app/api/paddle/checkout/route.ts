import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paddle, PLANS, type PlanKey } from '@/lib/paddle'
import { isDisposableEmail } from '@/lib/utils'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()
    const planData = PLANS[plan as PlanKey]
    if (!planData) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })

    // Disposable email check
    if (isDisposableEmail(user.email!)) {
      return NextResponse.json({ error: 'Please use a valid business email.' }, { status: 400 })
    }

    // IP rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
    const serviceSupabase = createServiceClient()
    const { count } = await serviceSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('signup_ip', ip)
      .eq('trial_used', true)

    if ((count || 0) >= 2) {
      return NextResponse.json({ error: 'Trial limit reached for this network.' }, { status: 429 })
    }

    // Check trial_used flag
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('trial_used, paddle_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.trial_used) {
      return NextResponse.json({ error: 'You have already used your free trial.' }, { status: 400 })
    }

    // Store signup IP
    await serviceSupabase
      .from('profiles')
      .update({ signup_ip: ip })
      .eq('id', user.id)

    // Create Paddle transaction with trial
    const transaction = await paddle.transactions.create({
      items: [{
        priceId: planData.priceId,
        quantity: 1,
      }],
      customData: {
        supabase_user_id: user.id,
        plan,
      },
      ...(profile?.paddle_customer_id
        ? { customerId: profile.paddle_customer_id }
        : {}),
    })

    return NextResponse.json({ transactionId: transaction.id })
  } catch (err) {
    console.error('Paddle checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout.' }, { status: 500 })
  }
}
