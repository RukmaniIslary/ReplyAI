'use client'

import { useState } from 'react'
import { Check, Copy, Code2, Globe, Smartphone, Monitor } from 'lucide-react'

type Agent = {
  id: string
  name: string
  welcome_message: string
  widget_color: string
}

const platforms = [
  {
    name: 'Any website',
    icon: Globe,
    steps: [
      'Open your website\'s HTML file',
      'Find the closing </body> tag near the bottom',
      'Paste the script tag just before </body>',
      'Save and publish — widget appears immediately',
    ],
  },
  {
    name: 'Shopify',
    icon: Smartphone,
    steps: [
      'Go to Online Store → Themes → Edit code',
      'Open layout/theme.liquid',
      'Find the closing </body> tag',
      'Paste the script just before </body> and save',
    ],
  },
  {
    name: 'WordPress',
    icon: Monitor,
    steps: [
      'Install "Insert Headers and Footers" plugin',
      'Go to Settings → Insert Headers and Footers',
      'Paste the script in the "Footer" section',
      'Click Save — done',
    ],
  },
  {
    name: 'Webflow',
    icon: Globe,
    steps: [
      'Go to Project Settings → Custom Code',
      'Scroll to "Footer Code" section',
      'Paste the script and click Save',
      'Publish your site',
    ],
  },
  {
    name: 'Wix',
    icon: Globe,
    steps: [
      'Go to Settings → Custom Code',
      'Click + Add Custom Code',
      'Paste the script, set placement to "Body — end"',
      'Click Apply and publish',
    ],
  },
]

export function EmbedPageClient({ agent, embedCode, appUrl }: { agent: Agent; embedCode: string; appUrl: string }) {
  const [copied, setCopied] = useState(false)
  const [activePlatform, setActivePlatform] = useState(0)

  async function copy() {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-5">

      {/* Big embed code box */}
      <div className="rounded-xl border-2 border-lime-400/40 bg-neutral-950 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-lime-400/5">
          <div className="flex items-center gap-2">
            <Code2 size={15} className="text-lime-400" />
            <span className="text-sm font-semibold text-lime-400">Your embed code</span>
          </div>
          <span className="text-xs text-neutral-500">1 line of code</span>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-lg bg-black border border-neutral-800 p-4 font-mono text-sm text-lime-400 break-all select-all">
            {embedCode}
          </div>

          <button
            onClick={copy}
            className={`mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-lime-400 text-black hover:bg-lime-300'
            }`}
          >
            {copied ? (
              <><Check size={16} /> Copied to clipboard!</>
            ) : (
              <><Copy size={16} /> Copy embed code</>
            )}
          </button>
        </div>
      </div>

      {/* What it looks like */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">What your visitors will see</h2>
        <div className="relative rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden" style={{ height: '280px' }}>
          {/* Fake website background */}
          <div className="p-6 space-y-3 opacity-30">
            <div className="h-4 w-48 rounded bg-neutral-700" />
            <div className="h-3 w-full rounded bg-neutral-800" />
            <div className="h-3 w-4/5 rounded bg-neutral-800" />
            <div className="h-3 w-3/5 rounded bg-neutral-800" />
          </div>

          {/* Mock widget chat */}
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3">
            {/* Chat bubble */}
            <div className="rounded-2xl rounded-br-sm border border-neutral-700 bg-neutral-950 p-3 shadow-xl w-56">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-800">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.widget_color }} />
                <span className="text-xs font-medium text-white">{agent.name}</span>
              </div>
              <p className="text-xs text-neutral-300">{agent.welcome_message}</p>
            </div>

            {/* Trigger button */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg shadow-black/40"
              style={{ backgroundColor: agent.widget_color }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Platform guides */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Installation guide</h2>

        {/* Platform tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {platforms.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setActivePlatform(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activePlatform === i
                  ? 'bg-lime-400 text-black'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Steps */}
        <ol className="space-y-3">
          {platforms[activePlatform].steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-xs font-bold text-lime-400">
                {i + 1}
              </span>
              <span className="text-sm text-neutral-300 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-lg border border-lime-400/20 bg-lime-400/5 px-4 py-3 text-sm text-neutral-300">
          The widget loads async — it will never slow down your website.
        </div>
      </div>

      {/* Test the widget */}
      <div className="card">
        <h2 className="font-semibold text-white mb-2">Test your widget</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Open this URL to see your widget live before adding it to your site:
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-lime-400 break-all">
            {appUrl}/api/widget/{agent.id}
          </code>
          <a
            href={`${appUrl}/api/widget/${agent.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-2.5 whitespace-nowrap"
          >
            View widget script
          </a>
        </div>
      </div>
    </div>
  )
}
