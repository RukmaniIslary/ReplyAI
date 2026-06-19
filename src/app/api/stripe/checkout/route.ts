import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'
import { isDisposableEmail } from '@/lib/utils'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()
    const planData = PLANS[plan as PlanKey]
    if (!planData) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })

    // Layer 02: disposable email check
    if (isDisposableEmail(user.email!)) {
      return NextResponse.json({ error: 'Please use a valid business email.' }, { status: 400 })
    }

    // Layer 03: IP rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
    const { count } = await serviceSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('signup_ip', ip)
      .eq('trial_used', true)

    if ((count || 0) >= 2) {
      return NextResponse.json({ error: 'Trial limit reached for this network.' }, { status: 429 })
    }

    // Get or create Stripe customer
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('stripe_customer_id, trial_used')
      .eq('id', user.id)
      .single()

    // Layer 04: check trial_used flag
    if (profile?.trial_used) {
      return NextResponse.json({ error: 'You have already used your free trial.' }, { status: 400 })
    }

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await serviceSupabase
        .from('profiles')
        .update({ stripe_customer_id: customerId, signup_ip: ip })
        .eq('id', user.id)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Layer 05: force card at checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_collection: 'always',
      line_items: [{ price: planData.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
        metadata: { supabase_user_id: user.id, plan },
      },
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
