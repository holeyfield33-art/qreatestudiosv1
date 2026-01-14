import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QrCode, Globe, Package } from 'lucide-react'

export default async function Home() {
  const session = await auth()
  const ctaLink = session ? '/dashboard' : '/auth/signup'

  return (
    <div className="min-h-screen">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50" role="banner">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center" aria-label="Main navigation">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">Qreate Studios</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm hover:text-blue-600">
              Pricing
            </Link>
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6">
              QR Codes + AI + Print
              <br />
              <span className="text-blue-600">All in One Platform</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create dynamic QR codes, generate content with AI, build landing pages,
              and order professional prints - all from one powerful platform.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={ctaLink}>
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free plan available
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto">
            <h2 id="features-heading" className="text-4xl font-bold text-center mb-16">
              Everything You Need
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Dynamic QR Codes</h3>
                <p className="text-muted-foreground">
                  Create QR codes for URLs, payments, menus, events, and more.
                  Track every scan with detailed analytics.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">AI Content Tools</h3>
                <p className="text-muted-foreground">
                  Generate landing pages, blog posts, ads, social media content,
                  and more with GPT-4o.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Professional Printing</h3>
                <p className="text-muted-foreground">
                  Order stickers, standees, business cards, and posters delivered
                  to your door.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of businesses using Qreate Studios
            </p>
            <Link href={ctaLink}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Free Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4" role="contentinfo">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2" role="list">
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-blue-600">Pricing</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-blue-600">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2" role="list">
              <li><Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-blue-600">Terms</Link></li>
              <li><Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-blue-600">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2" role="list">
              <li><a href="mailto:support@qreatestudios.com" className="text-sm text-muted-foreground hover:text-blue-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Qreate Studios</h4>
            <p className="text-sm text-muted-foreground">
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
