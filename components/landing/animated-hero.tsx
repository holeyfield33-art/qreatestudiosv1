'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, TrendingUp } from 'lucide-react'

interface AnimatedHeroProps {
  ctaLink: string
}

export function AnimatedHero({ ctaLink }: AnimatedHeroProps) {
  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient"></div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
        >
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">Powered by GPT-4o</span>
        </motion.div>

        {/* Main heading with stagger animation */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.span
            className="block mb-2 text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            QR Codes + AI + Print
          </motion.span>
          <motion.span
            className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            All in One Platform
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Create dynamic QR codes, generate content with AI, build landing pages,
          and order professional prints - all from one powerful platform.
        </motion.p>

        {/* CTA buttons with hover effects */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href={ctaLink}>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all"
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </motion.div>
          </Link>
          <Link href="/pricing">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white hover:border-blue-500 transition-all"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                View Pricing
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.p
          className="text-sm text-slate-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          No credit card required • Free plan available
        </motion.p>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center">
            <motion.div
              className="text-2xl md:text-4xl font-bold text-white mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.9 }}
            >
              10K+
            </motion.div>
            <div className="text-xs md:text-sm text-slate-400">QR Codes Created</div>
          </div>
          <div className="text-center">
            <motion.div
              className="text-2xl md:text-4xl font-bold text-white mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 1.0 }}
            >
              500+
            </motion.div>
            <div className="text-xs md:text-sm text-slate-400">Active Businesses</div>
          </div>
          <div className="text-center">
            <motion.div
              className="text-2xl md:text-4xl font-bold text-white mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 1.1 }}
            >
              99.9%
            </motion.div>
            <div className="text-xs md:text-sm text-slate-400">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
