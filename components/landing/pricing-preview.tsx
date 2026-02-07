'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Sparkles, Zap, Building2, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out QR codes and exploring the platform.',
    icon: Sparkles,
    color: 'from-slate-400 to-slate-500',
    borderColor: 'border-slate-700',
    bgColor: 'bg-slate-800/30',
    buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    features: [
      'Up to 5 QR codes',
      'Basic analytics',
      'Standard QR designs',
      '1 landing page',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaLink: '/auth/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing businesses that need more power and customization.',
    icon: Zap,
    color: 'from-blue-500 to-purple-500',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/5',
    buttonStyle:
      'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25',
    features: [
      'Unlimited QR codes',
      'Advanced analytics & reports',
      'Custom branding & colors',
      '25 landing pages',
      'AI content generation',
      'Priority support',
      'Print ordering',
    ],
    cta: 'Start Pro Trial',
    ctaLink: '/auth/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Business',
    price: '$99',
    period: '/month',
    description: 'For teams and enterprises needing advanced features and scale.',
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/5',
    buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    features: [
      'Everything in Pro',
      'Multi-tenant workspaces',
      'Team collaboration',
      'Unlimited landing pages',
      'Custom domains',
      'API access',
      'SSO & advanced security',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    ctaLink: '/pricing',
    popular: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
}

export function PricingPreview() {
  return (
    <section
      className="py-20 md:py-32 px-4 relative overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />

      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">Simple Pricing</span>
          </motion.div>

          <h2
            id="pricing-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-white">Plans That Scale</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              With You
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {plans.map((plan, index) => {
            const PlanIcon = plan.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-semibold text-white shadow-lg shadow-blue-500/25">
                      Most Popular
                    </span>
                  </motion.div>
                )}

                <div
                  className={`relative rounded-2xl border ${plan.borderColor} ${plan.bgColor} backdrop-blur-sm p-6 md:p-8 overflow-hidden h-full flex flex-col ${
                    plan.popular ? 'ring-1 ring-blue-500/20' : ''
                  }`}
                >
                  {/* Plan icon & name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                    >
                      <PlanIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-4xl md:text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-1">{plan.period}</span>
                  </div>

                  <p className="text-sm text-slate-400 mb-6">{plan.description}</p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1" role="list">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            plan.popular ? 'text-blue-400' : 'text-slate-500'
                          }`}
                        />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={plan.ctaLink} className="block">
                    <motion.button
                      className={`w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all ${plan.buttonStyle}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.button>
                  </Link>

                  {/* Glow for popular */}
                  {plan.popular && (
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* See full pricing link */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors group"
          >
            <span>View full pricing details & compare plans</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
