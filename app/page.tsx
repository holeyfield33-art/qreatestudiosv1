import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QrCode, Globe, Package, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { AnimatedHeader } from '@/components/landing/animated-header'
import { AnimatedHero } from '@/components/landing/animated-hero'
import { AnimatedFeatures } from '@/components/landing/animated-features'

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

        {/* CTA */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
          <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of businesses using Qreate Studios
            </p>
            <Link href={ctaLink}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform">
                Start Free Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4" role="contentinfo">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2" role="list">
              <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2" role="list">
              <li><Link href="/legal/terms" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Terms</Link></li>
              <li><Link href="/legal/privacy" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2" role="list">
              <li><a href="mailto:support@qreatestudios.com" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Qreate Studios</h4>
            <p className="text-sm text-slate-400">
              © 2025 Qreate Studios LLC
              <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
