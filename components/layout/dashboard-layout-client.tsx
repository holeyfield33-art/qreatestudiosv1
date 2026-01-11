'use client'

import { useState } from 'react'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { MobileMenuModal } from '@/components/layout/mobile-menu-modal'
import { PageTransition } from '@/components/page-transition'
import { AIChatInterface } from '@/components/ai/AIChatInterface'

interface DashboardLayoutClientProps {
  children: React.ReactNode
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

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <DashboardNav user={user} />
        </div>
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader title="Dashboard" user={user} />
          <main 
            className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6" 
            id="main-content"
          >
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
        
        <AIChatInterface />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMoreClick={() => setMobileMenuOpen(true)} />
      
      {/* Mobile Menu Modal */}
      <MobileMenuModal 
        open={mobileMenuOpen} 
        onOpenChange={setMobileMenuOpen}
        user={user}
      />
    </>
  )
}
