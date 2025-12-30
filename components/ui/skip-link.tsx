'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-md",
        "font-medium",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      Skip to main content
    </Link>
  )
}
