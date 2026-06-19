import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const getSupabase = () => createServiceClient()

const PLAN_LIMITS: Record<string, { conversations: number; agents: number }> = {
  starter: { conversations: 500, agents: 1 },
  growth: { conversations: 5000, agents: 5 },
  pro: { conversations: -1, agents: -1 },
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const supabase = getSupabase()

  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata?.supabase_user_id
  const plan = subscription.metadata?.plan || 'starter'

  switch (event.type) {
    case 'customer.subscription.created': {
      if (!userId) break

      // Layer 01: Card fingerprint check
      const customerId = subscription.customer as string
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        })
        const fingerprint = paymentMethods.data[0]?.card?.fingerprint

        if (fingerprint) {
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('card_fingerprint', fingerprint)
            .neq('id', userId)
            .single()

          if (existing) {
            // Duplicate card — cancel immediately
            await stripe.subscriptions.cancel(subscription.id)
            console.log(`Blocked duplicate card fingerprint for user ${userId}`)
            break
          }

          await supabase
            .from('profiles')
            .update({ card_fingerprint: fingerprint })
            .eq('id', userId)
        }
      } catch {}

      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter
      await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          plan,
          conversations_limit: limits.conversations,
        })
        .eq('id', userId)
      break
    }

    case 'customer.subscription.updated': {
      if (!userId) break
      const newPlan = subscription.metadata?.plan || 'starter'
      const limits = PLAN_LIMITS[newPlan] || PLAN_LIMITS.starter
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          plan: newPlan,
          conversations_limit: limits.conversations,
        })
        .eq('id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      if (!userId) break
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          plan: 'free',
          conversations_limit: 0,
          trial_used: true,
        })
        .eq('id', userId)
      break
    }

    case 'customer.subscription.trial_will_end': {
      // Set trial_used so they can't abuse another trial
      if (userId) {
        await supabase
          .from('profiles')
          .update({ trial_used: true })
          .eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
