'use client'

import { motion } from 'framer-motion'
import { QrCode, Palette, Rocket, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: QrCode,
    step: '01',
    title: 'Create Your QR Code',
    description:
      'Choose from multiple QR code types — URLs, payments, menus, vCards, events, and more. Our intuitive editor makes it effortless to get started in seconds.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    glowColor: 'shadow-blue-500/20',
  },
  {
    icon: Palette,
    step: '02',
    title: 'Customize & Brand',
    description:
      'Add your logo, pick brand colors, choose patterns and corner styles. Generate AI-powered landing pages and content that match your brand identity perfectly.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    glowColor: 'shadow-purple-500/20',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Deploy & Track',
    description:
      'Download high-res files, order professional prints, and start tracking. Real-time analytics show scans, locations, devices, and conversion rates.',
    color: 'from-pink-500 to-orange-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    glowColor: 'shadow-pink-500/20',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
}

export function HowItWorks() {
  return (
    <section
      className="py-20 md:py-32 px-4 relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Rocket className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">Simple Process</span>
          </motion.div>

          <h2
            id="how-it-works-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-white">How It</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Go from idea to live QR campaign in three simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[16.6%] right-[16.6%] h-px -translate-y-1/2">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          {/* Connector line (mobile/tablet) */}
          <div className="lg:hidden absolute left-8 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2">
            <motion.div
              className="h-full bg-gradient-to-b from-blue-500/40 via-purple-500/40 to-pink-500/40"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative pl-20 lg:pl-0"
                >
                  {/* Step number bubble */}
                  <motion.div
                    className={`absolute left-0 lg:relative lg:mx-auto w-16 h-16 rounded-full ${step.bgColor} border-2 ${step.borderColor} flex items-center justify-center mb-6 shadow-lg ${step.glowColor}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </motion.div>

                  <div className="lg:text-center">
                    {/* Step label */}
                    <span
                      className={`text-xs font-bold tracking-widest uppercase bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                    >
                      Step {step.step}
                    </span>

                    <h3 className="text-xl md:text-2xl font-semibold text-white mt-2 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-sm lg:mx-auto">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow between steps (desktop only) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="hidden lg:flex absolute -right-3 top-8 z-10"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + index * 0.2, duration: 0.4 }}
                    >
                      <ArrowRight className="h-6 w-6 text-slate-600" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
