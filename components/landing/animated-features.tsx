'use client'

import { motion } from 'framer-motion'
import { QrCode, Globe, Package, Sparkles, BarChart, Palette } from 'lucide-react'

const features = [
  {
    icon: QrCode,
    title: 'Dynamic QR Codes',
    description: 'Create QR codes for URLs, payments, menus, events, and more. Track every scan with detailed analytics.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Globe,
    title: 'AI Content Tools',
    description: 'Generate landing pages, blog posts, ads, social media content, and more with GPT-4o.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Package,
    title: 'Professional Printing',
    description: 'Order stickers, standees, business cards, and posters delivered to your door.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Track scans, views, and conversions with real-time analytics and insights.',
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: Palette,
    title: 'Brand Customization',
    description: 'Customize QR codes and landing pages with your brand colors, logos, and style.',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Optimization',
    description: 'Get intelligent suggestions to improve QR code performance and engagement.',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function AnimatedFeatures() {
  return (
    <section className="py-20 md:py-32 px-4 relative overflow-hidden" aria-labelledby="features-heading">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900"></div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Powerful Features</span>
          </motion.div>

          <h2 id="features-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-white">Everything You Need</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              In One Platform
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful tools to create, manage, and optimize your QR codes and landing pages
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="group"
              >
                <div className={`relative p-6 md:p-8 rounded-2xl border ${feature.borderColor} ${feature.bgColor} backdrop-blur-sm overflow-hidden transition-all duration-300`}>
                  {/* Animated background on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-4 md:mb-6`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`h-7 w-7 md:h-8 md:w-8 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                    <Icon className={`absolute h-7 w-7 md:h-8 md:w-8 text-white opacity-50`} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover glow effect */}
                  <motion.div
                    className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
