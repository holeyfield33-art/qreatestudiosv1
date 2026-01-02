'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  available: boolean
  badgeText: string
  onClick: () => void
}

function FeatureCard({ icon, title, description, available, badgeText, onClick }: FeatureCardProps) {
  return (
    <Card
      className="p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="text-4xl mb-3" aria-hidden="true">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <Badge variant={available ? 'default' : 'secondary'}>{badgeText}</Badge>
    </Card>
  )
}

interface FeatureCardsProps {
  canAccessAdvancedAnalytics: boolean
  canAccessWhiteLabel: boolean
  canUseAIOptimization: boolean
}

export function FeatureCards({ canAccessAdvancedAnalytics, canAccessWhiteLabel, canUseAIOptimization }: FeatureCardsProps) {
  const router = useRouter()

  const handleAnalyticsClick = () => {
    if (canAccessAdvancedAnalytics) {
      router.push('/dashboard/analytics')
    } else {
      router.push('/pricing')
    }
  }

  const handleTemplatesClick = () => {
    router.push('/dashboard/landing-pages')
  }

  const handleWhiteLabelClick = () => {
    if (canAccessWhiteLabel) {
      router.push('/dashboard/white-label')
    } else {
      router.push('/pricing')
    }
  }

  const handleAIClick = () => {
    toast.info('AI Optimization is available when creating or editing QR codes!', {
      description: 'Create a new QR code or edit an existing one to use AI-powered insights.',
      duration: 4000,
    })
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Advanced Analytics */}
      <FeatureCard
        icon="📈"
        title="Advanced Analytics"
        description="View detailed scan insights with heatmaps, time-series data, and exportable reports"
        available={canAccessAdvancedAnalytics}
        badgeText={canAccessAdvancedAnalytics ? 'Available' : 'Pro Feature'}
        onClick={handleAnalyticsClick}
      />

      {/* Templates Library */}
      <FeatureCard
        icon="🎨"
        title="Template Library"
        description="50+ professional QR templates ready to customize and use"
        available={true}
        badgeText="All Plans"
        onClick={handleTemplatesClick}
      />

      {/* White-Label */}
      <FeatureCard
        icon="🏢"
        title="White-Label Platform"
        description="Build your own branded QR platform with custom domain"
        available={canAccessWhiteLabel}
        badgeText={canAccessWhiteLabel ? 'Available' : 'Agency Feature'}
        onClick={handleWhiteLabelClick}
      />

      {/* AI Optimization */}
      <FeatureCard
        icon="🤖"
        title="AI Optimization"
        description="AI-powered insights to improve your QR code performance"
        available={canUseAIOptimization}
        badgeText={canUseAIOptimization ? 'Available' : 'Pro Feature'}
        onClick={handleAIClick}
      />
    </div>
  )
}
