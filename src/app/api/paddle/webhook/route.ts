import { NextRequest, NextResponse } from 'next/server'
import { paddle } from '@/lib/paddle'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const PLAN_LIMITS: Record<string, { conversations: number; agents: number }> = {
  starter: { conversations: 500, agents: 1 },
  growth: { conversations: 5000, agents: 5 },
  pro: { conversations: -1, agents: -1 },
}

type PaddleSubscription = {
  id: string
  status: string
  customerId: string
  customData?: { supabase_user_id?: string; plan?: string }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('paddle-signature') || ''

  const eventData = await paddle.webhooks.unmarshal(
    body,
    process.env.PADDLE_WEBHOOK_SECRET!,
    signature
  )

  if (!eventData) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (eventData.eventType) {
      case 'subscription.created':
      case 'subscription.activated': {
        const sub = eventData.data as unknown as PaddleSubscription
        const userId = sub.customData?.supabase_user_id
        const plan = sub.customData?.plan || 'starter'
        if (!userId) break

        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter
        await supabase.from('profiles').update({
          paddle_subscription_id: sub.id,
          paddle_customer_id: sub.customerId,
          subscription_status: sub.status,
          plan,
          conversations_limit: limits.conversations,
        }).eq('id', userId)
        break
      }

      case 'subscription.updated': {
        const sub = eventData.data as unknown as PaddleSubscription
        const userId = sub.customData?.supabase_user_id
        const plan = sub.customData?.plan || 'starter'
        if (!userId) break

        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter
        await supabase.from('profiles').update({
          subscription_status: sub.status,
          plan,
          conversations_limit: limits.conversations,
        }).eq('id', userId)
        break
      }

      case 'subscription.canceled': {
        const sub = eventData.data as unknown as PaddleSubscription
        const userId = sub.customData?.supabase_user_id
        if (!userId) break

        await supabase.from('profiles').update({
          subscription_status: 'canceled',
          plan: 'free',
          conversations_limit: 0,
          trial_used: true,
        }).eq('id', userId)
        break
      }

      case 'subscription.trialing': {
        const sub = eventData.data as unknown as PaddleSubscription
        const userId = sub.customData?.supabase_user_id
        if (userId) {
          await supabase.from('profiles').update({ trial_used: true }).eq('id', userId)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
  }

  return NextResponse.json({ received: true })
}
