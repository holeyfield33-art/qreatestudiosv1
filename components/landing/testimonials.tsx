'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    quote:
      'Qreate Studios transformed how we handle QR codes. The analytics alone saved us thousands in marketing spend. We can finally see exactly which campaigns are driving foot traffic.',
    name: 'Sarah Chen',
    role: 'Head of Marketing',
    company: 'TechFlow Inc.',
    rating: 5,
    avatar: 'SC',
    avatarColor: 'from-blue-500 to-cyan-500',
  },
  {
    quote:
      'The AI-powered landing page builder is a game-changer. We launched 50 campaign pages in the time it used to take for 5. The drag-and-drop editor is incredibly intuitive.',
    name: 'Marcus Rodriguez',
    role: 'Digital Director',
    company: 'Bloom Agency',
    rating: 5,
    avatar: 'MR',
    avatarColor: 'from-purple-500 to-pink-500',
  },
  {
    quote:
      'We manage QR codes for 200+ restaurant locations. The multi-tenant features and real-time analytics make it effortless. Print ordering directly from the dashboard is chef\'s kiss.',
    name: 'Aisha Patel',
    role: 'Operations Manager',
    company: 'FoodChain Group',
    rating: 5,
    avatar: 'AP',
    avatarColor: 'from-emerald-500 to-teal-500',
  },
  {
    quote:
      'Switching from our old QR provider to Qreate Studios cut our costs by 60% while giving us 10x better features. The custom branding options alone justified the switch.',
    name: 'James Okafor',
    role: 'CTO',
    company: 'RetailEdge',
    rating: 5,
    avatar: 'JO',
    avatarColor: 'from-orange-500 to-red-500',
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const testimonial = testimonials[current]

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  }

  return (
    <section
      className="py-20 md:py-32 px-4 relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Star className="h-4 w-4 text-pink-400" />
            <span className="text-sm text-pink-300 font-medium">Loved by Teams</span>
          </motion.div>

          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-white">What Our Customers</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Say
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Trusted by thousands of businesses worldwide to power their QR campaigns
          </p>
        </motion.div>

        {/* Testimonial card */}
        <motion.div
          className="relative max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-8 md:p-12 overflow-hidden">
            {/* Decorative quote */}
            <Quote className="absolute top-6 right-6 h-16 w-16 text-slate-800/50" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg md:text-xl text-slate-200 leading-relaxed mb-8 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Glow effect */}
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1)
                    setCurrent(i)
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? 'w-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'w-2 h-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <motion.button
                onClick={prev}
                className="p-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={next}
                className="p-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
