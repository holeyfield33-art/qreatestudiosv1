'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  QrCode,
  Globe,
  BarChart3,
  Menu,
} from 'lucide-react'

interface MobileBottomNavProps {
  onMoreClick?: () => void
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
  { name: 'Landing', href: '/dashboard/landing-pages', icon: Globe },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

export function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t lg:hidden pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                'min-h-[44px]',
                isActive
                  ? 'text-blue-600'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        <button
          onClick={onMoreClick}
          className={cn(
            'flex flex-col items-center justify-center gap-1 transition-colors',
            'min-h-[44px]',
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="More options"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </nav>
  )
}
