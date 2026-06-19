import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Bot } from 'lucide-react'

export default async function ConversationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get conversation + verify ownership via agent
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, agents(name, user_id, widget_color)')
    .eq('id', params.id)
    .single()

  if (!conversation || (conversation.agents as { user_id: string })?.user_id !== user!.id) {
    notFound()
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  const agent = conversation.agents as { name: string; widget_color: string }
  const statusColors: Record<string, string> = {
    open: 'badge-lime',
    resolved: 'badge-green',
    escalated: 'badge-red',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/conversations" className="text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white truncate">
              {conversation.page_url || 'Unknown page'}
            </h1>
            <span className={statusColors[conversation.status] || 'badge-lime'}>
              {conversation.status}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {agent?.name} &middot; {new Date(conversation.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="card p-0 overflow-hidden">
        <div className="border-b border-neutral-800 px-5 py-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: agent?.widget_color || '#a3e635' }} />
          <span className="text-sm font-medium text-white">{agent?.name}</span>
        </div>

        <div className="divide-y divide-neutral-800/50">
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 px-5 py-4 ${msg.role === 'assistant' ? 'bg-neutral-900/30' : ''}`}>
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.role === 'assistant' ? 'bg-lime-400/20 text-lime-400' : 'bg-neutral-700 text-neutral-300'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-400 mb-1">
                    {msg.role === 'assistant' ? agent?.name : 'Customer'} &middot; {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-neutral-500">
              No messages in this conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
