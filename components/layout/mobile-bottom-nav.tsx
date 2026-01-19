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
import { motion } from 'framer-motion'

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
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t lg:hidden pb-safe"
      aria-label="Mobile navigation"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors relative',
                'min-h-[44px]',
                isActive
                  ? 'text-blue-600'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: index * 0.05 }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        <motion.button
          onClick={onMoreClick}
          className={cn(
            'flex flex-col items-center justify-center gap-1 transition-colors',
            'min-h-[44px]',
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="More options"
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium">More</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}
