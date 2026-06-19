import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    conversations: 500,
    agents: 1,
  },
  growth: {
    name: 'Growth',
    price: 79,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    conversations: 5000,
    agents: 5,
  },
  pro: {
    name: 'Pro',
    price: 149,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    conversations: -1, // unlimited
    agents: -1,
  },
}

export type PlanKey = keyof typeof PLANS
