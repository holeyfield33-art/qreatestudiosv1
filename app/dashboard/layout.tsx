import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardLayoutClient } from '@/components/layout/dashboard-layout-client'
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
    <>
      <SkipLink />
      <DashboardLayoutClient user={session.user}>
        {children}
      </DashboardLayoutClient>
      <Toaster position="top-right" />
    </>
  )
}
