'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { QrCode, Globe, BarChart3, Package, Plus, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    qrCodes: 0,
    landingPages: 0,
    totalScans: 0,
    printOrders: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/qr-codes'),
      fetch('/api/landing-pages'),
    ]).then(async ([qrRes, lpRes]) => {
      const qrData = await qrRes.json();
      const lpData = await lpRes.json();

      setStats({
        qrCodes: qrData.qrCodes?.length || 0,
        landingPages: lpData.pages?.length || 0,
        totalScans: qrData.qrCodes?.reduce((sum: number, qr: any) => sum + (qr.scanCount || 0), 0) || 0,
        printOrders: 0,
      });
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch stats:', error);
      }
    });
  }, []);

  const statsCards = [
    { title: 'QR Codes', value: stats.qrCodes, subtitle: 'Active codes', icon: QrCode, gradient: 'from-blue-500 to-purple-500' },
    { title: 'Landing Pages', value: stats.landingPages, subtitle: 'Published pages', icon: Globe, gradient: 'from-purple-500 to-pink-500' },
    { title: 'Total Scans', value: stats.totalScans, subtitle: 'All time', icon: BarChart3, gradient: 'from-pink-500 to-orange-500' },
    { title: 'Print Orders', value: stats.printOrders, subtitle: 'Completed', icon: Package, gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="container max-w-7xl mx-auto py-4 px-4 lg:py-8">
      {/* Header with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 lg:mb-8"
      >
        <h1 className="text-2xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-sm text-slate-400">
          Here&apos;s what&apos;s happening with your QR codes and landing pages
        </p>
      </motion.div>

      {/* Stats Grid with Staggered Animation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative"
            >
              <Card className="relative overflow-hidden bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 hover:opacity-5 transition-opacity`} />

                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                  <CardTitle className="text-sm font-medium text-slate-200">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-slate-400">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions Grid with Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm text-slate-400">Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                  onClick={() => router.push('/dashboard/qr-codes/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create QR Code
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="default"
                  className="w-full justify-start border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 hover:text-white hover:border-purple-500"
                  onClick={() => router.push('/dashboard/landing-pages/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Landing Page
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="default"
                  className="w-full justify-start border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 hover:text-white hover:border-pink-500"
                  onClick={() => router.push('/dashboard/analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:shadow-lg hover:shadow-pink-500/10 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Getting Started</CardTitle>
              <CardDescription className="text-sm text-slate-400">Learn how to use Qreate Studios</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-start gap-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-xs shrink-0">1</span>
                  <span className="text-slate-300">Create your first QR code with any URL or content</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="flex items-start gap-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-xs shrink-0">2</span>
                  <span className="text-slate-300">Build a landing page to enhance your QR experience</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex items-start gap-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white font-semibold text-xs shrink-0">3</span>
                  <span className="text-slate-300">Connect your QR code to your landing page</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="flex items-start gap-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold text-xs shrink-0">4</span>
                  <span className="text-slate-300">Order physical NFC cards or print materials</span>
                </motion.li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
