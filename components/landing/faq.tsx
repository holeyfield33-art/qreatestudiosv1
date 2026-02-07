'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What types of QR codes can I create?',
    answer:
      'Qreate Studios supports a wide range of QR code types including URL links, vCards (contact cards), Wi-Fi network sharing, payment links, restaurant menus, event tickets, app store links, and more. All QR codes are dynamic, meaning you can update the destination URL anytime without reprinting.',
  },
  {
    question: 'How does pricing work? Can I change plans anytime?',
    answer:
      'We offer three tiers: Free (5 QR codes, basic analytics), Pro ($29/mo, unlimited QR codes, advanced features), and Business ($99/mo, team features, API access). You can upgrade, downgrade, or cancel anytime. All paid plans come with a 14-day free trial. Annual billing saves you 20%.',
  },
  {
    question: 'What analytics and tracking are available?',
    answer:
      'Our analytics dashboard provides real-time data on total scans, unique visitors, geographic locations (country, city), device types (mobile, desktop, tablet), operating systems, browsers, time-of-day patterns, and conversion rates. Pro and Business plans include exportable reports and custom date ranges.',
  },
  {
    question: 'What are multi-tenant workspaces?',
    answer:
      'Multi-tenant workspaces (Business plan) let you manage QR codes and campaigns for multiple brands, locations, or clients from a single account. Each workspace has its own branding, analytics, and team members. Perfect for agencies, franchises, and enterprise organizations.',
  },
  {
    question: 'How secure is the platform?',
    answer:
      'Security is our top priority. We use AES-256 encryption for data at rest, TLS 1.3 for data in transit, and SOC 2 Type II compliant infrastructure. Business plans include SSO (SAML 2.0), role-based access control, audit logs, and IP allowlisting. All QR code redirects go through our secure edge network.',
  },
  {
    question: 'Do you offer an API for developers?',
    answer:
      'Yes! Our RESTful API (available on Business plans) lets you programmatically create QR codes, manage campaigns, retrieve analytics data, and integrate with your existing tools. We provide SDKs for JavaScript, Python, and Ruby, along with comprehensive documentation and webhook support for real-time events.',
  },
]

function FAQItem({
  question,
  answer,
  index,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="border-b border-slate-800 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={`text-base md:text-lg font-medium pr-4 transition-colors duration-200 ${
            isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'
          }`}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown
            className={`h-5 w-5 transition-colors duration-200 ${
              isOpen ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'
            }`}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-sm md:text-base text-slate-400 leading-relaxed pb-5 md:pb-6 pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      className="py-20 md:py-32 px-4 relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="relative max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <HelpCircle className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-orange-300 font-medium">FAQ</span>
          </motion.div>

          <h2
            id="faq-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-white">Frequently Asked</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Qreate Studios
          </p>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm px-6 md:px-8 divide-slate-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-400 text-sm">
            Still have questions?{' '}
            <a
              href="mailto:support@qreatestudios.com"
              className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
