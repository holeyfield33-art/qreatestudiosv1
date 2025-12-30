export default function AuthBannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Account Banned</h1>
        <p className="text-muted-foreground mb-8">
          Your account has been suspended. Please contact support for more information.
        </p>
        <a
          href={`mailto:${process.env.SUPPORT_EMAIL || 'support@qreatestudios.com'}`}
          className="text-primary hover:underline"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
