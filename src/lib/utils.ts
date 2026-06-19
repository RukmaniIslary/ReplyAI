import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatNumber(n: number) {
  if (n === -1) return 'Unlimited'
  return new Intl.NumberFormat('en-US').format(n)
}

// Disposable email domains — blocked at signup
export const BLOCKED_EMAIL_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'throwaway.email',
  'yopmail.com',
  '10minutemail.com',
  'trashmail.com',
  'sharklasers.com',
  'fakeinbox.com',
  'dispostable.com',
  'maildrop.cc',
  'spam4.me',
  'mytemp.email',
  'temp-mail.org',
  'throwam.com',
]

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return BLOCKED_EMAIL_DOMAINS.includes(domain)
}
