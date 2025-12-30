export default function LegalPrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide directly to us, including name, email address,
            and any other information you choose to provide when using our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use the information we collect to provide, maintain, and improve our services,
            to communicate with you, and to monitor and analyze trends and usage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell, trade, or rent your personal information to third parties.
            We may share your information with service providers who assist us in operating
            our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your personal information
            from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@qreatestudios.com" className="text-primary hover:underline">
              support@qreatestudios.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
