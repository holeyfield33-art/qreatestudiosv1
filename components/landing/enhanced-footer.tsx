'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Twitter,
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  QrCode,
  Globe,
  BarChart3,
  Package,
} from 'lucide-react'

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'QR Code Generator', href: '/auth/signup', icon: QrCode },
      { label: 'Landing Pages', href: '/auth/signup', icon: Globe },
      { label: 'Analytics', href: '/auth/signup', icon: BarChart3 },
      { label: 'Print Shop', href: '/auth/signup', icon: Package },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '#' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Contact', href: 'mailto:support@qreatestudios.com' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Status Page', href: '#' },
    ],
  },
}

const socialLinks = [
  { label: 'Twitter', icon: Twitter, href: 'https://twitter.com/qreatestudios' },
  { label: 'GitHub', icon: Github, href: 'https://github.com/qreatestudios' },
  { label: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/qreatestudios' },
  { label: 'Email', icon: Mail, href: 'mailto:hello@qreatestudios.com' },
]

export function EnhancedFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950 relative overflow-hidden" role="contentinfo">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section: Newsletter */}
        <div className="py-12 md:py-16 border-b border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                Stay in the loop
              </h3>
              <p className="text-slate-400 text-sm md:text-base">
                Get product updates, tips, and QR code best practices delivered to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  aria-label="Email address for newsletter"
                />
              </div>
              <motion.button
                type="submit"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm font-medium text-white flex items-center gap-2 whitespace-nowrap transition-all shadow-lg shadow-blue-500/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {subscribed ? (
                  'Subscribed!'
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Middle section: Links grid */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Qreate Studios
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              The all-in-one platform for dynamic QR codes, AI-powered content, landing pages, and professional print materials.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const SocialIcon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <SocialIcon className="h-4 w-4" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3" role="list">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-2 group"
                    >
                      {'icon' in link && link.icon && (
                        <link.icon className="h-3.5 w-3.5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                      )}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section: Copyright & legal */}
        <div className="py-6 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Qreate Studios LLC. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <Link
              href="/legal/terms"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/legal/privacy"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cookie Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Acceptable Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
