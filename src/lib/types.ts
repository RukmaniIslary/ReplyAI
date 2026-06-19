export type Profile = {
  id: string
  email: string
  full_name: string | null
  plan: 'free' | 'starter' | 'growth' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  conversations_used: number
  conversations_limit: number
  trial_used: boolean
  card_fingerprint: string | null
  signup_ip: string | null
  created_at: string
}

export type Agent = {
  id: string
  user_id: string
  name: string
  system_prompt: string
  welcome_message: string
  widget_color: string
  escalation_email: string | null
  is_active: boolean
  created_at: string
}

export type Source = {
  id: string
  agent_id: string
  type: 'url' | 'pdf'
  url: string | null
  filename: string | null
  status: 'pending' | 'processing' | 'ready' | 'error'
  chunk_count: number
  created_at: string
}

export type Conversation = {
  id: string
  agent_id: string
  session_id: string
  page_url: string | null
  status: 'open' | 'resolved' | 'escalated'
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
