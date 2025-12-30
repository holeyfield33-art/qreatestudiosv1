export default function LegalTermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using Qreate Studios, you accept and agree to be bound by
            the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="text-muted-foreground">
            Permission is granted to use the service for personal and commercial purposes
            in accordance with these terms. You may not use the service for any illegal
            or unauthorized purpose.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Account Responsibilities</h2>
          <p className="text-muted-foreground">
            You are responsible for maintaining the confidentiality of your account and
            password. You agree to accept responsibility for all activities that occur
            under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Prohibited Content</h2>
          <p className="text-muted-foreground">
            You may not create QR codes that link to illegal, harmful, or offensive content.
            We reserve the right to remove any content that violates these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            Qreate Studios shall not be liable for any indirect, incidental, special,
            consequential or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
          <p className="text-muted-foreground">
            Questions about the Terms of Service should be sent to{' '}
            <a href="mailto:support@qreatestudios.com" className="text-primary hover:underline">
              support@qreatestudios.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
