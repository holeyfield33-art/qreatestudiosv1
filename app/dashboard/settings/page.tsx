import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-muted-foreground">
        Manage your account settings and preferences.
      </p>
    </div>
  )
}
