'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { Session } from 'next-auth'

interface AnimatedHeaderProps {
  session: Session | null
}

export function AnimatedHeader({ session }: AnimatedHeaderProps) {
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10])

  return (
    <motion.header
      className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50"
      role="banner"
      style={{
        opacity: headerOpacity,
        backdropFilter: useTransform(headerBlur, (blur) => `blur(${blur}px)`),
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center" aria-label="Main navigation">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <motion.div
            className="relative"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
            }}
          >
            <Sparkles className="h-7 w-7 text-blue-500" />
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Sparkles className="h-7 w-7 text-purple-500" />
            </motion.div>
          </motion.div>
          <span className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Qreate Studios
          </span>
        </motion.div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="hidden sm:block">
            <motion.span
              className="text-sm text-slate-300 hover:text-blue-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pricing
            </motion.span>
          </Link>
          {session ? (
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  Dashboard
                </Button>
              </motion.div>
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="hidden sm:block">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
