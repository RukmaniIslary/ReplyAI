'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function EmbedCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className="btn-primary gap-2 text-sm py-2.5">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy code'}
    </button>
  )
}
