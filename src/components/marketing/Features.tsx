import { Globe, FileText, MessageSquare, BarChart3, Code2, Shield } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Website crawler',
    description:
      'Paste your URL and Raysef reads every page, FAQ, and doc automatically. Your AI knows your product.',
  },
  {
    icon: FileText,
    title: 'PDF & doc upload',
    description:
      'Upload manuals, guides, and policy docs. Your AI references them instantly when customers ask.',
  },
  {
    icon: MessageSquare,
    title: 'Conversations dashboard',
    description:
      'Every chat logged. Filter by status, search transcripts, escalate to email when needed.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'See what customers ask most. Identify gaps in your knowledge base. Improve over time.',
  },
  {
    icon: Code2,
    title: 'One-line embed',
    description:
      'Copy one script tag. Paste it into any website, Shopify store, or web app. Done in seconds.',
  },
  {
    icon: Shield,
    title: 'White-label ready',
    description:
      'Remove Raysef branding on Growth and Pro. Your brand, your agent, your customer experience.',
  },
]

export function Features() {
  return (
    <section id="features" className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime-400">
            Features
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Built for businesses that want results — not configuration.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-xl border border-neutral-800 bg-neutral-950 p-6 transition-all hover:border-lime-400/30 hover:bg-neutral-900/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400 transition-colors group-hover:bg-lime-400/20">
                <f.icon size={20} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
