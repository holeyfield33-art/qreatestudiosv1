'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getFeatureAccess, type PlanType } from '@/lib/utils/feature-access'
import {
  LayoutDashboard,
  QrCode,
  Menu,
  BarChart3,
  Users,
  UserCircle,
  Printer,
  Sparkles,
  Settings,
  Palette,
  LogOut,
  Globe,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    organization?: {
      plan?: string
      isWhiteLabel?: boolean
    }
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Studio', href: '/dashboard/ai-studio', icon: Sparkles, badge: 'NEW', badgeColor: 'bg-purple-500 text-white' },
  { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
  { name: 'Landing Pages', href: '/dashboard/landing-pages', icon: Globe },
  { name: 'Menus', href: '/dashboard/menus', icon: Menu },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'CRM', href: '/dashboard/crm', icon: UserCircle },
  { name: 'Print Orders', href: '/dashboard/print', icon: Printer },
  { name: 'White-Label', href: '/dashboard/white-label', icon: Palette, requiresWhiteLabel: true },
  { name: 'Billing', href: '/dashboard/billing', icon: Settings },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  
  // Get feature access based on organization plan
  const plan = (user.organization?.plan as PlanType) || 'FREE'
  const features = getFeatureAccess(plan)
  
  // Filter navigation based on feature access
  const visibleNavigation = navigation.filter((item) => {
    if ('requiresWhiteLabel' in item && item.requiresWhiteLabel) {
      return features.canAccessWhiteLabel
    }
    return true
  })

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav
      className="flex h-full w-64 flex-col border-r bg-muted/40"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 font-bold text-xl transition-all duration-200 hover:text-primary hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        >
          <QrCode className="h-6 w-6" aria-hidden="true" />
          <span>Qreate Studios</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3" role="list">
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            const showBadge = 'badge' in item && item.badge
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between space-x-3 rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                    'min-h-[44px]', // Minimum touch target size
                    isActive
                      ? 'bg-blue-500 text-white font-bold shadow-md'
                      : 'text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                  </div>
                  {showBadge && (
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-bold',
                      'badgeColor' in item ? item.badgeColor : 'bg-blue-500 text-white'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-3 cursor-default">
          <Avatar className="ring-2 ring-offset-2 ring-transparent hover:ring-blue-500 transition-all duration-200">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start min-h-[44px]"
          onClick={() => signOut({ callbackUrl: '/' })}
          aria-label="Sign out"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
