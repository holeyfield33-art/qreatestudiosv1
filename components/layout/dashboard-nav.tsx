'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getFeatureAccess, type PlanType } from '@/lib/utils/feature-access'
import {
  LayoutDashboard,
  QrCode,
  BarChart3,
  Users,
  Printer,
  Sparkles,
  Settings,
  LogOut,
  Globe,
  CreditCard,
  Crown,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    plan?: string
    organization?: {
      plan?: string
      isWhiteLabel?: boolean
    }
  }
}

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: string
  requiresPlan?: string[]
}

const navigation: NavItem[] = [
  // Core features (all users)
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
  { name: 'Landing Pages', href: '/dashboard/landing-pages', icon: Globe },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Print Shop', href: '/dashboard/print-orders', icon: Printer },
  
  // Business+ features
  { name: 'Team & CRM', href: '/dashboard/crm', icon: Users, badge: 'BUSINESS', requiresPlan: ['BUSINESS', 'AGENCY'] },
  
  // Agency features
  { name: 'White Label', href: '/dashboard/white-label', icon: Sparkles, badge: 'AGENCY', requiresPlan: ['AGENCY'] },
  
  // All users (content differs by plan)
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const userPlan = (user?.plan || user?.organization?.plan || 'FREE') as PlanType

  const canAccessFeature = (requiredPlans?: string[]): boolean => {
    if (!requiredPlans || requiredPlans.length === 0) return true
    return requiredPlans.includes(userPlan)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (item.requiresPlan && !canAccessFeature(item.requiresPlan)) {
      e.preventDefault()
      
      // Create upgrade message
      const planName = item.badge || item.requiresPlan[0]
      const upgradeMessage = `This feature requires a ${planName} plan. Upgrade to access ${item.name}.`
      
      // Show alert and redirect to billing
      if (typeof window !== 'undefined') {
        alert(upgradeMessage)
        router.push('/dashboard/billing?upgrade=' + planName.toLowerCase())
      }
    }
  }

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
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            const hasAccess = canAccessFeature(item.requiresPlan)
            const isLocked = item.requiresPlan && !hasAccess
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    'flex items-center justify-between space-x-3 rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                    'min-h-[44px]', // Minimum touch target size
                    isActive && hasAccess
                      ? 'bg-blue-500 text-white font-bold shadow-md'
                      : hasAccess
                      ? 'text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]'
                      : 'text-muted-foreground/40 font-medium hover:bg-accent/50 opacity-60'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                  </div>
                  {isLocked && item.badge && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-xs font-semibold text-purple-400">
                      <Crown className="h-3 w-3" />
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
            <p className="text-xs text-purple-500 font-semibold mt-0.5">{userPlan} Plan</p>
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
