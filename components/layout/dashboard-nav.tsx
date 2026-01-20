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
  Palette,
  Settings,
  LogOut,
  Globe,
  CreditCard,
  Crown,
  ShoppingBag,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

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
  { name: 'Print Shop', href: '/dashboard/print-orders', icon: ShoppingBag },
  
  // Business+ features
  { name: 'Team & CRM', href: '/dashboard/crm', icon: Users, badge: 'BUSINESS', requiresPlan: ['BUSINESS', 'AGENCY'] },
  
  // Agency features
  { name: 'White Label', href: '/dashboard/white-label', icon: Palette, badge: 'AGENCY', requiresPlan: ['AGENCY'] },
  
  // All users (content differs by plan)
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const userPlan = (user?.plan || user?.organization?.plan || 'FREE') as PlanType

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/')
    }
  }

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
    <motion.nav
      className="h-full w-64 flex-col border-r bg-muted/40 hidden lg:flex"
      aria-label="Main navigation"
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center justify-center px-6 py-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all"
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <QrCode className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Qreate Studios
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Professional QR Platform
            </p>
          </div>
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
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: navigation.indexOf(item) * 0.05 }}
              >
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
                    <motion.div
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                      <Crown className="w-3 h-3 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </motion.div>
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </div>

      <motion.div
        className="border-t p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-3 cursor-default">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Avatar className="ring-2 ring-offset-2 ring-transparent hover:ring-blue-500 transition-all duration-200">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <p className="text-xs text-purple-500 font-semibold mt-0.5">{userPlan} Plan</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start min-h-[44px]"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign Out
          </Button>
        </motion.div>
      </motion.div>
    </motion.nav>
  )
}
