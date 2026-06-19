import { Paddle, Environment } from '@paddle/paddle-node-sdk'

export const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: process.env.PADDLE_ENVIRONMENT === 'production'
    ? Environment.production
    : Environment.sandbox,
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.PADDLE_STARTER_PRICE_ID!,
    conversations: 500,
    agents: 1,
  },
  growth: {
    name: 'Growth',
    price: 79,
    priceId: process.env.PADDLE_GROWTH_PRICE_ID!,
    conversations: 5000,
    agents: 5,
  },
  pro: {
    name: 'Pro',
    price: 149,
    priceId: process.env.PADDLE_PRO_PRICE_ID!,
    conversations: -1,
    agents: -1,
  },
}

export type PlanKey = keyof typeof PLANS
