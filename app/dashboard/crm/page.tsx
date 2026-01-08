'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Crown, ArrowRight, UserPlus, TrendingUp, Calendar } from 'lucide-react'

export default function CRMPage() {
  const router = useRouter()
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user plan from session
    fetch('/api/user/session')
      .then((res) => res.json())
      .then((data) => {
        const plan = data?.user?.plan || data?.user?.organization?.plan || 'FREE'
        setUserPlan(plan)
        setLoading(false)

        // Redirect if not Business or Agency
        if (plan !== 'BUSINESS' && plan !== 'AGENCY') {
          setTimeout(() => {
            router.push('/dashboard/billing?upgrade=business')
          }, 3000)
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </div>
    )
  }

  // Show upgrade prompt if not Business or Agency
  if (userPlan !== 'BUSINESS' && userPlan !== 'AGENCY') {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Unlock Team & CRM Features</CardTitle>
            <CardDescription className="text-lg">
              Upgrade to Business or Agency to manage your team and customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <UserPlus className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                <h3 className="font-semibold mb-1">Team Management</h3>
                <p className="text-sm text-muted-foreground">
                  Add up to 5 team members with role-based access
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                <h3 className="font-semibold mb-1">Customer CRM</h3>
                <p className="text-sm text-muted-foreground">
                  Track leads, manage contacts, and monitor interactions
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                <h3 className="font-semibold mb-1">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Team performance metrics and customer insights
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-6 space-y-4">
              <h3 className="font-semibold text-lg">Business Plan - $49/month</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  500 QR Codes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Unlimited Landing Pages
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Team Management (5 members)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Customer CRM
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  AI-Powered Tools
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Priority Support
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => router.push('/dashboard/billing?upgrade=business')}
              >
                Upgrade to Business
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Redirecting to billing page in 3 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show CRM interface for Business/Agency users
  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team & CRM</h1>
        <p className="text-muted-foreground">
          Manage your team members and customer relationships
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No customers yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">5 seats available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">New interactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CRM System Coming Soon</CardTitle>
          <CardDescription>
            Full team and customer management features are currently in development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold mb-2">CRM Dashboard In Progress</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're building a powerful CRM system with:
            </p>
            <ul className="text-sm text-left max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2" />
                <span>Customer contact management and segmentation</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2" />
                <span>Interaction tracking and activity logs</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2" />
                <span>Team member roles and permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2" />
                <span>Sales pipeline and deal tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2" />
                <span>Automated workflows and notifications</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
