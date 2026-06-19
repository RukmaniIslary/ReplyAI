import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paddle } from '@/lib/paddle'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const serviceSupabase = createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('paddle_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.paddle_customer_id) {
      return NextResponse.json({ error: 'No billing account found.' }, { status: 400 })
    }

    // Generate Paddle customer portal session
    const session = await paddle.customers.generateAuthToken(profile.paddle_customer_id)

    // Paddle customer portal URL
    const portalUrl = process.env.PADDLE_ENVIRONMENT === 'production'
      ? `https://customer.paddle.com?customer_auth_token=${session.customerAuthToken}`
      : `https://sandbox-customer.paddle.com?customer_auth_token=${session.customerAuthToken}`

    return NextResponse.json({ url: portalUrl })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: 'Failed to open billing portal.' }, { status: 500 })
  }
}
