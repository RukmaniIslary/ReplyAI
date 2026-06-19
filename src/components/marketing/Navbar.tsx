'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Ray<span className="text-lime-400">sef</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#how-it-works" className="text-sm text-neutral-400 transition-colors hover:text-white">
            How it works
          </Link>
          <Link href="/#features" className="text-sm text-neutral-400 transition-colors hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-neutral-400 transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/#faq" className="text-sm text-neutral-400 transition-colors hover:text-white">
            FAQ
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="btn-ghost text-sm">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
            Start free trial
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-neutral-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-neutral-900 bg-black px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/#how-it-works" className="text-sm text-neutral-400" onClick={() => setOpen(false)}>How it works</Link>
            <Link href="/#features" className="text-sm text-neutral-400" onClick={() => setOpen(false)}>Features</Link>
            <Link href="/pricing" className="text-sm text-neutral-400" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="/#faq" className="text-sm text-neutral-400" onClick={() => setOpen(false)}>FAQ</Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
              <Link href="/login" className="btn-secondary text-center" onClick={() => setOpen(false)}>Sign in</Link>
              <Link href="/signup" className="btn-primary text-center" onClick={() => setOpen(false)}>Start free trial</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
