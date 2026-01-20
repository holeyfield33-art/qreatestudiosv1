'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings, CreditCard, ShoppingBag, LogOut, Crown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type PlanType } from '@/lib/utils/feature-access'

interface MobileMenuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

const menuItems = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Print Shop', href: '/dashboard/print-orders', icon: ShoppingBag },
]

export function MobileMenuModal({ open, onOpenChange, user }: MobileMenuModalProps) {
  const router = useRouter()
  const userPlan = (user?.plan || user?.organization?.plan || 'FREE') as PlanType

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      onOpenChange(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/')
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 backdrop-blur-md bg-white/95">
        <DialogHeader>
          <DialogTitle>Menu</DialogTitle>
        </DialogHeader>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Crown className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-500 font-semibold">{userPlan} Plan</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onOpenChange(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start min-h-[44px] text-base"
                >
                  <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full justify-start min-h-[44px] text-base mt-4"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
          Sign Out
        </Button>
      </DialogContent>
    </Dialog>
  )
}
