import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function SettingsProfilePage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <p className="text-muted-foreground">
        Update your profile information and preferences.
      </p>
    </div>
  )
}
