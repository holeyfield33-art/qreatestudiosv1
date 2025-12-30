import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { SkipLink } from '@/components/ui/skip-link'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SkipLink />
      <DashboardNav user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader title="Dashboard" user={session.user} />
        <main className="flex-1 overflow-y-auto p-6" id="main-content">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
