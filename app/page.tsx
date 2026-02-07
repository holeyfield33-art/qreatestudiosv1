import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedHeader } from '@/components/landing/animated-header'
import { AnimatedHero } from '@/components/landing/animated-hero'
import { AnimatedFeatures } from '@/components/landing/animated-features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { InteractiveDemo } from '@/components/landing/interactive-demo'
import { Testimonials } from '@/components/landing/testimonials'
import { PricingPreview } from '@/components/landing/pricing-preview'
import { FAQ } from '@/components/landing/faq'
import { EnhancedFooter } from '@/components/landing/enhanced-footer'

export default async function Home() {
  const session = await auth()
  const ctaLink = session ? '/dashboard' : '/auth/signup'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <AnimatedHeader session={session} />

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Hero */}
        <AnimatedHero ctaLink={ctaLink} />

        {/* Features */}
        <AnimatedFeatures />

        {/* How It Works */}
        <HowItWorks />

        {/* Interactive Demo */}
        <InteractiveDemo />

        {/* Testimonials */}
        <Testimonials />

        {/* Pricing Preview */}
        <PricingPreview />

        {/* FAQ */}
        <FAQ />

        {/* CTA */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
          <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of businesses using Qreate Studios to power their QR campaigns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ctaLink}>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform">
                  Start Free Today
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10 transition-all">
                  Compare Plans
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/60 mt-6">
              No credit card required &bull; Free plan available &bull; Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <EnhancedFooter />
    </div>
  );
}
