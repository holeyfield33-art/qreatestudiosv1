'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  Layout,
  BarChart3,
  Palette,
  Download,
  Eye,
  TrendingUp,
  Users,
  Globe,
  Smartphone,
  Monitor,
  MousePointerClick,
} from 'lucide-react'

const tabs = [
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'landing', label: 'Landing Page', icon: Layout },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const

type TabId = (typeof tabs)[number]['id']

function QRCodePreview() {
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
      {/* QR Code visual */}
      <div className="relative flex-shrink-0">
        <motion.div
          className="w-48 h-48 md:w-56 md:h-56 rounded-2xl border-2 border-slate-700 p-4 bg-white relative overflow-hidden"
          animate={{ borderColor: selectedColor + '40' }}
          transition={{ duration: 0.3 }}
        >
          {/* Simulated QR pattern */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Position detection patterns (corners) */}
            <rect x="2" y="2" width="24" height="24" rx="2" fill={selectedColor} />
            <rect x="5" y="5" width="18" height="18" rx="1" fill="white" />
            <rect x="8" y="8" width="12" height="12" rx="1" fill={selectedColor} />

            <rect x="74" y="2" width="24" height="24" rx="2" fill={selectedColor} />
            <rect x="77" y="5" width="18" height="18" rx="1" fill="white" />
            <rect x="80" y="8" width="12" height="12" rx="1" fill={selectedColor} />

            <rect x="2" y="74" width="24" height="24" rx="2" fill={selectedColor} />
            <rect x="5" y="77" width="18" height="18" rx="1" fill="white" />
            <rect x="8" y="80" width="12" height="12" rx="1" fill={selectedColor} />

            {/* Data modules */}
            {[
              [30, 4], [38, 4], [46, 4], [54, 4], [62, 4],
              [30, 12], [46, 12], [62, 12],
              [4, 30], [12, 30], [30, 30], [38, 30], [46, 30], [54, 30], [62, 30], [70, 30], [80, 30], [88, 30],
              [4, 38], [20, 38], [30, 38], [46, 38], [54, 38], [70, 38], [88, 38],
              [4, 46], [12, 46], [20, 46], [38, 46], [54, 46], [62, 46], [80, 46], [88, 46],
              [4, 54], [20, 54], [30, 54], [38, 54], [46, 54], [62, 54], [70, 54], [80, 54],
              [4, 62], [12, 62], [30, 62], [46, 62], [54, 62], [62, 62], [80, 62], [88, 62],
              [30, 70], [38, 70], [46, 70], [62, 70], [80, 70],
              [30, 80], [46, 80], [54, 80], [70, 80], [88, 80],
              [30, 88], [38, 88], [62, 88], [70, 88], [80, 88], [88, 88],
            ].map(([x, y], i) => (
              <motion.rect
                key={i}
                x={x}
                y={y}
                width="6"
                height="6"
                rx="1"
                fill={selectedColor}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.008, duration: 0.2 }}
              />
            ))}

            {/* Center logo area */}
            <rect x="38" y="38" width="24" height="24" rx="4" fill="white" />
            <rect x="40" y="40" width="20" height="20" rx="3" fill={selectedColor} opacity="0.1" />
            <text
              x="50"
              y="53"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={selectedColor}
            >
              Q
            </text>
          </svg>
        </motion.div>

        {/* Scan animation ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: selectedColor + '30' }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Controls panel */}
      <div className="flex-1 space-y-5 w-full">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Brand Color</label>
          <div className="flex gap-2">
            {colors.map((color) => (
              <motion.button
                key={color}
                className={`w-9 h-9 rounded-lg border-2 transition-all ${
                  selectedColor === color ? 'border-white scale-110' : 'border-slate-600'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Pattern Style</span>
            <span className="text-slate-300 bg-slate-800 px-3 py-1 rounded-md text-xs">Rounded</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Error Correction</span>
            <span className="text-slate-300 bg-slate-800 px-3 py-1 rounded-md text-xs">High (30%)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Logo</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md text-xs">Enabled</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium text-white"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download className="h-4 w-4" />
            Download
          </motion.button>
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Palette className="h-4 w-4" />
            Customize
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function LandingPagePreview() {
  return (
    <div className="space-y-4">
      {/* Mini browser window */}
      <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">
              yourcompany.qreate.link/promo
            </div>
          </div>
        </div>

        {/* Page content mock */}
        <div className="p-6 space-y-4">
          {/* Hero section mock */}
          <div className="text-center space-y-3">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 mx-auto flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="text-white font-bold text-lg">Q</span>
            </motion.div>
            <div className="h-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-slate-700 rounded w-1/2 mx-auto" />
          </div>

          {/* Content blocks */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { color: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-500/20' },
              { color: 'from-purple-500/20 to-pink-500/20', borderColor: 'border-purple-500/20' },
            ].map((block, i) => (
              <motion.div
                key={i}
                className={`p-3 rounded-lg bg-gradient-to-br ${block.color} border ${block.borderColor}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                <div className="h-2.5 bg-slate-600 rounded w-3/4 mb-2" />
                <div className="h-2 bg-slate-700 rounded w-full mb-1.5" />
                <div className="h-2 bg-slate-700 rounded w-2/3" />
              </motion.div>
            ))}
          </div>

          {/* CTA mock */}
          <div className="flex justify-center pt-2">
            <div className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-xs text-white font-medium">
              Get Started
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>Drag & drop builder</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          <span>Custom domains</span>
        </div>
        <div className="flex items-center gap-1">
          <Smartphone className="h-3.5 w-3.5" />
          <span>Mobile optimized</span>
        </div>
      </div>
    </div>
  )
}

function AnalyticsPreview() {
  const barData = [35, 52, 68, 45, 82, 95, 72, 88, 64, 91, 78, 85]
  const maxBar = Math.max(...barData)

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Scans', value: '12,847', icon: MousePointerClick, change: '+23%', color: 'text-blue-400' },
          { label: 'Unique Visitors', value: '8,392', icon: Users, change: '+18%', color: 'text-purple-400' },
          { label: 'Conversion Rate', value: '4.2%', icon: TrendingUp, change: '+0.8%', color: 'text-emerald-400' },
          { label: 'Top Device', value: 'Mobile', icon: Smartphone, change: '68%', color: 'text-pink-400' },
        ].map((stat, i) => {
          const StatIcon = stat.icon
          return (
            <motion.div
              key={i}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <StatIcon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-emerald-400">{stat.change}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Chart mock */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-300">Scans Over Time</span>
          <div className="flex gap-1">
            {['7D', '30D', '90D'].map((range, i) => (
              <button
                key={range}
                className={`px-2 py-0.5 text-[10px] rounded ${
                  i === 1
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5 h-32">
          {barData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-600 to-purple-500 relative group"
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxBar) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-700 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                {value * 12} scans
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between mt-2 text-[10px] text-slate-600">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>

      {/* Device breakdown */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5 text-blue-400" />
          <span>Mobile 68%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5 text-purple-400" />
          <span>Desktop 24%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-pink-400" />
          <span>42 Countries</span>
        </div>
      </div>
    </div>
  )
}

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<TabId>('qr')

  return (
    <section
      className="py-20 md:py-32 px-4 relative overflow-hidden"
      aria-labelledby="demo-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Eye className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Live Preview</span>
          </motion.div>

          <h2
            id="demo-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-white">See It In</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Action
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Explore our powerful tools — from QR code creation to real-time analytics
          </p>
        </motion.div>

        {/* Demo container */}
        <motion.div
          className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/50">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  <TabIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8 min-h-[380px]">
            <AnimatePresence mode="wait">
              {activeTab === 'qr' && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <QRCodePreview />
                </motion.div>
              )}
              {activeTab === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LandingPagePreview />
                </motion.div>
              )}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnalyticsPreview />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
