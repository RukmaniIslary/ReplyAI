import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-black py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold">
              Ray<span className="text-lime-400">sef</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
              AI-powered customer support. Train on your content. Answer questions 24/7.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Product</p>
            <ul className="space-y-2.5">
              {[
                { href: '/#features', label: 'Features' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/#how-it-works', label: 'How it works' },
                { href: '/#faq', label: 'FAQ' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Compare</p>
            <ul className="space-y-2.5">
              {[
                { href: '/compare/vs-intercom', label: 'vs Intercom' },
                { href: '/compare/vs-zendesk', label: 'vs Zendesk' },
                { href: '/compare/vs-freshdesk', label: 'vs Freshdesk' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Legal</p>
            <ul className="space-y-2.5">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-900 pt-8 md:flex-row">
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} Raysef. All rights reserved.
          </p>
          <p className="text-sm text-neutral-600">
            Built for businesses that refuse to repeat themselves.
          </p>
        </div>
      </div>
    </footer>
  )
}
