import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, QrCode as QrCodeIcon, Eye, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatNumber, formatDate } from '@/lib/utils/format'
import { getFeatureAccess, type PlanType } from '@/lib/utils/feature-access'
import { Badge } from '@/components/ui/badge'
import { Suspense } from 'react'
import { StatCardSkeleton } from '@/components/loading/stat-card-skeleton'
import { TableSkeleton } from '@/components/loading/table-skeleton'
import { EmptyQRCodes } from '@/components/empty-states/empty-qr-codes'

// Stats Component with loading
async function DashboardStats({ userId }: { userId: string }) {
  const [qrCodeCount, totalScans, activeQRs] = await Promise.all([
    prisma.qRCode.count({
      where: { userId },
    }),
    prisma.analytics.count({
      where: {
        qrCode: {
          userId,
        },
      },
    }),
    prisma.qRCode.count({
      where: {
        userId,
        isActive: true,
        isBanned: false,
      },
    }),
  ])

  const stats = [
    {
      title: 'Total QR Codes',
      value: formatNumber(qrCodeCount),
      icon: QrCodeIcon,
      description: 'All time',
    },
    {
      title: 'Total Scans',
      value: formatNumber(totalScans),
      icon: Eye,
      description: 'All time',
    },
    {
      title: 'Active QR Codes',
      value: formatNumber(activeQRs),
      icon: TrendingUp,
      description: 'Currently active',
    },
  ]

  return (
    <>
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}

// Recent QR Codes Component
async function RecentQRCodes({ userId }: { userId: string }) {
  const recentQRs = await prisma.qRCode.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      type: true,
      scanCount: true,
      createdAt: true,
      isActive: true,
    },
  })

  if (recentQRs.length === 0) {
    return <EmptyQRCodes />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium" scope="col">Name</th>
            <th className="text-left p-2 font-medium" scope="col">Type</th>
            <th className="text-left p-2 font-medium" scope="col">Scans</th>
            <th className="text-left p-2 font-medium" scope="col">Status</th>
            <th className="text-left p-2 font-medium" scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          {recentQRs.map((qr) => (
            <tr key={qr.id} className="border-b transition-colors duration-150 hover:bg-accent/50 cursor-default">
              <td className="p-2">
                <Link
                  href={`/dashboard/qr-codes/${qr.id}`}
                  className="text-primary font-medium transition-all duration-150 hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded cursor-pointer"
                >
                  {qr.name}
                </Link>
              </td>
              <td className="p-2 text-muted-foreground">{qr.type}</td>
              <td className="p-2">{formatNumber(qr.scanCount)}</td>
              <td className="p-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    qr.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  {qr.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-2 text-muted-foreground">
                {formatDate(qr.createdAt, 'relative')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  // Get user's plan and feature access
  const plan = (session.user.organization?.plan as PlanType) || 'FREE'
  const features = getFeatureAccess(plan)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's an overview of your QR codes and analytics
          </p>
        </div>
        <Link href="/dashboard/qr-codes/new">
          <Button size="lg" className="min-h-[44px]">
            <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
            Create QR Code
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Suspense fallback={<><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>}>
          <DashboardStats userId={session.user.id} />
        </Suspense>
      </div>

      {/* New Features Showcase */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🚀 New Features Available</h2>
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Advanced Analytics */}
          <Link href="/dashboard/analytics" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg">
            <Card className="p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99]">
              <div className="text-4xl mb-3" aria-hidden="true">📈</div>
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View detailed scan insights with heatmaps, time-series data, and exportable reports
              </p>
              {!features.canAccessAdvancedAnalytics ? (
                <Badge variant="secondary">Pro Feature</Badge>
              ) : (
                <Badge variant="default">Available</Badge>
              )}
            </Card>
          </Link>

          {/* Templates Library */}
          <Link href="/dashboard/templates" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg">
            <Card className="p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99]">
              <div className="text-4xl mb-3" aria-hidden="true">🎨</div>
              <h3 className="font-semibold mb-2">Template Library</h3>
              <p className="text-sm text-muted-foreground mb-4">
                50+ professional QR templates ready to customize and use
              </p>
              <Badge variant="default">All Plans</Badge>
            </Card>
          </Link>

          {/* White-Label */}
          <Link href={features.canAccessWhiteLabel ? '/dashboard/white-label' : '/pricing'} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg">
            <Card className="p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99]">
              <div className="text-4xl mb-3" aria-hidden="true">🏢</div>
              <h3 className="font-semibold mb-2">White-Label Platform</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build your own branded QR platform with custom domain
              </p>
              {!features.canAccessWhiteLabel ? (
                <Badge variant="secondary">Agency Feature</Badge>
              ) : (
                <Badge variant="default">Available</Badge>
              )}
            </Card>
          </Link>

          {/* AI Optimization */}
          <Link href="/dashboard/qr-codes" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg">
            <Card className="p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99]">
              <div className="text-4xl mb-3" aria-hidden="true">🤖</div>
              <h3 className="font-semibold mb-2">AI Optimization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered insights to improve your QR code performance
              </p>
              {!features.canUseAIOptimization ? (
                <Badge variant="secondary">Pro Feature</Badge>
              ) : (
                <Badge variant="default">Available</Badge>
              )}
            </Card>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentQRs.length === 0 ? (
            <div className="text-center py-12">
              <QrCodeIcon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">No QR codes yet</h3>
              <p className="text-muted-foreground mt-2">
                Get started by creating your first QR code
              </p>
              <Link href="/dashboard/qr-codes/new">
                <Button className="mt-4 min-h-[44px]">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create QR Code
                </Button>
              </Link>
            </div>
          ) : (
          <Suspense fallback={<TableSkeleton rows={5} />}>
            <RecentQRCodes userId={session.user.id} />
          </Suspense>
          )}
        </CardContent>
      </Card>